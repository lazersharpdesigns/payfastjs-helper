const crypto = require("crypto");
const axios = require('axios').default;
const dns = require('dns');

const Live = 'https://www.payfast.co.za/eng/process'
const Sandbox = 'https://sandbox.payfast.co.za​/eng/process'

const SERVER_VALIDATION = {
    'COMPLETE': 'COMPLETE',
    'CANCELLED': 'CANCELLED',
}

// create md5 signature for payments
const hash = (data, passPhrase) => {
    // Create parameter string
    let pfOutput = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== "") {
                pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
}

const generateDataString = (dataArray) => {
    // Convert your data array to a string
    let pfParamString = "";
    for (let key in dataArray) {
        if (dataArray[key]) {
            if (dataArray.hasOwnProperty(key)) {
                if (dataArray[key] !== "") {
                    pfParamString += `${key}=${encodeURIComponent(dataArray[key].trim()).replace(/%20/g, "+")}&`;
                }
            }
        }
    }
    // Remove last ampersand
    return pfParamString.slice(0, -1);
}

const generatePaymentIdentifier = async (dataString) => {
    console.log(dataString);
    const result = await axios.post(`https://www.payfast.co.za/onsite/process`, dataString)
        .then((res) => {
            return res.data.uuid || null;
        })
        .catch((error) => {
            console.error(error)
        });
    return result;
};

const createPaymentObject = (paymentData) => {
    return {
        ...this.payfastData,

        return_url: paymentData.return_url || '',
        cancel_url: paymentData.cancel_url || '',
        notify_url: paymentData.notify_url || '',

        name_first: paymentData.name_first || '',
        name_last: paymentData.name_last || '',
        email_address: paymentData.email_address || '',
        cell_number: paymentData.cell_number || '',

        m_payment_id: paymentData.m_payment_id || '',
        amount: paymentData.amount || '',
        item_name: paymentData.item_name || '',
        item_description: paymentData.item_description || '',

        custom_int1: paymentData.custom_int1 || '',
        custom_int2: paymentData.custom_int2 || '',
        custom_int3: paymentData.custom_int3 || '',
        custom_int4: paymentData.custom_int4 || '',
        custom_int5: paymentData.custom_int5 || '',

        custom_str1: paymentData.custom_str1 || '',
        custom_str2: paymentData.custom_str2 || '',
        custom_str3: paymentData.custom_str3 || '',
        custom_str4: paymentData.custom_str4 || '',
        custom_str5: paymentData.custom_str5 || '',

        email_confirmation: paymentData.email_confirmation || '',
        confirmation_address: paymentData.confirmation_address || '',
        payment_method: paymentData.payment_method || '',

        signature: '',
    }
}

const createSubscriptionObject = (paymentData) => {
    return {
        ...this.payfastData,

        return_url: paymentData.return_url || '',
        cancel_url: paymentData.cancel_url || '',
        notify_url: paymentData.notify_url || '',

        name_first: paymentData.name_first || '',
        name_last: paymentData.name_last || '',
        email_address: paymentData.email_address || '',
        cell_number: paymentData.cell_number || '',

        m_payment_id: paymentData.m_payment_id || '',
        amount: paymentData.amount || '',
        item_name: paymentData.item_name || '',
        item_description: paymentData.item_description || '',

        custom_int1: paymentData.custom_int1 || '',
        custom_int2: paymentData.custom_int2 || '',
        custom_int3: paymentData.custom_int3 || '',
        custom_int4: paymentData.custom_int4 || '',
        custom_int5: paymentData.custom_int5 || '',

        custom_str1: paymentData.custom_str1 || '',
        custom_str2: paymentData.custom_str2 || '',
        custom_str3: paymentData.custom_str3 || '',
        custom_str4: paymentData.custom_str4 || '',
        custom_str5: paymentData.custom_str5 || '',

        email_confirmation: paymentData.email_confirmation || '',
        confirmation_address: paymentData.confirmation_address || '',
        payment_method: paymentData.payment_method || '',

        subscription_type: paymentData.subscription_type || '',
        billing_date: paymentData.billing_date || '',
        recurring_amount: paymentData.recurring_amount || '',
        frequency: paymentData.frequency || '',
        cycles: paymentData.cycles || '',

        signature: '',
    }
}

