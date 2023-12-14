export var deviceMode;
(function (deviceMode) {
    deviceMode["demo"] = "demo";
    deviceMode["color"] = "color";
    deviceMode["off"] = "off";
    deviceMode["effect"] = "effect";
    deviceMode["movie"] = "movie";
    deviceMode["playlist"] = "playlist";
    deviceMode["rt"] = "rt";
})(deviceMode || (deviceMode = {}));
export var applicationResponseCode;
(function (applicationResponseCode) {
    applicationResponseCode[applicationResponseCode["Ok"] = 1000] = "Ok";
    applicationResponseCode[applicationResponseCode["error"] = 1001] = "error";
    applicationResponseCode[applicationResponseCode["invalidArgumentValue"] = 1101] = "invalidArgumentValue";
    applicationResponseCode[applicationResponseCode["valueTooLong"] = 1102] = "valueTooLong";
    applicationResponseCode[applicationResponseCode["malformedJSON"] = 1104] = "malformedJSON";
    applicationResponseCode[applicationResponseCode["invalidArgumentKey"] = 1105] = "invalidArgumentKey";
    applicationResponseCode[applicationResponseCode["firmwareUpgradeSHA1SUMerror"] = 1205] = "firmwareUpgradeSHA1SUMerror";
})(applicationResponseCode || (applicationResponseCode = {}));
