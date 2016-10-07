'use strict';

var exports = module.exports = {};
var TRAIN_PATH = '/sip/public/images/train/';
var IMAGES_PATH = '/sip/public/images/';
var RESOURCES_PATH = '/sip/public/images/resources/';
var MobileDetect = require('mobile-detect');
var TRAIN_STATUS = ['全線停止', '一部停止', '通常運行', '確認中'];
var BUILDING_STATUS = ['受入中', '受入不可', '閉鎖', '確認中'];
var BUILDING_RESOURCES = ['判定結果', '火災', '電気', 'ガス', '水道', '通信', 'トイレ'];

exports.getMainStatus = function(bousais) {
    var disasterStatus = { curPhase: 0, disasterStatus: bousais, phaseColor: 'grey' };
    bousais.forEach(function(status) {
        switch (status.id) {
            case 1: // 発災
                if (status.value) {
                    disasterStatus.curPhase = 1;
                    disasterStatus.phaseColor = 'darkred';
                }
                status.imageSrc = status.value ? IMAGES_PATH + 'phase1.png' : IMAGES_PATH + 'phase1_off.png';
                break;
            case 2: // 残留退避
                if (status.value) {
                    disasterStatus.curPhase = 2;
                    disasterStatus.phaseColor = 'orange';
                }
                status.imageSrc = status.value ? IMAGES_PATH + 'phase2.png' : IMAGES_PATH + 'phase2_off.png';
                break;
            case 3: // 滞在
                if (status.value) {
                    disasterStatus.curPhase = 3;
                    disasterStatus.phaseColor = 'green';
                }
                status.imageSrc = status.value ? IMAGES_PATH + 'phase3.png' : IMAGES_PATH + 'phase3_off.png';
                break;
            case 4: // 帰宅
                if (status.value) {
                    disasterStatus.curPhase = 4;
                    disasterStatus.phaseColor = 'blue';
                }
                status.imageSrc = status.value ? IMAGES_PATH + 'phase4.png' : IMAGES_PATH + 'phase4_off.png';
                break;

            default:
                break;
        }
    });
    disasterStatus.disasterStatus = bousais;

    return disasterStatus;
};

function _setupTrainStatus(statusCode, total) {
    switch (statusCode) {
        case 0: // checking
            total.checking++;
            total.summary[3].trainNumber++;
            return { state: '確認中', color: 'red' };
            break;
        case 1: // stop
            total.stop++;
            total.summary[0].trainNumber++;
            return { state: '全線停止', color: 'red' };
            break;
        case 2: // stop some
            total.stopSome++;
            total.summary[1].trainNumber++;
            return { state: '一部停止', color: 'yellow' };
            break;
        case 3: // good
            total.good++;
            total.summary[2].trainNumber++;
            return { state: '運行中', color: 'blue' };
            break;

        default:
            return '';
            break;
    }
}