const createSubscriptionHeaders = (merchant_id, passPhrase, body) => {
    const timestamp = new Date().toISOString();
    return {
        'merchant-id': merchant_id,
        'version': 'v1',
        'timestamp': timestamp,
        'signature': hash(Object.keys({
            'merchant-id': merchant_id,
            'passphrase': passPhrase,
            'version': 'v1',
            'timestamp': timestamp,
            ...body
        })
            .sort())
    }
}

class PayfastHandler {
    constructor(merchantKey, merchantId, passPhrase) {
        if (!merchantKey) {
            throw "Please enter your merchant_key"
        }
        if (!merchantId) {
            throw "Please enter your merchant_id"
        }

        // insert payfast script
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://www.payfast.co.za/onsite/engine.js';
        head.appendChild(script);

        // populate payfast data
        this.passPhrase = passPhrase;
        this.payfastData = {
            merchant_id: merchantId,
            merchant_key: merchantKey
        }
    }

    async createPayment(paymentData = {
        return_url: '',
        cancel_url: '',
        notify_url: '',

        name_first: '',
        name_last: '',
        email_address: '',
        cell_number: '',

        m_payment_id: '',
        amount: '',
        item_name: '',
        item_description: '',

        custom_int1: '',
        custom_int2: '',
        custom_int3: '',
        custom_int4: '',
        custom_int5: '',

        custom_str1: '',
        custom_str2: '',
        custom_str3: '',
        custom_str4: '',
        custom_str5: '',

        email_confirmation: '',
        confirmation_address: '',
        payment_method: '',
    }, options = {
        sandbox: false,
        onsite: false,
    }, callback = () => { }) {

        console.log(options);

        if (!paymentData['amount']) {
            throw "Please enter your amount"
        }
        if (!paymentData['email_address'] && !paymentData['cell_number']) {
            throw "Please enter your email_address or your cell_number"
        }

        if (!paymentData['cancel_url'] && !options.onsite) {
            throw "Please enter your cancel_url"
        }

        if (!paymentData['return_url'] && !options.onsite) {
            throw "Please enter your return_url"
        }

        if (!paymentData['notify_url']) {
            throw "Please enter your notify_url"
        }

        if (!paymentData['item_name']) {
            throw "Please enter your item_name"
        }

        // populate payment data
        this.payfastData = {
            ...this.payfastData,
            ...createPaymentObject(paymentData)
        }

        // generate signature
        this.payfastData['signature'] = hash(this.payfastData, this.passPhrase || null);

        // generate pfDataString
        const pfParamString = generateDataString(this.payfastData);
        if (!options.onsite) {
            return window.location.href = (options.sandbox ? Sandbox : Live) + '?' + pfParamString;
        } else {
            // generate payment identifier
            const identifier = await generatePaymentIdentifier(pfParamString)
            /** 
                if return_url && cacel_url is provided, redirect user
                if both are not provided, return callback 
            **/
            if (identifier) {
                if (paymentData['return_url'] && paymentData['cancel_url']) {
                    window['payfast_do_onsite_payment']({
                        "uuid": identifier,
                        "return_url": paymentData['return_url'],
                        "cancel_url": paymentData['cancel_url']
                    });
                } else {
                    window['payfast_do_onsite_payment']({ "uuid": identifier }, function (result) {
                        if (result === true) {
                            // Payment Completed
                            callback(result)
                        }
                        else {
                            // Payment Window Closed
                            callback(false)
                        }
                    });
                }
            } else {
                throw "Something went wrong"
            }
        }
    }

