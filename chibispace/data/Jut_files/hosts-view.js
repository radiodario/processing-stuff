define(function(require, exports, module) {
var BaseView = require('../../base-view');
var HostsCollection = require('services/config/models/hosts-model');
var AuthorizationCollection = require('services/auth/models/authorization-model');
var _ = require('underscore');
var host_template = require('text!./host.html');
var open_template = require('text!./open-host.html');
var service_template = require('text!./service-template.html');
var edit_service_template = require('text!./edit-service-template.html');
var $ = require('jquery');
var Environment = require('core/environment');
var request_wrapper = require('request-wrapper');
var Q = require('q');
var jutVersion = require('jut-version');

var Logger = require('logger');

var logger;

var serviceViewConfig = {
    "service-data" : {
        inputs : [
            {
                key : 'port',
                title : 'Port'
            },
            {
                key : 'storage_directory',
                title : 'Storage Directory'
            }
        ],

        defaultOptions : {
            ssl: {
                enabled: true
            }
        }
    },
    "log-collector" : {
        inputs : [
            {
                key : 'log_type',
                title : 'Log Type'
            },
            {
                key : 'files',
                title : 'Files'
            }
        ],

        defaultOptions : {}
    },
    "cloudwatch-collector" : {
        inputs : [
            {
                key : 'access_key',
                title : 'Access Key'
            },
            {
                key : 'secret_access_key',
                title : 'Secret Access Key',
                type : 'Password'
            },
            {
                key : 'region',
                title : 'Region'
            }
        ],

        defaultOptions : {}
    },
    "zabbix-collector" : {
        inputs : [
            {
                key : 'zabbix_url',
                title : 'Zabbix Url'
            },
            {
                key : 'username',
                title : 'Username'
            },
            {
                key : 'password',
                title : 'Password',
                type : 'Password'
            }
        ],

        defaultOptions : {}
    },
    "demo-collector" : {
        inputs : [
            {
                key : 'name',
                title : 'Name'
            }
        ],

        defaultOptions : {}
    },
    'citrus-collector' : {
        inputs : [
            {
                key : 'host_prefix',
                title : 'Host Prefix',
                default_value : 'collectd'
            },
            {
                key : 'host_postfix',
                title : 'Host Postfix',
                default_value : 'collectd'
            },
            {
                key : 'listen_port',
                title : 'Listen Port',
                default_value : '2003'
            },
            {
                key : 'listen_address',
                title : 'Listen Address',
                default_value : '0.0.0.0'
            },
            {
                key : 'default_pop',
                title : 'Default Pop',
                default_value : 'sfo'
            },
            {
                key : 'default_pool',
                title : 'Default Pool',
                default_value : 'cds'
            },
            {
                key : 'include_metrics',
                title : 'Include Metrics',
                default_value : '^interface, ^cpu'
            },
            {
                key : 'update_stats_interval',
                title : 'Update Stats Interval',
                default_value : '30'
            },
            {
                key : 'server_groups_file',
                title : 'Server Groups File',
                default_value : 'servergroups.dat'
            },
            {
                key : 'region_mapping_file',
                title : 'Region Mapping File',
                default_value : 'regiongroups.dat'
            },
            {
                key : 'max_records', 
                title : 'Max Records',
                default_value : '10'
            }
        ]
    }
};

var ServiceView = BaseView.extend({

    className : "row",

    events : {
        'click .remove-collector' : 'remove_service'
    },

    initialize : function (options) {
        this.inputs = options.inputs;
        this.model = options.model;
        this.model.options = _.extend({}, options.defaultOptions, this.model.options);
        this.service_id = options.service_id;
        this.$el.addClass(options.type);
        this.type = options.type;
    },

    render : function (options) {
        var message;

        if (this.model.status && this.model.status.state !== 'ok') {
            message = this.model.status.message;
        }
        logger.debug('ServiceView render', this.service_id, this.model);

        this.$el.html(_.template(service_template, {
            type : this.type,
            inputs : this.inputs,
            model : this.model,
            health : getHealthForStatus(this.model.status).className,
            message : message
        }));
    },

    save : function () {
        var self = this;
        var errors;
        this.$el.find('.service-input').each(function () {
            var value = $(this).val();
            if (!value) {
                errors = $(this).data('title') + ' cannot be empty';
                $(this).parent()
                    .addClass('has-warning')
                    .append($('<label class="host-status-label health-warning">').html(errors));
            } else {
                self.model.options[$(this).data('input')] = $(this).val();
            }
        });

        return errors;
    },

    enable_edit : function () {
        this.$el.html(_.template(edit_service_template, {
            inputs : this.inputs,
            model : this.model,
            health : getHealthForStatus(this.model.status).className,
            message: this.model.status && this.model.status.message
        }));
    },

    remove_service : function () {
        delete this.service_id;
        this.close();
    }
});


var HostView = BaseView.extend({
    events : {
        'click #host-edit' : 'edit_host',
        'click #host-save' : 'save_host',
        'click #edit-cancel' : 'cancel_edit',
        'change #data-service' : 'toggle_data_service',
        'click #host-name' : 'toggle_open',
        'change #collector-select' : 'select_collector',
        'click .remove-collector' : 'remove_collector'
    },

    initialize : function (options) {
        this.app = options.app;
        this.model = options.model;
        this.isOpen = false;
        this.listenTo(this.model, 'sync', this.toggle_edit_off);
        this.listenTo(this.model, 'change:data.status', this.render);
        this.listenTo(this.model, 'change:services', this.render);
        this.listenTo(this.model, 'invalid', this.invalid_model);
        if (!this.model.get('next_service_id')) {

        }
        _.bind(this.render, this);

        this.editable = false;
        this.isOpen = false;
    },

    render : function (options) {
        logger.debug('hostview render', this.model.attributes);
        var services = this.model.get('services') || {};

        var hostHealth = (_(services).size() > 0) ? healthLevels[0] : healthLevels[1];

        var numHostErrors = 0;

        _(services).each(function(service) {
            var serviceHealth = getHealthForStatus(service.status);

            if (serviceHealth.level > 1) {
                numHostErrors++;
            }

            if (!hostHealth || serviceHealth.level > hostHealth.level) {
                hostHealth = serviceHealth;
            }
        });

        var services_info;

        if (numHostErrors) {
            services_info = numHostErrors +' service '+ ((numHostErrors > 1) ? 'errors' : 'error');
        } else {
            var hasDataService = !!_.find(services, function (service) {
                return service.type === 'service-data';
            });

            var collectors = _.filter(services, function (service) {
                return service.type !== 'service-data';
            });

            var numCollectors  = (collectors) ? _.size(collectors) : 0;

            services_info = 'Not Configured';

            var numCollectorsString;
            if (numCollectors) {
                numCollectorsString = numCollectors +' '+ ((numCollectors > 1) ? 'Collectors' : 'Collector');
            }

            if (hasDataService && numCollectors) {
                services_info = 'Data & '+ numCollectorsString;
            } else if (hasDataService) {
                services_info = 'Data';
            } else if (numCollectors) {
                services_info = numCollectorsString;
            }
        }

        $(this.el).html(_.template(host_template, {
            model         : this.model.toJSON(),
            services_info : services_info,
            health        : hostHealth.className
        }));

        logger.debug('host render', this.model.attributes, services_info, hostHealth, 'editable', this.editable, 'open', this.isOpen);

        if (this.editable) {
            this.edit_host();
        } else if (this.isOpen) {
            this.open();
        }
    },

    toggle_open : function () {
        if (this.editable) {
            return;
        }
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open : function () {
        var services = this.model.get('services');

        this.$el.find('#edit-container').html(_.template(open_template));
        var dataService = _.find(services, function (service) {
            return service.type === 'service-data';
        });
        var collectors  = _.filter(services, function (service) {
            return service.type !== 'service-data';
        });     

        var self = this;
        this.service_views = [];


        if (dataService) {
            var dataView = new ServiceView({
                inputs : serviceViewConfig['service-data'].inputs,
                defaultOptions : serviceViewConfig['service-data'].defaultOptions,
                type : 'service-data',
                model : dataService,
                service_id : dataService.id
            });
            dataView.render();
            this.$el.find('#data-service-container').append(dataView.$el);
            self.service_views.push(dataView);
        }


        if (collectors && collectors.length > 0) {
            _.each(collectors, function (service) {
                var service_view = new ServiceView({
                    type : service.type,
                    inputs : serviceViewConfig[service.type].inputs,
                    defaultOptions : serviceViewConfig[service.type].defaultOptions,
                    model : service,
                    service_id : service.id
                });
                service_view.render();
                self.$el.find('#host-collectors-container').append(service_view.$el);
                self.service_views.push(service_view);
            });    
        }

        this.$el.find('#data-service')
            .prop('checked', (typeof dataService !== 'undefined'))
            .prop('disabled', true);

        this.$el.find('#host-collector-select-container').hide();

        this.isOpen = true;
    },

    close : function () {
        this.$el.find('#edit-container').empty();
        this.isOpen = false;
    },

    edit_host : function () {
        this.open();
        this.toggle_edit_on();
    },


    cancel_edit : function () {
        this.toggle_edit_off();
    },

    // returns a promise fulfilled with client_id and client_secret
    get_authorization : function () {
        var self = this;

        // wrap in try to make sure errors make it up the promise chain
        return Q.fcall(function() {
            var deferred = Q.defer();

            new AuthorizationCollection().fetch({
                success: function(collection, response, options) {
                    var authorization = collection.findWhere({
                        account_id: self.app.auth_status.get('account').id
                    });

                    if (authorization) {
                        deferred.resolve({
                            client_id: authorization.get('client_id'),
                            client_secret: authorization.get('client_secret')
                        });
                    }
                    else {
                        return Q(request_wrapper.request({
                            type: 'POST',
                            dataType: 'json',
                            url: Environment.get('auth_url') + '/authorize',
                            data: ''
                        })).done(function(data) {
                            deferred.resolve({
                                client_id: data.client_id,
                                client_secret: data.client_secret
                            });
                        });
                    }
                },
                error: function(collection, response, options) {
                    throw new Error('Invalid response: ' + response);
                }
            });

            return deferred.promise;
        });
    },

    save_host : function () {
        var errors = [];
        var services = {};
        var self = this;

        // A data node must be present in the environment if any
        // services are being configured (other than the data service
        // itself).
        var need_data_url = !!_.find(this.service_views, function (service_view) {
            return service_view.service_id &&
                (service_view.model.type !== 'service-data');
        });

        if (need_data_url && ! Environment.get('data_url')) {
            this.toggle_error_message('Data node is not valid. Please set and try again');
            return;
        }

        _.each(this.service_views, function (service_view, index) {
            if (typeof service_view.service_id === 'undefined') {
                self.service_views.splice(index, 1);
                return;
            }
            var error = service_view.save();
            if (error) {
                errors.push(error);
            } else{
                services[service_view.service_id] = service_view.model;
            }
        });

        var error = this.validate_inputs();
        if (error) {
            errors.push(error);
        }

        if (errors.length > 0) {
            this.toggle_error_message('Please Fix Indicated Errors');
        }
        else {
            this.get_authorization().done(
                function(creds) {
                    _(services).each(function(service) {
                        // Pass the user's client_id and client_secret to each service
                        // so they're able to authenticate.
                        service.options.client_id = creds.client_id;
                        service.options.client_secret = creds.client_secret;

                        service.options.auth_url = Environment.get('auth_url');

                        if (service.type !== 'service-data') {
                            service.options.data_url = Environment.get('data_url');
                        }
                    });

                    self.model.set('services', services);

                    self.model.save();
                },
                function(err) {
                    self.toggle_error_message('Unable to create authorization credentials. Please try again later.');
                }
            );
        }
    },

    invalid_model : function (error) {
        this.toggle_error_message(error.validationError);
    },

    toggle_edit_on : function () {
        var cancel_button = $('<button class="btn" id="edit-cancel">').html('Cancel');
        var save_button = $('<button class="btn btn-success" id="host-save">').html('OK');
        var btn_container = this.$el.find('#host-btn-container');
        btn_container
            .empty()
            .append(save_button)
            .append(cancel_button);

        // Enable base properties edit

        this.$el.find('#host-name')
            .html($('<input type="text" id="host-name-input" value="' + this.model.get('name') + '">'));     


        this.$el.find('#data-service')
            .prop('disabled', false);

        this.$el.find('#host-collector-select-container').show();

        // Enable Services Edit

        _.each(this.service_views, function (service_view) {
            service_view.enable_edit();
        });

        this.editable = true;
    },

    toggle_edit_off : function () {
        this.editable = false;
        this.render();
    },

    toggle_data_service : function () {
        var $dataService = this.$el.find('#data-service');

        var next_service_id = this.model.get('next_service_id');
        if (next_service_id === undefined) {
            next_service_id = 0;
        } else {
            next_service_id = next_service_id + 1;
        }
        this.model.set('next_service_id', next_service_id);
        if ($dataService.is(':checked')) {
            var data_model = {
                type : 'service-data',
                id : next_service_id,
                // This is a temporary solution until there's a real way
                // for the system to coordinate what version to install.
                version: jutVersion.build
            };
            var service_view = new ServiceView({
                inputs : serviceViewConfig['service-data'].inputs,
                defaultOptions : serviceViewConfig['service-data'].defaultOptions,
                type : 'service-data',
                model : data_model,
                service_id : next_service_id
            });

            service_view.enable_edit();
            this.$el.find('#data-service-container').html(service_view.$el);
            this.service_views.push(service_view);
        } else {
            if (this.dataView) {
                this.dataView.close();
            }
        }
    },


    select_collector : function () {
        var selected = this.$el.find('#collector-select option:selected').val();

        var next_service_id = this.model.get('next_service_id');
        if (next_service_id === undefined) {
            next_service_id = 0;
        } else {
            next_service_id = next_service_id + 1;
        }
        this.model.set('next_service_id', next_service_id);
        var service_model = {
            type : selected,
            id : next_service_id,

            // This is a temporary solution until there's a real way
            // for the system to coordinate what version to install.
            version: jutVersion.build
        };

        var service_view = new ServiceView({
            inputs : serviceViewConfig[selected].inputs,
            defaultOptions : serviceViewConfig[selected].defaultOptions,
            type : selected,
            model : service_model,
            service_id : next_service_id
        });
        service_view.enable_edit();
        this.$el.find('#host-collectors-container').append(service_view.$el);
        this.service_views.push(service_view);
    },

    validate_inputs : function () {
        var errors;

        // Check base properties

        var name_input = this.$el.find('#host-name-input');
        var name_input_value = name_input.val();

        if (!name_input_value || name_input_value.length === 0) {
            name_input.parent()
                .addClass('has-warning')
                .append($('<label class="host-status-label health-warning">').html('Name cannot be empty'));
            errors = 'name empty';
        } else {
            this.model.set('name', name_input_value);
        }

        return errors;
    },

    toggle_error_message : function (error) {
        this.$el.find('#host-services').html(error).addClass('host-error');
    },

    remove_collector : function (event) {
        $(event.target).parents('.collector').remove();
    }
});

var HostsListView = BaseView.extend({

    initialize : function (options) {
        this.collection = options.collection;
        this.listenTo(this.collection, 'add', this.add_host);
        this.listenTo(this.collection, 'sync', this.check_hosts);
        _.bind(this.add_host, this);
        this.app = options.app;
        this.$el.append($('<p id="empty-warning">'));
    },

    add_host : function (model) {
        this.$el.find('#empty-warning').empty();
        var view = new HostView({
            model : model,
            app: this.app
        });
        view.render();
        this.$el.append(view.$el);
    },

    check_hosts : function () {
        if (this.collection.length === 0) {
            this.$el.find($('#empty-warning').html("Waiting for hosts..."));
        }
    }
});

var PageView = BaseView.extend({

    initialize : function (options) {
        logger = Logger.get('hosts');
        logger.debug('pageview initialize');
        this.app = options.app;
        this.collection = new HostsCollection([], {db_container : this.app.active_deployment});
        this.list_view = new HostsListView({
            collection : this.collection, 
            el : this.el,
            app : this.app
        });

    },

    render : function (options) {
        logger.debug('pageview render');
        var self = this;
        this.collection.fetch();

        setInterval(function() {
            logger.debug('fetching collection...');
            self.collection.fetch();
        }, 2000);
    }

}, {
    needs_data_node : false
});

function getHealthForStatus(status) {
    if (status && status.state === 'ok') {
        return healthLevels[0];
    } else if (status && status.state === 'error') {
        return healthLevels[2];
    } else {
        return healthLevels[1];
    }
}

var healthLevels = [
    { level : 0, className : 'health-good' },
    { level : 1, className : 'health-warning' },
    { level : 2, className : 'health-alert' }
];


module.exports = PageView;
});
