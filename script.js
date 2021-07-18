
class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

class GameObject {
	constructor() { };
	update = ()=>{ };
	draw = ()=>{ };
}

class Rect extends GameObject{
	constructor(x,y,w,h,color) {
		super();
		this.pos = new Vector(x,y);
		this.size = new Vector(w,h);
		this.color = color;
	}
}

class Circle extends GameObject{
	constructor(x,y,r,color){
		super();
		this.pos = new Vector(x,y);
		this.radius = r;
		this.color = color;
	}
}

class Ball extends Circle {
	constructor(r){
		super(0,0,0.02,'#FF0000');
		this.d = new Vector(0.02,0.015);
	}

	update = (delta)=>{
		this.pos.x += Math.round(1*this.d.x*delta * 1000) / 1000;
		this.pos.y += Math.round(1*this.d.y*delta * 1000) / 1000;
		
		//check if ball beyond right border
		if (this.pos.x > 1){
			this.pos.x = 0;
			this.pos.y = 0;
			this.d.x = this.d.x*-1;
		// check if ball beyond left border 
		}else if (this.pos.x < -1){
			this.pos.x = 0;
			this.pos.y = 0;
			this.d.x = this.d.x*-1;
		}
		// check top border
		if (this.pos.y > 1-this.radius){
			this.pos.y = 1-this.radius;
			this.d.y = this.d.y*-1;
		// check bottom border
		}else if (this.pos.y < -1+this.radius){
			this.pos.y = -1+this.radius;
			this.d.y = this.d.y*-1;
		}
	}

	draw = (ctx, pos, r)=>{
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
		ctx.lineWidth = 3;
		ctx.strokeStyle = this.color;
		ctx.stroke();
	}
}

class AI extends Rect {
	constructor(ball){
		super(0.96,0.15,0.02,0.3,'#F36A2F');
		this.move = 1;
		this.ball = ball;
		this.time = new Date().valueOf();
	}

	update = (delta)=>{
		/*if (new Date().valueOf() - this.time > 300) {
			this.time = new Date().valueOf();
			if (this.ball.pos.y > this.pos.y-this.size.y/2) this.move = 1;
			else this.move = -1;
			console.log("ball", this.ball.pos.y, "aipos", this.pos.y);
		}*/
		this.pos.y = this.ball.pos.y+this.size.y/2;
		//this.pos.y += Math.round((0.02*this.move*delta) * 100) / 100;
		if (this.pos.y > 1){
			this.pos.y = 1;
		}else if (this.pos.y < -1+this.size.y){
			this.pos.y = -1+this.size.y;
		}
	}

	draw = (ctx, pos, size)=>{
		ctx.fillStyle = this.color;
		ctx.fillRect(pos.x,pos.y,size.w,size.h);
	}
}

class Player extends Rect{
	constructor(){
		super(-0.96,0,-0.02,0.3,'white');
		this.move = 0;
	}

	update = (delta)=>{
		this.pos.y += Math.round((0.02*this.move*delta) * 100) / 100;
		if (this.pos.y > 1){
			this.pos.y = 1;
		}else if (this.pos.y < -1+this.size.y){
			this.pos.y = -1+this.size.y;
		}
	}

	draw = (ctx, pos, size)=>{
		ctx.fillStyle = this.color;
		ctx.fillRect(pos.x,pos.y,size.w,size.h);
	}
}

class WindowManager {

	constructor(wRatio, hRatio){
		this.gamediv = document.getElementById('gamediv');
		this.canvas = document.getElementById('board');
		this.ctx = this.canvas.getContext('2d');
		this.board = {
			min: 0,
			x: 0,
			y: 0
		};
		this.border = {
			x: 1.0,
			y: 1.0
		};
		this.w = wRatio;
		this.h = hRatio;
		this.resize();
	}

