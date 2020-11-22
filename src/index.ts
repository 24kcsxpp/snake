/**
 * 贪吃蛇整体思路
 * 1、创建活动区域，让蛇在规定的区域内移动
 * 2、创建蛇
 * 3、随机创建生成食物
 * 4、根据速度设置定时器，让蛇进行移动
 * 5、监听方向键，判断蛇移动的方向，计算蛇头的位置
 * 6、当碰壁或碰上自己的身体时，则游戏结束
 * 7、当遇到食物时，将食物所在的点当成蛇头，延长整个蛇身
**/

'use strict'

//整体游戏方案
module GamePlan {
    let score: number = 0;
    interface Point {
        type: string  //点的类型（蛇身、空白还是食物）
        node: HTMLElement  //所在的节点
        coordinates: Coordinates  //所在的位置
    }
    interface Coordinates {
        x: number  //点的位置X
        y: number  //点的位置Y
    }
    //创建活动区域
    export class ActivityArea {
        private area: HTMLTableElement
        public row: number  //有多少行，用于计算活动区域大小（默认100）
        public col: number  //有多少列，用于计算活动区域大小（默认100）
        public areaPoints: Point[]  //活动区域内所有点位的集合
        constructor(option: any) {
            this.row = option.row || 100;
            this.col = option.col || 100;
            this.area = document.createElement("table");
            this.areaPoints = [];
        }
        //计算活动区域
        initActivityArea() {
            for (let i = 0; i < this.row; i++) {
                //生成行
                let tr = this.area.insertRow(-1);
                for (let j = 0; j < this.col; j++) {
                    //生成列
                    let td = tr.insertCell(-1);
                    td.className = "space";
                    //记录下每一个点位
                    let point: Point = {
                        type: "space",
                        node: td,
                        coordinates: { x: i, y: j }
                    }

                    //记录下所有的点
                    this.areaPoints.push(point);
                }
            }

            let gameArea = <HTMLElement>document.getElementById("gameArea");
            gameArea.appendChild(this.area);
        }
    }

    //创建蛇
    export class Snake {
        public length: number  //蛇的长度
        public speed: number  //速度
        public activityArea: ActivityArea  //活动区域
        public bodies: Point[]  //蛇的身体
        public direction: number  //蛇的方向，默认向右
        public timer: any  //设置定时器
        constructor(option: any) {
            this.length = option.length || 3;
            this.speed = option.speed || 100;
            this.activityArea = option.activityArea;
            this.bodies = [];
            this.direction = option.direction || 39;
        }
        //初始化蛇
        initSnake() {
            let getSnakeDirection = (e: KeyboardEvent): void => {
                let keyCode = e.keyCode;

                //判断时不允许蛇掉头
                switch (keyCode) {
                    case 37:
                        if (this.direction !== 39) {
                            this.direction = 37;
                        }
                        break;
                    case 38:
                        if (this.direction !== 40) {
                            this.direction = 38;
                        }
                        break;
                    case 39:
                        if (this.direction !== 37) {
                            this.direction = 39;
                        }
                        break;
                    case 40:
                        if (this.direction !== 38) {
                            this.direction = 40;
                        }
                        break;
                    default:
                        break;
                }
            }
            //计算出蛇身的初始位置
            for (var i = 0; i < this.length; i++) {
                this.bodies.push(this.activityArea.areaPoints[i]);
            }

            this.bodies.forEach((point) => { point.type = "snake" });
            this.changePointType(this.bodies);
            //设置键盘按下监听
            document.addEventListener("keydown", getSnakeDirection, false);
            //初始化食物
            this.initFood();
            //设置定时器，按照速度让蛇进行移动
            this.timer = setInterval(() => { this.moveFunc() }, this.speed);
        }
        //初始化食物
        initFood() {
            //生成食物随机点位
            let coordinates: Coordinates = {
                x: Math.ceil(this.activityArea.row * Math.random()),
                y: Math.ceil(this.activityArea.col * Math.random())
            }

            //找到范围内的这个点，将其类型替换为食物
            let food = this.activityArea.areaPoints.filter((point) => {
                if (coordinates.x === point.coordinates.x && coordinates.y === point.coordinates.y) {
                    return true;
                }
            });
            food[0].type = "food";
            this.changePointType(food);
        }
        //蛇移动
        moveFunc() {
            //找到蛇头
            let snakeHead = this.bodies[this.bodies.length - 1];
            //找到下一个运动到的点位
            let nextPoint = this.nextPoint(snakeHead);
            //如果下一个点位不在活动范围内，或者是自己的身体，则判定游戏结束
            if (!nextPoint || nextPoint.type === "snake") {
                this.gameOver();
                clearInterval(this.timer);
                return;
            }
            //如果下一个点是食物，则将下一个点push到身体内，作为头部
            if (nextPoint.type === "food") {
                //将这个点位变成蛇的身体
                nextPoint.type = "snake";
                this.bodies.push(nextPoint);
                this.changePointType(this.bodies);
                //重新生成食物
                this.initFood();
                //重新找到下一个位置
                nextPoint = this.nextPoint(nextPoint);
                //得分加一
                score++;
            }

            //将下一个点位push到身体中，将最后一个点位删除掉，就形成了蛇往前走的现象
            nextPoint.type = "snake";
            this.bodies.push(nextPoint);
            let tail = <Point>this.bodies.shift();
            tail.type = "space";
            this.changePointType([tail]);
            this.changePointType(this.bodies);
        }
        nextPoint(snakeHead: Point) {
            let coordinatesX = 0;
            let coordinatesY = 0;
            switch (this.direction) {
                case 37:
                    coordinatesX = snakeHead.coordinates.x;
                    coordinatesY = snakeHead.coordinates.y - 1;
                    break;
                case 38:
                    coordinatesX = snakeHead.coordinates.x - 1;
                    coordinatesY = snakeHead.coordinates.y;
                    break;
                case 39:
                    coordinatesX = snakeHead.coordinates.x;
                    coordinatesY = snakeHead.coordinates.y + 1;
                    break;
                case 40:
                    coordinatesX = snakeHead.coordinates.x + 1;
                    coordinatesY = snakeHead.coordinates.y;
                    break;
                default:
                    break;
            }
            return this.activityArea.areaPoints.filter((point) => {
                if (coordinatesX === point.coordinates.x && coordinatesY === point.coordinates.y) {
                    return true;
                }
            })[0];
        }
        gameOver() {
            alert("游戏结束，最终得分：" + score);
            score = 0;
        }
        //更换点位类型
        changePointType(points: Point[]) {
            points.forEach((point) => { point.node.className = point.type });
        }
    }
}

let startNode = <HTMLElement>document.getElementById("start");
startNode.addEventListener("click", () => {
    let gameAreaNode = <HTMLElement>document.getElementById("gameArea");
    gameAreaNode.innerHTML = "";
    let activityArea = new GamePlan.ActivityArea({});
    activityArea.initActivityArea();

    let snake = new GamePlan.Snake({
        activityArea: activityArea
    });
    snake.initSnake();
});