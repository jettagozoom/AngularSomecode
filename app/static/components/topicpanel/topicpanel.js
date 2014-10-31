// Use to create a custom bootstrap-ui tooltip or popover trigger
//someCodeApp.config(['$tooltipProvider', function($tooltipProvider) {
//    $tooltipProvider.setTriggers({'show':'hide'});
//}])

someCodeApp.directive('topicPanel', [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: './static/components/topicpanel/topicpanel.html',
        controller: function ($scope, $element, $attrs, displayTopicSnippets, snippetService) {
            $scope.TopicPanelDirectiveCtrlScope = "TopicPanelDirectiveCtrlScope";
            $scope.isAddingTopic = false;
            $scope.isEditingTopic = false;
            $scope.isEditingTopicName = false;
            $scope.selectedTopicId = undefined;
            $scope.topics = snippetService.topics.topics;
            $scope.$on('updateTopics', function(event) {
                $scope.topics = snippetService.topics.topics;
            });

            // Click on a topic to display snippets in the topic
            $scope.selectTopic = function(topic) {
                var topicName = topic.name;
                if ($scope.isAddingTopic === false) {
                    if ($scope.isEditingTopic === true) {
                        if (topicName != "General" && topicName != "Welcome") {
                            // Edit the topic name
                            $scope.isEditingTopicName = true;
                        }
                    } else {
                        // Display topic snippets
                        displayTopicSnippets(topicName).then(function(results) {
                            snippetService.setSnippets(results, $scope);
                            $scope.$emit('updateTopicString', topicName);
                        });
                        $scope.selectedTopicId = topic.id;
                    }
                }
            };

            $scope.initiateTopicDelete = function(topic) {
                // Popup modal to prompt user to see if topic should really be deleted
                $scope.$broadcast('topicDeleteEvent', topic);
            }

            // Click on the topic add control to add a new topic
            $scope.topicAdd = function() {
                if ($scope.isEditingTopic === false) {
                    $scope.isAddingTopic = !$scope.isAddingTopic;
                    $scope.$broadcast('topicAddEvent', $scope.isAddingTopic);
                }
            };

            // Click on top topic edit control to edit a topic name
            $scope.topicEdit = function() {
                if ($scope.isAddingTopic === false) {
                    $scope.isEditingTopic = !$scope.isEditingTopic;
                    if ($scope.isEditingTopic === false) {
                        $scope.isEditingTopicName = false;
                    }
                }
            };
            $scope.topicEditSubmit = function() {
                console.log("At topicEditSubmit: " + $scope.topicEditString);
            };

        },
        link: function (scope, element, attrs, topicPanelCtrl) {
        }
    }
}])

.directive('topic', [function() {
    return {
        require: '?^topicPanel',
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topic.html',
        link: function(scope, element, attrs, topicPanelCtrl) {
            scope.isSelected = false;
            scope.editSymbol = (scope.topic.name === "General" || scope.topic.name === "Welcome") ?
                'fa-circle' : 'fa-minus-circle';
            scope.invisibleClass = (scope.topic.name === "General" || scope.topic.name === "Welcome") ?
                'invisible' : "";
        }
    }
}])


.directive('topicAddForm', ['snippetService', function(snippetService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicAddForm.html',
        controller: function($scope, $element, $attrs, createTopic, snippetService) {
            $('#topicNameField').popover({
                container:'body', trigger:'manual', toggle:'popover', placement:'right',
                content:"This name already exists. Please type another name."});

            $scope.TopicAddFormDirectiveScope = "TopicAddFormDirectiveScope";
            $scope.$on('topicAddEvent', function(event, isAdding) {
                if (isAdding === false) {
                    triggerTopicAddPopover(false);
                    resetForm();
                }
            });

            $scope.topicAddSubmit = function() {
                if ($scope.topicForm.$valid) {
                    createTopic($scope.topicAddString).then(function(newTopic) {
                        snippetService.addTopic(newTopic, $scope);
                        resetForm();
                    });
                } else {
                    triggerTopicAddPopover(true);
                    // Use to trigger custom bootstrap-ui tooltips or popovers
                    //if($scope.topicForm.$error.validateTopicName) {
                    //    $timeout(function () {
                    //        $('#topicNameField').trigger('show');
                    //    }, 0)
                    //}
                }
            };

            function resetForm() {
                $scope.topicAddString = "";
                $scope.topicForm.$setPristine();
            }

            function triggerTopicAddPopover(trigger) {
                if (trigger) {
                    if($scope.topicForm.$error.validateTopicName) {
                        $('#topicNameField').popover('show');
                    }
                } else {
                    $('#topicNameField').popover('hide');
                }
            }

            this.triggerTopicAddPopover = function(trigger) {
                triggerTopicAddPopover(trigger);
            }
        },
        link: function (scope, element, attrs) {
        }
    }
}])


.directive('topicEditForm', ['snippetService', function(snippetService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicEditForm.html',
        controller: function ($scope, $element, $attrs, snippetService) {
        }
    }
}])


.directive('topicDeleteDialog', ['snippetService', function(snippetService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './static/components/topicpanel/topicDeleteDialog.html',
        controller: function($scope, $element, $attrs, deleteTopic) {
            var topicToDelete = undefined;

            // Setup the topic delete modal dialog
            $element.modal({backdrop:'static', keyboard:false, show:false});

            $scope.$on('topicDeleteEvent', function(event, topic) {
                topicToDelete = topic;
                $('#topicDeleteDialog').modal('show');
                $('#topicDoDelete').focus();
            });

            $scope.doTopicDelete = function() {
                if (topicToDelete) {
                    deleteTopic(topicToDelete.id).then(function(results) {
                        snippetService.deleteTopic(results.id, $scope);
                    });
                    topicToDelete = undefined;
                }
                $('#topicDeleteDialog').modal('hide');
            }
        }
    }
}])

.factory('topicNameValidatorService', ['snippetService', function(snippetService) {
    return function(attrs, ngModelCtrl, topicName) {
        // Return false (don't validate) if the topicName already exists
        // We don't want to add or edit a topic if it is already in the list of topics
        var topics = [];

        if (topicName != undefined) {
            topics = snippetService.topics.topics;
            for (var topic in topics) {
                if (topicName.toLowerCase() === topics[topic].name.toLowerCase()) {
                    return false;
                }
            }
        }
        return true;
    }
}])

.directive('validateTopicName', ['topicNameValidatorService', function(topicNameValidatorService) {
    return {
        restrict: 'A',
        require: ['ngModel', '?^topicAddForm'],
        link: function(scope, element, attrs, controllers) {
            ngModelCtrl = controllers[0];
            topicAddFormCtrl = controllers[1];

            ngModelCtrl.$validators.validateTopicName = function(modelValue, viewValue) {
                var status = topicNameValidatorService(attrs, ngModelCtrl, modelValue);
                topicAddFormCtrl.triggerTopicAddPopover(false);
                return status;
            };
        }
    }
}]);
