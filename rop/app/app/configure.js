"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("ts-alias-loader");
const app = __importStar(require("#fx/app"));
const _ = __importStar(require("#fx/utils"));
const $fs = __importStar(require("fs"));
let AppROPConfigure = class AppROPConfigure extends app.AbstractApplication {
    _genConfig(args) {
        return {
            'ports': {
                'getCAHttps': 61000,
                'registerHttps': 61002,
                'getCertHttps': 61001,
                'keepAliveTCP': 61003,
                'signalingTLS': 61005,
                'streamTLS': 61006,
                'streamTCP': 61007,
                'clientHttp': 61009,
                'clientRtsp': 61008
            },
            'serverHost': args.hostname,
            'cert': {
                'workDir': '/data/certs',
                'serverCertValidDays': 90,
                'serverCertValidDaysBefore': 30,
                'clientCertValidDays': 180
            },
            'deviceStream': {
                'encryptMode': 'TLS',
            },
            'authCode': {
                'signKey': args.authCodeSignKey,
                'expiredIn': 60
            },
            'alarm': {
                'enabled': args.alarmEnabled,
                'notificationURL': args.alarmWebhook
            },
            'upgrade': {
                'filePath': '/data/firmware',
                'maxSession': 100,
                'sessionTTL': 3600000
            },
            'rtsp': {
                'playSessionTTL': 30000,
                'playURLPrefix': args.rtspPlayURLPrefix
            },
            'timeout': {
                'streamTimeout': 30000,
                'signalingExec': 10000,
                'signalingConnectionIdle': 30000
            },
            'deviceAuth': {
                'deviceKeys': {
                    [args.deviceKeyIndex]: args.deviceKey
                },
                'currentKeyIndex': args.deviceKeyIndex
            },
            'application': {
                'instanceId': '553ef7e3-16d5-4ff0-82bb-099b4b1697c4',
            },
            'logs': {
                'drivers': {},
                'subjects': {
                    'default': {
                        'enabled': true,
                        'levels': [
                            'info',
                            'error',
                            'debug',
                            'warning'
                        ],
                        'driver': 'console',
                    },
                },
            }
        };
    }
    _genConfigFile(path = '/data') {
        const file = `${path}/config.json`;
        if ($fs.existsSync(file)) {
            console.log('config.json already exist, do not create it again.');
            return;
        }
        const hostname = process.env['ROP_HOSTNAME'];
        if (!hostname) {
            const errorMsg = 'invalid ROP_HOSTNAME in docker-compose.yml, please check it.';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        const alarmWebhook = process.env['ROP_ALARM_WEBHOOK'];
        let alarmEnabled = true;
        if (!alarmWebhook || alarmWebhook.length === 0) {
            alarmEnabled = false;
        }
        const rtspPlayURLPrefix = process.env['RTSP_PLAY_URL_PREFIX'];
        if (!rtspPlayURLPrefix || rtspPlayURLPrefix.length === 0) {
            const errorMsg = 'invalid RTSP_PLAY_URL_PREFIX in docker-compose.yml, please check it.';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        const config = this._genConfig({
            alarmEnabled,
            'alarmWebhook': alarmWebhook ?? '',
            'authCodeSignKey': _.String.randomString(16),
            'deviceKey': _.String.randomString(32),
            'deviceKeyIndex': _.String.randomString(16),
            rtspPlayURLPrefix,
            'hostname': hostname
        });
        $fs.writeFileSync(file, JSON.stringify(config, undefined, '    '));
    }
    main() {
        this._genConfigFile();
        console.log('generate config file at /data/config.json ok!');
        return 0;
    }
    static async setup() {
    }
};
AppROPConfigure = __decorate([
    app.AppSchema({
        type: 'app',
        name: 'ROPConfigure',
    })
], AppROPConfigure);
_.Async.invokeAsync(async () => {
    const exe = new app.Executor(AppROPConfigure, {
        appRoot: `${__dirname}/..`,
    });
    process.exit(await exe.execute(process.argv));
});
//# sourceMappingURL=configure.js.map