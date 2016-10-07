'use strict';
// JavaScript Document
$(document).ready(function() {
    $("#collapse2ID").click(function() {
        $("#collapse2").collapse('show');
        $("#hidenshowpanel").collapse('hide');
        $("#btnBackCollapset").show();
        $("#btnUpdateListUser").hide();

    });
    $("#collapse3ID").click(function() {
        $("#hidenshowpanel").collapse('hide');
        $("#collapse3").collapse('show');
        $("#collapse2").collapse('hide');
    });

    $("#btnUpdateListUser").click(function() {
        $("#hidenshowpanel").collapse('show');
        $("#collapse3").collapse('hide');
    });

    $("#btnBackCollapset").click(function() {
        $("#hidenshowpanel").collapse('show');
        $("#btnBackCollapset").hide();
        $("#btnUpdateListUser").show();
        $("#collapse2").collapse('hide');
    });

    $("#btnDemoSetting").click(function() {
        $("#panel_adminmanagerment_id").hide();
        $("#panel_admindemosetting_id").show();
        $("#btnDemoSetting").hide();
        // Show Save, Cancel buttons in Demo screen
//        $("#btnSubmitDemo").show();
        $("#btnSubmitDemo").css('display', 'block');
        $("#btnBackToSettingAdmin").show();
        $("#btnUpdateListUser").hide();
        $("#btnBackCollapset").hide();
    });

    $("#btnBackToSettingAdmin").click(function() {
        $("#panel_adminmanagerment_id").show();
        $("#panel_admindemosetting_id").hide();
        $("#btnDemoSetting").show();
        // Hide Save, Cancel buttons
        $("#btnSubmitDemo").hide();
        $("#btnBackToSettingAdmin").hide();
        $("#btnUpdateListUser").show();
        $("#btnBackCollapset").click();
    });
});


function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ')
    }
}

function ChangeColorPanel() {
    var a = document.getElementById('admin_item_color');
    var b = document.getElementById('collapsetable1');

    if (hasClass(a, 'color_blue_menuadmin')) {
        removeClass(a, 'color_blue_menuadmin');
    } else {
        addClass(a, 'color_blue_menuadmin');
    }
}