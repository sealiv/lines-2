var score = 0;
var zeroX = 0;
var zeroY = 0;
var maxColor = 7;
var cellSize = 64;
var offsetCells = 313;
var selected = null;
var ballId = 0;
var balls = [];
var cells = [];
var emptyCount = 9 * 9;

function init() {
   var field = document.getElementById("field");
   let mainImage = new PanelImage("fieldImg", true);
   let boardImage = new PanelImage("cellsImg", true);
   let resultImage = new PanelImage("resultImg", false);
   let newWinnerImage = new PanelImage("newWinnerImg", false);
   zeroX = window.outerWidth/2 - mainImage.img.naturalWidth/2 + offsetCells - field.offsetLeft;
   zeroY = boardImage.img.offsetTop + 80;
   resize();

   window.onresize = function(e) {
      resize();
   };

   
   boardImage.img.onclick = function(e) {
      if (selected == null) return;
      var x = (e.pageX - zeroX - field.offsetLeft) / cellSize | 0;
      var y = (e.pageY - zeroY)  / cellSize | 0;
      if (cells[x][y] == null && checkRoad(new EmptyCell(x, y))) {
         selected.setPosition(x, y);
         checkTheSameColorAndDelete(selected);
         selected.doJamp();
      }
   };


   function resize() {
     zeroX =  window.outerWidth/2 - mainImage.img.naturalWidth/2 - field.offsetLeft + offsetCells;
     mainImage.setLeft(zeroX - offsetCells);
     boardImage.setLeft(zeroX);
     resultImage.setLeft(zeroX + cellSize);
     newWinnerImage.setLeft(zeroX + cellSize);
   //   console.log("zeroX = " + zeroX);
   //   console.log("zeroY = " + zeroY);
     fillSell();
   };
}


class PanelImage {
   id = "id";
   width = 0;
   height = 0;
   visible = true;

   constructor(id, visible) {
      this.id = id;
      this.img = document.getElementById(id);
      this.width = this.img.naturalWidth;
      this.height = this.img.naturalHeight;
      this.visible = visible;
      if (!visible) {
         this.img.style.display = "none";
      }
   }

   printConsoleWidth() {
      console.log(this.width);
   }

   setLeft(x) {
      this.img.style.left = x;
   }
}

class EmptyCell {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
   toString() {return "EmptyCell{" + this.x + ", " + this.y + "}";}
}

class Ball {
   id = "";
   color = 1;

   constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.img = document.createElement("img");
      this.id = "b_" + ++ballId;
      this.img.setAttribute("id", this.id);
      this.img.setAttribute("src", "img/png/s" + color + ".png");
      document.getElementById("field").append(this.img);
      this.setPosition(x, y);
      checkTheSameColorAndDelete(this);
      this.img.onclick = clickOnBall;
      balls.push(this);
   }

   setPosition(x, y) {
      this.setImageOffsets(this.img, x, y);
      if(selected !== null) {
         cells[selected.x][selected.y] = null;
      }
      cells[x][y]=this;
      this.x = x;
      this.y = y;
   }

   setImageOffsets(image, x, y) {
      image.style.left = zeroX + 7 + x * cellSize | 0;
      image.style.top = zeroY - 11 - cellSize + y * cellSize | 0;
   }

   doJamp() {
      this.img.setAttribute("src", "img/png/s" + selected.color + ".png");
      selected = null;
   } 

   toString(){
      return "Ball["
      + "id: " + this.id
      + ", {" + this.x + ", " + this.y + "}"
      + ", color: " + this.color
      + ", img: " + this.img.getAttribute("src")
      + "]";
   }
}

function addBalls() {
   for (let i=0; i<3; i++) {
      if(emptyCount === 0) {
         console.log("THE END");
         return;
      }
      let newCell = findPosition();
      let newBall = new Ball(newCell.x, newCell.y, getRandom(maxColor-1) + 1);
   }
}
function findPosition() {
   let position = getRandom(emptyCount - 1);
   emptyCount--;
   let index = 0;
   for(let x=0; x<9; x++) {
      for(let y=0; y<9; y++) {
         if(cells[x][y] === null) {
            if(index === position){
               return new EmptyCell(x, y);
            } else {
               index++;
            }
         }
      }
   }
}

function clickOnBall(e) {
   var clickedBall = findBall(this.id);
   if (selected == null) {
      setJamping(clickedBall);
   }
   else if (clickedBall.id === selected.id) {
      setStanding();
   } 
   else {
      setStanding();
      setJamping(clickedBall);
   }
}

function findBall(id) {
   return balls.find((item) => item.id === id);
}

function getRandom(max) {
   result = Math.floor(Math.random() * (max + 1));
   if ( result > max) {
      result = max;
   }
   return result;
}

function setJamping(ball) {
   selected = ball;
   selected.img.setAttribute("src", "img/gif/s" + selected.color + ".gif");
}

function setStanding() {
   selected.img.setAttribute("src", "img/png/s" + selected.color + ".png");
   selected = null;
}

function fillSell() {
   for (let x = 0; x < 9; x++) {
      var cellsX = [];
      for (let y = 0; y < 9; y++) {
         cellsX.push(null);
      }
      cells.push(cellsX);  
   }
}


