(function () {

    var jigsawGameModule = angular.module('JigsawGame');


    jigsawGameModule.controller('JigsawGameController', function ($scope,$interval) {
        var row1 = [1, 2, 3];
        var row2 = [4, 5, 6];
        var row3 = [7, 8, 9];
        var initialBlankImg = [2, 2];
        var rowIndex = 0;
        var columnIndex = 1;

        $scope.initialBlankImg = initialBlankImg;
        $scope.imagePathSuffixArray = [row1, row2, row3];
        $scope.timer =0;
        $scope.startTime;
        $scope.winningCombination = angular.copy($scope.imagePathSuffixArray);
        $scope.count=0;
        $scope.promise;

        $scope.start = shuffle;
        $scope.move = function (row, column) {

            if (isValidMove(row, column)) {
                moveImages(row, column);
            }
            else {
                alert('invalid move');
                return;
            }


            if (checkWinningState()) {
                window.setTimeout(function () {
                    alert('You won!!');
                    stopTheTimer();
                }, 50);
            }
        }

        function isValidMove(row, column) {
            return ((Math.abs(row - initialBlankImg[rowIndex]) === 1 && Math.abs(column - initialBlankImg[columnIndex] === 0)) ||
            (Math.abs(row - initialBlankImg[rowIndex]) === 0 && Math.abs(column - initialBlankImg[columnIndex]) === 1));

        }

        function moveImages(row, column) {
            var imageAtCurrentClickcolumn = $scope.imagePathSuffixArray[row][column];
            $scope.imagePathSuffixArray[row][column] = $scope.imagePathSuffixArray[initialBlankImg[rowIndex]][initialBlankImg[columnIndex]];
            $scope.imagePathSuffixArray[initialBlankImg[rowIndex]][initialBlankImg[columnIndex]] = imageAtCurrentClickcolumn;
            initialBlankImg[rowIndex] = row;
            initialBlankImg[columnIndex] = column;
            $scope.count++;
        }

        function checkWinningState() {

            return $scope.isGameRunning && (JSON.stringify($scope.imagePathSuffixArray) === JSON.stringify($scope.winningCombination));
        }


        function shuffle() {

            var currentImages = populateRandomNumbers();
            populateTheArray(currentImages);
            if($scope.isGameRunning){
                resetTheTimer();
            }
            $scope.startTime = new Date();
            startTheTimer();



        }

        function populateRandomNumbers(){
            var currentImages = [];
            while (currentImages.length < 9) {
                var nextRarndomNo = nextRandom();
                while (currentImages.indexOf(nextRarndomNo)!= -1 || nextRarndomNo === 0) {
                    nextRarndomNo = nextRandom();
                }
                currentImages.push(nextRarndomNo);
            }
            return currentImages;
        }


        function populateTheArray(currentImages){
            var index = 0;
            for (var i = 0; i < $scope.imagePathSuffixArray.length; i++) {
                var row = $scope.imagePathSuffixArray[i];
                for (var j = 0; j < row.length; j++) {
                    row[j] = currentImages[index];
                    if(currentImages[index] == 9 ){
                        $scope.initialBlankImg[0]= i;
                        $scope.initialBlankImg[1] = j;
                    }
                    index++;
                }
            }

        }

        function startTheTimer(){


           $scope.promise =  $interval(function () {

                var timeElapsed = new Date().getTime()-  $scope.startTime.getTime();
                var hours = (timeElapsed/3600000);
                var minutes = (timeElapsed%3600000)/60000;
                var seconds = ((timeElapsed%3600000)%60000)/1000;
                $scope.timer = ("00"+ Math.floor(hours)).slice(-2) +":"+("00"+ Math.floor(minutes)).slice(-2)+":"+("00"+ Math.floor(seconds)).slice(-2);

            },1000);
            $scope.isGameRunning =true;
        }

        function stopTheTimer(){
            $interval.cancel($scope.promise);

        }

        function resetTheTimer(){
            $interval.cancel($scope.promise);
            $scope.timer =0;
        }

        function nextRandom() {
            var random = Math.floor(Math.random() * 10);
            console.log(random);
           return random;
        }


    });

})();
