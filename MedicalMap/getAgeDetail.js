// Get the people distribution of all age ranges, and store into an array
function getAgeDetail(name, boundaryType, resultType, genderType) {
    var detail = [];
    if (boundaryType == "county") {
        if (resultType == "hospital") {
            if (genderType == "male") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].County_Name) {
                        if (detail.length == 0) {
                            detail.push(townData[i].Hospital_Male_Age1_People);
                            detail.push(townData[i].Hospital_Male_Age2_People);
                            detail.push(townData[i].Hospital_Male_Age3_People);
                            detail.push(townData[i].Hospital_Male_Age4_People);
                            detail.push(townData[i].Hospital_Male_Age5_People);
                            detail.push(townData[i].Hospital_Male_Age6_People);
                            detail.push(townData[i].Hospital_Male_Age7_People);
                            detail.push(townData[i].Hospital_Male_Age8_People);
                            detail.push(townData[i].Hospital_Male_Age9_People);
                        }
                        else {
                            detail[0] = detail[0] + townData[i].Hospital_Male_Age1_People;
                            detail[1] = detail[1] + townData[i].Hospital_Male_Age2_People;
                            detail[2] = detail[2] + townData[i].Hospital_Male_Age3_People;
                            detail[3] = detail[3] + townData[i].Hospital_Male_Age4_People;
                            detail[4] = detail[4] + townData[i].Hospital_Male_Age5_People;
                            detail[5] = detail[5] + townData[i].Hospital_Male_Age6_People;
                            detail[6] = detail[6] + townData[i].Hospital_Male_Age7_People;
                            detail[7] = detail[7] + townData[i].Hospital_Male_Age8_People;
                            detail[8] = detail[8] + townData[i].Hospital_Male_Age9_People;
                        }
                    }
                }
            }
            else if (genderType == "female") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].County_Name) {
                        if (detail.length == 0) {
                            detail.push(townData[i].Hospital_Female_Age1_People);
                            detail.push(townData[i].Hospital_Female_Age2_People);
                            detail.push(townData[i].Hospital_Female_Age3_People);
                            detail.push(townData[i].Hospital_Female_Age4_People);
                            detail.push(townData[i].Hospital_Female_Age5_People);
                            detail.push(townData[i].Hospital_Female_Age6_People);
                            detail.push(townData[i].Hospital_Female_Age7_People);
                            detail.push(townData[i].Hospital_Female_Age8_People);
                            detail.push(townData[i].Hospital_Female_Age9_People);
                        }
                        else {
                            detail[0] = detail[0] + townData[i].Hospital_Female_Age1_People;
                            detail[1] = detail[1] + townData[i].Hospital_Female_Age2_People;
                            detail[2] = detail[2] + townData[i].Hospital_Female_Age3_People;
                            detail[3] = detail[3] + townData[i].Hospital_Female_Age4_People;
                            detail[4] = detail[4] + townData[i].Hospital_Female_Age5_People;
                            detail[5] = detail[5] + townData[i].Hospital_Female_Age6_People;
                            detail[6] = detail[6] + townData[i].Hospital_Female_Age7_People;
                            detail[7] = detail[7] + townData[i].Hospital_Female_Age8_People;
                            detail[8] = detail[8] + townData[i].Hospital_Female_Age9_People;
                        }
                    }
                }
            }
            else { //genderType == "all"
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].County_Name) {
                        if (detail.length == 0) {
                            detail.push(townData[i].Hospital_Male_Age1_People + townData[i].Hospital_Female_Age1_People);
                            detail.push(townData[i].Hospital_Male_Age2_People + townData[i].Hospital_Female_Age2_People);
                            detail.push(townData[i].Hospital_Male_Age3_People + townData[i].Hospital_Female_Age3_People);
                            detail.push(townData[i].Hospital_Male_Age4_People + townData[i].Hospital_Female_Age4_People);
                            detail.push(townData[i].Hospital_Male_Age5_People + townData[i].Hospital_Female_Age5_People);
                            detail.push(townData[i].Hospital_Male_Age6_People + townData[i].Hospital_Female_Age6_People);
                            detail.push(townData[i].Hospital_Male_Age7_People + townData[i].Hospital_Female_Age7_People);
                            detail.push(townData[i].Hospital_Male_Age8_People + townData[i].Hospital_Female_Age8_People);
                            detail.push(townData[i].Hospital_Male_Age9_People + townData[i].Hospital_Female_Age9_People);
                        }
                        else {
                            detail[0] = detail[0] + townData[i].Hospital_Male_Age1_People + townData[i].Hospital_Female_Age1_People;
                            detail[1] = detail[1] + townData[i].Hospital_Male_Age2_People + townData[i].Hospital_Female_Age2_People;
                            detail[2] = detail[2] + townData[i].Hospital_Male_Age3_People + townData[i].Hospital_Female_Age3_People;
                            detail[3] = detail[3] + townData[i].Hospital_Male_Age4_People + townData[i].Hospital_Female_Age4_People;
                            detail[4] = detail[4] + townData[i].Hospital_Male_Age5_People + townData[i].Hospital_Female_Age5_People;
                            detail[5] = detail[5] + townData[i].Hospital_Male_Age6_People + townData[i].Hospital_Female_Age6_People;
                            detail[6] = detail[6] + townData[i].Hospital_Male_Age7_People + townData[i].Hospital_Female_Age7_People;
                            detail[7] = detail[7] + townData[i].Hospital_Male_Age8_People + townData[i].Hospital_Female_Age8_People;
                            detail[8] = detail[8] + townData[i].Hospital_Male_Age9_People + townData[i].Hospital_Female_Age9_People;
                        }
                    }
                }
            }
        }
        else if (resultType == "residence") {
            if (genderType == "male") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].County_Name) {
                        detail.push(townData[i].Residence_Male_Age1_People);
                        detail.push(townData[i].Residence_Male_Age2_People);
                        detail.push(townData[i].Residence_Male_Age3_People);
                        detail.push(townData[i].Residence_Male_Age4_People);
                        detail.push(townData[i].Residence_Male_Age5_People);
                        detail.push(townData[i].Residence_Male_Age6_People);
                        detail.push(townData[i].Residence_Male_Age7_People);
                        detail.push(townData[i].Residence_Male_Age8_People);
                        detail.push(townData[i].Residence_Male_Age9_People);
                    }
                }
            }
            else if (genderType == "female") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].County_Name) {
                        detail.push(townData[i].Residence_Female_Age1_People);
                        detail.push(townData[i].Residence_Female_Age2_People);
                        detail.push(townData[i].Residence_Female_Age3_People);
                        detail.push(townData[i].Residence_Female_Age4_People);
                        detail.push(townData[i].Residence_Female_Age5_People);
                        detail.push(townData[i].Residence_Female_Age6_People);
                        detail.push(townData[i].Residence_Female_Age7_People);
                        detail.push(townData[i].Residence_Female_Age8_People);
                        detail.push(townData[i].Residence_Female_Age9_People);
                    }
                }
            }
            else { //genderType == "all"
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].County_Name) {
                        detail.push(townData[i].Residence_Male_Age1_People + townData[i].Residence_Female_Age1_People);
                        detail.push(townData[i].Residence_Male_Age2_People + townData[i].Residence_Female_Age2_People);
                        detail.push(townData[i].Residence_Male_Age3_People + townData[i].Residence_Female_Age3_People);
                        detail.push(townData[i].Residence_Male_Age4_People + townData[i].Residence_Female_Age4_People);
                        detail.push(townData[i].Residence_Male_Age5_People + townData[i].Residence_Female_Age5_People);
                        detail.push(townData[i].Residence_Male_Age6_People + townData[i].Residence_Female_Age6_People);
                        detail.push(townData[i].Residence_Male_Age7_People + townData[i].Residence_Female_Age7_People);
                        detail.push(townData[i].Residence_Male_Age8_People + townData[i].Residence_Female_Age8_People);
                        detail.push(townData[i].Residence_Male_Age9_People + townData[i].Residence_Female_Age9_People);
                    }
                }
            }
        }
    }
    else if (boundaryType == "town") {
        if (resultType == "hospital") {
            if (genderType == "male") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].Town_Name) {
                        detail.push(townData[i].Hospital_Male_Age1_People);
                        detail.push(townData[i].Hospital_Male_Age2_People);
                        detail.push(townData[i].Hospital_Male_Age3_People);
                        detail.push(townData[i].Hospital_Male_Age4_People);
                        detail.push(townData[i].Hospital_Male_Age5_People);
                        detail.push(townData[i].Hospital_Male_Age6_People);
                        detail.push(townData[i].Hospital_Male_Age7_People);
                        detail.push(townData[i].Hospital_Male_Age8_People);
                        detail.push(townData[i].Hospital_Male_Age9_People);
                        break;
                    }
                }
            }
            else if (genderType == "female") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].Town_Name) {
                        detail.push(townData[i].Hospital_Female_Age1_People);
                        detail.push(townData[i].Hospital_Female_Age2_People);
                        detail.push(townData[i].Hospital_Female_Age3_People);
                        detail.push(townData[i].Hospital_Female_Age4_People);
                        detail.push(townData[i].Hospital_Female_Age5_People);
                        detail.push(townData[i].Hospital_Female_Age6_People);
                        detail.push(townData[i].Hospital_Female_Age7_People);
                        detail.push(townData[i].Hospital_Female_Age8_People);
                        detail.push(townData[i].Hospital_Female_Age9_People);
                        break;
                    }
                }
            }
            else { //genderType == "all"
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].Town_Name) {
                        detail.push(townData[i].Hospital_Male_Age1_People + townData[i].Hospital_Female_Age1_People);
                        detail.push(townData[i].Hospital_Male_Age2_People + townData[i].Hospital_Female_Age2_People);
                        detail.push(townData[i].Hospital_Male_Age3_People + townData[i].Hospital_Female_Age3_People);
                        detail.push(townData[i].Hospital_Male_Age4_People + townData[i].Hospital_Female_Age4_People);
                        detail.push(townData[i].Hospital_Male_Age5_People + townData[i].Hospital_Female_Age5_People);
                        detail.push(townData[i].Hospital_Male_Age6_People + townData[i].Hospital_Female_Age6_People);
                        detail.push(townData[i].Hospital_Male_Age7_People + townData[i].Hospital_Female_Age7_People);
                        detail.push(townData[i].Hospital_Male_Age8_People + townData[i].Hospital_Female_Age8_People);
                        detail.push(townData[i].Hospital_Male_Age9_People + townData[i].Hospital_Female_Age9_People);
                        break;
                    }
                }
            }
        }
        else if (resultType == "residence") {
            if (genderType == "male") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].Town_Name) {
                        detail.push(townData[i].Residence_Male_Age1_People);
                        detail.push(townData[i].Residence_Male_Age2_People);
                        detail.push(townData[i].Residence_Male_Age3_People);
                        detail.push(townData[i].Residence_Male_Age4_People);
                        detail.push(townData[i].Residence_Male_Age5_People);
                        detail.push(townData[i].Residence_Male_Age6_People);
                        detail.push(townData[i].Residence_Male_Age7_People);
                        detail.push(townData[i].Residence_Male_Age8_People);
                        detail.push(townData[i].Residence_Male_Age9_People);
                        break;
                    }
                }
            }
            else if (genderType == "female") {
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].Town_Name) {
                        detail.push(townData[i].Residence_Female_Age1_People);
                        detail.push(townData[i].Residence_Female_Age2_People);
                        detail.push(townData[i].Residence_Female_Age3_People);
                        detail.push(townData[i].Residence_Female_Age4_People);
                        detail.push(townData[i].Residence_Female_Age5_People);
                        detail.push(townData[i].Residence_Female_Age6_People);
                        detail.push(townData[i].Residence_Female_Age7_People);
                        detail.push(townData[i].Residence_Female_Age8_People);
                        detail.push(townData[i].Residence_Female_Age9_People);
                        break;
                    }
                }
            }
            else { //genderType == "all"
                for (var i = 0; i < townData.length; i++) {
                    if (name == townData[i].Town_Name) {
                        detail.push(townData[i].Residence_Male_Age1_People + townData[i].Residence_Female_Age1_People);
                        detail.push(townData[i].Residence_Male_Age2_People + townData[i].Residence_Female_Age2_People);
                        detail.push(townData[i].Residence_Male_Age3_People + townData[i].Residence_Female_Age3_People);
                        detail.push(townData[i].Residence_Male_Age4_People + townData[i].Residence_Female_Age4_People);
                        detail.push(townData[i].Residence_Male_Age5_People + townData[i].Residence_Female_Age5_People);
                        detail.push(townData[i].Residence_Male_Age6_People + townData[i].Residence_Female_Age6_People);
                        detail.push(townData[i].Residence_Male_Age7_People + townData[i].Residence_Female_Age7_People);
                        detail.push(townData[i].Residence_Male_Age8_People + townData[i].Residence_Female_Age8_People);
                        detail.push(townData[i].Residence_Male_Age9_People + townData[i].Residence_Female_Age9_People);
                        break;
                    }
                }
            }
        }
    }
    return detail;
}