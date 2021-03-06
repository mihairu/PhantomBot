/*
 * Copyright (C) 2016 www.phantombot.net
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* 
 * @author IllusionaryOne
 */

/*
 * pointsPanel.js
 * Drives the Points Panel
 */
(function() {

    var sortType = 'alpha_asc',
        modeIcon = [];
        modeIcon['false'] = "<i class=\"fa fa-circle-o\" />";
        modeIcon['true'] = "<i class=\"fa fa-circle\" />";

    /*
     * onMessage
     * This event is generated by the connection (WebSocket) object.
     */
    function onMessage(message) {
        var msgObject,
            groupPointKeys = [ "Caster", "Administrator", "Subscriber", "Regular", "Viewer" ];
            timezone = "GMT"; // Default time zone in Core if none given.

        try {
            msgObject = JSON.parse(message.data);
        } catch (ex) {
            return;
        }

        if (panelHasQuery(msgObject)) {
            if (panelCheckQuery(msgObject, 'points_settings')) {
                for (idx in msgObject['results']) {
                    var key = "",
                        value = "";
    
                    key = msgObject['results'][idx]['key'];
                    value = msgObject['results'][idx]['value'];
    
                    if (panelMatch(key, 'onlineGain')) {
                        $("#setPointGainInput_setgain").attr("placeholder", value).blur();
                    } else if (panelMatch(key, 'offlineGain')) {
                        $("#setPointGainInput_setofflinegain").attr("placeholder", value).blur();
                    } else if (panelMatch(key, 'onlinePayoutInterval')) {
                        $("#setPointGainInput_setinterval").attr("placeholder", value).blur();
                    } else if (panelMatch(key, 'offlinePayoutInterval')) {
                        $("#setPointGainInput_setofflineinterval").attr("placeholder", value).blur();
                    } else if (panelMatch(key, 'pointNameSingle')) {
                        $("#setPointNameInput").attr("placeholder", value).blur();
                    } else if (panelMatch(key, 'pointNameMultiple')) {
                        $("#setPointsNameInput").attr("placeholder", value).blur();
                    }
                }
            }

            if (panelCheckQuery(msgObject, 'points_pointstable')) {
                var pointsTableData = msgObject['results'],
                    username = "",
                    points = "",
                    timeValue = "",
                    html = "";

                if (panelMatch(sortType, 'points_asc')) {
                    pointsTableData.sort(sortPointsTable_points_asc);
                } else if (panelMatch(sortType, 'points_desc')) {
                    pointsTableData.sort(sortPointsTable_points_desc);
                } else if (panelMatch(sortType, 'alpha_asc')) {
                    pointsTableData.sort(sortPointsTable_alpha_asc);
                } else if (panelMatch(sortType, 'alpha_desc')) {
                    pointsTableData.sort(sortPointsTable_alpha_desc);
                }
                
                html = "<table>";
                for (var idx = 0; idx < pointsTableData.length; idx++) {
                    username = pointsTableData[idx]['key'];
                    points = pointsTableData[idx]['value'];
                    html += "<tr class=\"textList\">" +
                            "    <td style=\"vertical-align: middle; width: 50%\">" + username + "</td>" +
                            "    <td style=\"vertical-align: middle; width: 25%\">" + points + "</td>" +
                            "    <td style=\"vertical-align: middle: width: 25%\">" +
                            "    <form onkeypress=\"return event.keyCode != 13\">" +
                            "        <input type=\"number\" min=\"0\" id=\"inlineUserPoints_" + username + "\"" +
                            "               placeholder=\"" + points + "\" value=\"" + points + "\"" +
                            "               style=\"width: 8em\"/>" +
                            "        <button type=\"button\" class=\"btn btn-default btn-xs\" onclick=\"$.updateUserPoints('" + username + "')\"><i class=\"fa fa-pencil\" /></button>" +
                            "    </form>" +
                            "</tr>";
                }
                html += "</table>";
                $("#userPointsTable").html(html);
            }

            if (panelCheckQuery(msgObject, 'points_grouppoints')) {
                var groupName = "",
                    groupPoints = "",
                    groupPointsData = [];

                html = "<table>";
                for (var idx = 0; idx < msgObject['results'].length; idx++) {
                    groupName = msgObject['results'][idx]['key'];
                    groupPoints = msgObject['results'][idx]['value'];
                    groupPointsData[groupName] = groupPoints;
                }
                for (key in groupPointKeys) {
                    groupName = groupPointKeys[key];
                    groupPoints = groupPointsData[groupName];

                    html += "<tr class=\"textList\">" +
                            "    <td style=\"width: 15px\">" +
                            "        <div id=\"clearGroupPoints_" + groupName + "\" class=\"button\"" +
                            "             onclick=\"$.updateGroupPoints('" + groupName + "', true, true)\"><i class=\"fa fa-trash\" />" +
                            "        </div>" +
                            "    <td style=\"width: 8em\">" + groupName + "</td>" +
                            "    <td><form onkeypress=\"return event.keyCode != 13\">" +
                            "        <input type=\"number\" min=\"-1\" id=\"inlineGroupPointsEdit_" + groupName + "\"" +
                            "               value=\"" + groupPoints + "\" style=\"width: 5em\"/>" +
                            "        <button type=\"button\" class=\"btn btn-default btn-xs\"" +
                            "               onclick=\"$.updateGroupPoints('" + groupName + "', true, false)\"><i class=\"fa fa-pencil\" />" +
                            "        </button>" +
                            "    </form></td>";

                     if (groupPoints === '-1') {
                         html += "<td style=\"float: right\"><i>Using Global Value</i></td>";
                     } else {
                         html += "<td />";
                     }
                     html += "</tr>";
                }
                $("#groupPointsTable").html(html);
            }

            if (panelCheckQuery(msgObject, 'points_grouppointsoffline')) {
                var groupName = "",
                    groupPoints = "",
                    groupPointsData = [];

                html = "<table>";
                for (var idx = 0; idx < msgObject['results'].length; idx++) {
                    groupName = msgObject['results'][idx]['key'];
                    groupPoints = msgObject['results'][idx]['value'];
                    groupPointsData[groupName] = groupPoints;
                }
                for (key in groupPointKeys) {
                    groupName = groupPointKeys[key];
                    groupPoints = groupPointsData[groupName];

                    html += "<tr class=\"textList\">" +
                            "    <td style=\"width: 15px\">" +
                            "        <div id=\"clearGroupPointsOffline_" + groupName + "\" class=\"button\"" +
                            "             onclick=\"$.updateGroupPoints('" + groupName + "', false, true)\"><i class=\"fa fa-trash\" />" +
                            "        </div>" +
                            "    <td style=\"width: 8em\">" + groupName + "</td>" +
                            "    <td><form onkeypress=\"return event.keyCode != 13\">" +
                            "        <input type=\"number\" min=\"-1\" id=\"inlineGroupPointsOfflineEdit_" + groupName + "\"" +
                            "               value=\"" + groupPoints + "\" style=\"width: 5em\"/>" +
                            "        <button type=\"button\" class=\"btn btn-default btn-xs\"" +
                            "               onclick=\"$.updateGroupPoints('" + groupName + "', false, false)\"><i class=\"fa fa-pencil\" />" +
                            "        </button>" +
                            "    </form></td>";

                     if (groupPoints === '-1') {
                         html += "<td style=\"float: right\"><i>Using Global Value</i></td>";
                     } else {
                         html += "<td />";
                     }
                     html += "</tr>";
                }
                $("#groupPointsOfflineTable").html(html);
            }
        }
    }

    /**
     * @function doQuery
     */
    function doQuery() {
        sendDBKeys("points_settings", "pointSettings");
        sendDBKeys("points_pointstable", "points");
        sendDBKeys("points_grouppoints", "grouppoints");
        sendDBKeys("points_grouppointsoffline", "grouppointsoffline");
    }

    /**
     * @function sortPointsTable
     * @param {Object} a
     * @param {Object} b
     */
    function sortPointsTable_alpha_desc(a, b) {
        return panelStrcmp(b.key, a.key);
    }
    function sortPointsTable_alpha_asc(a, b) {
        return panelStrcmp(a.key, b.key);
    }
    function sortPointsTable_points_asc(a, b) {
        return parseInt(a.value) - parseInt(b.value);
    }
    function sortPointsTable_points_desc(a, b) {
        return parseInt(b.value) - parseInt(a.value);
    }

    /**
     * @function updateGroupPoints
     * @param {String} group
     * @param {Boolean} online
     * @param {Boolean} clear
     */
    function updateGroupPoints(group, online, clear) {
        var divId = (online ? "#inlineGroupPointsEdit_" + group : "#inlineGroupPointsOfflineEdit_" + group),
            points = (clear ? "-1" : $(divId).val()),
            dbtable = (online ? "grouppoints" : "grouppointsoffline");

        if (points.length > 0) {
            sendDBUpdate("points_updateGroupPoints", dbtable, group, points);
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function updateUserPoints
     * @param {String} username
     */
    function updateUserPoints(username) {
        var points = $("#inlineUserPoints_" + username).val();
        if (points.length > 0) {
            $("#inlineUserPoints_" + username).val('');
            sendDBUpdate("points_pointstableUpdate", "points", username, points);
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function setPointName
     */
    function setPointName() {
        var singleName = $("#setPointNameInput").val(),
            pluralName = $("#setPointsNameInput").val();

        if (singleName.length > 0 && pluralName.length > 0) {
            sendCommand("points setname single " + singleName);
            sendCommand("points setname multiple " + pluralName);
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function clearPointName
     */
    function clearPointName() {
        sendCommand("points setname delete");
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
    }

    /**
     * @function setPointGain
     * @param {String} action
     */
    function setPointGain(action) {
        var value = $("#setPointGainInput_" + action).val();
        if (value.length > 0) {
            $("#setPointGainInput_" + action).val('');
            sendCommand("points " + action + " " + value);
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }
 
    /**
     * @function modifyUserPoints
     * @param {String} action
     */
    function modifyUserPoints(action) {
        var username = $("#adjustUserPointsNameInput").val(),
            points = $("#adjustUserPointsInput").val();

        if (username.length > 0 && points.length > 0) {
            sendCommand("points " + action + " "  + username + " " + points);
            $("#adjustUserPointsNameInput").val('');
            $("#adjustUserPointsInput").val('');
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function giftChatPoints
     * @param {String} action
     */
    function giftChatPoints(action) {
        var points = $("#giftChatPointsInput").val(),
            command = "";

        if (points.length > 0) {
            if (panelMatch(action, 'all')) {
                command = "points all " + points;
            }
            if (panelMatch(action, 'makeitrain')) {
                command = "makeitrain " + points;
            }
            $("#giftChatPointsInput").val('');
            sendCommand(command);
        }
    }

    /**
     * @function setPointsSort
     * @param {String} type
     */
    function setPointsSort(type) {
        sortType = type;
        doQuery();
    }

    // Import the HTML file for this panel.
    $("#pointsPanel").load("/panel/points.html");

    // Load the DB items for this panel, wait to ensure that we are connected.
    var interval = setInterval(function() {
        if (isConnected && TABS_INITIALIZED) {
            var active = $("#tabs").tabs("option", "active");
            if (active == 4) {
                doQuery();
                clearInterval(interval);
            }
        }
    }, INITIAL_WAIT_TIME);

    // Query the DB every 30 seconds for updates.
    setInterval(function() {
        var active = $("#tabs").tabs("option", "active");
        if (active == 4 && isConnected) {
            newPanelAlert('Refreshing Time Data', 'success', 1000);
            doQuery();
        }
    }, 3e4);

    // Export functions - Needed when calling from HTML.
    $.pointsOnMessage = onMessage;
    $.updateGroupPoints = updateGroupPoints;
    $.setPointName = setPointName;
    $.clearPointName = clearPointName;
    $.setPointGain = setPointGain;
    $.giftChatPoints = giftChatPoints;
    $.modifyUserPoints = modifyUserPoints;
    $.updateUserPoints = updateUserPoints;
    $.setPointsSort = setPointsSort;
})();