	resize = ()=>{	
		//console.log("resize");
		var winHeight = this.gamediv.clientHeight;
		var winWidth = this.gamediv.clientWidth;
		
		//console.log(winHeight);
		//console.log(winWidth);
		//console.log(canvas.width);
		
	
		if(winHeight / this.h < winWidth / this.w) {
			this.canvas.height = winHeight;
			this.canvas.width = this.w*winHeight/this.h;
		} else {
			this.canvas.width = winWidth;
			this.canvas.height = this.h*winWidth/this.w;
		}

		if(this.canvas.height < this.canvas.width){
			this.board.min = this.canvas.height/2;
			this.board.x = this.canvas.height/2;
			this.board.y = this.canvas.height/2;
		} else {
			this.board.min = this.canvas.width/2;
			this.board.x = this.canvas.width/2;
			this.board.y = this.canvas.width/2;
		}
		this.board.x *= this.border.x;
		this.board.y *= this.border.y;
	}

	getCoordinates = (vector)=>{
		var w = this.canvas.width;
		var h = this.canvas.height;
		return {
			x: Math.floor(w/2 + this.board.x*vector.x),
			y: Math.floor(h/2 + this.board.y*vector.y*-1)
		};

	}

	getSize = (vector)=>{
		return {
			w: Math.round(this.board.min*vector.x),
			h: Math.round(this.board.min*vector.y)
		};
	}

	getRad = (rad)=>{
		return Math.round(rad*this.board.min);
	}

	clear = ()=>{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

class Pong {

	constructor(w, h, fps) {
		this.window = new WindowManager(w, h);
		//super(game, canvas, ctx, 4, 3);
		this.height;
		this.width;
		this.balls = [
			new Ball()
		];
		this.players = [
			new AI(this.balls[0]),
			new Player()
		];
		this.last;
		this.fps = fps;
		this.animationID;
		this.addListeners();
	}

	addListeners = () => {
		window.addEventListener("resize", this.window.resize, false);
		var startBut = document.getElementById("start");
		var stopBut = document.getElementById("stop");
		startBut.addEventListener("click",  (e) => {
			this.start();
		});
		stopBut.addEventListener("click",  (e) => {
			this.stop();
		});

		window.addEventListener('keydown', (key) => {
			// up movement
			if (key.key === 'ArrowUp') this.players[1].move = 1;

			// down movement
			if (key.key === 'ArrowDown') this.players[1].move = -1;
		});

		// stop movement
		window.addEventListener('keyup', (key) => { this.players[1].move = 0; });
	}

	start = () => {
		this.last = Date.now()
		this.animationID = requestAnimationFrame(this.loop);
	}

	loop = () => {
		// calculate delta
		this.animationID = requestAnimationFrame(this.loop);
		var now = Date.now();
		var delta = Math.round(((now-this.last) / (1000/this.fps)) * 10) / 10;
		this.last = now;

		//######## main loop ########

		this.step(delta);
		this.render();
	}

	stop = () => {
		cancelAnimationFrame(this.animationID);
		this.window.clear();
		console.log("stopped");
	}

	step = (delta) => {
		//console.log(delta)

		this.players.forEach(p => {
			p.update(delta);
		});
		this.balls.forEach(b => {
			b.update(delta);
		});

		// collision detection with player 
		let epx = 0.01
		let epy = 0.03
		this.balls.forEach(b => {
			this.players.forEach(p => {
				if(b.pos.x+epx >= p.pos.x && b.pos.x-epx <= p.pos.x ){
					if(b.pos.y >= p.pos.y-p.size.y-epy && b.pos.y <= p.pos.y+epy){
						b.d.x = b.d.x*-1
					}
				}
			});
		});

	}

	render = () => {
		this.window.ctx.clearRect(0, 0, this.window.canvas.width, this.window.canvas.height);
		
		this.players.forEach(p => {
			let pos = this.window.getCoordinates(p.pos);
			let size = this.window.getSize(p.size);
			p.draw(this.window.ctx, pos, size);
		});

		this.balls.forEach(b => {
			let pos = this.window.getCoordinates(b.pos);
			let r = this.window.getRad(b.radius);
			b.draw(this.window.ctx, pos, r)
		});
	}

}

(function() {
	let game = new Pong(4, 3, 60);
})();