exports.formatTrainStatus = function(trainStatus) {
    var trains = { isSuccessful: true, total: { good: 0, stop: 0, stopSome: 0, checking: 0, summary: [] }, detail: [] };
    TRAIN_STATUS.forEach(function(status) {
        trains.total.summary.push({ trainStatus: status, trainNumber: 0 });
    });

    if (trainStatus.length == 0) {
        trains.noData = true;
        return trains;
    }

    trains.detail = [{}, {}, {}, {}];
    trainStatus.forEach(function(train) {
        var stateObj = _setupTrainStatus(train.trainStatus, trains.total);
        switch (train.trainName) {
            case '山手線':
                trains.detail[0].name1 = '山手線';
                trains.detail[0].icon1 = TRAIN_PATH + 'JR_JY.png';
                trains.detail[0].state1 = stateObj.state;
                trains.detail[0].stateColor1 = stateObj.color;
                trains.detail[0].Updated1 = train.updated;
                break;
            case '京王線':
                trains.detail[0].name2 = '京王線';
                trains.detail[0].icon2 = TRAIN_PATH + 'Keio.png';
                trains.detail[0].state2 = stateObj.state;
                trains.detail[0].stateColor2 = stateObj.color;
                trains.detail[0].Updated2 = train.updated;
                break;
            case '丸ノ内線':
                trains.detail[0].name3 = '丸ノ内線';
                trains.detail[0].icon3 = TRAIN_PATH + 'Subway_TokyoMarunouchi.png';
                trains.detail[0].state3 = stateObj.state;
                trains.detail[0].stateColor3 = stateObj.color;
                trains.detail[0].Updated3 = train.updated;
                break;
            case '中央線（快速）':
                trains.detail[1].name1 = '中央線';
                trains.detail[1].icon1 = TRAIN_PATH + 'JR_JC.png';
                trains.detail[1].state1 = stateObj.state;
                trains.detail[1].stateColor1 = stateObj.color;
                trains.detail[1].Updated1 = train.updated;
                break;
            case '小田急線':
                trains.detail[1].name2 = '小田急線';
                trains.detail[1].icon2 = TRAIN_PATH + 'Odakyu_odawara.png';
                trains.detail[1].state2 = stateObj.state;
                trains.detail[1].stateColor2 = stateObj.color;
                trains.detail[1].Updated2 = train.updated;
                break;
            case '副都心線':
                trains.detail[1].name3 = '副都心線';
                trains.detail[1].icon3 = TRAIN_PATH + 'Subway_TokyoFukutoshin.png';
                trains.detail[1].state3 = stateObj.state;
                trains.detail[1].stateColor3 = stateObj.color;
                trains.detail[1].Updated3 = train.updated;
                break;
            case '中央・総武線（各駅停車）':
                trains.detail[2].name1 = '中央総武線';
                trains.detail[2].icon1 = TRAIN_PATH + 'JR_JB.png';
                trains.detail[2].state1 = stateObj.state;
                trains.detail[2].stateColor1 = stateObj.color;
                trains.detail[2].Updated1 = train.updated;
                break;
            case '西武新宿線':
                trains.detail[2].name2 = '西部新宿線';
                trains.detail[2].icon2 = TRAIN_PATH + 'Seibu_shinjuku.png';
                trains.detail[2].state2 = stateObj.state;
                trains.detail[2].stateColor2 = stateObj.color;
                trains.detail[2].Updated2 = train.updated;
                break;
            case '大江戸線':
                trains.detail[2].name3 = '大江戸線';
                trains.detail[2].icon3 = TRAIN_PATH + 'Subway_TokyoOedo.png';
                trains.detail[2].state3 = stateObj.state;
                trains.detail[2].stateColor3 = stateObj.color;
                trains.detail[2].Updated3 = train.updated;
                break;
            case '埼京線':
                trains.detail[3].name1 = '埼京線';
                trains.detail[3].icon1 = TRAIN_PATH + 'JR_JA.png';
                trains.detail[3].state1 = stateObj.state;
                trains.detail[3].stateColor1 = stateObj.color;
                trains.detail[3].Updated1 = train.updated;
                break;
            case '京王新線':
                trains.detail[3].name2 = '京王新線';
                trains.detail[3].icon2 = TRAIN_PATH + 'Keio.png';
                trains.detail[3].state2 = stateObj.state;
                trains.detail[3].stateColor2 = stateObj.color;
                trains.detail[3].Updated2 = train.updated;
            case '都営新宿線':
                trains.detail[3].name3 = '新宿線';
                trains.detail[3].icon3 = TRAIN_PATH + 'Subway_TokyoShinjuku.png';
                trains.detail[3].state3 = stateObj.state;
                trains.detail[3].stateColor3 = stateObj.color;
                trains.detail[3].Updated3 = train.updated;
                break;

            default:
                break;
        }
    });

    return trains;
};

