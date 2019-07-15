class Hexa {
    constructor() {
        this.board;
        this.playBtn;
        this.turn;
        this.score;
        this.memory = [];
        this.lastMove = {
            brd: "",
            mvi: 0
        };
        this.clicks = {
            first: null,
            second: null
        };
        this.win = {
            c: 0,
            p: 0
        };

        this.createBtns();
        this.restart();
    }

    getPossibles() {
        const pos = [],
            tp = this.turn == 0 ? "W" : "B",
            gp = this.turn == 0 ? "B" : "W";

        for (let j = 0; j < 3; j++) {
            let jj = j + (this.turn == 0 ? -1 : 1);
            if (jj < 3 && jj > -1) {
                for (let i = 0; i < 3; i++) {
                    if (this.board[i][j] == tp) {
                        for (let k = -1; k < 2; k++) {
                            if (i + k > -1 && i + k < 3 &&
                                ((this.board[i + k][jj] == " " && i + k == i) || (this.board[i + k][jj] == gp && i + k != i))) {
                                pos.push({
                                    f: i + j * 3,
                                    t: i + k + jj * 3
                                });
                            }
                        }
                    }
                }
            }
        }
        return pos;
    }

    computerMoves() {
        let brd = this.getBoard(),
            mvs, needSave = false;

        for (let i = 0; i < this.memory.length; i++) {
            if (this.memory[i].board == brd) {
                mvs = this.memory[i].moves;
                break;
            }
        }

        if (!mvs) {
            mvs = this.getPossibles();
            needSave = true;
        }
        if (mvs.length == 0) return 0;

        let idx = Math.floor(Math.random() * mvs.length);
        this.lastMove.brd = brd;
        this.lastMove.mvi = idx;
        let i = mvs[idx].f % 3,
            j = Math.floor(mvs[idx].f / 3),
            ii = mvs[idx].t % 3,
            jj = Math.floor(mvs[idx].t / 3);
        this.board[i][j] = " ";
        this.board[ii][jj] = "B";

        if (needSave) {
            this.memory.push({
                board: brd,
                moves: mvs
            });
        }
        this.updateBtns();
        return -1;
    }

    getBoard() {
        let str = "";
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                str += this.board[i][j];
            }
        }
        return str;
    }

    updateScore() {
        this.score.innerHTML = "Player: " + this.win.p + " Computer: " + this.win.c;
    }

    finish(r) {
        let str = "The Computer wins!";
        if (r == 0) {
            str = "You win!";
            this.win.p++;
            for (let i = 0; i < this.memory.length; i++) {
                if (this.memory[i].board == this.lastMove.brd) {
                    this.memory[i].moves.splice(this.lastMove.mvi, 1);
                    break;
                }
            }
        } else {
            this.win.c++;
        }
        this.playBtn.innerHTML = str + "<br />Click to play.";
        this.playBtn.className = "button long"
        this.updateScore();
    }

    checkFinished() {
        if (this.getPossibles().length < 1) return this.turn == 0 ? 1 : 0;

        for (let i = 0; i < 3; i++) {
            if (this.board[i][0] == "W") return 0;
            if (this.board[i][2] == "B") return 1;
        }

        let w = 0,
            b = 0;
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                if (this.board[i][j] == "W") w++;
                if (this.board[i][j] == "B") b++;
            }
        }
        if (w == 0) return 1;
        if (b == 0) return 0;
        return -1;
    }

    nextPlayer() {
        let r;
        this.updateBtns();
        this.turn = this.turn == 0 ? 1 : 0;
        r = this.checkFinished();

        if (r > -1) {
            this.finish(r);
        } else {
            if (this.turn == 1) {
                r = this.computerMoves();
                if (r < 0) this.nextPlayer();
                else this.finish(r);
            }
        }
    }

    search(o, arr) {
        for (let i = 0; i < arr.length; i++) {
            if (o.f == arr[i].f && o.t == arr[i].t) return i;
        }
        return -1;
    }

    btnHandle(e) {
        if (this.turn > 0) return;
        let ti = e.target.i,
            tj = e.target.j;

        if (this.clicks.first == null && this.board[ti][tj] == "W") {
            this.clicks.first = e.target;
            this.clicks.first.className += " marked"
        } else if (this.clicks.first != null && this.board[ti][tj] == "W") {
            this.clicks.first.className = this.clicks.first.className.split(" ")[0];
            this.clicks.first = this.clicks.second = null;
        } else if (this.clicks.first != null && (this.board[ti][tj] == " " ||
                this.board[ti][tj] == "B")) {
            this.clicks.second = e.target;
            let moves = this.getPossibles(this.turn),
                i = this.clicks.first.i,
                ii = this.clicks.second.i,
                j = this.clicks.first.j,
                jj = this.clicks.second.j,
                obj = {
                    f: i + j * 3,
                    t: ii + jj * 3
                };
            if (this.search(obj, moves) > -1) {
                this.board[i][j] = " ";
                this.board[ii][jj] = "W";
                this.clicks.first.className = this.clicks.first.className.split(" ")[0];
                this.clicks.first = this.clicks.second = null;
                this.nextPlayer();
            }
        }
    }

    updateBtns() {
        let b, v;
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                b = document.getElementById("btn" + (i + j * 3));
                b.innerHTML = this.board[i][j] == "B" ? "&#x265F;" : this.board[i][j] == "W" ? "&#x2659;" : " ";
            }
        }
    }

    restart() {
        this.turn = 0;
        this.createBoard();
        this.updateBtns();
        this.playBtn.className += " hide";
    }

    createBoard() {
        this.board = new Array(3);
        for (let i = 0; i < 3; i++) {
            this.board[i] = new Array(3);
        }
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                this.board[i][j] = j == 0 ? "B" : j == 2 ? "W" : " ";
            }
        }
    }

    createBtns() {
        let b, d = document.createElement("div"),
            v = false;
        d.className += "board";
        document.body.appendChild(d);
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                b = document.createElement("button");
                b.id = "btn" + (i + j * 3);
                b.i = i;
                b.j = j;
                b.addEventListener("click", (e) => {
                    this.btnHandle(e)
                }, false);
                b.appendChild(document.createTextNode(""));
                d.appendChild(b);
                if (v) b.className = "button"
                else b.className = "empty";
                v = !v;
            }
        }
        this.playBtn = document.createElement("button");
        this.playBtn.className = "button long hide";
        this.playBtn.addEventListener("click", (e) => {
            this.restart()
        }, false);
        this.score = document.createElement("p");
        this.score.className = "txt";
        d.appendChild(this.score);
        d.appendChild(this.playBtn);
        this.updateScore();
    }
}

new Hexa();