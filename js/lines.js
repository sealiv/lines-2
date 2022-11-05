var zeroX = 0;
var zeroY = 0;
var cellSize = 64;
var offsetCells = 313;
var selected = null;
var ballId = 0;
var balls = [];
var cells = [];
var emptyCells = [];

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
      if (cells[x][y].ball == null && checkRoad(selected.cell, cells[x][y])) {
         selected.setPosition(x, y);
         checkTheSameColorAndDelete(cells[x][y]);
         selected.doJamp();
      }
   };

   boardImage.img.ondblclick = function(e) {
      var x = (e.pageX - zeroX - field.offsetLeft) / cellSize | 0;
      var y = (e.pageY - zeroY)  / cellSize | 0;
      new Ball(x, y, getRandom(6) + 1);
   };


   function resize() {
     zeroX =  window.outerWidth/2 - mainImage.img.naturalWidth/2 - field.offsetLeft + offsetCells;
     mainImage.setLeft(zeroX - offsetCells);
     boardImage.setLeft(zeroX);
     resultImage.setLeft(zeroX + cellSize);
     newWinnerImage.setLeft(zeroX + cellSize);
     console.log("zeroX = " + zeroX);
     console.log("zeroY = " + zeroY);
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

class Cell {
   constructor(x, y, ball) {
      this.x = x;
      this.y = y;
      this.ball = ball;
   }

   setBall(newBall) {
      this.ball = newBall;
   }

   deleteBall() {
      this.ball = null;
   }

   toString(){
      let id = this.ball != null ? this.ball.id : "-";
      return "{" + this.x + ", " + this.y + ", " + id + "}" ;
   }
}

class Ball {
   id = "";
   color = 1;
   cell = null;

   constructor(x, y, color) {
      this.color = color;
      this.img = document.createElement("img");
      this.id = "b_" + ++ballId;
      this.img.setAttribute("id", this.id);
      this.img.setAttribute("src", "img/png/s" + color + ".png");
      this.img.classList.add("color" + color);
      document.getElementById("field").append(this.img);
      this.setPosition(x, y);
      checkTheSameColorAndDelete(cells[x][y]);
      this.img.onclick = clickOnBall;
      balls.push(this);
   }

   setPosition(x, y) {
      this.setImageOffsets(this.img, x, y);
      this.setCell(cells[x][y]);
   }

   setImageOffsets(image, x, y) {
      image.style.left = zeroX + 7 + x * cellSize | 0;
      image.style.top = zeroY - 11 - cellSize + y * cellSize | 0;
   }

   setCell(newCell){
      if (this.cell != null) {
         emptyCells.push(this.cell);
         this.cell.ball = null;
      }
      this.cell = newCell;
      newCell.ball = this;
      emptyCells.splice(emptyCells.indexOf(newCell), 1);
   }

   doJamp() {
      this.img.setAttribute("src", "img/png/s" + selected.color + ".png");
      selected = null;
   } 

   toString(){
      return "Ball["
      + "id: " + this.id
      + ", color: " + this.color
      + ", cell={" + this.cell.x + ", " + this.cell.y + "}"
      + ", img: " + this.img.getAttribute("src")
      + "]";
   }
}

function addBalls() {
   for (let i=0; i<3; i++) {
      if(emptyCells.length === 0) {
         console.log("THE END");
         return;
      }
      let position = getRandom(emptyCells.length - 1);
      let newCell = emptyCells[position];
      let newBall = new Ball(newCell.x, newCell.y, getRandom(0) + 1);
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
         var newCell = new Cell(x, y, null);
         cellsX.push(newCell);
         emptyCells.push(newCell);      
      }
      cells.push(cellsX);  
   }
}


function checkRoad(cellStart, cellEnd) {
   var checkedCells = [];
   var needCheck = [];
   needCheck.push(cellStart);
   return checkRoadArray(cellEnd, checkedCells, needCheck);
}