exports.getTrainStatistic = function(trainStatus) {
    var trains = { isSuccessful: true, total: { good: 0, stop: 0, stopSome: 0, checking: 0, summary: [] } };
    TRAIN_STATUS.forEach(function(status) {
        trains.total.summary.push({ trainStatus: status, trainNumber: 0 });
    });

    if (trainStatus.length == 0) {
        trains.noData = true;
        return trains;
    }

    trainStatus.forEach(function(train) {
        _setupTrainStatus(train.trainStatus, trains.total);
    });

    return trains;
};

function _setupBuildingAcceptance(totalObj, statusCode) {
    switch (statusCode) {
        case 0: // checking
            totalObj.summaryResource[0].checking++;
            return { value: statusCode, desc: '確認中', status: 'red' };
            break;
        case 1: // stop
            totalObj.summaryBuilding[2].buildingNumber++;
            totalObj.summaryResource[0].bad++;
            return { value: statusCode, desc: '危険', status: 'red' };
            break;
        case 2: // good
            totalObj.summaryResource[0].good++;
            return { value: statusCode, desc: '安全', status: '' };
            break;

        default:
            return {};
            break;
    }
}
/**
 * Format data of Electricity, Water, Wifi, Toilet, Gas for display.
 * @param summaryRs
 * @param statusCode
 * @param goodIcon
 * @param badIcon
 * @returns
 */
function _setupBuildingResources(summaryRs, statusCode, goodIcon, badIcon) {
    switch (statusCode) {
        case 0: // checking
            summaryRs.checking++;
            return { value: statusCode, desc: '確認中', status: '' };
            break;
        case 1: // stop
            summaryRs.bad++;
            return { value: statusCode, desc: '危険', status: badIcon ? badIcon : 'red' };
            break;
        case 2: // good
            summaryRs.good++;
            return { value: statusCode, desc: '安全', status: goodIcon ? goodIcon : '' };
            break;

        default:
            return {};
            break;
    }
}

function _setupFireBuildingResources(summaryRs, statusCode) {
    switch (statusCode) {
        case 0: // checking
            summaryRs.checking++;
            return { value: statusCode, desc: '確認中', status: 'red' };
            break;
        case 1: // good
            summaryRs.good++;
            return { value: statusCode, desc: 'なし', status: '' };
            break;
        case 2: // bad
            summaryRs.bad++;
            return { value: statusCode, desc: 'あり', status: 'red' };
            break;

        default:
            return {};
            break;
    }
}

function _setupMedicalStatus(statisticObj, medical) {
    var statusCode = medical.medicalAcceptance;
    switch (statusCode) {
        case 0: // checking
            // increase notAcceptance of this type
            statisticObj[medical.medicalType].notAcceptance++;
            return { value: statusCode, desc: '確認中', status: 'red' }
            break;
        case 1: // avaiable
            // increase acceptance of this type
            statisticObj[medical.medicalType].acceptance++;
            return { value: statusCode, desc: '受入可', status: '' }
            break;
        case 2: // full
            // increase notAcceptance of this type
            statisticObj[medical.medicalType].notAcceptance++;
            return { value: statusCode, desc: '受入不可', status: 'red' }
            break;

        default:
            return {};
            break;
    }
}

