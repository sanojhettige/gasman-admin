'use strict';

angular.module('gasAdmin').constant('configs', {
    apiEndpoint: 'https://api.gasman.lk',
    devApiEndPoint: '/gas',
    liveApiEndPoint: 'http://api.gasman.lk',
    assetsEndPoint: 'http://api.gasman.lk',
    appId: '',
    currency: 'LKR ',
    s3accessKeyId: '',
    s3secretAccessKey: '',
    s3bucket: '',
    appName: 'GasMan',
    deliveryId: 4,
    asapDeliveryId: 6,
    takeAwayId: 5,
    userRoles: [{
            id: 1,
            name: 'administrator'
        },
        {
            id: 2,
            name: 'manager'
        },
        {
            id: 5,
            name: 'admin_staff'
        },
        {
            id: 6,
            name: 'agent'
        },
        {
            id: 10,
            name: 'user'
        }
    ]
});