function checkRoadArray(cellEnd, arrChecked, arrNeedCheck) {
   if(arrNeedCheck.length === 0) {
      console.log("Road doesn't exist...")
      return false;
   }
   let tempCell = arrNeedCheck.pop();
   if (Math.abs(tempCell.x - cellEnd.x) + Math.abs(tempCell.y - cellEnd.y) === 1) {
      return true;
   }
   let x = tempCell.x;
   let y = tempCell.y;
   if (tempCell.x > 0 && checkOneCell(cells[x - 1][y], arrChecked)) {
      arrNeedCheck.push(cells[x - 1][y]);
   }
   if (tempCell.x < 8 && checkOneCell(cells[x + 1][y], arrChecked)) {
      arrNeedCheck.push(cells[x + 1][y]);
   }
   if (tempCell.y > 0 && checkOneCell(cells[x][y - 1], arrChecked)) {
      arrNeedCheck.push(cells[x][y - 1]);
   }
   if (tempCell.y < 8 && checkOneCell(cells[x][y + 1], arrChecked)) {
      arrNeedCheck.push(cells[x][y + 1]);
   }
   arrChecked.push(tempCell);
   return checkRoadArray(cellEnd, arrChecked, arrNeedCheck);
}

function checkOneCell(cell, arrChecked) {
   if(arrChecked.indexOf(cell) >= 0) {
      return false;
   }
   return cell.ball === null;
}

function checkTheSameColorAndDelete(cell) {
   let left = 0;
   let right = 0;
   let up = 0;
   let down = 0;
   let leftUp = 0;
   let rightUp = 0;
   let leftDown = 0;
   let rightDown = 0;
   let x = cell.x;
   let y = cell.y;

   for(let i = x-1; i>=0; i--) {
      if (cells[i][y].ball !== null && cells[i][y].ball.color === cell.ball.color) {
         left++;
      } else break;
   }
   for(let i = x+1; i<=8; i++) {
      if (cells[i][y].ball !== null && cells[i][y].ball.color === cell.ball.color) {
         right++;
      } else break;
   }
   for(let i = y-1; i>=0; i--) {
      if (cells[x][i].ball !== null && cells[x][i].ball.color === cell.ball.color) {
         up++;
      } else break;
   }
   for(let i = y+1; i<=8; i++) {
      if (cells[x][i].ball !== null && cells[x][i].ball.color === cell.ball.color) {
         down++;
      } else break;
   }

   for(let i = 1; x-i>=0 & y-i>=0; i++) {
      if (cells[x-i][y-i].ball !== null && cells[x-i][y-i].ball.color === cell.ball.color) {
         leftUp++;
      } else break;
   }
   for(let i = 1; x+i<9 & y+i<9; i++) {
      if (cells[x+i][y+i].ball !== null && cells[x+i][y+i].ball.color === cell.ball.color) {
         rightDown++;
      } else break;
   }
   for(let i = 1; x-i>=0 & y+i<9; i++) {
      if (cells[x-i][y+i].ball !== null && cells[x-i][y+i].ball.color === cell.ball.color) {
         leftDown++;
      } else break;
   }
   for(let i = 1; x+i<9 & y-i>=0; i++) {
      if (cells[x+i][y-i].ball !== null && (cells[x+i][y-i].ball.color === cell.ball.color)) {
         rightUp++;
      } else break;
   }
   let arrayToDelete = [];
   if(up + down >= 4) {
      for(let i=y-up; i<=y+down; i++){
         if(i !== y) {
            arrayToDelete.push(cells[x][i].ball);
         }
      }
   }
   if(left + right >= 4) {
      for(let i=x-left; i<=x+right; i++){
         if (i !== x) {
            arrayToDelete.push(cells[i][y].ball);
         }
      }
   }
   if(leftDown + rightUp >= 4) {
      let length = leftDown + rightUp;
      for(let i=0; i<= length; i++){
         if(i !== leftDown) {
            arrayToDelete.push(cells[x-leftDown+i][y+leftDown-i].ball);
         }
      }
   }
   if(leftUp + rightDown >= 4) {
      let length = leftUp + rightDown;
      console.log("rightDown=" + rightDown + ", leftUp=" + leftUp);
      for(let i=0; i<= length; i++){
         if(i !== leftUp) {
            console.log("{" + (x-leftUp+i) + "," + y-leftUp+i + "}");
            arrayToDelete.push(cells[x-leftUp+i][y-leftUp+i].ball);
         }
      }
      console.log("arr: " + arrayToDelete);
   }
   
   if(arrayToDelete.length > 0) {
      arrayToDelete.push(cells[x][y].ball);
   }

   deleteBalls(arrayToDelete);
}

function deleteBalls(ballsToDelete) {
   console.log("removing... " + ballsToDelete);
   while(ballsToDelete.length > 0) {
      let ball = ballsToDelete.pop();
      remove(ball);
   }
}

function remove(ball) {
   ball.cell.deleteBall();
   emptyCells.push(ball.cell);
   document.getElementById(ball.id).remove();
   balls.splice(balls.indexOf(ball), 1);
   ball = null;
}