function _sumBuildingPeople(totalObj, building) {
    if (0 <= parseInt(building.numberOfPeople) && parseInt(building.numberOfPeople) <= 6) {
        totalObj.summaryBuilding[0].buildingNumber++;
        if (parseInt(building.numberOfPeople) == 6)
            totalObj.sumPeople += (50 + 5 * 50);
        else
            totalObj.sumPeople += (50 + parseInt(building.numberOfPeople) * 50 - 1);
    }

    if (parseInt(building.numberOfPeople) == 7)
        totalObj.summaryBuilding[3].buildingNumber++;
    if (parseInt(building.numberOfPeople) == 8)
        totalObj.summaryBuilding[1].buildingNumber++;

    if (0 <= parseInt(building.enrollment) && parseInt(building.enrollment) <= 7)
        totalObj.sumEnrollment += (1000 + parseInt(building.enrollment) * 500 - 1);
    else if (parseInt(building.enrollment) == 8)
        totalObj.sumEnrollment += (1000 + 7 * 500);
}
exports.formatBuildingStatus = function(buildingStatus) {
    var result = { isSuccessful: true, total: { sumEnrollment: 0, sumPeople: 0, summaryBuilding: [], summaryResource: [] }, detail: [] };
    BUILDING_STATUS.forEach(function(status) {
        result.total.summaryBuilding.push({ buildingStatus: status, buildingNumber: 0 });
    });
    BUILDING_RESOURCES.forEach(function(rsName) {
        result.total.summaryResource.push({ resourceName: rsName, good: 0, bad: 0, checking: 0 });
    });
    if (buildingStatus.length == 0) {
        result.noData = true;
        return result;
    }

    buildingStatus.forEach(function(building, idx) {
        building.buildingTypeText = building.buildingType === 0 ? '民間' : '公共';
        building.acceptanceObj = _setupBuildingAcceptance(result.total, building.acceptance);
        building.fireObj = _setupFireBuildingResources(result.total.summaryResource[1], building.fire); // Fire summary
        building.electricityObj = _setupBuildingResources(result.total.summaryResource[2], building.electricity, RESOURCES_PATH + 'denki.png', RESOURCES_PATH + 'ng-denki.png');
        building.gasObj = _setupBuildingResources(result.total.summaryResource[3], building.townGas, RESOURCES_PATH + 'gas.png', RESOURCES_PATH + 'ng-gas.png'); // Gas summary
        building.waterObj = _setupBuildingResources(result.total.summaryResource[4], building.waterSupply, RESOURCES_PATH + 'suidou.png', RESOURCES_PATH + 'ng-suidou.png');
        building.communicationObj = _setupBuildingResources(result.total.summaryResource[5], building.communication, RESOURCES_PATH + 'wifi.png', RESOURCES_PATH + 'ng-wifi.png');
        building.toiletObj = _setupBuildingResources(result.total.summaryResource[6], building.toilet, RESOURCES_PATH + 'toire.png', RESOURCES_PATH + 'ng-toire.png');
        // summary number of people
        _sumBuildingPeople(result.total, building);
        // TODO: get area from real database
        building.building_area = '新宿西口';
        if (idx === 4 || idx === 6)
            building.building_area = '新宿東口';
        if (idx === 5 || idx === 7 || idx === 10)
            building.building_area = '新宿南口';

        result.detail.push(building);
    });

    return result;
};

exports.getBuildingStatistic = function(buildingStatus) {
    var result = { isSuccessful: true, total: { sumEnrollment: 0, sumPeople: 0, summaryBuilding: [], summaryResource: [] }, detail: [] };
    BUILDING_STATUS.forEach(function(status) {
        result.total.summaryBuilding.push({ buildingStatus: status, buildingNumber: 0 });
    });
    BUILDING_RESOURCES.forEach(function(rsName) {
        result.total.summaryResource.push({ resourceName: rsName, good: 0, bad: 0, checking: 0 });
    });
    if (buildingStatus.length == 0) {
        result.noData = true;
        return result;
    }
    //	var buildings = [];
    buildingStatus.forEach(function(building, idx) {
        _setupBuildingAcceptance(result.total, building.acceptance);
        _setupBuildingResources(result.total.summaryResource[1], building.fire); // Fire summary
        _setupBuildingResources(result.total.summaryResource[2], building.electricity);
        _setupBuildingResources(result.total.summaryResource[3], building.townGas); // Gas summary
        _setupBuildingResources(result.total.summaryResource[4], building.waterSupply);
        _setupBuildingResources(result.total.summaryResource[5], building.communication);
        _setupBuildingResources(result.total.summaryResource[6], building.toilet);
        // summary number of people
        _sumBuildingPeople(result.total, building);
    });

    return result;
};