    async createSubscription(paymentData = {
        return_url: '',
        cancel_url: '',
        notify_url: '',

        name_first: '',
        name_last: '',
        email_address: '',
        cell_number: '',

        m_payment_id: '',
        amount: '',
        item_name: '',
        item_description: '',

        custom_int1: '',
        custom_int2: '',
        custom_int3: '',
        custom_int4: '',
        custom_int5: '',

        custom_str1: '',
        custom_str2: '',
        custom_str3: '',
        custom_str4: '',
        custom_str5: '',

        email_confirmation: '',
        confirmation_address: '',
        payment_method: '',

        subscription_type: '1',
        billing_date: '',
        recurring_amount: '',
        frequency: '3',
        cycles: '',
    }, options = {
        sandbox: false,
        onsite: false,
    }, callback = () => { }) {

        if (!paymentData['amount']) {
            throw "Please enter your amount"
        }

        if (!this.passPhrase) {
            throw "Please initialize with your passphrase"
        }

        if (!paymentData['cycles']) {
            throw "Please enter your cycles"
        }

        if (!paymentData['email_address'] && !paymentData['cell_number']) {
            throw "Please enter your email_address or your cell_number"
        }

        if (!paymentData['cancel_url'] && !options.onsite) {
            throw "Please enter your cancel_url"
        }

        if (!paymentData['return_url'] && !options.onsite) {
            throw "Please enter your return_url"
        }

        if (!paymentData['notify_url']) {
            throw "Please enter your notify_url"
        }

        if (!paymentData['item_name']) {
            throw "Please enter your item_name"
        }

        // populate payment data
        this.payfastData = {
            ...this.payfastData,
            ...createSubscriptionObject({ ...paymentData, subscription_type: paymentData.subscription_type || '1', frequency: paymentData.frequency || '3' })
        }

        // generate signature
        this.payfastData['signature'] = hash(this.payfastData, this.passPhrase || null);

        // generate pfDataString
        const pfParamString = generateDataString(this.payfastData);

        if (options.onsite) {
            // generate payment identifier
            const identifier = await generatePaymentIdentifier(pfParamString)
            /** 
                if return_url && cacel_url is provided, redirect user
                if both are not provided, return callback 
            **/
            if (identifier) {
                if (paymentData['return_url'] && paymentData['cancel_url']) {
                    window['payfast_do_onsite_payment']({
                        "uuid": identifier,
                        "return_url": paymentData['return_url'],
                        "cancel_url": paymentData['cancel_url']
                    });
                } else {
                    window['payfast_do_onsite_payment']({ "uuid": identifier }, function (result) {
                        if (result === true) {
                            // Payment Completed
                            callback(result)
                        }
                        else {
                            // Payment Window Closed
                            callback(false)
                        }
                    });
                }
            } else {
                throw "Something went wrong"
            }
        } else {
            return window.location.href = (options.sandbox ? Sandbox : Live) + '?' + pfParamString;
        }
    }

}

class PayfastSubscriptionHandler {
    constructor(merchantId, passPhrase) {

        if (!merchantId) {
            throw "Please enter your merchant_id"
        }
        if (!passPhrase) {
            throw "Please enter your passPhrase"
        }

        // populate payfast data
        this.passPhrase = passPhrase;
        this.payfastData = {
            merchant_id: merchantId,
        }
    }

    async cancelSubscription(pfToken) {
        if (!pfToken) {
            throw "Please enter your pfToken"
        }
        try {
            await axios({
                url: `https://api.payfast.co.za/subscriptions/${pfToken}/cancel`,
                method: 'PUT',
                headers: {
                    ...createSubscriptionHeaders(this.merchantId, this.passPhrase)
                }
            })
            return true;
        } catch (err) {
            throw err;
        }
    }

    async validateITN(req, sandbox = false) {

        const pfHost = sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";

        const pfData = JSON.parse(JSON.stringify(req.body));

        let pfParamString = "";
        for (let key in pfData) {
            if (pfData.hasOwnProperty(key) && key !== "signature") {
                pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
            }
        }

        // Remove last ampersand
        pfParamString = pfParamString.slice(0, -1);

        const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
            // Calculate security signature
            let tempParamString = '';
            if (pfPassphrase !== null) {
                pfParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
            }

            const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
            return pfData['signature'] === signature;
        };

