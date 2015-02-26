                                            require(['applib/jut-app/launcher', 'logger', 'logger-config', 'jut-version'],
    function(JutLauncher, Logger, LoggerConfig, version) {
        Logger.config(LoggerConfig);
        Logger.get('app').info('initializing version', version.version);
        var JLr = new JutLauncher({
            client: window.JutClientConfig.client
        });
        window.jut = JLr.launch();
    }
);
    