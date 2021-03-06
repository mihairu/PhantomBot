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
 * noticesPanel.js
 */

(function() {

   var refreshIcon = '<i class="fa fa-refresh" />',
       spinIcon = '<i style=\"color: #6136b1\" class="fa fa-spinner fa-spin" />',
       modeIcon = [],
       settingIcon = [];

       modeIcon['false'] = "<i style=\"color: #6136b1\" class=\"fa fa-circle-o\" />";
       modeIcon['true'] = "<i style=\"color: #6136b1\" class=\"fa fa-circle\" />";

       settingIcon['false'] = "<i class=\"fa fa-circle-o\" />";
       settingIcon['true'] = "<i class=\"fa fa-circle\" />";

    /**
     * @function onMessage
     */
    function onMessage(message) {
        var msgObject,
            html = '',
            id = '';

        try { 
            msgObject = JSON.parse(message.data);
        } catch (ex) {
            return;
        }

        if (panelHasQuery(msgObject)) {
            if (panelCheckQuery(msgObject, 'notices_settings')) {
                for (var idx in msgObject['results']) {
                    if (panelMatch(msgObject['results'][idx]['key'], 'reqmessages')) {
                        $('#noticeReqInput').attr('placeholder', msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'interval')) {
                        $('#noticeIntervalInput').attr('placeholder', msgObject['results'][idx]['value']).blur();
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'noticetoggle')) {
                        $('#chatNoticeMode').html(modeIcon[msgObject['results'][idx]['value']]);
                    }
                    if (panelMatch(msgObject['results'][idx]['key'], 'noticeOffline')) {
                        $('#chatOfflineNoticeMode').html(modeIcon[msgObject['results'][idx]['value']]);
                    }
                }
            }

            if (panelCheckQuery(msgObject, 'notices_notices')) {
                if (msgObject['results'].length === 0) {
                    $('#noticeList').html('<i>No Notices Are Defined</i>');
                    return;
                }

                html = '<table>';
                for (var idx in msgObject['results']) {
                    id = msgObject['results'][idx]['key'].match(/message_(\d+)/)[1];
                    html += '<tr style="textList">' +
                            '    <td style="width: 25px">' +
                            '        <div id="deleteNotice_' + id + '" class="button"' +
                            '             onclick="$.deleteNotice(\'' + id + '\')"><i class="fa fa-trash" />' +
                            '        </div>' +
                            '    </td>' +
                            '    <td style="vertical-align: middle">' +
                            '        <form onkeypress="return event.keyCode != 13">' +
                            '            <input type="text" id="inlineNoticeEdit_' + id + '"' +
                            '                   value="' + msgObject['results'][idx]['value'] + '" />' +
                            '            <button type="button" class="btn btn-default btn-xs"' +
                            '                   onclick="$.updateNotice(\'' + id + '\')"><i class="fa fa-pencil" />' +
                            '            </button>' +
                            '        </form>' +
                            '    </td>' +
                            '</tr>';
                }
                html += '</table>';
                $('#noticeList').html(html);
            }
        }
    }

    /**
     * @function doQuery
     */
    function doQuery() {
        sendDBKeys('notices_settings', 'noticeSettings');
        sendDBKeys('notices_notices', 'notices');
    }

    /**
     * @function toggleChatNotice
     */
    function toggleChatNotice() {
        $('#chatNoticeMode').html(spinIcon);
        sendCommand('notice toggle');
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
    }

    /**
     * @function toggleChatOfflineNotice
     */
    function toggleChatOfflineNotice() {
        $('#chatOfflineNoticeMode').html(spinIcon);
        sendCommand('notice toggleoffline');
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
    }

    /**
     * @function updateNoticeInterval
     */
    function updateNoticeInterval() {
        var value = $('#noticeIntervalInput').val();
        if (value.length > 0) {
            sendCommand('notice interval ' + value);
            $('#noticeIntervalInput').attr('placeholder', value).blur();
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function updateNoticeReq
     */
    function updateNoticeReq() {
        var value = $('#noticeReqInput').val();
        if (value.length > 0) {
            sendCommand('notice req ' + value);
            $('#noticeReqInput').attr('placeholder', value).blur();
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }

    /**
     * @function addNotice
     */
    function addNotice() {
        var value = $('#addNoticeInput').val();
        if (value.length > 0) {
            sendCommand('notice add ' + value);
            $('#addNoticeInput').attr('placeholder', 'Updating...').blur();
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);    
        }
    }

    /**
     * @function deleteNotice
     * @param {String} id
     */
    function deleteNotice(id) {
        sendCommand('notice remove ' + id);
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
    }

    /**
     * @function updateNotice
     * @param {String} id
     */
    function updateNotice(id) {
        var value = $('#inlineNoticeEdit_' + id).val();
        if (value.length > 0) {
            $('#inlineNoticeEdit_' + id).val(value).blur();
            sendCommand('notice edit ' + id + ' ' + value);
            setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
        }
    }
    
    // Import the HTML file for this panel.
    $("#noticesPanel").load("/panel/notices.html");

    // Load the DB items for this panel, wait to ensure that we are connected.
    var interval = setInterval(function() {
        if (isConnected && TABS_INITIALIZED) {
            var active = $('#tabs').tabs('option', 'active');
            if (active == 9) {
                doQuery();
                clearInterval(interval);
            }
        }
    }, INITIAL_WAIT_TIME);

    // Query the DB every 30 seconds for updates.
    setInterval(function() {
        var active = $('#tabs').tabs('option', 'active');
        if (active == 9 && isConnected) {
            newPanelAlert('Refreshing Notices Data', 'success', 1000);
            doQuery();
        }
    }, 3e4);
    
    // Export to HTML
    $.noticesOnMessage = onMessage;
    $.toggleChatNotice = toggleChatNotice;
    $.toggleChatOfflineNotice = toggleChatOfflineNotice;
    $.updateNoticeInterval = updateNoticeInterval;
    $.updateNoticeReq = updateNoticeReq;
    $.addNotice = addNotice;
    $.deleteNotice = deleteNotice;
    $.updateNotice = updateNotice;
})();