function checkRoad(cellEnd) {
   var checkedCells = [];
   var needCheck = [];
   needCheck.push(new EmptyCell(selected.x, selected.y));
   return checkRoadArray(cellEnd, checkedCells, needCheck);
}

function checkRoadArray(cellEnd, arrChecked, arrNeedCheck) {
   if(arrNeedCheck.length === 0) {
      console.log("Road doesn't exist...")
      return false;
   }
   let tempCell = arrNeedCheck.shift();
   if (Math.abs(tempCell.x - cellEnd.x) + Math.abs(tempCell.y - cellEnd.y) === 1) {
      return true;
   }
   let x = tempCell.x;
   let y = tempCell.y;
   if (tempCell.x > 0 && isNeedAddCellToCheck(x - 1, y, arrChecked, arrNeedCheck)) {
      arrNeedCheck.push(new EmptyCell(x - 1, + y));
   }
   if (tempCell.x < 8 && isNeedAddCellToCheck(x + 1, y, arrChecked, arrNeedCheck)) {
      arrNeedCheck.push(new EmptyCell(x + 1, y));
   }
   if (tempCell.y > 0 && isNeedAddCellToCheck(x, y - 1, arrChecked, arrNeedCheck)) {
      arrNeedCheck.push(new EmptyCell(x, y - 1));
   }
   if (tempCell.y < 8 && isNeedAddCellToCheck(x, y + 1, arrChecked, arrNeedCheck)) {
      arrNeedCheck.push(new EmptyCell(x, y + 1));
   }
   arrChecked.push(tempCell);
   return checkRoadArray(cellEnd, arrChecked, arrNeedCheck);
}

function isNeedAddCellToCheck(x, y, alreadyCheckedArray, needCheckArray){
   if(cells[x][y] !== null) {
      return false;
   }
   let checkedElement = alreadyCheckedArray.find((i)=> i.x === x & i.y === y);
   let alreadyAddedElement = needCheckArray.find((i)=> i.x === x & i.y === y);
   return !checkedElement && !alreadyAddedElement;
}

function checkTheSameColorAndDelete(ball) {
   let left = 0;
   let right = 0;
   let up = 0;
   let down = 0;
   let leftUp = 0;
   let rightUp = 0;
   let leftDown = 0;
   let rightDown = 0;
   let x = ball.x;
   let y = ball.y;

   for(let i = x-1; i>=0; i--) {
      if (cells[i][y] !== null && cells[i][y].color === ball.color) {
         left++;
      } else break;
   }
   for(let i = x+1; i<=8; i++) {
      if (cells[i][y] !== null && cells[i][y].color === ball.color) {
         right++;
      } else break;
   }
   for(let i = y-1; i>=0; i--) {
      if (cells[x][i] !== null && cells[x][i].color === ball.color) {
         up++;
      } else break;
   }
   for(let i = y+1; i<=8; i++) {
      if (cells[x][i] !== null && cells[x][i].color === ball.color) {
         down++;
      } else break;
   }

   for(let i = 1; x-i>=0 & y-i>=0; i++) {
      if (cells[x-i][y-i] !== null && cells[x-i][y-i].color === ball.color) {
         leftUp++;
      } else break;
   }
   for(let i = 1; x+i<9 & y+i<9; i++) {
      if (cells[x+i][y+i] !== null && cells[x+i][y+i].color === ball.color) {
         rightDown++;
      } else break;
   }
   for(let i = 1; x-i>=0 & y+i<9; i++) {
      if (cells[x-i][y+i] !== null && cells[x-i][y+i].color === ball.color) {
         leftDown++;
      } else break;
   }
   for(let i = 1; x+i<9 & y-i>=0; i++) {
      if (cells[x+i][y-i] !== null && (cells[x+i][y-i].color === ball.color)) {
         rightUp++;
      } else break;
   }

   let arrayToDelete = [];
   if(up + down >= 4) {
      for(let i=y-up; i<=y+down; i++){
         arrayToDelete.push(cells[x][i]);
      }
   }
   if(left + right >= 4) {
      for(let i=x-left; i<=x+right; i++){
         arrayToDelete.push(cells[i][y]);
      }
   }
   if(leftDown + rightUp >= 4) {
      let length = leftDown + rightUp;
      for(let i=0; i<= length; i++){
         arrayToDelete.push(cells[x-leftDown+i][y+leftDown-i]);
      }
   }
   if(leftUp + rightDown >= 4) {
      let length = leftUp + rightDown;
      for(let i=0; i<= length; i++){
         arrayToDelete.push(cells[x-leftUp+i][y-leftUp+i]);
      }
   }
   
   if(arrayToDelete.length > 0) {
      deleteBalls(getBallsWithoutDuplicates(arrayToDelete));
   }
}

function deleteBalls(ballsToDelete) {
   while(ballsToDelete.length > 0) {
      let ball = ballsToDelete.pop();
      remove(ball);
      score = score + 2;
   }
   console.log("Score = " + score);
}

function remove(ball) {
   cells[ball.x][ball.y] = null;
   document.getElementById(ball.id).remove();
   balls.splice(balls.indexOf(ball), 1);
   ball = null;
}

function getBallsWithoutDuplicates(arr) {
   let distinctArray = [];
   while(arr.length > 0) {
      let currentElement = arr.shift();
      if(!(distinctArray.find((i)=> i === currentElement))) {
         distinctArray.push(currentElement);
      }
   }
   return distinctArray;
}