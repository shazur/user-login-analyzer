var fs = require('fs');
var _ = require('lodash');
var csv=require('csvtojson')

function detectSuspiciousByUsers(jsonArr) {
    var loginsByUuid = groupLoginsByUuid(jsonArr);
    return _.reduce(loginsByUuid, function(acc, userLogins, uuid) {
        var suspiciousUserLogins = getSuspicious(userLogins);
        if (suspiciousUserLogins.length) {
            acc[uuid] = suspiciousUserLogins;
        }
        return acc;
    }, {});
}

function handleCsv(req, res) {
    var sampleUserIdA = "51527b90-d2f0-41f7-afce-f4e6dcadd2e9";
    var sampleUserIdB = "b5c99594-92cc-4c9c-9f0c-31f575307d8e";
    var sampleUserId = "91055dbd-acd2-4ebd-9df4-ad9501d6da8b";
    var jsonArr = [];
    var csvFilePath='logins.csv';
    csv()
        .fromFile(csvFilePath)
        .on('json', function(jsonObj) {
            jsonArr.push(jsonObj)
    })
    .on('done',function(error) {
        console.log(detectSuspiciousByUsers(jsonArr));

        //console.log('sample uuid', sampleUserId);
        //var sampleUserLogins = groupLoginsByUuid(jsonArr)[sampleUserId];
        //console.log('sampleUserLogins', sampleUserLogins);
        //var sampleUserSuspiciousLogins = getSuspicious(sampleUserLogins);
        //console.log('suspicious logins', sampleUserSuspiciousLogins);

        console.log('end')
    });
}

function groupLoginsByUuid(logins) {
    return _.groupBy(logins, "uuid");

}

function getSuspicious(userLogins) {
    var sortedLogins = sortByDate(userLogins);
    return sortedLogins.filter(isSuspicious);
}

function sortByDate(userLogins) {
    return userLogins.sort(function(loginA, loginB) {
        var loginADate = loginA['date_created'];
        var loginBDate = loginB['date_crated'];
        if (loginADate === loginBDate) {
            return 0;
        }
        return loginADate < loginBDate ? -1 : 1;
    });
}

function isSuspicious(login, index, arr) {
    var prevLogin = arr[index - 1];
    if (!prevLogin || prevLogin["client_id"] === login["client_id"]) {
        return false;
    }
    return prevLogin["user_agent"] !== login["user_agent"] || prevLogin["country_code"] !== login["country_code"];
}

module.exports = {
    handleCsv: handleCsv
};