(function () {

    var jigsawGameModule = angular.module('JigsawGame');


    jigsawGameModule.controller('JigsawGameController', function ($scope,$interval,$timeout) {
        var row1 = [1, 2, 3];
        var row2 = [4, 5, 6];
        var row3 = [7, 8, 9];
        //change name
        var initialBlankImg = [2, 2];
        var rowIndex = 0;
        var columnIndex = 1;

        $scope.initialBlankImg = initialBlankImg;
        $scope.imagePathSuffixArray = [row1, row2, row3];
        $scope.timer ="00:00:00";
        $scope.solution=[];
        $scope.simulate = simulate;
        $scope.startTime;
        $scope.winningCombination = angular.copy($scope.imagePathSuffixArray);
        $scope.count=0;
        $scope.promise;
        $scope.highlightIndex;
        $scope.isGameRunning =false;
        $scope.won =false;


        $scope.start = shuffle;
        $scope.stop = stop;
        $scope.solve = startAStarSearch;
        $scope.move = move;

        function move (row, column) {

            if (isValidMove(row, column)) {
                moveImages(row, column);
            }
            else {
                $scope.alert.msg="Invalid move !!!";
                $scope.type=warning;
                return;
            }


            if (checkWinningState()) {
                   $scope.won=true;
                    stopTheTimer();

            }
        };

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
            while(!verifySolvable(currentImages)){
                currentImages = populateRandomNumbers();
            }
            populateTheArray(currentImages);
            if($scope.isGameRunning){
                resetTheTimer();
            }
            $scope.startTime = new Date();
            startTheTimer();

        }

        function stop(){
            stopTheTimer();
            $scope.isGameRunning =false;
            $scope.won=false;
            $scope.solution=[];
        }

        function populateRandomNumbers(){
            var currentImages = [];
            while (currentImages.length < 9) {
                var nextRarndomNo = nextRandom();
                while (currentImages.indexOf(nextRarndomNo)!== -1 || nextRarndomNo === 0) {
                    nextRarndomNo = nextRandom();
                }
                currentImages.push(nextRarndomNo);
            }
            return currentImages;
        }

        function verifySolvable(currentImages){
            var inversionCount = getInversionCount(currentImages);
            return (inversionCount%2===0);
        }

        function getInversionCount(currentImages) {
            var inversionCount = 0;
            for (var i = 0; i < (9 - 1); i++) {
                for (var j = i + 1; j <  9 ; j++) {
                    //skip if 9 as 9 is used for blank image
                    if(!(currentImages[i]===9 || currentImages[j]===9)){
                        if(currentImages[i] >  currentImages[j]){
                            inversionCount++;
                        }
                    }
                }
            }
            return inversionCount;
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

        function simulate(){
            var delay = 0;
            $scope.solution.forEach(function(item,index){
                    delay += 500;
                   switch(item.value){
                   case 'R':$timeout(function(){move($scope.initialBlankImg[rowIndex],$scope.initialBlankImg[columnIndex]+1);$scope.highlightIndex=index ;},delay);break;
                   case 'L':$timeout(function(){move($scope.initialBlankImg[rowIndex],$scope.initialBlankImg[columnIndex]-1);$scope.highlightIndex=index ;},delay);break;
                   case 'U':$timeout(function(){move($scope.initialBlankImg[rowIndex]-1,$scope.initialBlankImg[columnIndex]);$scope.highlightIndex=index ;},delay);break;
                   case 'D':$timeout(function(){move($scope.initialBlankImg[rowIndex]+1,$scope.initialBlankImg[columnIndex]);$scope.highlightIndex=index ;},delay);break;
                   default : alert('Invalid move');break;
               }
           }
        );

        }
//--------------------------------------------------------------Alert ----------------------
//---------------------------------------------------------------A* search bit---------------



        function startAStarSearch() {
            var currState = angular.copy($scope.imagePathSuffixArray);
            var goalState = $scope.winningCombination;
            var current = new Node(0,currState, initialBlankImg[rowIndex], initialBlankImg[columnIndex], 0);
            var goal = new Node(0,goalState, 2, 2, 0);

            var astar = new AStar(current, goal, 9);
            var result = astar.execute();
            // console.log(result.strRepresentation);
            // $scope.solution = result.path;
        }

        function Node(value, state, blankImgRow, blankImgCol, depth) {
            this.value = value;
            this.state = state;
            this.blankImgCol = blankImgCol;
            this.blankImgRow = blankImgRow;
            this.depth = depth;
            this.strRepresentation = "";
            this.path = "";

            for (var i = 0; i < state.length; i++) {
                if (state[i].length != state.length) {
                    alert('Number of rows differs from number of columns');
                    return false
                }

                for (var j = 0; j < state[i].length; j++)
                    this.strRepresentation += state[i][j] + ",";
            }

            this.size = this.state.length
        }

        Array.prototype.clone = function () {
            return JSON.parse(JSON.stringify(this))
        };

        function AStar(initial, goal, empty) {
            this.initial = initial;
            this.goal = goal;
            this.empty = empty;
            this.queue = new PriorityQueue({
                comparator: function (a, b) {
                    if (a.value > b.value)
                        return 1;
                    if (a.value < b.value)
                        return -1;
                    return 0
                }
            });
            this.queue.queue(initial);
            this.visited = new HashSet();
        }

        AStar.prototype.heuristic = function (node) {
            return this.manhattanDistance(node);
        };

        AStar.prototype.manhattanDistance = function (node) {
            var result = 0;

            for (var i = 0; i < node.state.length; i++) {
                for (var j = 0; j < node.state[i].length; j++) {
                    var elem = node.state[i][j];
                    var found = false;
                    for (var h = 0; h < this.goal.state.length; h++) {
                        for (var k = 0; k < this.goal.state[h].length; k++) {
                            if (this.goal.state[h][k] === elem) {
                                result += Math.abs(h - i) + Math.abs(j - k);
                                found = true;
                                break
                            }
                        }
                        if (found)
                            break
                    }
                }
            }

            return result
        };

        AStar.prototype.execute = function () {
            // Add current state to visited list
            this.visited.add(this.initial.strRepresentation);
            while (this.queue.length > 0) {
                var current = this.queue.dequeue();

                console.log(current.strRepresentation);

                if (current.strRepresentation === this.goal.strRepresentation){
                    console.log("SOLUTION FOUNDD!!!");
                    $scope.solution = Array.from(current.path);
                    $scope.solution.forEach(function (item, index) {
                        $scope.solution[index] = {index:index, value:item};

                    })
                    return;
                    // return current;
                }


                this.expandNode(current)
            }
        };

        AStar.prototype.expandNode = function (node) {
            var temp = '';
            var newState = '';
            var col = node.blankImgCol;
            var row = node.blankImgRow;
            var newNode = '';
            console.log("expanding nodes");

            // Up
            if (row > 0) {
                newState = node.state.clone();
                temp = newState[row - 1][col];
                newState[row - 1][col] = this.empty;
                newState[row][col] = temp;
                newNode = new Node(0, newState, row - 1, col, node.depth + 1);

                if (!this.visited.contains(newNode.strRepresentation)) {
                    newNode.value = newNode.depth + this.heuristic(newNode);
                    newNode.path = node.path + "U";
                    this.queue.queue(newNode);
                    this.visited.add(newNode.strRepresentation)
                }
            }

            // Down
            if (row < node.size - 1) {
                newState = node.state.clone();
                temp = newState[row + 1][col];
                newState[row + 1][col] = this.empty;
                newState[row][col] = temp;
                newNode = new Node(0, newState, row + 1, col, node.depth + 1);

                if (!this.visited.contains(newNode.strRepresentation)) {
                    newNode.value = newNode.depth + this.heuristic(newNode);
                    newNode.path = node.path + "D";
                    this.queue.queue(newNode);
                    this.visited.add(newNode.strRepresentation)
                }
            }

            // Left
            if (col > 0) {
                newState = node.state.clone();
                temp = newState[row][col - 1];
                newState[row][col - 1] = this.empty;
                newState[row][col] = temp;
                newNode = new Node(0, newState, row, col - 1, node.depth + 1);

                if (!this.visited.contains(newNode.strRepresentation)) {
                    newNode.value = newNode.depth + this.heuristic(newNode);
                    newNode.path = node.path + "L";
                    this.queue.queue(newNode);
                    this.visited.add(newNode.strRepresentation)
                }
            }

            // Right
            if (col < node.size - 1) {
                newState = node.state.clone();
                temp = newState[row][col + 1];
                newState[row][col + 1] = this.empty;
                newState[row][col] = temp;
                newNode = new Node(0, newState, row, col + 1, node.depth + 1);

                if (!this.visited.contains(newNode.strRepresentation)) {
                    newNode.value = newNode.depth + this.heuristic(newNode);
                    newNode.path = node.path + "R";
                    this.queue.queue(newNode);
                    this.visited.add(newNode.strRepresentation)
                }
            }
        }



    });

})();
