'use strict';

angular.module('jkuri.touchspin', [])
  .directive('ngTouchSpin', ngTouchSpinDirective);

ngTouchSpinDirective.$inject = ['$timeout', '$interval', '$document'];

function ngTouchSpinDirective($timeout, $interval, $document) {

  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: {
      min: '=?',
      max: '=?',
      step: '=?',
      prefix: '=?',
      postfix: '=?',
      decimals: '=?',
      stepInterval: '=?',
      stepIntervalDelay: '=?',
      initval: '=?',
      val: '=?',
      onChange: '=?'
    },
    replace: true,
    link: function(scope, element, attrs, ngModel) {

      initScope();

      function initScope() {
        scope.min = parseFloat(Number(scope.min)) || 0;
        scope.max = parseFloat(Number(scope.max)) || 100;
        scope.step = scope.step || 1;
        scope.prefix = scope.prefix || undefined;
        scope.postfix = scope.postfix || undefined;
        scope.decimals = parseInt(scope.decimals) || 0;
        scope.stepInterval = scope.stepInterval || 100;
        scope.stepIntervalDelay = scope.stepIntervalDelay || 500;
        scope.val = parseFloat(scope.initval).toFixed(scope.decimals);
        scope.onChange = scope.onChange || function() {};
      }

      var $body = $document.find('body');
      var timeout, timer, helper = true,
        oldval = scope.val,
        clickStart;

      ngModel.$setViewValue(scope.val);
      scope.onChange(scope.val);

      scope.focused = false;

      scope.decrement = function() {
        oldval = scope.val;
        var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(
          scope.step)).toFixed(scope.decimals);

        if (value < scope.min) {
          value = parseFloat(scope.min).toFixed(scope.decimals);
          scope.val = value;
          ngModel.$setViewValue(value);
          return;
        }

        scope.val = value;
        ngModel.$setViewValue(value);
        scope.onChange(scope.val);
      };

      scope.increment = function() {
        oldval = scope.val;
        var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(
          scope.step)).toFixed(scope.decimals);

        if (value > scope.max) return;

        scope.val = value;
        ngModel.$setViewValue(value);
        scope.onChange(scope.val);
      };

      scope.startSpinUp = function() {
        scope.checkValue();
        scope.increment();

        clickStart = Date.now();
        scope.stopSpin();

        $timeout(function() {
          timer = $interval(function() {
            scope.increment();
          }, scope.stepInterval);
        }, scope.stepIntervalDelay);
      };

      scope.startSpinDown = function() {
        scope.checkValue();
        scope.decrement();

        clickStart = Date.now();

        var timeout = $timeout(function() {
          timer = $interval(function() {
            scope.decrement();
          }, scope.stepInterval);
        }, scope.stepIntervalDelay);
      };

      scope.stopSpin = function() {
        if (Date.now() - clickStart > scope.stepIntervalDelay) {
          $timeout.cancel(timeout);
          $interval.cancel(timer);
        } else {
          $timeout(function() {
            $timeout.cancel(timeout);
            $interval.cancel(timer);
          }, scope.stepIntervalDelay);
        }
      };

      scope.checkValue = function() {
        var val;

        if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
          val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) :
            parseFloat(scope.min).toFixed(scope.decimals);
          scope.val = val;
          ngModel.$setViewValue(val);
        }

        scope.focused = false;
      };

      scope.updateValue = function() {
        var newValue = scope.val;

        if (newValue !== '') {
          if (newValue.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
            newValue = parseFloat(newValue);
            if (newValue < scope.min) newValue = scope.min;
            if (newValue > scope.max) newValue = scope.max;
            newValue = newValue.toFixed(scope.decimals);
          } else {
            newValue = oldval;
          }
          scope.val = newValue;
          ngModel.$setViewValue(newValue);
          scope.onChange(scope.val);
        }
      };

      scope.handleEmptyValue = function() {
        var newValue = scope.val;

        if (newValue === '' && attrs.value) {
          newValue = attrs.value;
        }

        scope.val = newValue;
        ngModel.$setViewValue(newValue);
        scope.onChange(scope.val);
      };

      /**
       * I have no idea what is causing it but the modelValue gets overwritten to an empty string.
       * Change it back into the current value if it does!
       */
      function modelChanged() {
        if (ngModel.$modelValue == '' && scope.val) ngModel.$setViewValue(
          scope.val);
      }

      ngModel.$viewChangeListeners.push(modelChanged);

      scope.focus = function() {
        scope.focused = true;
      };

      ngModel.$render = function() {
        scope.val = ngModel.$viewValue;
      };


    },
    template: '<div class="input-group">' +
      '  <span class="input-group-btn" ng-show="!verticalButtons">' +
      '    <button type="button" class="btn btn-default" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="fa fa-minus"></i></button>' +
      '  </span>' +
      '  <span class="input-group-addon" ng-show="prefix" ng-bind="prefix"></span>' +
      '  <input type="text" ng-model="val" class="form-control" ng-change="updateValue()" ng-blur="handleEmptyValue()" ng-focus="focus()">' +
      '  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
      '  <span class="input-group-btn" ng-show="!verticalButtons">' +
      '    <button type="button" class="btn btn-default" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="fa fa-plus"></i></button>' +
      '  </span>' +
      '</div>'
  };
}