exports.formatMedicalStatus = function(medicalStatus) {
    var result = { isSuccessful: true, total: [], detail: [] };
    if (medicalStatus.length == 0) {
        result.noData = true;
        result.total.push({ medicalType: '', acceptance: '', notAcceptance: '' });
        return result;
    }
    var statisticObj = {};
    medicalStatus.forEach(function(medical, idx) {
        medical.Medical_type = { value: 0, desc: medical.medicalType };
        // init statistic for this type of medical
        if (!statisticObj[medical.medicalType])
            statisticObj[medical.medicalType] = { acceptance: 0, notAcceptance: 0 };
        medical.Medical_acceptance = _setupMedicalStatus(statisticObj, medical);

        // TODO: get area from real database
        medical.Medical_area_desc = '新宿西口';
        medical.Medical_area = { value: 0, desc: '新宿西口' };
        if (idx === 2) {
            medical.Medical_area_desc = '新宿東口';
            medical.Medical_area = { value: 1, desc: '新宿東口' };
        }
        if (idx === 3) {
            medical.Medical_area_desc = '新宿南口';
            medical.Medical_area = { value: 2, desc: '新宿南口' };
        }

        result.detail.push(medical);
    });
    for (var key in statisticObj) {
        // add 'medicalType' attribute for statisticObj[key] JSON object
        statisticObj[key].medicalType = key;
        result.total.push(statisticObj[key]);
    }

    return result;
};

exports.getMedicalStatistic = function(medicalStatus) {
    var result = { isSuccessful: true, total: [] };
    if (medicalStatus.length == 0) {
        result.noData = true;
        result.total.push({ medicalType: '', acceptance: '', notAcceptance: '' });
        return result;
    }

    var statisticObj = {};
    medicalStatus.forEach(function(medical) {
        if (!statisticObj[medical.medicalType])
            statisticObj[medical.medicalType] = { acceptance: 0, notAcceptance: 0 };
        _setupMedicalStatus(statisticObj, medical);
    });
    for (var key in statisticObj) {
        // add 'medicalType' attribute for statisticObj[key] JSON object
        statisticObj[key].medicalType = key;
        result.total.push(statisticObj[key]);
    }

    return result;
};

exports.mergeArrayJson = function(arrayJson1, arrayJson2, arrayJson3) {
    var result = [];
    var maxLength = Math.max(arrayJson1.length, arrayJson2.length, arrayJson3.length);
    var _setEqualLength = function(maxLength, arr) {
        if (maxLength > arr.length && arr.length > 0) {
            var tmpObj = {};
            for (var key in arr[0]) {
                if (!isNaN(arr[0][key]))
                    tmpObj[key] = -1;
                else
                    tmpObj[key] = '';
            }
            var blankNumber = maxLength - arr.length;
            for (var i = 0; i < blankNumber; i++) {
                arr.push(tmpObj);
            }
        }
    };

    [arrayJson1, arrayJson2, arrayJson3].forEach(function(arr) {
        _setEqualLength(maxLength, arr);
    });

    arrayJson1.forEach(function(obj, j) {
        result.push(Object.assign(obj, arrayJson2[j], arrayJson3[j]));
    });

    return result;
};

exports.checkMobile = function(req) {
    var md = new MobileDetect(req.headers['user-agent']);
    //    console.log(md);
    var mdStr = JSON.stringify(md);
    return mdStr.indexOf('Mobile') !== -1 ? true : false;
};

exports.getSindoWhere = function(sindoLevel) {
    var sindoCond = '';
    switch (sindoLevel) {
        case '震度4':
            sindoCond = 'Sindo=4';
            break;
        case '震度5弱':
            sindoCond = 'Sindo>4 AND Sindo<5';
            break;
        case '震度5強':
            sindoCond = 'Sindo>=5 AND Sindo<5.5';
            break;
        case '震度6弱':
            sindoCond = 'Sindo>=5.5 AND Sindo<6';
            break;
        case '震度6強':
            sindoCond = 'Sindo>=6 AND Sindo<7';
            break;
        case '震度7':
            sindoCond = 'Sindo=7';
            break;

        default:
            break;
    }

    return sindoCond;
};