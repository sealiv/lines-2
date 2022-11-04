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
      if (cells[x][y].ball == null) {
         selected.setPosition(x, y);
         selected.doJamp();
      }
      // findFillingCells();
   };

   boardImage.img.ondblclick = function(e) {
      var x = (e.pageX - zeroX - field.offsetLeft) / cellSize | 0;
      var y = (e.pageY - zeroY)  / cellSize | 0;
      new Ball(x, y, getRandom(6) + 1);
      // findFillingCells();
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
      this.img.onclick = clickOnBall;
      balls.push(this);
      // this.setCell(cells[x][y]);
      // console.log("new Ball: " + cells[x][y]);
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
      let newBall = new Ball(newCell.x, newCell.y, getRandom(6) + 1);
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

function findFillingCells() {
   var cellsWithBall = [];
   for(let x=0; x < 9; x++) {
      for(let y=0; y<9; y++) {
         if(cells[x][y].ball != null) {
            cellsWithBall.push(cells[x][y]);
         }
      }
   }
   console.log("Filled cells: " + cellsWithBall);
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