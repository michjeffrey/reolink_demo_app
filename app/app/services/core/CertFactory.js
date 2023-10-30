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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertFactory = exports.L2_CA_VALIDATE_DAYS = exports.ROOT_CA_VALIDATE_DAYS = void 0;
const DI = __importStar(require("#fx/di"));
const Logger = __importStar(require("#fx/log"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const childProcess = __importStar(require("child_process"));
const server_1 = require("../../errors/server");
exports.ROOT_CA_VALIDATE_DAYS = 365000;
exports.L2_CA_VALIDATE_DAYS = 182500;
let CertFactory = class CertFactory {
    createRootCA(args) {
        if (!fs.existsSync(args.workDir)) {
            this._logs.error({
                'action': 'createRootCA',
                'message': 'work dir not found'
            });
            throw new server_1.E_WORK_DIR_NOT_FOUND();
        }
        const myCARandFile = `${args.rootCADir}/.rand`;
        const myCARootKeyPath = `${args.rootCADir}/key.pem`;
        const caRootReqPath = `${args.rootCADir}/ca.csr.cnf`;
        const caRootConfPath = `${args.rootCADir}/ca.cnf`;
        if (fs.existsSync(caRootConfPath)) {
            this._logs.error({
                'action': 'createRootCA',
                'message': 'duplicate create root ca'
            });
            throw new server_1.E_DUPLICATE_CREATE_CA();
        }
        const execScript = `
mkdir -p ${args.workDir}
mkdir -p ${args.rootCADir}
cd ${args.rootCADir}
mkdir -p newcerts crl
touch index.txt
openssl rand -out ${myCARandFile} 65535
md5sum ${myCARandFile} | grep -Eo '^\\w+' > ${args.rootCADir}/serial
openssl rand -out ${myCARandFile} 1048576
openssl ecparam -rand ${myCARandFile} -genkey -name secp384r1 -noout -out ${myCARootKeyPath}
cat > ${caRootReqPath} << EOL
[ req ]

default_bits        = 4096
distinguished_name  = req_distinguished_name
string_mask         = utf8only
prompt              = no

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha384

# Extension to add when the -x509 option is used.
x509_extensions     = v3_ca
req_extensions     = v3_ca

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.
countryName                     = CN
0.organizationName              = ORG
organizationalUnitName          = Department
commonName                      = CA ECC Root

[ v3_ca ]

subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, cRLSign, keyCertSign
EOL

# 生成一个有效期为 1000 年的自签名 CA 根证书
openssl req -config ${caRootReqPath} \
    -new \
    -x509 \
    -days ${exports.ROOT_CA_VALIDATE_DAYS} \
    -sha384 \
    -extensions v3_ca \
    -key ${myCARootKeyPath} \
    -out ${args.rootCertPath}

cat > ${caRootConfPath} << EOL
[ ca ]
default_ca = CA_default

[ CA_default ]
# Directory and file locations.
certs             = ${args.rootCADir}/certs
crl_dir           = ${args.rootCADir}/crl
new_certs_dir     = ${args.rootCADir}/newcerts
database          = ${args.rootCADir}/index.txt
serial            = ${args.rootCADir}/serial
RANDFILE          = ${args.rootCADir}/.rand

# The root key and root certificate.
private_key       = ${args.rootCADir}/key.pem
certificate       = ${args.rootCADir}/ca.pem

# For certificate revocation lists.
crlnumber         = ${args.rootCADir}/crlnumber
crl               = ${args.rootCADir}/crl/ca.crl.pem
crl_extensions    = crl_ext
default_crl_days  = 30

# SHA-1 is deprecated, so use SHA-2 instead.
default_md        = sha256

name_opt          = ca_default
cert_opt          = ca_default
default_days      = 375
preserve          = no
policy            = policy_strict
copy_extensions   = copy

[ policy_strict ]
# The root CA should only sign intermediate certificates that match.
countryName             = match
stateOrProvinceName     = optional
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ policy_loose ]
# Allow the intermediate CA to sign a more diverse range of certificates.
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ req ]
default_bits        = 4096
distinguished_name  = req_distinguished_name
string_mask         = utf8only
prompt              = no

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha384

# Extension to add when the -x509 option is used.
x509_extensions     = v3_ca

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.
countryName                     = CN
0.organizationName              = ORG
organizationalUnitName          = Department
commonName                      = CA ECC Root

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, cRLSign, keyCertSign

[ v3_intermediate_ca ]
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
extendedKeyUsage = critical, clientAuth, serverAuth
basicConstraints = critical, CA:true, pathlen:0
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
authorityInfoAccess = caIssuers;URI:http://${args.host}/ca.html
crlDistributionPoints = URI:http://${args.host}/ca.crl
certificatePolicies = 2.23.140.1.2.1,@policy_issuer_info

[ policy_issuer_info ]
policyIdentifier = 1.3.6.1.4.1.44947.1.2.3.4.5.6.7.8

[ crl_ext ]
authorityKeyIdentifier=keyid:always

[ ocsp ]
basicConstraints = CA:FALSE
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, OCSPSigning
EOL
        `;
        return this._excuteFile(args.workDir, execScript);
    }
    createL2CA(args) {
        const myCARandFile = `${args.l2CADir}/.rand`;
        const myCAL2KeyPath = `${args.l2CADir}/key.pem`;
        const myCAL2ReqPath = `${args.l2CADir}/ca.csr.cnf`;
        const myCAL2CsrPath = `${args.l2CADir}/ca.csr.pem`;
        const myCAL2CertChainPath = `${args.l2CADir}/ca.fullchain.pem`;
        const myCAL2ConfPath = `${args.l2CADir}/ca.cnf`;
        if (fs.existsSync(myCAL2ConfPath)) {
            this._logs.error({
                'action': 'createL2CA',
                'message': 'duplicate create L2 ca'
            });
            throw new server_1.E_DUPLICATE_CREATE_CA();
        }
        const execScript = `
mkdir -p ${args.workDir}
mkdir -p ${args.l2CADir}
cd ${args.l2CADir}


mkdir -p certs crl csr newcerts private
touch index.txt

openssl rand -out ${myCARandFile} 65535
sha1sum ${myCARandFile} | grep -Eo '^\\w+' > ${args.l2CADir}/serial

openssl rand -out ${myCARandFile} 65535
sha1sum ${myCARandFile} | grep -Eo '^\\w+' > ${args.l2CADir}/crlnumber

openssl rand -out ${myCARandFile} 1048576

openssl ecparam -rand ${myCARandFile} -genkey -name secp384r1 -noout -out ${myCAL2KeyPath}

cat > ${myCAL2ReqPath} << EOL
[ req ]
default_bits        = 4096
distinguished_name  = req_distinguished_name
string_mask         = utf8only

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha384
prompt              = no

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.
countryName                     = CN
0.organizationName              = ORG
organizationalUnitName          = Department
commonName                      = CA ECC E1
EOL



openssl req \
    -config ${myCAL2ReqPath} \
    -new \
    -key ${myCAL2KeyPath} \
    -out ${myCAL2CsrPath}


openssl ca \
    -config ${args.rootCADir}/ca.cnf \
    -extensions v3_intermediate_ca \
    -days ${exports.L2_CA_VALIDATE_DAYS} \
    -notext \
    -md sha384 \
    -batch \
    -in ${myCAL2CsrPath} \
    -out ${args.l2CACertPath}

cat > ${myCAL2CertChainPath} << EOL
$(cat ${args.l2CACertPath})

$(cat ${args.rootCertPath})
EOL


cat > ${myCAL2ConfPath} << EOL
[ ca ]
# man ca
default_ca = CA_default

[ CA_default ]
# Directory and file locations.
certs             = ${args.l2CADir}/certs
crl_dir           = ${args.l2CADir}/crl
new_certs_dir     = ${args.l2CADir}/newcerts
database          = ${args.l2CADir}/index.txt
serial            = ${args.l2CADir}/serial
RANDFILE          = ${args.l2CADir}/.rand

# The root key and root certificate.
private_key       = ${args.l2CADir}/key.pem
certificate       = ${args.l2CADir}/ca.pem

# For certificate revocation lists.
crlnumber         = ${args.l2CADir}/crlnumber
crl               = ${args.l2CADir}/crl/intermediate.crl.pem
crl_extensions    = crl_ext
default_crl_days  = 30

# SHA-1 is deprecated, so use SHA-2 instead.
default_md        = sha256

name_opt          = ca_default
cert_opt          = ca_default
default_days      = 375
preserve          = no
policy            = policy_loose
copy_extensions   = copy

[ policy_loose ]
# Allow the intermediate CA to sign a more diverse range of certificates.
# See the POLICY FORMAT section of the ca man page.
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ client_cert ]
# Extensions for client certificates (man x509v3_config).
basicConstraints = CA:FALSE
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth
authorityInfoAccess = caIssuers;URI:http://${args.host}/ca.html
# authorityInfoAccess = OCSP;URI:http://ocsp.${args.host}/
certificatePolicies = 2.23.140.1.2.1,@policy_issuer_info

[ server_cert ]
# Extensions for server certificates (man x509v3_config).
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
basicConstraints = CA:FALSE
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
authorityInfoAccess = caIssuers;URI:http://${args.host}/ca.html
# authorityInfoAccess = OCSP;URI:http://ocsp.${args.host}/
certificatePolicies = 2.23.140.1.2.1,@policy_issuer_info

[ policy_issuer_info ]
policyIdentifier = 1.3.6.1.4.1.44947.1.2.3.4.5.6.7.8
CPS.1 = "http://cps.${args.host}/"
# userNotice.1 = @policy_issuer_notice

# [ policy_issuer_notice ]

# explicitText="This is a demo certificate"
# organization="Demo ORG"

EOL

echo 'unique_subject = no' > ${args.l2CADir}/index.txt.attr
`;
        return this._excuteFile(args.workDir, execScript);
    }
    createServerCert(args) {
        const execScript = `
openssl ecparam -rand ${args.l2CADir}/.rand -genkey -name prime256v1 -noout -out ${args.serverKeyPath}
NEW_SERVER_CERT_REQ_PATH=${args.l2CADir}/csr/server-${args.host}.csr.cnf

cat > $NEW_SERVER_CERT_REQ_PATH << EOL
[ req ]
distinguished_name  = req_distinguished_name
string_mask         = utf8only
req_extensions      = req_ext # If there is IP address required
x509_extensions     = v3_req # If there is IP address required

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha256
prompt              = no

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.
commonName                      = ${args.host}

[req_ext]
subjectAltName = @alt_names

[v3_req]
subjectAltName = @alt_names

[alt_names]
${args.altNames}
EOL

NEW_SERVER_CERT_CSR_PATH=${args.l2CADir}/csr/server-${args.host}.csr.pem

openssl req \
    -config $NEW_SERVER_CERT_REQ_PATH \
    -new -sha256 \
    -key ${args.serverKeyPath} \
    -out $NEW_SERVER_CERT_CSR_PATH

NEW_SERVER_CERT_PATH=${args.l2CADir}/newcerts/server-${args.host}.cert.pem

openssl ca \
    -config ${args.l2CADir}/ca.cnf \
    -extensions server_cert \
    -startdate ${args.startDate} \
    -enddate ${args.endDate} \
    -notext \
    -md sha256 \
    -batch \
    -in $NEW_SERVER_CERT_CSR_PATH \
    -out $NEW_SERVER_CERT_PATH

cat > ${args.serverFullchainPath} << EOL
$(cat $NEW_SERVER_CERT_PATH)

$(cat ${args.l2CACertPath})
EOL
`;
        return this._excuteFile(args.workDir, execScript);
    }
    createClientCert(args) {
        const execScript = `
NEW_CLIENT_CERT_REQ_PATH=${args.l2CADir}/csr/client-${args.uid}.csr.cnf

openssl ecparam -rand ${args.l2CADir}/.rand -genkey -name prime256v1 -noout -out ${args.clientKeyPath}

cat > $NEW_CLIENT_CERT_REQ_PATH << EOL
[ req ]
distinguished_name  = req_distinguished_name
string_mask         = utf8only

# SHA-1 is deprecated, so use SHA-2 instead.
default_md          = sha256
prompt              = no

[ req_distinguished_name ]
# See <https://en.wikipedia.org/wiki/Certificate_signing_request>.
commonName                      = ${args.uid}
EOL

NEW_CLIENT_CERT_CSR_PATH=${args.l2CADir}/csr/client-${args.uid}.csr.pem

openssl req \
    -config $NEW_CLIENT_CERT_REQ_PATH \
    -new -sha256 \
    -key ${args.clientKeyPath} \
    -out $NEW_CLIENT_CERT_CSR_PATH

NEW_CLIENT_CERT_PATH=${args.l2CADir}/newcerts/client-${args.uid}.cert.pem

openssl ca \
    -config ${args.l2CADir}/ca.cnf \
    -extensions client_cert \
    -days ${args.validDays} \
    -notext \
    -md sha256 \
    -batch \
    -in $NEW_CLIENT_CERT_CSR_PATH \
    -out $NEW_CLIENT_CERT_PATH

cat > ${args.clientFullchainPath} << EOL
$(cat $NEW_CLIENT_CERT_PATH)

$(cat ${args.l2CACertPath})
EOL
`;
        return this._excuteFile(args.workDir, execScript);
    }
    _excuteFile(workDir, execScript) {
        const file = crypto.createHash('md5').update(execScript).digest().toString('hex');
        const execFile = `${workDir}/${file}.sh`;
        fs.writeFileSync(execFile, execScript, {
            'flag': 'w'
        });
        return new Promise((resolve) => {
            childProcess.exec(`sh ${execFile}`, () => {
                fs.unlinkSync(execFile);
                resolve();
            });
        });
    }
};
__decorate([
    Logger.UseLogger('default'),
    __metadata("design:type", Object)
], CertFactory.prototype, "_logs", void 0);
CertFactory = __decorate([
    DI.Singleton()
], CertFactory);
exports.CertFactory = CertFactory;
//# sourceMappingURL=CertFactory.js.map