"use strict";

const util = require('util');
var readYaml = require('read-yaml-promise');
var MiniTools = require('mini-tools');
var extensionServeStatic = require('extension-serve-static');

var Promises = require('best-promise');

var backend = require("backend-plus")

class AppPizarra extends backend.AppBackend{
    configList(){
        return super.configList().concat([
            'def-config.yaml',
            'local-config.yaml'
        ]);
    }
    addLoggedServices(){
        super.addLoggedServices();
        var be = this;
        be.app.use('/',extensionServeStatic(this.rootPath+'client',{staticExtensions:['jpg','png','html','gif']}));
    }
}

new AppPizarra().start();