        async function ipLookup(domain) {
            return new Promise((resolve, reject) => {
                dns.lookup(domain, { all: true }, (err, address, family) => {
                    if (err) {
                        reject(err)
                    } else {
                        const addressIps = address.map(function (item) {
                            return item.address;
                        });
                        resolve(addressIps);
                    }
                });
            });
        }

        const pfValidIP = async (req) => {
            const validHosts = [
                'www.payfast.co.za',
                'sandbox.payfast.co.za',
                'w1w.payfast.co.za',
                'w2w.payfast.co.za'
            ];

            let validIps = [];
            const pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            try {
                for (let key in validHosts) {
                    const ips = await ipLookup(validHosts[key]);
                    validIps = [...validIps, ...ips];
                }
            } catch (err) {
                console.error(err);
            }

            const uniqueIps = [...new Set(validIps)];

            if (uniqueIps.includes(pfIp)) {
                return true;
            }
            return false;
        };

        const pfValidPaymentData = (cartTotal, pfData) => {
            return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
        };

        const pfValidServerConfirmation = async (pfHost, pfParamString) => {
            const result = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString)
                .then((res) => {
                    return res.data;
                })
                .catch((error) => {
                    console.error(error)
                });
            return result === 'VALID';
        };

        const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
        const check2 = pfValidIP(req);
        const check3 = pfValidPaymentData(cartTotal, pfData);
        const check4 = pfValidServerConfirmation(pfHost, pfParamString);

        if (check1 && check2 && check3 && check4) {
            return {
                passed: true,
                status: pfData.payment_status === SERVER_VALIDATION.COMPLETE ? SERVER_VALIDATION.COMPLETE : SERVER_VALIDATION.CANCELLED,
                data: pfData
            }
        } else {
            // Some checks have failed, check payment manually and log for investigation
            return {
                passed: false,
            }
        }
    }

    async updateSubscription(pfToken, paymentData = {
        cycles: '',
        amount: '',
        run_date: '',
        frequency: ''
    }) {
        if (!pfToken) {
            throw "Please enter your pfToken"
        }
        try {
            await axios({
                url: `https://api.payfast.co.za/subscriptions/${pfToken}/pause`,
                method: 'PUT',
                headers: {
                    ...createSubscriptionHeaders(this.merchantId, this.passPhrase, paymentData)
                },
                data: {
                    ...paymentData
                }
            })
            return true;
        } catch (err) {
            throw err;
        }
    }

    async pauseSubscription(pfToken, cycles) {
        if (!pfToken) {
            throw "Please enter your pfToken"
        }
        try {
            await axios({
                url: `https://api.payfast.co.za/subscriptions/${pfToken}/pause`,
                method: 'PUT',
                headers: {
                    ...createSubscriptionHeaders(this.merchantId, this.passPhrase, body)
                },
                data: {
                    cycles: cycles || '1',
                }
            })
            return true;
        } catch (err) {
            throw err;
        }
    }

    async unpauseSubscription(pfToken) {
        if (!pfToken) {
            throw "Please enter your pfToken"
        }
        try {
            await axios({
                url: `https://api.payfast.co.za/subscriptions/${pfToken}/unpause`,
                method: 'PUT',
                headers: {
                    ...createSubscriptionHeaders(this.merchantId, this.passPhrase)
                }
            })
            return true;
        } catch (err) {
            throw err;
        }
    }

    async getSubscription(pfToken) {
        if (!pfToken) {
            throw "Please enter your pfToken"
        }
        try {
            const subscription = await axios({
                url: `https://api.payfast.co.za/subscriptions/${pfToken}/fetch`,
                method: 'GET',
                headers: {
                    ...createSubscriptionHeaders(this.merchantId, this.passPhrase)
                }
            })
            return subscription.data;
        } catch (err) {
            throw err;
        }
    }
}


module.exports = { PayfastHandler, PayfastSubscriptionHandler, SERVER_VALIDATION };

