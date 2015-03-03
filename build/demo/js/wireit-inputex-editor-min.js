var WireIt = {
    defaultWireClass: "WireIt.StepWire",
    wireClassFromXtype: function (A) {
        return this.classFromXtype(A, this.defaultWireClass)
    },
    defaultTerminalClass: "WireIt.Terminal",
    terminalClassFromXtype: function (A) {
        return this.classFromXtype(A, this.defaultTerminalClass)
    },
    defaultContainerClass: "WireIt.Container",
    containerClassFromXtype: function (A) {
        return this.classFromXtype(A, this.defaultContainerClass)
    },
    classFromXtype: function (E, C) {
        var D = (E || C).split(".");
        var A = window;
        for (var B = 0; B < D.length; B++) {
            A = A[D[B]]
        }
        if (!YAHOO.lang.isFunction(A)) {
            throw new Error("WireIt unable to find klass from xtype: '" + E + "'")
        }
        return A
    },
    getIntStyle: function (B, A) {
        var C = YAHOO.util.Dom.getStyle(B, A);
        return parseInt(C.substr(0, C.length - 2), 10)
    },
    sn: function (D, C, A) {
        if (!D) {
            return
        }
        var B;
        if (C) {
            for (B in C) {
                if (C.hasOwnProperty(B)) {
                    var E = C[B];
                    if (typeof (E) == "function") {
                        continue
                    }
                    if (B == "className") {
                        B = "class";
                        D.className = E
                    }
                    if (E !== D.getAttribute(B)) {
                        if (E === false) {
                            D.removeAttribute(B)
                        } else {
                            D.setAttribute(B, E)
                        }
                    }
                }
            }
        }
        if (A) {
            for (B in A) {
                if (A.hasOwnProperty(B)) {
                    if (typeof (A[B]) == "function") {
                        continue
                    }
                    if (D.style[B] != A[B]) {
                        D.style[B] = A[B]
                    }
                }
            }
        }
    },
    cn: function (A, C, B, E) {
        var D = document.createElement(A);
        this.sn(D, C, B);
        if (E) {
            D.innerHTML = E
        }
        return D
    },
    indexOf: YAHOO.lang.isFunction(Array.prototype.indexOf) ?
    function (B, A) {
        return A.indexOf(B)
    } : function (C, A) {
        for (var B = 0; B < A.length; B++) {
            if (A[B] == C) {
                return B
            }
        }
        return -1
    },
    compact: YAHOO.lang.isFunction(Array.prototype.compact) ?
    function (A) {
        return A.compact()
    } : function (A) {
        var C = [];
        for (var B = 0; B < A.length; B++) {
            if (A[B]) {
                C.push(A[B])
            }
        }
        return C
    }
};
WireIt.util = {};
(function () {
    var A = YAHOO.util.Event,
        B = YAHOO.env.ua;
    WireIt.CanvasElement = function (C) {
        this.element = document.createElement("canvas");
        C.appendChild(this.element);
        if (typeof (G_vmlCanvasManager) != "undefined") {
            this.element = G_vmlCanvasManager.initElement(this.element)
        }
    };
    WireIt.CanvasElement.prototype = {
        getContext: function (C) {
            return this.element.getContext(C || "2d")
        },
        destroy: function () {
            var C = this.element;
            if (YAHOO.util.Dom.inDocument(C)) {
                C.parentNode.removeChild(C)
            }
            A.purgeElement(C, true)
        },
        SetCanvasRegion: B.ie ?
        function (G, F, E, C) {
            var D = this.element;
            WireIt.sn(D, null, {
                left: G + "px",
                top: F + "px",
                width: E + "px",
                height: C + "px"
            });
            D.getContext("2d").clearRect(0, 0, E, C);
            this.element = D
        } : ((B.webkit || B.opera) ?
        function (F, J, C, K) {
            var D = this.element;
            var H = WireIt.cn("canvas", {
                className: D.className || D.getAttribute("class"),
                width: C,
                height: K
            }, {
                left: F + "px",
                top: J + "px"
            });
            var I = A.getListeners(D);
            for (var E in I) {
                if (I.hasOwnProperty(E)) {
                    var G = I[E];
                    A.addListener(H, G.type, G.fn, G.obj, G.adjust)
                }
            }
            A.purgeElement(D);
            D.parentNode.replaceChild(H, D);
            this.element = H
        } : function (F, E, D, C) {
            WireIt.sn(this.element, {
                width: D,
                height: C
            }, {
                left: F + "px",
                top: E + "px"
            })
        })
    }
})();
WireIt.Wire = function (D, C, B, A) {
    this.parentEl = B;
    this.terminal1 = D;
    this.terminal2 = C;
    this.eventMouseClick = new YAHOO.util.CustomEvent("eventMouseClick");
    this.eventMouseIn = new YAHOO.util.CustomEvent("eventMouseIn");
    this.eventMouseOut = new YAHOO.util.CustomEvent("eventMouseOut");
    this.eventMouseMove = new YAHOO.util.CustomEvent("eventMouseMove");
    this.setOptions(A || {});
    WireIt.Wire.superclass.constructor.call(this, this.parentEl);
    YAHOO.util.Dom.addClass(this.element, this.className);
    if (this.label) {
        this.renderLabel()
    }
    this.terminal1.addWire(this);
    this.terminal2.addWire(this)
};
YAHOO.lang.extend(WireIt.Wire, WireIt.CanvasElement, {    //wire properties
    xtype: "WireIt.Wire",
    className: "WireIt-Wire",
    cap: "round",
    bordercap: "round",
    width: 0,
    //height: 20,
    borderwidth: 1,
   // length:1,
    color: "#000000" , //"rgb(173, 216, 230)",
    bordercolor: "#0000ff",
    label: null,
    labelStyle: null,
    labelEditor: null,
    setOptions: function (B) {
        for (var A in B) {
            if (B.hasOwnProperty(A)) {
                this[A] = B[A]
            }
        }
    },
    remove: function () {
	
        this.parentEl.removeChild(this.element);
        if (this.terminal1 && this.terminal1.removeWire) {
            this.terminal1.removeWire(this)
        }
        if (this.terminal2 && this.terminal2.removeWire) {
            this.terminal2.removeWire(this)
        }
        this.terminal1 = null;
        this.terminal2 = null;
        if (this.labelEl) {
            if (this.labelField) {
                this.labelField.destroy()
            }
            this.labelEl.innerHTML = ""
        }
    },
    getOtherTerminal: function (A) {
        return (A == this.terminal1) ? this.terminal2 : this.terminal1
    },
    draw: function () {
	
	    var E = [4, 4];
        var H = this.terminal1.getXY();
        var G = this.terminal2.getXY();
        var D = [Math.min(H[0], G[0]) - E[0], Math.min(H[1], G[1]) - E[1]];
        var B = [Math.max(H[0], G[0]) + E[0], Math.max(H[1], G[1]) + E[1]];
        
        this.min = D;
        this.max = B;
        var F = Math.abs(B[0] - D[0]);
        var C = Math.abs(B[1] - D[1]);
       alert(C);
        H[0] = H[0] - D[0];
        H[1] = H[1] - D[1];
        G[0] = G[0] - D[0];
        G[1] = G[1] - D[1];
        this.SetCanvasRegion(D[0], D[1], F, C);
        var A = this.getContext();
        A.lineCap = this.bordercap;
        A.strokeStyle = this.bordercolor;
        A.lineWidth = this.width + this.borderwidth * 2;
        A.beginPath();
        A.moveTo(H[0], H[1]);
        A.lineTo(G[0], G[1]);
        A.stroke();
        A.lineCap = this.cap;
        A.strokeStyle = this.color;
        A.lineWidth = this.width;
        A.beginPath();
        A.moveTo(H[0], H[1]);    
        //alert(H);
        A.lineTo(G[0], G[1]);
        //alert();       
        A.stroke()
    },
    redraw: function () {
        this.draw();
        if (this.label) {
            this.positionLabel()
        }
    },
    renderLabel: function () {
        this.labelEl = WireIt.cn("div", {
            className: "WireIt-Wire-Label"
        }, this.labelStyle);
        if (this.labelEditor) {
            this.labelField = new inputEx.InPlaceEdit({
                parentEl: this.labelEl,
                editorField: this.labelEditor,
                animColors: {
                    from: "#FFFF99",
                    to: "#DDDDFF"
                }
            });
            this.labelField.setValue(this.label)
        } else {
            this.labelEl.innerHTML = this.label
        }
        this.element.parentNode.appendChild(this.labelEl)
    },
    setLabel: function (A) {
        if (this.labelEditor) {
            this.labelField.setValue(A)
        } else {
            this.labelEl.innerHTML = A
        }
    },
    positionLabel: function () {
        YAHOO.util.Dom.setStyle(this.labelEl, "left", (this.min[0] + this.max[0] - this.labelEl.clientWidth) / 2);
        YAHOO.util.Dom.setStyle(this.labelEl, "top", (this.min[1] + this.max[1] - this.labelEl.clientHeight) / 2)
    },
    wireDrawnAt: function (B, E) {
        var A = this.getContext();
        var D = A.getImageData(B, E, 1, 1);
		
        var C = D.data;
        return !(C[0] === 0 && C[1] === 0 && C[2] === 0 && C[3] === 0)
    },
    onMouseMove: function (A, B) {
        if (typeof this.mouseInState === undefined) {
            this.mouseInState = false
        }
        if (this.wireDrawnAt(A, B)) {
            if (!this.mouseInState) {
                this.mouseInState = true;
                this.onWireIn(A, B)
            }
            this.onWireMove(A, B)
        } else {
            if (this.mouseInState) {
                this.mouseInState = false;
                this.onWireOut(A, B)
            }
        }
    },
    onWireMove: function (A, B) {
        this.eventMouseMove.fire(this, [A, B])
    },
    onWireIn: function (A, B) {
        this.eventMouseIn.fire(this, [A, B])
    },
    onWireOut: function (A, B) {
        this.eventMouseOut.fire(this, [A, B])
    },
    onClick: function (A, B) {
        if (this.wireDrawnAt(A, B)) {
            this.onWireClick(A, B)
        }
    },
    onWireClick: function (A, B) {
        this.eventMouseClick.fire(this, [A, B])
    },
    getConfig: function () {
        var A = {
            xtype: this.xtype
        };
        if (this.labelEditor) {
            A.label = this.labelField.getValue()
        }
        return A
    }
});
WireIt.StepWire = function (D, C, B, A) {
    WireIt.StepWire.superclass.constructor.call(this, D, C, B, A)
};
YAHOO.lang.extend(WireIt.StepWire, WireIt.Wire, {
    xtype: "WireIt.StepWire",
    draw: function () {
        var B = [4, 4];
        var H = this.terminal1.getXY();
        var G = this.terminal2.getXY();
        var C = [Math.min(H[0], G[0]) - B[0], Math.min(H[1], G[1]) - B[1]];
        var E = [Math.max(H[0], G[0]) + B[0], Math.max(H[1], G[1]) + B[1]];
        var A = Math.abs(E[0] - C[0]);
        var I = Math.abs(E[1] - C[1]);
        H[0] = H[0] - C[0];
        H[1] = H[1] - C[1];
        G[0] = G[0] - C[0];
        G[1] = G[1] - C[1];
        var F = [G[0], G[1]];
        G[1] = H[1];
        this.SetCanvasRegion(C[0], C[1], A, I);
        var D = this.getContext();
        D.lineCap = this.bordercap;
        D.strokeStyle = this.bordercolor;
        D.lineWidth = this.width + this.borderwidth * 2;
        D.beginPath();
        D.moveTo(H[0], H[1]);
        D.lineTo(G[0], G[1]);
        D.lineTo(F[0], F[1]);
        D.stroke();
        D.lineCap = this.cap;
        D.strokeStyle = this.color;
        D.lineWidth = this.width;
        D.beginPath();
        D.moveTo(H[0], H[1]);
        D.lineTo(G[0], G[1]);
        D.lineTo(F[0], F[1]);
        D.stroke()
    }
});
WireIt.ArrowWire = function (D, C, B, A) {
    WireIt.ArrowWire.superclass.constructor.call(this, D, C, B, A)
};
YAHOO.lang.extend(WireIt.ArrowWire, WireIt.Wire, {
    xtype: "WireIt.ArrowWire",
    draw: function () {
        var j = 7;
        var G = j + 3;
        var Y = [4 + G, 4 + G];
        var E = this.terminal1.getXY();
        var D = this.terminal2.getXY();
        var J = Math.sqrt(Math.pow(E[0] - D[0], 2) + Math.pow(E[1] - D[1], 2));
        var f = [Math.min(E[0], D[0]) - Y[0], Math.min(E[1], D[1]) - Y[1]];
        var g = [Math.max(E[0], D[0]) + Y[0], Math.max(E[1], D[1]) + Y[1]];
        this.min = f;
        this.max = g;
        var K = Math.abs(g[0] - f[0]) + G;
        var V = Math.abs(g[1] - f[1]) + G;
        E[0] = E[0] - f[0];
        E[1] = E[1] - f[1];
        D[0] = D[0] - f[0];
        D[1] = D[1] - f[1];
        this.SetCanvasRegion(f[0], f[1], K, V);
        var N = this.getContext();
        N.lineCap = this.bordercap;
        N.strokeStyle = this.bordercolor;
        N.lineWidth = this.width + this.borderwidth * 2;
        N.beginPath();
        N.moveTo(E[0], E[1]);
        N.lineTo(D[0], D[1]);
        N.stroke();
        N.lineCap = this.cap;
        N.strokeStyle = this.color;
        N.lineWidth = this.width;
        N.beginPath();
        N.moveTo(E[0], E[1]);
        N.lineTo(D[0], D[1]);
        N.stroke();
        var R = E;
        var Q = D;
        var P = [0, 0];
        var M = 20;
        var T = (J === 0) ? 0 : 1 - (M / J);
        P[0] = Math.abs(R[0] + T * (Q[0] - R[0]));
        P[1] = Math.abs(R[1] + T * (Q[1] - R[1]));
        var m, l;
        var I = R[0] - Q[0];
        var U = R[1] - Q[1];
        var S = R[0] * Q[1] - R[1] * Q[0];
        if (I !== 0) {
            m = U / I;
            l = S / I
        } else {
            m = 0
        }
        var L, O;
        if (m === 0) {
            L = 0
        } else {
            L = -1 / m
        }
        O = P[1] - L * P[0];
        var c = 1 + Math.pow(L, 2);
        var Z = 2 * L * O - 2 * P[0] - 2 * P[1] * L;
        var X = -2 * P[1] * O + Math.pow(P[0], 2) + Math.pow(P[1], 2) - Math.pow(j, 2) + Math.pow(O, 2);
        var k = Math.pow(Z, 2) - 4 * c * X;
        if (k < 0) {
            return
        }
        var i = (-Z + Math.sqrt(k)) / (2 * c);
        var h = (-Z - Math.sqrt(k)) / (2 * c);
        var H = L * i + O;
        var F = L * h + O;
        if (R[1] == Q[1]) {
            var e = (R[0] > Q[0]) ? 1 : -1;
            i = Q[0] + e * M;
            h = i;
            H -= j;
            F += j
        }
        N.fillStyle = this.color;
        N.beginPath();
        N.moveTo(Q[0], Q[1]);
        N.lineTo(i, H);
        N.lineTo(h, F);
        N.fill();
        N.strokeStyle = this.bordercolor;
        N.lineWidth = this.borderwidth;
        N.beginPath();
        N.moveTo(Q[0], Q[1]);
        N.lineTo(i, H);
        N.lineTo(h, F);
        N.lineTo(Q[0], Q[1]);
        N.stroke()
    }
});
WireIt.BezierWire = function (D, C, B, A) {
    WireIt.BezierWire.superclass.constructor.call(this, D, C, B, A)
};
YAHOO.lang.extend(WireIt.BezierWire, WireIt.Wire, {
    xtype: "WireIt.BezierWire",
    coeffMulDirection: 100,
    draw: function () {
        var O = this.terminal1.getXY();
        var M = this.terminal2.getXY();
        var F = this.coeffMulDirection;
        var B = Math.sqrt(Math.pow(O[0] - M[0], 2) + Math.pow(O[1] - M[1], 2));
        if (B < F) {
            F = B / 2
        }
        var C = [this.terminal1.direction[0] * F, this.terminal1.direction[1] * F];
        var A = [this.terminal2.direction[0] * F, this.terminal2.direction[1] * F];
        var L = [];
        L[0] = O;
        L[1] = [O[0] + C[0], O[1] + C[1]];
        L[2] = [M[0] + A[0], M[1] + A[1]];
        L[3] = M;
        var H = [O[0], O[1]];
        var K = [O[0], O[1]];
        for (var I = 1; I < L.length; I++) {
            var D = L[I];
            if (D[0] < H[0]) {
                H[0] = D[0]
            }
            if (D[1] < H[1]) {
                H[1] = D[1]
            }
            if (D[0] > K[0]) {
                K[0] = D[0]
            }
            if (D[1] > K[1]) {
                K[1] = D[1]
            }
        }
        var G = [4, 4];
        H[0] = H[0] - G[0];
        H[1] = H[1] - G[1];
        K[0] = K[0] + G[0];
        K[1] = K[1] + G[1];
        var E = Math.abs(K[0] - H[0]);
        var N = Math.abs(K[1] - H[1]);
        this.min = H;
        this.max = K;
        this.SetCanvasRegion(H[0], H[1], E, N);
        var J = this.getContext();
        for (I = 0; I < L.length; I++) {
            L[I][0] = L[I][0] - H[0];
            L[I][1] = L[I][1] - H[1]
        }
        J.lineCap = this.bordercap;
        J.strokeStyle = this.bordercolor;
        J.lineWidth = this.width + this.borderwidth * 2;
        J.beginPath();
        J.moveTo(L[0][0], L[0][1]);
        J.bezierCurveTo(L[1][0], L[1][1], L[2][0], L[2][1], L[3][0], L[3][1]);
        J.stroke();
        J.lineCap = this.cap;
        J.strokeStyle = this.color;
        J.lineWidth = this.width;
        J.beginPath();
        J.moveTo(L[0][0], L[0][1]);
        J.bezierCurveTo(L[1][0], L[1][1], L[2][0], L[2][1], L[3][0], L[3][1]);
        J.stroke()
    }
});
WireIt.BezierArrowWire = function (D, C, B, A) {
    WireIt.BezierArrowWire.superclass.constructor.call(this, D, C, B, A)
};
YAHOO.lang.extend(WireIt.BezierArrowWire, WireIt.BezierWire, {
    xtype: "WireIt.BezierArrowWire",
    draw: function () {
        var E = Math.round(this.width * 1.5 + 20);
        var Q = Math.round(this.width * 1.2 + 20);
        var r = E / 2;
        var G = r + 3;
        var F = [4 + G, 4 + G];
        var q = this.terminal1.getXY();
        var n = this.terminal2.getXY();
        var w = this.coeffMulDirection;
        var P = Math.sqrt(Math.pow(q[0] - n[0], 2) + Math.pow(q[1] - n[1], 2));
        if (P < w) {
            w = P / 2
        }
        var k = [this.terminal1.direction[0] * w, this.terminal1.direction[1] * w];
        var j = [this.terminal2.direction[0] * w, this.terminal2.direction[1] * w];
        var O = [];
        O[0] = q;
        O[1] = [q[0] + k[0], q[1] + k[1]];
        O[2] = [n[0] + j[0], n[1] + j[1]];
        O[3] = n;
        var s = [q[0], q[1]];
        var R = [q[0], q[1]];
        for (var m = 1; m < O.length; m++) {
            var f = O[m];
            if (f[0] < s[0]) {
                s[0] = f[0]
            }
            if (f[1] < s[1]) {
                s[1] = f[1]
            }
            if (f[0] > R[0]) {
                R[0] = f[0]
            }
            if (f[1] > R[1]) {
                R[1] = f[1]
            }
        }
        s[0] = s[0] - F[0];
        s[1] = s[1] - F[1];
        R[0] = R[0] + F[0];
        R[1] = R[1] + F[1];
        var S = Math.abs(R[0] - s[0]);
        var Y = Math.abs(R[1] - s[1]);
        this.min = s;
        this.max = R;
        this.SetCanvasRegion(s[0], s[1], S, Y);
        var h = this.getContext();
        for (m = 0; m < O.length; m++) {
            O[m][0] = O[m][0] - s[0];
            O[m][1] = O[m][1] - s[1]
        }
        h.lineCap = this.bordercap;
        h.strokeStyle = this.bordercolor;
        h.lineWidth = this.width + this.borderwidth * 2;
        h.beginPath();
        h.moveTo(O[0][0], O[0][1]);
        h.bezierCurveTo(O[1][0], O[1][1], O[2][0], O[2][1], O[3][0], O[3][1] + Q / 2 * this.terminal2.direction[1]);
        h.stroke();
        h.lineCap = this.cap;
        h.strokeStyle = this.color;
        h.lineWidth = this.width;
        h.beginPath();
        h.moveTo(O[0][0], O[0][1]);
        h.bezierCurveTo(O[1][0], O[1][1], O[2][0], O[2][1], O[3][0], O[3][1] + Q / 2 * this.terminal2.direction[1]);
        h.stroke();
        var X = O[2],
            V = n;
        var c = [0, 0];
        var H = Q;
        var e = 1 - (H / P);
        c[0] = Math.abs(X[0] + e * (V[0] - X[0]));
        c[1] = Math.abs(X[1] + e * (V[1] - X[1]));
        var v, u;
        var D = X[0] - V[0];
        var U = X[1] - V[1];
        var T = X[0] * V[1] - X[1] * V[0];
        if (D !== 0) {
            v = U / D;
            u = T / D
        } else {
            v = 0
        }
        var N, l;
        if (v === 0) {
            N = 0
        } else {
            N = -1 / v
        }
        l = c[1] - N * c[0];
        var L = 1 + Math.pow(N, 2),
            J = 2 * N * l - 2 * c[0] - 2 * c[1] * N,
            I = -2 * c[1] * l + Math.pow(c[0], 2) + Math.pow(c[1], 2) - Math.pow(r, 2) + Math.pow(l, 2),
            Z = Math.pow(J, 2) - 4 * L * I;
        if (Z < 0) {
            return false
        }
        var M = (-J + Math.sqrt(Z)) / (2 * L),
            K = (-J - Math.sqrt(Z)) / (2 * L),
            y = N * M + l,
            x = N * K + l;
        if (X[1] == V[1]) {
            var g = (X[0] > V[0]) ? 1 : -1;
            M = V[0] + g * H;
            K = M;
            y -= r;
            x += r
        }
        h.fillStyle = this.color;
        h.beginPath();
        h.moveTo(V[0], V[1]);
        h.lineTo(M, y);
        h.lineTo(K, x);
        h.fill();
        h.strokeStyle = this.bordercolor;
        h.lineWidth = this.borderwidth;
        h.beginPath();
        h.moveTo(V[0], V[1]);
        h.lineTo(M, y);
        h.lineTo(K, x);
        h.lineTo(V[0], V[1]);
        h.stroke();
        return [q, n, X, V]
    }
});
(function () {
    var A = YAHOO.util;
    var C = YAHOO.lang,
        B = "WireIt-";
    WireIt.TerminalProxy = function (E, D) {
        this.terminal = E;
        this.termConfig = D || {};
        this.terminalProxySize = D.terminalProxySize || 10;
        this.fakeTerminal = null;
        WireIt.TerminalProxy.superclass.constructor.call(this, this.terminal.el, undefined, {
            dragElId: "WireIt-TerminalProxy",
            resizeFrame: false,
            centerFrame: true
        })
    };
    A.DDM.mode = A.DDM.INTERSECT;
    C.extend(WireIt.TerminalProxy, YAHOO.util.DDProxy, {
        createFrame: function () {
            var E = this,
                D = document.body;
            if (!D || !D.firstChild) {
                window.setTimeout(function () {
                    E.createFrame()
                }, 50);
                return
            }
            var J = this.getDragEl(),
                I = YAHOO.util.Dom;
            if (!J) {
                J = document.createElement("div");
                J.id = this.dragElId;
                var H = J.style;
                H.position = "absolute";
                H.visibility = "hidden";
                H.cursor = "move";
                H.border = "2px solid #aaa";
                H.zIndex = 999;
                var F = this.terminalProxySize + "px";
                H.height = F;
                H.width = F;
                var G = document.createElement("div");
                I.setStyle(G, "height", "100%");
                I.setStyle(G, "width", "100%");
                I.setStyle(G, "background-color", "#ccc");
                I.setStyle(G, "opacity", "0");
                J.appendChild(G);
                D.insertBefore(J, D.firstChild)
            }
        },
        startDrag: function () {
            if (this.terminal.nMaxWires == 1 && this.terminal.wires.length == 1) {
                this.terminal.wires[0].remove()
            } else {
                if (this.terminal.wires.length >= this.terminal.nMaxWires) {
                    return
                }
            }
            var E = this.terminalProxySize / 2;
            this.fakeTerminal = {
                direction: this.terminal.fakeDirection,
                pos: [200, 200],
                addWire: function () {},
                removeWire: function () {},
                getXY: function () {
                    var G = YAHOO.util.Dom.getElementsByClassName("WireIt-Layer");
                    if (G.length > 0) {
                        var H = YAHOO.util.Dom.getXY(G[0]);
                        return [this.pos[0] - H[0] + E, this.pos[1] - H[1] + E]
                    }
                    return this.pos
                }
            };
            var F = this.terminal.parentEl.parentNode;
            if (this.terminal.container) {
                F = this.terminal.container.layer.el
            }
            var D = WireIt.wireClassFromXtype(this.terminal.editingWireConfig.xtype);
            this.editingWire = new D(this.terminal, this.fakeTerminal, F, this.terminal.editingWireConfig);
            YAHOO.util.Dom.addClass(this.editingWire.element, B + "Wire-editing")
        },
        onDrag: function (F) {
            if (!this.editingWire) {
                return
            }
            if (this.terminal.container) {
                var E = this.terminal.container.layer.el;
                var G = 0;
                var D = 0;
                if (E.offsetParent) {
                    do {
                        G += E.scrollLeft;
                        D += E.scrollTop;
                        E = E.offsetParent
                    } while (E)
                }
                this.fakeTerminal.pos = [F.clientX + G, F.clientY + D]
            } else {
                this.fakeTerminal.pos = (YAHOO.env.ua.ie) ? [F.clientX, F.clientY] : [F.clientX + window.pageXOffset, F.clientY + window.pageYOffset]
            }
            this.editingWire.redraw()
        },
        endDrag: function (D) {
            if (this.editingWire) {
                this.editingWire.remove();
                this.editingWire = null
            }
        },
        onDragEnter: function (F, D) {
            if (!this.editingWire) {
                return
            }
            for (var E = 0; E < D.length; E++) {
                if (this.isValidWireTerminal(D[E])) {
                    D[E].terminal.setDropInvitation(true)
                }
            }
        },
        onDragOut: function (F, D) {
            if (!this.editingWire) {
                return
            }
            for (var E = 0; E < D.length; E++) {
                if (this.isValidWireTerminal(D[E])) {
                    D[E].terminal.setDropInvitation(false)
                }
            }
        },
        onDragDrop: function (L, J) {
            var H;
            if (!this.editingWire) {
                return
            }
            this.onDragOut(L, J);
            var N = null;
            for (H = 0; H < J.length; H++) {
                if (this.isValidWireTerminal(J[H])) {
                    N = J[H];
                    break
                }
            }
            if (!N) {
                return
            }
            this.editingWire.remove();
            this.editingWire = null;
            var G = false;
            for (H = 0; H < this.terminal.wires.length; H++) {
                if (this.terminal.wires[H].terminal1 == this.terminal) {
                    if (this.terminal.wires[H].terminal2 == N.terminal) {
                        G = true;
                        break
                    }
                } else {
                    if (this.terminal.wires[H].terminal2 == this.terminal) {
                        if (this.terminal.wires[H].terminal1 == N.terminal) {
                            G = true;
                            break
                        }
                    }
                }
            }
            if (G) {
                return
            }
            var I = this.terminal.parentEl.parentNode;
            if (this.terminal.container) {
                I = this.terminal.container.layer.el
            }
            var F = this.terminal;
            var E = N.terminal;
            if (E.alwaysSrc) {
                F = N.terminal;
                E = this.terminal
            }
            var K = WireIt.wireClassFromXtype(F.wireConfig.xtype);
            var D = N.terminal,
                M;
            if (D.nMaxWires == 1) {
                if (D.wires.length > 0) {
                    D.wires[0].remove()
                }
                M = new K(F, E, I, F.wireConfig);
                M.redraw()
            } else {
                if (D.wires.length < D.nMaxWires) {
                    M = new K(F, E, I, F.wireConfig);
                    M.redraw()
                }
            }
        },
        isWireItTerminal: true,
        isValidWireTerminal: function (D) {
            if (!D.isWireItTerminal) {
                return false
            }
            if (this.termConfig.type) {
                if (this.termConfig.allowedTypes) {
                    if (WireIt.indexOf(D.termConfig.type, this.termConfig.allowedTypes) == -1) {
                        return false
                    }
                } else {
                    if (this.termConfig.type != D.termConfig.type) {
                        return false
                    }
                }
            } else {
                if (D.termConfig.type) {
                    if (D.termConfig.allowedTypes) {
                        if (WireIt.indexOf(this.termConfig.type, D.termConfig.allowedTypes) == -1) {
                            return false
                        }
                    } else {
                        if (this.termConfig.type != D.termConfig.type) {
                            return false
                        }
                    }
                }
            }
            if (this.terminal.container) {
                if (this.terminal.container.preventSelfWiring) {
                    if (D.terminal.container == this.terminal.container) {
                        return false
                    }
                }
            }
            return true
        }
    })
})();
(function () {
    var B = YAHOO.util;
    var A = B.Event,
        D = YAHOO.lang,
        C = "WireIt-";
    WireIt.Scissors = function (E, F) {
        WireIt.Scissors.superclass.constructor.call(this, document.createElement("div"), F);
        this._terminal = E;
        this.initScissors()
    };
    WireIt.Scissors.visibleInstance = null;
    D.extend(WireIt.Scissors, YAHOO.util.Element, {
        initScissors: function () {
            this.hideNow();
            this.addClass(C + "Wire-scissors");
            this.appendTo(this._terminal.container ? this._terminal.container.layer.el : this._terminal.el.parentNode.parentNode);
            this.on("mouseover", this.show, this, true);
            this.on("mouseout", this.hide, this, true);
            this.on("click", this.scissorClick, this, true);
            A.addListener(this._terminal.el, "mouseover", this.mouseOver, this, true);
            A.addListener(this._terminal.el, "mouseout", this.hide, this, true)
        },
        setPosition: function () {
            var E = this._terminal.getXY();
            this.setStyle("left", (E[0] + this._terminal.direction[0] * 30 - 8) + "px");
            this.setStyle("top", (E[1] + this._terminal.direction[1] * 30 - 8) + "px")
        },
        mouseOver: function () {
            if (this._terminal.wires.length > 0) {
                this.show()
            }
        },
        scissorClick: function () {
            this._terminal.removeAllWires();
            if (this.terminalTimeout) {
                this.terminalTimeout.cancel()
            }
            this.hideNow()
        },
        show: function () {
            this.setPosition();
            this.setStyle("display", "");
            if (WireIt.Scissors.visibleInstance && WireIt.Scissors.visibleInstance != this) {
                if (WireIt.Scissors.visibleInstance.terminalTimeout) {
                    WireIt.Scissors.visibleInstance.terminalTimeout.cancel()
                }
                WireIt.Scissors.visibleInstance.hideNow()
            }
            WireIt.Scissors.visibleInstance = this;
            if (this.terminalTimeout) {
                this.terminalTimeout.cancel()
            }
        },
        hide: function () {
            this.terminalTimeout = YAHOO.lang.later(700, this, this.hideNow)
        },
        hideNow: function () {
            WireIt.Scissors.visibleInstance = null;
            this.setStyle("display", "none")
        }
    })
})();
(function () {
    var B = YAHOO.util;
    var A = B.Event,
        E = YAHOO.lang,
        C = B.Dom,
        D = "WireIt-";
    WireIt.Terminal = function (H, G, F) {
        this.name = null;
        this.parentEl = H;
        this.container = F;
        this.wires = [];
        this.setOptions(G);
        this.eventAddWire = new B.CustomEvent("eventAddWire");
        this.eventRemoveWire = new B.CustomEvent("eventRemoveWire");
        this.el = null;
        this.render();
        if (this.editable) {
            this.dd = new WireIt.TerminalProxy(this, this.ddConfig);
            this.scissors = new WireIt.Scissors(this)
        }
    };
    WireIt.Terminal.prototype = {
        xtype: "WireIt.Terminal",
        direction: [0, 1],
        fakeDirection: [0, -1],
        editable: true,
        nMaxWires: Infinity,
        wireConfig: {},
        editingWireConfig: {},
        className: "WireIt-Terminal",
        connectedClassName: "WireIt-Terminal-connected",
        dropinviteClassName: "WireIt-Terminal-dropinvite",
        offsetPosition: null,
        alwaysSrc: false,
        ddConfig: false,
        setOptions: function (G) {
            for (var F in G) {
                if (G.hasOwnProperty(F)) {
                    this[F] = G[F]
                }
            }
            if (G.direction && !G.fakeDirection) {
                this.fakeDirection = [-G.direction[5], -G.direction[1]]
            }
            if (G.wireConfig && !G.editingWireConfig) {
                this.editingWireConfig = this.wireConfig
            }
        },
        setDropInvitation: function (F) {
            if (F) {
                C.addClass(this.el, this.dropinviteClassName)
            } else {
                C.removeClass(this.el, this.dropinviteClassName)
            }
        },
        render: function () {
            this.el = WireIt.cn("div", {
                className: this.className
            });
            if (this.name) {
                this.el.title = this.name
            }
            this.setPosition(this.offsetPosition);
            this.parentEl.appendChild(this.el)
        },
        setPosition: function (G) {
            if (G) {
                this.el.style.left = "";
                this.el.style.top = "";
                this.el.style.right = "";
                this.el.style.bottom = "";
                if (E.isArray(G)) {
                    this.el.style.left = G[0] + "px";
                    this.el.style.top = G[1] + "px"
                } else {
                    if (E.isObject(G)) {
                        for (var F in G) {
                            if (G.hasOwnProperty(F) && G[F] !== "") {
                                this.el.style[F] = G[F] + "px"
                            }
                        }
                    }
                }
            }
        },
        addWire: function (F) {
            this.wires.push(F);
            C.addClass(this.el, this.connectedClassName);
            this.eventAddWire.fire(F)
        },
        removeWire: function (G) {
            var F = WireIt.indexOf(G, this.wires);
            if (F != -1) {
                this.wires[F].destroy();
                this.wires[F] = null;
                this.wires = WireIt.compact(this.wires);
                if (this.wires.length === 0) {
                    C.removeClass(this.el, this.connectedClassName)
                }
                this.eventRemoveWire.fire(G)
            }
        },
        getXY: function () {
            var G = this.container && this.container.layer ? this.container.layer.el : document.body;
            var H = this.el;
            var I = 0,
                F = 0;
            if (H.offsetParent) {
                do {
                    I += H.offsetLeft;
                    F += H.offsetTop;
                    H = H.offsetParent
                } while ( !! H && H != G)
            }
            return [I + 10, F + 11]
        },
        remove: function () {
            while (this.wires.length > 0) {
                this.wires[0].remove()
            }
            this.parentEl.removeChild(this.el);
            A.purgeElement(this.el);
            if (this.scissors) {
                A.purgeElement(this.scissors.get("element"))
            }
        },
        getConnectedTerminals: function () {
            var F = [];
            if (this.wires) {
                for (var G = 0; G < this.wires.length; G++) {
                    F.push(this.wires[G].getOtherTerminal(this))
                }
            }
            return F
        },
        redrawAllWires: function () {
            if (this.wires) {
                for (var F = 0; F < this.wires.length; F++) {
                    this.wires[F].redraw()
                }
            }
        },
        removeAllWires: function () {
            while (this.wires.length > 0) {
                this.wires[0].remove()
            }
        }
    }
})();
WireIt.util.TerminalInput = function (C, B, A) {
    WireIt.util.TerminalInput.superclass.constructor.call(this, C, B, A)
};
YAHOO.lang.extend(WireIt.util.TerminalInput, WireIt.Terminal, {
    xtype: "WireIt.TerminalInput",
    direction: [0, -1],
    fakeDirection: [0, 1],
    nMaxWires: 1,
    ddConfig: {
        type: "input",
        allowedTypes: ["output"]
    }
});
WireIt.util.TerminalOutput = function (C, B, A) {
    WireIt.util.TerminalOutput.superclass.constructor.call(this, C, B, A)
};
YAHOO.lang.extend(WireIt.util.TerminalOutput, WireIt.Terminal, {
    xtype: "WireIt.TerminalOutput",
    direction: [0, 1],
    fakeDirection: [0, -1],
    ddConfig: {
        type: "output",
        allowedTypes: ["input"]
    },
    alwaysSrc: true
});
WireIt.util.DD = function (D, C, A, B) {
    if (!D) {
        throw new Error("WireIt.util.DD needs at least terminals and id")
    }
    this._WireItTerminals = D;
    WireIt.util.DD.superclass.constructor.call(this, C, A, B)
};
YAHOO.extend(WireIt.util.DD, YAHOO.util.DD, {
    onDrag: function (C) {
        var A = YAHOO.lang.isArray(this._WireItTerminals) ? this._WireItTerminals : (this._WireItTerminals.isWireItTerminal ? [this._WireItTerminals] : []);
        for (var B = 0; B < A.length; B++) {
            A[B].redrawAllWires()
        }
    },
    setTerminals: function (A) {
        this._WireItTerminals = A
    }
});
WireIt.util.DDResize = function (A, B) {
    this.myConf = B || {};
    this.myConf.container = A;
    this.myConf.minWidth = this.myConf.minWidth || 50;
    this.myConf.minHeight = this.myConf.minHeight || 50;
    WireIt.util.DDResize.superclass.constructor.apply(this, [A.el, A.ddResizeHandle]);
    this.setHandleElId(A.ddResizeHandle);
    this.eventResize = new YAHOO.util.CustomEvent("eventResize")
};
YAHOO.extend(WireIt.util.DDResize, YAHOO.util.DragDrop, {
    onMouseDown: function (B) {
        var A = this.getEl();
        this.startWidth = A.offsetWidth;
        this.startHeight = A.offsetHeight;
        this.startPos = [YAHOO.util.Event.getPageX(B), YAHOO.util.Event.getPageY(B)]
    },
    onDrag: function (F) {
        var D = [YAHOO.util.Event.getPageX(F), YAHOO.util.Event.getPageY(F)];
        var A = D[0] - this.startPos[0];
        var G = D[1] - this.startPos[1];
        var E = Math.max(this.startWidth + A, this.myConf.minWidth);
        var C = Math.max(this.startHeight + G, this.myConf.minHeight);
        var B = this.getEl();
        B.style.width = E + "px";
        B.style.height = C + "px";
        this.myConf.container.redrawAllWires();
        this.eventResize.fire([E, C])
    }
});
(function () {
    var B = YAHOO.util;
    var C = B.Dom,
        A = B.Event,
        D = "WireIt-";
    WireIt.Container = function (E, F) {
        this.setOptions(E);
        this.layer = F;
        this.terminals = [];
        this.wires = [];
        this.el = null;
        this.bodyEl = null;
        this.eventAddWire = new B.CustomEvent("eventAddWire");
        this.eventRemoveWire = new B.CustomEvent("eventRemoveWire");
        this.eventFocus = new B.CustomEvent("eventFocus");
        this.eventBlur = new B.CustomEvent("eventBlur");
        this.render();
        if (E.terminals) {
            this.initTerminals(E.terminals)
        }
        if (this.resizable) {
            this.makeResizable()
        }
        if (this.draggable) {
            this.makeDraggable()
        }
    };
    WireIt.Container.prototype = {
        xtype: "WireIt.Container",
        draggable: true,
        position: [100, 100],
        className: D + "Container",
        ddHandle: true,
        ddHandleClassName: D + "Container-ddhandle",
        resizable: true,
        resizeHandleClassName: D + "Container-resizehandle",
        close: true,
        closeButtonClassName: D + "Container-closebutton",
        groupable: true,
        preventSelfWiring: true,
        title: null,
        icon: null,
        width: null,
        height: null,
        setOptions: function (F) {
            for (var E in F) {
                if (F.hasOwnProperty(E)) {
                    this[E] = F[E]
                }
            }
        },
        makeResizable: function () {
            this.ddResize = new WireIt.util.DDResize(this);
            this.ddResize.eventResize.subscribe(this.onResize, this, true)
        },
        makeDraggable: function () {
            this.dd = new WireIt.util.DD(this.terminals, this.el);
            this.dd.setXConstraint(this.position[0]);
            this.dd.setYConstraint(this.position[1]);
            if (this.ddHandle) {
                this.dd.setHandleElId(this.ddHandle)
            }
            if (this.resizable) {
                this.dd.addInvalidHandleId(this.ddResizeHandle);
                this.ddResize.addInvalidHandleId(this.ddHandle)
            }
        },
        onResize: function (G, E) {
            var F = E[0];
            WireIt.sn(this.bodyEl, null, {
                width: (F[0] - 14) + "px",
                height: (F[1] - (this.ddHandle ? 44 : 14)) + "px"
            })
        },
        render: function () {
            this.el = WireIt.cn("div", {
                className: this.className
            });
            if (this.width) {
                this.el.style.width = this.width + "px"
            }
            if (this.height) {
                this.el.style.height = this.height + "px"
            }
            A.addListener(this.el, "mousedown", this.onMouseDown, this, true);
            if (this.ddHandle) {
                this.ddHandle = WireIt.cn("div", {
                    className: this.ddHandleClassName
                });
                this.el.appendChild(this.ddHandle);
                if (this.icon) {
                    var E = WireIt.cn("img", {
                        src: this.icon,
                        className: "WireIt-Container-icon"
                    });
                    this.ddHandle.appendChild(E)
                }
                if (this.title) {
                    this.ddHandle.appendChild(WireIt.cn("span", {
                        className: "floatleft"
                    }, null, this.title))
                }
            }
            this.bodyEl = WireIt.cn("div", {
                className: "body"
            });
            this.el.appendChild(this.bodyEl);
            if (this.resizable) {
                this.ddResizeHandle = WireIt.cn("div", {
                    className: this.resizeHandleClassName
                });
                this.el.appendChild(this.ddResizeHandle)
            }
            if (this.close) {
                this.closeButton = WireIt.cn("div", {
                    className: this.closeButtonClassName
                });
                if (this.ddHandle) {
                    this.ddHandle.appendChild(this.closeButton)
                } else {
                    this.el.appendChild(this.closeButton)
                }
                A.addListener(this.closeButton, "click", this.onCloseButton, this, true)
            }
            if (this.groupable && this.ddHandle) {
                this.groupButton = WireIt.cn("div", {
                    className: "WireIt-Container-groupbutton"
                });
                this.ddHandle.appendChild(this.groupButton);
                A.addListener(this.groupButton, "click", this.onGroupButton, this, true)
            }
            this.layer.el.appendChild(this.el);
            this.el.style.left = this.position[0] + "px";
            this.el.style.top = this.position[1] + "px"
        },
        setBody: function (E) {
            if (typeof E == "string") {
                this.bodyEl.innerHTML = E
            } else {
                this.bodyEl.innerHTML = "";
                this.bodyEl.appendChild(E)
            }
        },
        onMouseDown: function (E) {
            if (this.layer) {
                if (this.layer.focusedContainer && this.layer.focusedContainer != this) {
                    this.layer.focusedContainer.removeFocus()
                }
                this.setFocus();
                this.layer.focusedContainer = this
            }
        },
        setFocus: function () {
            C.addClass(this.el, D + "Container-focused");
            this.eventFocus.fire(this)
        },
        removeFocus: function () {
            C.removeClass(this.el, D + "Container-focused");
            this.eventBlur.fire(this)
        },
        onCloseButton: function (F, E) {
            A.stopEvent(F);
            this.layer.removeContainer(this)
        },
        highlight: function () {
            this.el.style.border = "2px solid blue"
        },
        dehighlight: function () {
            this.el.style.border = ""
        },
        superHighlight: function () {
            this.el.style.border = "4px outset blue"
        },
        remove: function () {
            this.removeAllTerminals();
            this.layer.el.removeChild(this.el);
            A.purgeElement(this.el)
        },
        initTerminals: function (F) {
            for (var E = 0; E < F.length; E++) {
                this.addTerminal(F[E])
            }
        },
        addTerminal: function (G) {
            var E = WireIt.terminalClassFromXtype(G.xtype);
            var F = new E(this.el, G, this);
            this.terminals.push(F);
            F.eventAddWire.subscribe(this.onAddWire, this, true);
            F.eventRemoveWire.subscribe(this.onRemoveWire, this, true);
            return F
        },
        onAddWire: function (F, E) {
            var G = E[0];
            if (WireIt.indexOf(G, this.wires) == -1) {
                this.wires.push(G);
                this.eventAddWire.fire(G)
            }
        },
        onRemoveWire: function (G, F) {
            var H = F[0];
            var E = WireIt.indexOf(H, this.wires);
            if (E != -1) {
                this.eventRemoveWire.fire(H);
                this.wires[E] = null
            }
            this.wires = WireIt.compact(this.wires)
        },
        removeAllTerminals: function () {
            for (var E = 0; E < this.terminals.length; E++) {
                this.terminals[E].remove()
            }
            this.terminals = []
        },
        redrawAllWires: function () {
            for (var E = 0; E < this.terminals.length; E++) {
                this.terminals[E].redrawAllWires()
            }
        },
        getXY: function () {
            var F = C.getXY(this.el);
            if (this.layer) {
                var E = C.getXY(this.layer.el);
                F[0] -= E[0];
                F[1] -= E[1];
                F[0] += this.layer.el.scrollLeft;
                F[1] += this.layer.el.scrollTop
            }
            return F
        },
        getConfig: function () {
            return {
                position: this.getXY(),
                xtype: this.xtype
            }
        },
        getValue: function () {
            return {}
        },
        setValue: function (E) {},
        getTerminal: function (E) {
            var G;
            for (var F = 0; F < this.terminals.length; F++) {
                G = this.terminals[F];
                if (G.name == E) {
                    return G
                }
            }
            return null
        }
    }
})();
WireIt.Layer = function (B) {
    this.setOptions(B);
    this.containers = [];
    this.wires = [];
    this.groups = [];
    this.el = null;
    this.eventChanged = new YAHOO.util.CustomEvent("eventChanged");
    this.eventAddWire = new YAHOO.util.CustomEvent("eventAddWire");
    this.eventRemoveWire = new YAHOO.util.CustomEvent("eventRemoveWire");
    this.eventAddContainer = new YAHOO.util.CustomEvent("eventAddContainer");
    this.eventRemoveContainer = new YAHOO.util.CustomEvent("eventRemoveContainer");
    this.eventContainerDragged = new YAHOO.util.CustomEvent("eventContainerDragged");
    this.eventContainerResized = new YAHOO.util.CustomEvent("eventContainerResized");
    this.render();
    if (B.containers) {
        this.initContainers(B.containers)
    }
    if (B.wires) {
        this.initWires(B.wires)
    }
    if (this.layerMap) {
        this.layermap = new WireIt.LayerMap(this, this.layerMapOptions)
    }
    if (WireIt.Grouper) {
        this.grouper = new WireIt.Grouper(this, this.grouper.baseConfigFunction);
        var C = this.grouper.rubberband;
        this.el.onmousedown = function (D) {
            return C.layerMouseDown.call(C, D)
        };
        var A = this.grouper;
        this.el.addEventListener("mouseup", function (D) {
            C.finish();
            A.rubberbandSelect.call(A)
        }, false)
    }
};
WireIt.Layer.prototype = {
    className: "WireIt-Layer",
    parentEl: null,
    layerMap: false,
    layerMapOptions: null,
    enableMouseEvents: true,
    grouper: null,
    setOptions: function (B) {
        for (var A in B) {
            if (B.hasOwnProperty(A)) {
                this[A] = B[A]
            }
        }
        if (!this.parentEl) {
            this.parentEl = document.body
        }
    },
    render: function () {
        this.el = WireIt.cn("div", {
            className: this.className
        });
        this.parentEl.appendChild(this.el)
    },
    initContainers: function (B) {
        for (var A = 0; A < B.length; A++) {
            this.addContainer(B[A])
        }
    },
    initWires: function (B) {
        for (var A = 0; A < B.length; A++) {
            this.addWire(B[A])
        }
    },
    setSuperHighlighted: function (B) {
        this.unsetSuperHighlighted();
        for (var A in B) {
            if (B.hasOwnProperty(A)) {
                B[A].superHighlight()
            }
        }
        this.superHighlighted = B
    },
    unsetSuperHighlighted: function () {
        if (YAHOO.lang.isValue(this.superHighlighted)) {
            for (var A in this.superHighlighted) {
                if (this.superHighlighted.hasOwnProperty(A)) {
                    this.superHighlighted[A].highlight()
                }
            }
        }
        this.superHighlighted = null
    },
    addWire: function (B) {
        var A = WireIt.wireClassFromXtype(B.xtype);
        var E = B.src;
        var G = B.tgt;
        var F = this.containers[E.moduleId].getTerminal(E.terminal);
        var D = this.containers[G.moduleId].getTerminal(G.terminal);
        var C = new A(F, D, this.el, B);
        C.redraw();
        return C
    },
    addContainer: function (C) {
        var A = WireIt.containerClassFromXtype(C.xtype);
        var B = new A(C, this);
        return this.addContainerDirect(B)
    },
    addContainerDirect: function (A) {
        this.containers.push(A);
        A.eventAddWire.subscribe(this.onAddWire, this, true);
        A.eventRemoveWire.subscribe(this.onRemoveWire, this, true);
        if (A.ddResize) {
            A.ddResize.on("endDragEvent", function () {
                this.eventContainerResized.fire(A);
                this.eventChanged.fire(this)
            }, this, true)
        }
        if (A.dd) {
            A.dd.on("endDragEvent", function () {
                this.eventContainerDragged.fire(A);
                this.eventChanged.fire(this)
            }, this, true)
        }
        this.eventAddContainer.fire(A);
        this.eventChanged.fire(this);
        return A
    },
    removeContainer: function (A) {
        var B = WireIt.indexOf(A, this.containers);
        if (B != -1) {
            A.remove();
            this.containers[B] = null;
            this.containers = WireIt.compact(this.containers);
            this.eventRemoveContainer.fire(A);
            this.eventChanged.fire(this)
        }
    },
    removeGroup: function (F, C) {
        var A = this.groups.indexOf(F),
            B;
        if (A != -1) {
            this.groups.splice(A, 1)
        }
        if (C) {
            if (YAHOO.lang.isValue(F.groupContainer)) {
                this.removeContainer(F.groupContainer)
            } else {
                for (B in F.containers) {
                    if (F.containers.hasOwnProperty(B)) {
                        var E = F.containers[B].container;
                        this.removeContainer(E)
                    }
                }
                for (B in F.groups) {
                    if (F.containers.hasOwnProperty(B)) {
                        var D = F.groups[B].group;
                        this.removeGroup(D)
                    }
                }
            }
        }
    },
    onAddWire: function (B, A) {
        var C = A[0];
        if (WireIt.indexOf(C, this.wires) == -1) {
            this.wires.push(C);
            if (this.enableMouseEvents) {
                YAHOO.util.Event.addListener(C.element, "mousemove", this.onWireMouseMove, this, true);
                YAHOO.util.Event.addListener(C.element, "click", this.onWireClick, this, true)
            }
            this.eventAddWire.fire(C);
            this.eventChanged.fire(this)
        }
    },
    onRemoveWire: function (C, B) {
        var D = B[0];
        var A = WireIt.indexOf(D, this.wires);
        if (A != -1) {
            this.wires[A] = null;
            this.wires = WireIt.compact(this.wires);
            this.eventRemoveWire.fire(D);
            this.eventChanged.fire(this)
        }
    },
    clear: function () {
        while (this.containers.length > 0) {
            this.removeContainer(this.containers[0])
        }
    },
    removeAllContainers: function () {
        this.clear()
    },
    getWiring: function () {
        var B;
        var C = {
            containers: [],
            wires: []
        };
        for (B = 0; B < this.containers.length; B++) {
            C.containers.push(this.containers[B].getConfig())
        }
        for (B = 0; B < this.wires.length; B++) {
            var D = this.wires[B];
            var A = D.getConfig();
            A.src = {
                moduleId: WireIt.indexOf(D.terminal1.container, this.containers),
                terminal: D.terminal1.name
            };
            A.tgt = {
                moduleId: WireIt.indexOf(D.terminal2.container, this.containers),
                terminal: D.terminal2.name
            };
            C.wires.push(A)
        }
        return C
    },
    setWiring: function (B) {
        this.clear();
        var A;
        if (YAHOO.lang.isArray(B.containers)) {
            for (A = 0; A < B.containers.length; A++) {
                this.addContainer(B.containers[A])
            }
        }
        if (YAHOO.lang.isArray(B.wires)) {
            for (A = 0; A < B.wires.length; A++) {
                this.addWire(B.wires[A])
            }
        }
    },
    _getMouseEvtPos: function (B) {
        var C = YAHOO.util.Event.getTarget(B);
        var A = [C.offsetLeft, C.offsetTop];
        return [A[0] + B.layerX, A[1] + B.layerY]
    },
    onWireClick: function (J) {
        var D = this._getMouseEvtPos(J);
        var H = D[0],
            F = D[1],
            G = this.wires.length,
            K;
        for (var I = 0; I < G; I++) {
            K = this.wires[I];
            var E = K.element.offsetLeft,
                C = K.element.offsetTop;
            if (H >= E && H < E + K.element.width && F >= C && F < C + K.element.height) {
                var B = H - E,
                    A = F - C;
                K.onClick(B, A)
            }
        }
    },
    onWireMouseMove: function (J) {
        var D = this._getMouseEvtPos(J);
        var H = D[0],
            F = D[1],
            G = this.wires.length,
            K;
        for (var I = 0; I < G; I++) {
            K = this.wires[I];
            var E = K.element.offsetLeft,
                C = K.element.offsetTop;
            if (H >= E && H < E + K.element.width && F >= C && F < C + K.element.height) {
                var B = H - E,
                    A = F - C;
                K.onMouseMove(B, A)
            }
        }
    }
};
(function () {
    var B = YAHOO.util.Dom,
        A = YAHOO.util.Event;
    WireIt.LayerMap = function (D, C) {
        this.layer = D;
        this.setOptions(C);
        if (typeof C.parentEl == "string") {
            this.parentEl = YAHOO.util.Dom.get(C.parentEl)
        } else {
            if (this.layer && !this.parentEl) {
                this.parentEl = this.layer.el
            }
        }
        WireIt.LayerMap.superclass.constructor.call(this, this.parentEl);
        this.element.className = this.className;
        this.initEvents();
        this.draw()
    };
    YAHOO.lang.extend(WireIt.LayerMap, WireIt.CanvasElement, {
        className: "WireIt-LayerMap",
        style: "rgba(0, 0, 200, 0.5)",
        parentEl: null,
        lineWidth: 2,
        setOptions: function (D) {
            for (var C in D) {
                if (D.hasOwnProperty(C)) {
                    this[C] = D[C]
                }
            }
        },
        initEvents: function () {
            var C = this.layer;
            A.addListener(this.element, "mousedown", this.onMouseDown, this, true);
            A.addListener(this.element, "mouseup", this.onMouseUp, this, true);
            A.addListener(this.element, "mousemove", this.onMouseMove, this, true);
            A.addListener(this.element, "mouseout", this.onMouseUp, this, true);
            C.eventAddWire.subscribe(this.draw, this, true);
            C.eventRemoveWire.subscribe(this.draw, this, true);
            C.eventAddContainer.subscribe(this.draw, this, true);
            C.eventRemoveContainer.subscribe(this.draw, this, true);
            C.eventContainerDragged.subscribe(this.draw, this, true);
            C.eventContainerResized.subscribe(this.draw, this, true);
            A.addListener(this.layer.el, "scroll", this.onLayerScroll, this, true)
        },
        onMouseMove: function (D, C) {
            A.stopEvent(D);
            if (this.isMouseDown) {
                this.scrollLayer(D.clientX, D.clientY)
            }
        },
        onMouseUp: function (D, C) {
            A.stopEvent(D);
            this.isMouseDown = false
        },
        onMouseDown: function (D, C) {
            A.stopEvent(D);
            this.scrollLayer(D.clientX, D.clientY);
            this.isMouseDown = true
        },
        scrollLayer: function (E, D) {
            var P = B.getXY(this.element);
            var R = [E - P[0], D - P[1]];
            var H = B.getRegion(this.element);
            var G = H.right - H.left - 4;
            var K = H.bottom - H.top - 4;
            var F = this.layer.el.scrollWidth;
            var N = this.layer.el.scrollHeight;
            var I = Math.floor(100 * G / F) / 100;
            var O = Math.floor(100 * K / N) / 100;
            var C = [R[0] / I, R[1] / O];
            var Q = B.getRegion(this.layer.el);
            var M = Q.right - Q.left;
            var J = Q.bottom - Q.top;
            var L = [Math.max(Math.floor(C[0] - M / 2), 0), Math.max(Math.floor(C[1] - J / 2), 0)];
            if (L[0] + M > F) {
                L[0] = F - M
            }
            if (L[1] + J > N) {
                L[1] = N - J
            }
            this.layer.el.scrollLeft = L[0];
            this.layer.el.scrollTop = L[1]
        },
        onLayerScroll: function () {
            if (this.scrollTimer) {
                window.clearTimeout(this.scrollTimer)
            }
            var C = this;
            this.scrollTimer = window.setTimeout(function () {
                C.draw()
            }, 50)
        },
        draw: function () {
            var N = this.getContext();
            var E = B.getRegion(this.element);
            var D = E.right - E.left - 4;
            var J = E.bottom - E.top - 4;
            N.clearRect(0, 0, D, J);
            var C = this.layer.el.scrollWidth;
            var L = this.layer.el.scrollHeight;
            var F = Math.floor(100 * D / C) / 100;
            var M = Math.floor(100 * J / L) / 100;
            var O = B.getRegion(this.layer.el);
            var K = O.right - O.left;
            var I = O.bottom - O.top;
            var H = this.layer.el.scrollLeft;
            var G = this.layer.el.scrollTop;
            N.strokeStyle = "rgb(200, 50, 50)";
            N.lineWidth = 1;
            N.strokeRect(H * F, G * M, K * F, I * M);
            N.fillStyle = this.style;
            N.strokeStyle = this.style;
            N.lineWidth = this.lineWidth;
            this.drawContainers(N, F, M);
            this.drawWires(N, F, M)
        },
        drawContainers: function (C, I, F) {
            var H = this.layer.containers;
            var J = H.length,
                E, D = WireIt.getIntStyle,
                G;
            for (E = 0; E < J; E++) {
                G = H[E].el;
                C.fillRect(D(G, "left") * I, D(G, "top") * F, D(G, "width") * I, D(G, "height") * F)
            }
        },
        drawWires: function (G, D, F) {
            var K = this.layer.wires;
            var C = K.length,
                E, I;
            for (E = 0; E < C; E++) {
                I = K[E];
                var J = I.terminal1.getXY(),
                    H = I.terminal2.getXY();
                G.beginPath();
                G.moveTo(J[0] * D, J[1] * F);
                G.lineTo(H[0] * D, H[1] * F);
                G.closePath();
                G.stroke()
            }
        }
    })
})();
WireIt.ImageContainer = function (A, B) {
    WireIt.ImageContainer.superclass.constructor.call(this, A, B)
};
YAHOO.lang.extend(WireIt.ImageContainer, WireIt.Container, {
    xtype: "WireIt.ImageContainer",
    resizable: false,
    ddHandle: false,
    className: "WireIt-Container WireIt-ImageContainer",
    image: null,
    render: function () {
        WireIt.ImageContainer.superclass.render.call(this);
        YAHOO.util.Dom.setStyle(this.bodyEl, "background-image", "url(" + this.image + ")")
    }
});
WireIt.InOutContainer = function (A, B) {
    WireIt.InOutContainer.superclass.constructor.call(this, A, B)
};
YAHOO.lang.extend(WireIt.InOutContainer, WireIt.Container, {
    xtype: "WireIt.InOutContainer",
    resizable: false,
    className: "WireIt-Container WireIt-InOutContainer",
    inputs: [],
    outputs: [],
    render: function () {
        WireIt.InOutContainer.superclass.render.call(this);
        for (var C = 0; C < this.inputs.length; C++) {
            var B = this.inputs[C];
            this.terminals.push({
                name: B,
                direction: [-1, 0],
                offsetPosition: {
                    left: -14,
                    top: 3 + 30 * (C + 1)
                },
                ddConfig: {
                    type: "input",
                    allowedTypes: ["output"]
                }
            });
            this.bodyEl.appendChild(WireIt.cn("div", null, {
                lineHeight: "30px"
            }, B))
        }
        for (C = 0; C < this.outputs.length; C++) {
            var A = this.outputs[C];
            this.terminals.push({
                name: A,
                direction: [1, 0],
                offsetPosition: {
                    right: -14,
                    top: 3 + 30 * (C + 1 + this.inputs.length)
                },
                ddConfig: {
                    type: "output",
                    allowedTypes: ["input"]
                },
                alwaysSrc: true
            });
            this.bodyEl.appendChild(WireIt.cn("div", null, {
                lineHeight: "30px",
                textAlign: "right"
            }, A))
        }
    }
});
(function () {
    var A = YAHOO.lang;
    inputEx = function (B, D) {
        var C = null,
            E;
        if (B.type) {
            C = inputEx.getFieldClass(B.type);
            if (C === null) {
                C = inputEx.StringField
            }
        } else {
            C = B.fieldClass ? B.fieldClass : inputEx.StringField
        }
        if (A.isObject(B.inputParams)) {
            E = new C(B.inputParams)
        } else {
            E = new C(B)
        }
        if (D) {
            E.setParentField(D)
        }
        return E
    };
    A.augmentObject(inputEx, {
        VERSION: "0.5.0",
        spacerUrl: "images/space.gif",
        stateEmpty: "empty",
        stateRequired: "required",
        stateValid: "valid",
        stateInvalid: "invalid",
        messages: {
            required: "This field is required",
            invalid: "This field is invalid",
            valid: "This field is valid",
            defaultDateFormat: "m/d/Y",
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            timeUnits: {
                SECOND: "seconds",
                MINUTE: "minutes",
                HOUR: "hours",
                DAY: "days",
                MONTH: "months",
                YEAR: "years"
            }
        },
        widget: {},
        mixin: {},
        regexps: {
            email: /^[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+(?:\.[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,6}$/i,
            url: /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\:[0-9]{1,5})?(([0-9]{1,5})?\/.*)?$/i,
            password: /^[0-9a-zA-Z\x20-\x7E]*$/
        },
        typeClasses: {},
        browserAutocomplete: true,
        registerType: function (C, E, B, F) {
            if (!A.isString(C)) {
                throw new Error("inputEx.registerType: first argument must be a string")
            }
            if (!A.isFunction(E)) {
                throw new Error("inputEx.registerType: second argument must be a function")
            }
            this.typeClasses[C] = E;
            var D = [];
            if (A.isArray(B)) {
                D = B
            }
            if (E.superclass && !F && A.isArray(E.superclass.constructor.groupOptions)) {
                D = D.concat(E.superclass.constructor.groupOptions)
            }
            E.groupOptions = D
        },
        getFieldClass: function (B) {
            return A.isFunction(this.typeClasses[B]) ? this.typeClasses[B] : null
        },
        getType: function (B) {
            for (var C in this.typeClasses) {
                if (this.typeClasses.hasOwnProperty(C)) {
                    if (this.typeClasses[C] == B) {
                        return C
                    }
                }
            }
            return null
        },
        buildField: function (B) {
            return inputEx(B)
        },
        sn: function (E, D, B) {
            if (!E) {
                return
            }
            var C;
            if (D) {
                for (C in D) {
                    var G = D[C];
                    if (A.isFunction(G)) {
                        continue
                    }
                    if (C == "className") {
                        C = "class";
                        E.className = G
                    }
                    if (G !== E.getAttribute(C)) {
                        try {
                            if (G === false) {
                                E.removeAttribute(C)
                            } else {
                                E.setAttribute(C, G)
                            }
                        } catch (F) {}
                    }
                }
            }
            if (B) {
                for (C in B) {
                    if (A.isFunction(B[C])) {
                        continue
                    }
                    if (E.style[C] != B[C]) {
                        E.style[C] = B[C]
                    }
                }
            }
        },
        cn: function (B, F, C, H) {
            if (B == "input" && YAHOO.env.ua.ie) {
                var E = "<" + B;
                if (F !== "undefined") {
                    for (var D in F) {
                        E += " " + (D === "className" ? "class" : D) + '="' + F[D] + '"'
                    }
                }
                E += "/>";
                return document.createElement(E)
            } else {
                var G = document.createElement(B);
                this.sn(G, F, C);
                if (H) {
                    G.innerHTML = H
                }
                return G
            }
        },
        indexOf: function (F, B, E) {
            var C = B.length,
                D;
            if (!A.isFunction(E)) {
                E = function (G, H) {
                    return G === H
                }
            }
            for (D = 0; D < C; D++) {
                if (E.call({}, F, B[D])) {
                    return D
                }
            }
            return -1
        },
        compactArray: function (B) {
            var E = [],
                C = B.length,
                D;
            for (D = 0; D < C; D++) {
                if (!A.isNull(B[D]) && !A.isUndefined(B[D])) {
                    E.push(B[D])
                }
            }
            return E
        },
        removeAccents: function (B) {
            return B.replace(/[������]/g, "a").replace(/[����]/g, "e").replace(/[����]/g, "i").replace(/[�����]/g, "o").replace(/[����]/g, "u").replace(/[��]/g, "y").replace(/[�]/g, "n").replace(/[�]/g, "c").replace(/[�]/g, "oe").replace(/[�]/g, "ae")
        }
    })
})();
YAHOO.inputEx = inputEx;
(function () {
    var B = YAHOO.util.Dom,
        C = YAHOO.lang,
        A = YAHOO.util;
    inputEx.Field = function (D) {
        this.setOptions(D || {});
        this.render();
        this.updatedEvt = new A.CustomEvent("updated", this);
        this.initEvents();
        if (!C.isUndefined(this.options.value)) {
            this.setValue(this.options.value, false)
        }
        if (D.parentEl) {
            if (C.isString(D.parentEl)) {
                B.get(D.parentEl).appendChild(this.getEl())
            } else {
                D.parentEl.appendChild(this.getEl())
            }
        }
    };
    inputEx.Field.prototype = {
        setOptions: function (D) {
            this.options = {};
            this.options.name = D.name;
            this.options.value = D.value;
            this.options.id = D.id || B.generateId();
            this.options.label = D.label;
            this.options.description = D.description;
            this.options.messages = {};
            this.options.messages.required = (D.messages && D.messages.required) ? D.messages.required : inputEx.messages.required;
            this.options.messages.invalid = (D.messages && D.messages.invalid) ? D.messages.invalid : inputEx.messages.invalid;
            this.options.className = D.className ? D.className : "inputEx-Field";
            this.options.required = C.isUndefined(D.required) ? false : D.required;
            this.options.showMsg = C.isUndefined(D.showMsg) ? false : D.showMsg
        },
        render: function () {
            this.divEl = inputEx.cn("div", {
                className: "inputEx-fieldWrapper"
            });
            if (this.options.id) {
                this.divEl.id = this.options.id
            }
            if (this.options.required) {
                B.addClass(this.divEl, "inputEx-required")
            }
            if (this.options.label) {
                this.labelDiv = inputEx.cn("div", {
                    id: this.divEl.id + "-label",
                    className: "inputEx-label",
                    "for": this.divEl.id + "-field"
                });
                this.labelEl = inputEx.cn("label");
                this.labelEl.appendChild(document.createTextNode(this.options.label));
                this.labelDiv.appendChild(this.labelEl);
                this.divEl.appendChild(this.labelDiv)
            }
            this.fieldContainer = inputEx.cn("div", {
                className: this.options.className
            });
            this.renderComponent();
            if (this.options.description) {
                this.fieldContainer.appendChild(inputEx.cn("div", {
                    id: this.divEl.id + "-desc",
                    className: "inputEx-description"
                }, null, this.options.description))
            }
            this.divEl.appendChild(this.fieldContainer);
            this.divEl.appendChild(inputEx.cn("div", null, {
                clear: "both"
            }, " "))
        },
        fireUpdatedEvt: function () {
            var D = this;
            setTimeout(function () {
                D.updatedEvt.fire(D.getValue(), D)
            }, 50)
        },
        renderComponent: function () {},
        getEl: function () {
            return this.divEl
        },
        initEvents: function () {},
        getValue: function () {},
        setValue: function (E, D) {
            this.setClassFromState();
            if (D !== false) {
                this.fireUpdatedEvt()
            }
        },
        setClassFromState: function () {
            var D;
            if (this.previousState) {
                D = "inputEx-" + ((this.previousState == inputEx.stateRequired) ? inputEx.stateInvalid : this.previousState);
                B.removeClass(this.divEl, D)
            }
            var E = this.getState();
            if (!(E == inputEx.stateEmpty && B.hasClass(this.divEl, "inputEx-focused"))) {
                D = "inputEx-" + ((E == inputEx.stateRequired) ? inputEx.stateInvalid : E);
                B.addClass(this.divEl, D)
            }
            if (this.options.showMsg) {
                this.displayMessage(this.getStateString(E))
            }
            this.previousState = E
        },
        getStateString: function (D) {
            if (D == inputEx.stateRequired) {
                return this.options.messages.required
            } else {
                if (D == inputEx.stateInvalid) {
                    return this.options.messages.invalid
                } else {
                    return ""
                }
            }
        },
        getState: function () {
            if (this.isEmpty()) {
                return this.options.required ? inputEx.stateRequired : inputEx.stateEmpty
            }
            return this.validate() ? inputEx.stateValid : inputEx.stateInvalid
        },
        validate: function () {
            return true
        },
        onFocus: function (E) {
            var D = this.getEl();
            B.removeClass(D, "inputEx-empty");
            B.addClass(D, "inputEx-focused")
        },
        onBlur: function (D) {
            B.removeClass(this.getEl(), "inputEx-focused");
            this.setClassFromState()
        },
        onChange: function (D) {
            this.fireUpdatedEvt()
        },
        close: function () {},
        disable: function () {},
        enable: function () {},
        focus: function () {},
        destroy: function () {
            var D = this.getEl();
            this.updatedEvt.unsubscribeAll();
            A.Event.purgeElement(D, true);
            if (B.inDocument(D)) {
                D.parentNode.removeChild(D)
            }
        },
        displayMessage: function (F) {
            if (!this.fieldContainer) {
                return
            }
            if (!this.msgEl) {
                this.msgEl = inputEx.cn("div", {
                    className: "inputEx-message"
                });
                try {
                    var D = this.divEl.getElementsByTagName("div");
                    this.divEl.insertBefore(this.msgEl, D[(D.length - 1 >= 0) ? D.length - 1 : 0])
                } catch (E) {
                   // alert(E)
                }
            }
            this.msgEl.innerHTML = F
        },
        show: function () {
            this.divEl.style.display = ""
        },
        hide: function () {
            this.divEl.style.display = "none"
        },
        clear: function (D) {
            this.setValue(C.isUndefined(this.options.value) ? "" : this.options.value, D)
        },
        isEmpty: function () {
            return this.getValue() === ""
        },
        setParentField: function (D) {
            this.parentField = D
        },
        getParentField: function () {
            return this.parentField
        }
    };
    inputEx.Field.groupOptions = [{
        type: "string",
        label: "Label",
        name: "label",
        value: ""
    }, {
        type: "string",
        label: "Name",
        name: "name",
        value: ""
    }, {
        type: "string",
        label: "Description",
        name: "description",
        value: ""
    }, {
        type: "boolean",
        label: "Required?",
        name: "required",
        value: false
    }, {
        type: "boolean",
        label: "Show messages",
        name: "showMsg",
        value: false
    }]
})();
(function () {
    var A = YAHOO.lang;
    inputEx.BaseField = inputEx.Field;
    inputEx.Field = function (B) {
        inputEx.Field.superclass.constructor.call(this, B)
    };
    A.extend(inputEx.Field, inputEx.BaseField, {
        setOptions: function (B) {
            inputEx.Field.superclass.setOptions.call(this, B);
            this.options.wirable = A.isUndefined(B.wirable) ? false : B.wirable;
            this.options.container = B.container;
            B.container = null
        },
        render: function () {
            inputEx.Field.superclass.render.call(this);
            if (this.options.wirable) {
                this.renderTerminal()
            }
        },
        renderTerminal: function () {
            var B = inputEx.cn("div", {
                className: "WireIt-InputExTerminal"
            });
            this.divEl.insertBefore(B, this.fieldContainer);
            this.terminal = new WireIt.Terminal(B, {
                name: this.options.name,
                direction: [-1, 0],
                fakeDirection: [0, 1],
                ddConfig: {							
                    type: "input",
                    allowedTypes: ["output"]
                },
                nMaxWires: 1
            }, this.options.container);
            if (this.options.container) {
                this.options.container.terminals.push(this.terminal)
            }
            this.terminal.eventAddWire.subscribe(this.onAddWire, this, true);
            this.terminal.eventRemoveWire.subscribe(this.onRemoveWire, this, true)
        },
        onAddWire: function (B, C) {
            this.options.container.onAddWire(B, C);
            this.disable();
            this.el.value = "[wired]"
        },
        onRemoveWire: function (B, C) {
            this.options.container.onRemoveWire(B, C);
            this.enable();
            this.el.value = ""
        }
    });
    inputEx.Field.groupOptions = inputEx.BaseField.groupOptions.concat([{
        type: "boolean",
        label: "Wirable",
        name: "wirable",
        value: false
    }])
})();
WireIt.FormContainer = function (A, B) {
    WireIt.FormContainer.superclass.constructor.call(this, A, B)
};
YAHOO.lang.extend(WireIt.FormContainer, WireIt.Container, {
    xtype: "WireIt.FormContainer",
    fields: [],
    legend: null,
    collapsible: false,
    render: function () {
        WireIt.FormContainer.superclass.render.call(this);
        this.renderForm()
    },
    renderForm: function () {
        this.setBackReferenceOnFieldOptionsRecursively(this.fields);
        var A = {
            parentEl: this.bodyEl,
            fields: this.fields,
            legend: this.legend,
            collapsible: this.collapsible
        };
        this.form = new inputEx.Group(A);
        if (this.form.legend) {
            YAHOO.util.Event.addListener(this.form.legend, "click", function () {
                var C = this;
                for (var B = 0; B < this.form.inputs.length; B++) {
                    var D = this.form.inputs[B];
                    if (D.terminal) {
                        D.terminal.getXY = function () {
                            if (YAHOO.util.Dom.hasClass(C.form.fieldset, "inputEx-Collapsed")) {
                                return C.getXY()
                            } else {
                                return WireIt.Terminal.prototype.getXY.call(this)
                            }
                        }
                    }
                }
                this.redrawAllWires()
            }, this, true)
        }
    },
    setBackReferenceOnFieldOptionsRecursively: function (D, A) {
        if (YAHOO.lang.isUndefined(A)) {
            A = this
        }
        for (var C = 0; C < D.length; C++) {
            var B = D[C];
            B.container = A;
            if (B.fields && typeof B.fields == "object") {
                this.setBackReferenceOnFieldOptionsRecursively(B.fields)
            }
            if (B.elementType) {
                B.elementType.container = A;
                if (B.elementType.fields && typeof B.elementType.fields == "object") {
                    this.setBackReferenceOnFieldOptionsRecursively(B.elementType.fields)
                }
            }
        }
    },
    getValue: function () {
        return this.form.getValue()
    },
    setValue: function (A) {
        this.form.setValue(A)
    }
});
(function () {
    var C = YAHOO.lang,
        B = YAHOO.util.Dom,
        A = YAHOO.util.Event;
    inputEx.Group = function (D) {
        inputEx.Group.superclass.constructor.call(this, D);
        if (!this.options.value) {
            this.runFieldsInteractions()
        }
    };
    C.extend(inputEx.Group, inputEx.Field, {
        setOptions: function (D) {
            inputEx.Group.superclass.setOptions.call(this, D);
            this.options.className = D.className || "inputEx-Group";
            this.options.fields = D.fields;
            this.options.flatten = D.flatten;
            this.options.legend = D.legend || "";
            this.options.collapsible = C.isUndefined(D.collapsible) ? false : D.collapsible;
            this.options.collapsed = C.isUndefined(D.collapsed) ? false : D.collapsed;
            this.options.disabled = C.isUndefined(D.disabled) ? false : D.disabled;
            this.inputs = [];
            this.inputsNames = {}
        },
        render: function () {
            this.divEl = inputEx.cn("div", {
                className: this.options.className
            });
            if (this.options.id) {
                this.divEl.id = this.options.id
            }
            this.renderFields(this.divEl);
            if (this.options.disabled) {
                this.disable()
            }
        },
        renderFields: function (F) {
            this.fieldset = inputEx.cn("fieldset");
            this.legend = inputEx.cn("legend", {
                className: "inputEx-Group-legend"
            });
            if (this.options.collapsible) {
                var H = inputEx.cn("div", {
                    className: "inputEx-Group-collapseImg"
                }, null, " ");
                this.legend.appendChild(H);
                inputEx.sn(this.fieldset, {
                    className: "inputEx-Expanded"
                })
            }
            if (!C.isUndefined(this.options.legend) && this.options.legend !== "") {
                this.legend.appendChild(inputEx.cn("span", null, null, " " + this.options.legend))
            }
            if (this.options.collapsible || (!C.isUndefined(this.options.legend) && this.options.legend !== "")) {
                this.fieldset.appendChild(this.legend)
            }
            for (var E = 0; E < this.options.fields.length; E++) {
                var D = this.options.fields[E];
                if (!D) {
                    throw new Error("inputEx.Form: One of the provided fields is undefined ! (check trailing comma)")
                }
                var G = this.renderField(D);
                this.fieldset.appendChild(G.getEl())
            }
            if (this.options.collapsed) {
                this.toggleCollapse()
            }
            F.appendChild(this.fieldset)
        },
        renderField: function (E) {
            var D = inputEx(E, this);
            this.inputs.push(D);
            if (D.options.name) {
                this.inputsNames[D.options.name] = D
            }
            if (!this.hasInteractions && E.interactions) {
                this.hasInteractions = true
            }
            D.updatedEvt.subscribe(this.onChange, this, true);
            return D
        },
        initEvents: function () {
            if (this.options.collapsible) {
                A.addListener(this.legend, "click", this.toggleCollapse, this, true)
            }
        },
        toggleCollapse: function () {
            if (B.hasClass(this.fieldset, "inputEx-Expanded")) {
                B.replaceClass(this.fieldset, "inputEx-Expanded", "inputEx-Collapsed")
            } else {
                B.replaceClass(this.fieldset, "inputEx-Collapsed", "inputEx-Expanded")
            }
        },
        validate: function () {
            var E = true;
            for (var F = 0; F < this.inputs.length; F++) {
                var D = this.inputs[F];
                D.setClassFromState();
                var G = D.getState();
                if (G == inputEx.stateRequired || G == inputEx.stateInvalid) {
                    E = false
                }
            }
            return E
        },
        getFieldsStates: function () {
            var D, E, I, H, G = {
                fields: {},
                validate: true
            };
            for (var F = 0; F < this.inputs.length; F++) {
                D = this.inputs[F];
                E = D.options.name;
                I = D.getState();
                H = D.getStateString(I);
                G.fields[E] = {};
                G.fields[E].valid = true;
                G.fields[E].message = H;
                if (I == inputEx.stateRequired || I == inputEx.stateInvalid) {
                    G.fields[E].valid = false;
                    G.validate = false
                }
            }
            return G
        },
        enable: function () {
            for (var D = 0; D < this.inputs.length; D++) {
                this.inputs[D].enable()
            }
        },
        disable: function () {
            for (var D = 0; D < this.inputs.length; D++) {
                this.inputs[D].disable()
            }
        },
        setValue: function (G, E) {
            if (!G) {
                return
            }
            for (var F = 0; F < this.inputs.length; F++) {
                var H = this.inputs[F];
                var D = H.options.name;
                if (D && !C.isUndefined(G[D])) {
                    H.setValue(G[D], false)
                } else {
                    H.clear(false)
                }
            }
            this.runFieldsInteractions();
            if (E !== false) {
                this.fireUpdatedEvt()
            }
        },
        getValue: function () {
            var F = {};
            for (var E = 0; E < this.inputs.length; E++) {
                var D = this.inputs[E].getValue();
                if (this.inputs[E].options.name) {
                    if (this.inputs[E].options.flatten && C.isObject(D)) {
                        C.augmentObject(F, D)
                    } else {
                        F[this.inputs[E].options.name] = D
                    }
                }
            }
            return F
        },
        close: function () {
            for (var D = 0; D < this.inputs.length; D++) {
                this.inputs[D].close()
            }
        },
        focus: function () {
            if (this.inputs.length > 0) {
                this.inputs[0].focus()
            }
        },
        getFieldByName: function (D) {
            if (!this.inputsNames.hasOwnProperty(D)) {
                return null
            }
            return this.inputsNames[D]
        },
        onChange: function (E, F) {
            var G = F[0];
            var D = F[1];
            this.runInteractions(D, G);
            this.fireUpdatedEvt()
        },
        runAction: function (D, F) {
            var E = this.getFieldByName(D.name);
            if (YAHOO.lang.isFunction(E[D.action])) {
                E[D.action].call(E)
            } else {
                if (YAHOO.lang.isFunction(D.action)) {
                    D.action.call(E, F)
                } else {
                    throw new Error("action " + D.action + " is not a valid action for field " + D.name)
                }
            }
        },
        runInteractions: function (E, J) {
            var G = inputEx.indexOf(E, this.inputs);
            var I = this.options.fields[G];
            if (YAHOO.lang.isUndefined(I.interactions)) {
                return
            }
            var K = I.interactions;
            for (var H = 0; H < K.length; H++) {
                var D = K[H];
                if (D.valueTrigger === J) {
                    for (var F = 0; F < D.actions.length; F++) {
                        this.runAction(D.actions[F], J)
                    }
                }
            }
        },
        runFieldsInteractions: function () {
            if (this.hasInteractions) {
                for (var D = 0; D < this.inputs.length; D++) {
                    this.runInteractions(this.inputs[D], this.inputs[D].getValue())
                }
            }
        },
        clear: function (D) {
            for (var E = 0; E < this.inputs.length; E++) {
                this.inputs[E].clear(false)
            }
            if (D !== false) {
                this.fireUpdatedEvt()
            }
        },
        setErrors: function (F) {
            var E, D;
            if (YAHOO.lang.isArray(F)) {
                for (E = 0; E < F.length; E++) {
                    D = F[E][0];
                    value = F[E][1];
                    if (this.inputsNames[D]) {
                        if (this.inputsNames[D].options.showMsg) {
                            this.inputsNames[D].displayMessage(value);
                            B.replaceClass(this.inputsNames[D].divEl, "inputEx-valid", "inputEx-invalid")
                        }
                    }
                }
            } else {
                if (YAHOO.lang.isObject(F)) {
                    for (D in F) {
                        if (F.hasOwnProperty(D)) {
                            if (this.inputsNames[D]) {
                                if (this.inputsNames[D].options.showMsg) {
                                    this.inputsNames[D].displayMessage(F[D]);
                                    B.replaceClass(this.inputsNames[D].divEl, "inputEx-valid", "inputEx-invalid")
                                }
                            }
                        }
                    }
                }
            }
        },
        destroy: function () {
            var D, E, F;
            for (D = 0, E = this.inputs.length; D < E; D++) {
                F = this.inputs[D];
                F.destroy()
            }
            inputEx.Group.superclass.destroy.call(this)
        }
    });
    inputEx.registerType("group", inputEx.Group, [{
        type: "string",
        label: "Name",
        name: "name",
        value: ""
    }, {
        type: "string",
        label: "Legend",
        name: "legend"
    }, {
        type: "boolean",
        label: "Collapsible",
        name: "collapsible",
        value: false
    }, {
        type: "boolean",
        label: "Collapsed",
        name: "collapsed",
        value: false
    }, {
        type: "list",
        label: "Fields",
        name: "fields",
        elementType: {
            type: "type"
        }
    }], true)
})();
(function () {
    var A = YAHOO.lang;
    inputEx.visus = {
        trimpath: function (D, E) {
            if (!TrimPath) {
                alert("TrimPath is not on the page. Please load inputex/lib/trimpath-template.js");
                return null
            }
            var C = TrimPath.parseTemplate(D.template);
            var B = C.process(E);
            return B
        },
        func: function (B, C) {
            return B.func(C)
        },
        dump: function (B, C) {
            return A.dump(C)
        }
    };
    inputEx.renderVisu = function (H, D, E) {
        var B = H || {};
        var I = B.visuType || "dump";
        if (!inputEx.visus.hasOwnProperty(I)) {
            throw new Error("inputEx: no visu for visuType: " + I)
        }
        var F = inputEx.visus[I];
        if (!A.isFunction(F)) {
            throw new Error("inputEx: no visu for visuType: " + I)
        }
        var J = null;
        try {
            J = F(B, D)
        } catch (G) {
            throw new Error("inputEx: error while running visu " + I + " : " + G.message)
        }
        var C = null;
        if (E) {
            if (A.isString(E)) {
                C = YAHOO.util.Dom.get(E)
            } else {
                C = E
            }
        }
        if (C) {
            if (YAHOO.lang.isObject(J) && J.tagName) {
                C.innerHTML = "";
                C.appendChild(J)
            } else {
                C.innerHTML = J
            }
        }
        return J
    }
})();
(function () {
    var B = YAHOO.util,
        D = YAHOO.lang,
        A = B.Event,
        C = B.Dom;
    inputEx.widget.Button = function (E) {
        this.setOptions(E || {});
        if ( !! this.options.parentEl) {
            this.render(this.options.parentEl)
        }
    };
    D.augmentObject(inputEx.widget.Button.prototype, {
        setOptions: function (E) {
            this.options = {};
            this.options.id = D.isString(E.id) ? E.id : C.generateId();
            this.options.className = E.className || "inputEx-Button";
            this.options.parentEl = D.isString(E.parentEl) ? C.get(E.parentEl) : E.parentEl;
            this.options.type = (E.type === "link" || E.type === "submit-link") ? E.type : "submit";
            this.options.value = E.value;
            this.options.disabled = !! E.disabled;
            if (D.isFunction(E.onClick)) {
                this.options.onClick = {
                    fn: E.onClick,
                    scope: this
                }
            } else {
                if (D.isObject(E.onClick)) {
                    this.options.onClick = {
                        fn: E.onClick.fn,
                        scope: E.onClick.scope || this
                    }
                }
            }
        },
        render: function (F) {
            var E;
            if (this.options.type === "link" || this.options.type === "submit-link") {
                this.el = inputEx.cn("a", {
                    className: this.options.className,
                    id: this.options.id,
                    href: "#"
                });
                C.addClass(this.el, this.options.type === "link" ? "inputEx-Button-Link" : "inputEx-Button-Submit-Link");
                E = inputEx.cn("span", null, null, this.options.value);
                this.el.appendChild(E)
            } else {
                this.el = inputEx.cn("input", {
                    type: "submit",
                    value: this.options.value,
                    className: this.options.className,
                    id: this.options.id
                });
                C.addClass(this.el, "inputEx-Button-Submit")
            }
            F.appendChild(this.el);
            if (this.options.disabled) {
                this.disable()
            }
            this.initEvents();
            return this.el
        },
        initEvents: function () {
            this.clickEvent = new B.CustomEvent("click");
            this.submitEvent = new B.CustomEvent("submit");
            A.addListener(this.el, "click", function (F) {
                var E;
                A.stopEvent(F);
                if (this.disabled) {
                    E = false
                } else {
                    E = this.clickEvent.fire()
                }
                if (this.options.type === "link") {
                    E = false
                }
                if (E) {
                    this.submitEvent.fire()
                }
            }, this, true);
            if (this.options.onClick) {
                this.clickEvent.subscribe(this.options.onClick.fn, this.options.onClick.scope, true)
            }
        },
        disable: function () {
            this.disabled = true;
            C.addClass(this.el, "inputEx-Button-disabled");
            if (this.options.type === "submit") {
                this.el.disabled = true
            }
        },
        enable: function () {
            this.disabled = false;
            C.removeClass(this.el, "inputEx-Button-disabled");
            if (this.options.type === "submit") {
                this.el.disabled = false
            }
        },
        destroy: function () {
            this.clickEvent.unsubscribeAll();
            this.submitEvent.unsubscribeAll();
            B.Event.purgeElement(this.el, true);
            if (C.inDocument(this.el)) {
                this.el.parentNode.removeChild(this.el)
            }
        }
    })
})();
(function () {
    var C = YAHOO.lang,
        A = YAHOO.util.Event,
        B = YAHOO.util.Dom;
    inputEx.StringField = function (D) {
        inputEx.StringField.superclass.constructor.call(this, D);
        if (this.options.typeInvite) {
            this.updateTypeInvite()
        }
    };
    C.extend(inputEx.StringField, inputEx.Field, {
        setOptions: function (D) {
            inputEx.StringField.superclass.setOptions.call(this, D);
            this.options.regexp = D.regexp;
            this.options.size = D.size;
            this.options.maxLength = D.maxLength;
            this.options.minLength = D.minLength;
            this.options.typeInvite = D.typeInvite;
            this.options.readonly = D.readonly;
            this.options.autocomplete = C.isUndefined(D.autocomplete) ? inputEx.browserAutocomplete : (D.autocomplete === false || D.autocomplete === "off") ? false : true;
            this.options.trim = (D.trim === true) ? true : false
        },
        renderComponent: function () {
            this.wrapEl = inputEx.cn("div", {
                className: "inputEx-StringField-wrapper"
            });
            var D = {};
            D.type = "text";
            D.id = this.divEl.id ? this.divEl.id + "-field" : YAHOO.util.Dom.generateId();
            if (this.options.size) {
                D.size = this.options.size
            }
            if (this.options.name) {
                D.name = this.options.name
            }
            if (this.options.readonly) {
                D.readonly = "readonly"
            }
            if (this.options.maxLength) {
                D.maxLength = this.options.maxLength
            }
            D.autocomplete = this.options.autocomplete ? "on" : "off";
            this.el = inputEx.cn("input", D);
            this.wrapEl.appendChild(this.el);
            this.fieldContainer.appendChild(this.wrapEl)
        },
        initEvents: function () {
            A.addListener(this.el, "change", this.onChange, this, true);
            if (YAHOO.env.ua.ie) {
                var D = this.el;
                new YAHOO.util.KeyListener(this.el, {
                    keys: [13]
                }, {
                    fn: function () {
                        D.blur();
                        D.focus()
                    }
                }).enable()
            }
            A.addFocusListener(this.el, this.onFocus, this, true);
            A.addBlurListener(this.el, this.onBlur, this, true);
            A.addListener(this.el, "keypress", this.onKeyPress, this, true);
            A.addListener(this.el, "keyup", this.onKeyUp, this, true)
        },
        getValue: function () {
            var D;
            D = (this.options.typeInvite && this.el.value == this.options.typeInvite) ? "" : this.el.value;
            if (this.options.trim) {
                D = YAHOO.lang.trim(D)
            }
            return D
        },
        setValue: function (E, D) {
            this.el.value = (C.isNull(E) || C.isUndefined(E)) ? "" : E;
            inputEx.StringField.superclass.setValue.call(this, E, D)
        },
        validate: function () {
            var E = this.getValue();
            if (E === "") {
                return !this.options.required
            }
            var D = true;
            if (this.options.regexp) {
                D = D && E.match(this.options.regexp)
            }
            if (this.options.minLength) {
                D = D && E.length >= this.options.minLength
            }
            return D
        },
        disable: function () {
            this.el.disabled = true
        },
        enable: function () {
            this.el.disabled = false
        },
        focus: function () {
            if ( !! this.el && !C.isUndefined(this.el.focus)) {
                this.el.focus()
            }
        },
        getStateString: function (D) {
            if (D == inputEx.stateInvalid && this.options.minLength && this.el.value.length < this.options.minLength) {
                return inputEx.messages.stringTooShort[0] + this.options.minLength + inputEx.messages.stringTooShort[1]
            }
            return inputEx.StringField.superclass.getStateString.call(this, D)
        },
        setClassFromState: function () {
            inputEx.StringField.superclass.setClassFromState.call(this);
            if (this.options.typeInvite) {
                this.updateTypeInvite()
            }
        },
        updateTypeInvite: function () {
            if (!B.hasClass(this.divEl, "inputEx-focused")) {
                if (this.isEmpty()) {
                    B.addClass(this.divEl, "inputEx-typeInvite");
                    this.el.value = this.options.typeInvite
                } else {
                    B.removeClass(this.divEl, "inputEx-typeInvite")
                }
            } else {
                if (B.hasClass(this.divEl, "inputEx-typeInvite")) {
                    this.el.value = "";
                    this.previousState = null;
                    B.removeClass(this.divEl, "inputEx-typeInvite")
                }
            }
        },
        onFocus: function (D) {
            inputEx.StringField.superclass.onFocus.call(this, D);
            if (this.options.typeInvite) {
                this.updateTypeInvite()
            }
        },
        onKeyPress: function (D) {},
        onKeyUp: function (D) {}
    });
    inputEx.messages.stringTooShort = ["This field should contain at least ", " numbers or characters"];
    inputEx.registerType("string", inputEx.StringField, [{
        type: "string",
        label: "Type invite",
        name: "typeInvite",
        value: ""
    }, {
        type: "integer",
        label: "Size",
        name: "size",
        value: 20
    }, {
        type: "integer",
        label: "Min. length",
        name: "minLength",
        value: 0
    }])
})();
(function () {
    var A = YAHOO.lang;
    inputEx.mixin.choice = {
        addChoice: function (D) {
            var C, B, E;
            if (!A.isObject(D)) {
                D = {
                    value: D
                }
            }
            C = {
                value: D.value,
                label: A.isString(D.label) ? D.label : "" + D.value,
                visible: true
            };
            C.node = this.createChoiceNode(C);
            B = this.getChoicePosition({
                position: D.position,
                label: D.before || D.after
            });
            if (B === -1) {
                B = this.choicesList.length
            } else {
                if (A.isString(D.after)) {
                    B += 1
                }
            }
            this.choicesList.splice(B, 0, C);
            this.appendChoiceNode(C.node, B);
            if ( !! D.selected) {
                E = this;
                setTimeout(function () {
                    E.setValue(C.value)
                }, 0)
            }
            return C
        },
        removeChoice: function (D) {
            var B, C;
            B = this.getChoicePosition(D);
            if (B === -1) {
                throw new Error("SelectField : invalid or missing position, label or value in removeChoice")
            }
            C = this.choicesList[B];
            if (this.getValue() === C.value) {
                this.clear()
            }
            this.choicesList.splice(B, 1);
            this.removeChoiceNode(C.node)
        },
        hideChoice: function (D) {
            var B, C;
            B = this.getChoicePosition(D);
            if (B !== -1) {
                C = this.choicesList[B];
                if (C.visible) {
                    C.visible = false;
                    if (this.getValue() === C.value) {
                        this.clear()
                    }
                    this.removeChoiceNode(C.node)
                }
            }
        },
        showChoice: function (D) {
            var B, C;
            B = this.getChoicePosition(D);
            if (B !== -1) {
                C = this.choicesList[B];
                if (!C.visible) {
                    C.visible = true;
                    this.appendChoiceNode(C.node, B)
                }
            }
        },
        disableChoice: function (E, D) {
            var B, C;
            if (A.isUndefined(D) || !A.isBoolean(D)) {
                D = true
            }
            B = this.getChoicePosition(E);
            if (B !== -1) {
                C = this.choicesList[B];
                this.disableChoiceNode(C.node);
                if (D && this.getValue() === C.value) {
                    this.clear()
                }
            }
        },
        enableChoice: function (D) {
            var B, C;
            B = this.getChoicePosition(D);
            if (B !== -1) {
                C = this.choicesList[B];
                this.enableChoiceNode(C.node)
            }
        },
        getChoicePosition: function (C) {
            var D, B = -1;
            D = this.choicesList.length;
            if (A.isNumber(C.position) && C.position >= 0 && C.position < D) {
                B = parseInt(C.position, 10)
            } else {
                if (!A.isUndefined(C.value)) {
                    B = inputEx.indexOf(C.value, this.choicesList, function (F, E) {
                        return E.value === F
                    })
                } else {
                    if (A.isString(C.label)) {
                        B = inputEx.indexOf(C.label, this.choicesList, function (E, F) {
                            return F.label === E
                        })
                    }
                }
            }
            return B
        }
    }
}());
(function () {
    var A = YAHOO.util.Event,
        B = YAHOO.lang;
    inputEx.SelectField = function (C) {
        inputEx.SelectField.superclass.constructor.call(this, C)
    };
    B.extend(inputEx.SelectField, inputEx.Field, {
        setOptions: function (C) {
            var D, E;
            inputEx.SelectField.superclass.setOptions.call(this, C);
            this.options.choices = B.isArray(C.choices) ? C.choices : [];
            if (B.isArray(C.selectValues)) {
                for (D = 0, E = C.selectValues.length; D < E; D += 1) {
                    this.options.choices.push({
                        value: C.selectValues[D],
                        label: "" + ((C.selectOptions && !B.isUndefined(C.selectOptions[D])) ? C.selectOptions[D] : C.selectValues[D])
                    })
                }
            }
        },
        renderComponent: function () {
            var C, D;
            this.el = inputEx.cn("select", {
                id: this.divEl.id ? this.divEl.id + "-field" : YAHOO.util.Dom.generateId(),
                name: this.options.name || ""
            });
            this.choicesList = [];
            for (C = 0, D = this.options.choices.length; C < D; C += 1) {
                this.addChoice(this.options.choices[C])
            }
            this.fieldContainer.appendChild(this.el)
        },
        initEvents: function () {
            A.addListener(this.el, "change", this.onChange, this, true);
            A.addFocusListener(this.el, this.onFocus, this, true);
            A.addBlurListener(this.el, this.onBlur, this, true)
        },
        setValue: function (H, D) {
            var E, G, C, F, I = false;
            for (E = 0, G = this.choicesList.length; E < G; E += 1) {
                if (this.choicesList[E].visible) {
                    C = this.choicesList[E];
                    if (H === C.value) {
                        C.node.selected = "selected";
                        I = true;
                        break
                    } else {
                        if (B.isUndefined(F)) {
                            F = E
                        }
                    }
                }
            }
            if (!I && !B.isUndefined(F)) {
                C = this.choicesList[F];
                C.node.selected = "selected";
                H = C.value
            }
            inputEx.SelectField.superclass.setValue.call(this, H, D)
        },
        getValue: function () {
            var C;
            if (this.el.selectedIndex >= 0) {
                C = inputEx.indexOf(this.el.childNodes[this.el.selectedIndex], this.choicesList, function (E, D) {
                    return E === D.node
                });
                return this.choicesList[C].value
            } else {
                return ""
            }
        },
        disable: function () {
            this.el.disabled = true
        },
        enable: function () {
            this.el.disabled = false
        },
        createChoiceNode: function (C) {
            return inputEx.cn("option", {
                value: C.value
            }, null, C.label)
        },
        removeChoiceNode: function (C) {
            this.el.removeChild(C)
        },
        disableChoiceNode: function (C) {
            C.disabled = "disabled"
        },
        enableChoiceNode: function (C) {
            C.removeAttribute("disabled")
        },
        appendChoiceNode: function (E, C) {
            var F, D;
            F = 0;
            for (D = 0; D < C; D += 1) {
                if (this.choicesList[D].visible) {
                    F += 1
                }
            }
            if (F < this.el.childNodes.length) {
                YAHOO.util.Dom.insertBefore(E, this.el.childNodes[F])
            } else {
                this.el.appendChild(E)
            }
        }
    });
    B.augmentObject(inputEx.SelectField.prototype, inputEx.mixin.choice);
    inputEx.registerType("select", inputEx.SelectField, [{
        type: "list",
        name: "choices",
        label: "Choices",
        elementType: {
            type: "group",
            fields: [{
                label: "Value",
                name: "value",
                value: ""
            }, {
                label: "Label",
                name: "label"
            }]
        },
        value: [],
        required: true
    }])
}());
(function () {
    inputEx.EmailField = function (A) {
        inputEx.EmailField.superclass.constructor.call(this, A)
    };
    YAHOO.lang.extend(inputEx.EmailField, inputEx.StringField, {
        setOptions: function (A) {
            inputEx.EmailField.superclass.setOptions.call(this, A);
            this.options.messages.invalid = inputEx.messages.invalidEmail;
            this.options.regexp = inputEx.regexps.email;
            this.options.fixdomain = (YAHOO.lang.isUndefined(A.fixdomain) ? false : !! A.fixdomain)
        },
        validateDomain: function () {
            var F, D, A, C, H, E, B, J;
            A = this.getValue();
            C = A.split("@")[1];
            H = [
                ["gmail.com", "gmail.com.br", "_gmail.com", "g-mail.com", "g.mail.com", "g_mail.com", "gamail.com", "gamil.com", "gemail.com", "ggmail.com", "gimail.com", "gmai.com", "gmail.cim", "gmail.co", "gmaill.com", "gmain.com", "gmaio.com", "gmal.com", "gmali.com", "gmeil.com", "gmial.com", "gmil.com", "gtmail.com", "igmail.com", "gmail.fr"],
                ["hotmail.co.uk", "hotmail.com.uk"],
                ["hotmail.com", "hotmail.com.br", "hotmail.br", "0hotmail.com", "8hotmail.com", "_hotmail.com", "ahotmail.com", "ghotmail.com", "gotmail.com", "hatmail.com", "hhotmail.com", "ho0tmail.com", "hogmail.com", "hoimail.com", "hoitmail.com", "homail.com", "homtail.com", "hootmail.com", "hopmail.com", "hoptmail.com", "hormail.com", "hot.mail.com", "hot_mail.com", "hotail.com", "hotamail.com", "hotamil.com", "hotemail.com", "hotimail.com", "hotlmail.com", "hotmaail.com", "hotmael.com", "hotmai.com", "hotmaial.com", "hotmaiil.com", "hotmail.acom", "hotmail.bom", "hotmail.ccom", "hotmail.cm", "hotmail.co", "hotmail.coml", "hotmail.comm", "hotmail.con", "hotmail.coom", "hotmail.copm", "hotmail.cpm", "hotmail.lcom", "hotmail.ocm", "hotmail.om", "hotmail.xom", "hotmail2.com", "hotmail_.com", "hotmailc.com", "hotmaill.com", "hotmailo.com", "hotmaio.com", "hotmaiol.com", "hotmais.com", "hotmal.com", "hotmall.com", "hotmamil.com", "hotmaol.com", "hotmayl.com", "hotmeil.com", "hotmial.com", "hotmil.com", "hotmmail.com", "hotmnail.com", "hotmsil.com", "hotnail.com", "hotomail.com", "hottmail.com", "hotymail.com", "hoymail.com", "hptmail.com", "htmail.com", "htomail.com", "ohotmail.com", "otmail.com", "rotmail.com", "shotmail.com", "hotmain.com"],
                ["hotmail.fr", "hotmail.ffr", "hotmail.frr", "hotmail.fr.br", "hotmail.br", "0hotmail.fr", "8hotmail.fr", "_hotmail.fr", "ahotmail.fr", "ghotmail.fr", "gotmail.fr", "hatmail.fr", "hhotmail.fr", "ho0tmail.fr", "hogmail.fr", "hoimail.fr", "hoitmail.fr", "homail.fr", "homtail.fr", "hootmail.fr", "hopmail.fr", "hoptmail.fr", "hormail.fr", "hot.mail.fr", "hot_mail.fr", "hotail.fr", "hotamail.fr", "hotamil.fr", "hotemail.fr", "hotimail.fr", "hotlmail.fr", "hotmaail.fr", "hotmael.fr", "hotmai.fr", "hotmaial.fr", "hotmaiil.fr", "hotmail.frl", "hotmail.frm", "hotmail2.fr", "hotmail_.fr", "hotmailc.fr", "hotmaill.fr", "hotmailo.fr", "hotmaio.fr", "hotmaiol.fr", "hotmais.fr", "hotmal.fr", "hotmall.fr", "hotmamil.fr", "hotmaol.fr", "hotmayl.fr", "hotmeil.fr", "hotmial.fr", "hotmil.fr", "hotmmail.fr", "hotmnail.fr", "hotmsil.fr", "hotnail.fr", "hotomail.fr", "hottmail.fr", "hotymail.fr", "hoymail.fr", "hptmail.fr", "htmail.fr", "htomail.fr", "ohotmail.fr", "otmail.fr", "rotmail.fr", "shotmail.fr", "hotmain.fr"],
                ["yahoo.co.in", "yaho.co.in", "yahoo.co.cn", "yahoo.co.n", "yahoo.co.on", "yahoo.coin", "yahoo.com.in", "yahoo.cos.in", "yahoo.oc.in", "yaoo.co.in", "yhoo.co.in"],
                ["yahoo.com.br", "1yahoo.com.br", "5yahoo.com.br", "_yahoo.com.br", "ayhoo.com.br", "tahoo.com.br", "uahoo.com.br", "yagoo.com.br", "yahho.com.br", "yaho.com.br", "yahoo.cm.br", "yahoo.co.br", "yahoo.com.ar", "yahoo.com.b", "yahoo.com.be", "yahoo.com.ber", "yahoo.com.bl", "yahoo.com.brr", "yahoo.com.brv", "yahoo.com.bt", "yahoo.com.nr", "yahoo.coml.br", "yahoo.con.br", "yahoo.om.br", "yahool.com.br", "yahooo.com.br", "yahoou.com.br", "yaoo.com.br", "yaroo.com.br", "yhaoo.com.br", "yhoo.com.br", "yuhoo.com.br"],
                ["yahoo.com", "yahoomail.com", "_yahoo.com", "ahoo.com", "ayhoo.com", "eyahoo.com", "hahoo.com", "sahoo.com", "yahho.com", "yaho.com", "yahol.com", "yahoo.co", "yahoo.con", "yahoo.vom", "yahoo0.com", "yahoo1.com", "yahool.com", "yahooo.com", "yahoou.com", "yahoow.com", "yahopo.com", "yaloo.com", "yaoo.com", "yaroo.com", "yayoo.com", "yhaoo.com", "yhoo.com", "yohoo.com"],
                ["yahoo.fr", "yahoomail.fr", "_yahoo.fr", "ahoo.fr", "ayhoo.fr", "eyahoo.fr", "hahoo.fr", "sahoo.fr", "yahho.fr", "yaho.fr", "yahol.fr", "yahoo.co", "yahoo.con", "yahoo.vom", "yahoo0.fr", "yahoo1.fr", "yahool.fr", "yahooo.fr", "yahoou.fr", "yahoow.fr", "yahopo.fr", "yaloo.fr", "yaoo.fr", "yaroo.fr", "yayoo.fr", "yhaoo.fr", "yhoo.fr", "yohoo.fr"],
                ["wanadoo.fr", "wanadoo.frr", "wanadoo.ffr", "wanado.fr", "wanadou.fr", "wanadop.fr", "wandoo.fr", "wanaoo.fr", "wannadoo.fr", "wanadoo.com", "wananadoo.fr", "wanadoo.fe", "wanaddo.fr", "wanadoo.orange", "waqnadoo.fr", "wandaoo.fr", "wannado.fr"],
                ["msn.com", "mns.com", "msn.co"],
                ["aol.com", "aoel.com", "aol.co"]
            ];
            for (F = 0, E = H.length; F < E; F++) {
                B = H[F];
                for (D = 0, J = B.length; D < J; D++) {
                    if (B.indexOf(C) === 0) {
                        if (C === B[D]) {
                            return true
                        }
                    } else {
                        if (C === B[D]) {
                            var I = YAHOO.util.Dom.generateId();
                            var G = this;
                            YAHOO.util.Event.addListener(I, "click", function (M) {
                                YAHOO.util.Event.stopEvent(M);
                                var L = new RegExp(C, "i");
                                var K = A.replace(L, B[0]);
                                G.setValue(K)
                            });
                            this.options.messages.invalid = inputEx.messages.didYouMeant + "<a href='' id='" + I + "' style='color:blue;'>@" + B[0] + " ?</a>";
                            return false
                        }
                    }
                }
            }
            return true
        },
        validate: function () {
            var A = inputEx.EmailField.superclass.validate.call(this);
            if ( !! this.options.fixdomain) {
                this.options.messages.invalid = inputEx.messages.invalidEmail;
                return A && this.validateDomain()
            } else {
                return A
            }
        },
        getValue: function () {
            var A;
            A = inputEx.EmailField.superclass.getValue.call(this);
            return inputEx.removeAccents(A.toLowerCase())
        }
    });
    inputEx.messages.invalidEmail = "Invalid email, ex: sample@test.com";
    inputEx.messages.didYouMeant = "Did you mean : ";
    inputEx.registerType("email", inputEx.EmailField, [])
})();
(function () {
    var A = YAHOO.lang;
    inputEx.UrlField = function (B) {
        inputEx.UrlField.superclass.constructor.call(this, B)
    };
    A.extend(inputEx.UrlField, inputEx.StringField, {
        setOptions: function (B) {
            inputEx.UrlField.superclass.setOptions.call(this, B);
            this.options.className = B.className ? B.className : "inputEx-Field inputEx-UrlField";
            this.options.messages.invalid = inputEx.messages.invalidUrl;
            this.options.favicon = A.isUndefined(B.favicon) ? (("https:" == document.location.protocol) ? false : true) : B.favicon;
            this.options.size = B.size || 50;
            this.options.regexp = inputEx.regexps.url
        },
        render: function () {
            inputEx.UrlField.superclass.render.call(this);
            this.el.size = this.options.size;
            if (!this.options.favicon) {
                YAHOO.util.Dom.addClass(this.el, "nofavicon")
            }
            if (this.options.favicon) {
                this.favicon = inputEx.cn("img", {
                    src: inputEx.spacerUrl
                });
                this.fieldContainer.insertBefore(this.favicon, this.fieldContainer.childNodes[0]);
                YAHOO.util.Event.addListener(this.favicon, "click", function () {
                    this.focus()
                }, this, true)
            }
        },
        setClassFromState: function () {
            inputEx.UrlField.superclass.setClassFromState.call(this);
            if (this.options.favicon) {
                this.updateFavicon((this.previousState == inputEx.stateValid) ? this.getValue() : null)
            }
        },
        updateFavicon: function (C) {
            var B = C ? C.match(/https?:\/\/[^\/]*/) + "/favicon.ico" : inputEx.spacerUrl;
            if (B != this.favicon.src) {
                inputEx.sn(this.favicon, null, {
                    visibility: "hidden"
                });
                this.favicon.src = B;
                if (this.timer) {
                    clearTimeout(this.timer)
                }
                var D = this;
                this.timer = setTimeout(function () {
                    D.displayFavicon()
                }, 1000)
            }
        },
        displayFavicon: function () {
            inputEx.sn(this.favicon, null, {
                visibility: (this.favicon.naturalWidth != 0) ? "visible" : "hidden"
            })
        }
    });
    inputEx.messages.invalidUrl = "Invalid URL, ex: http://www.test.com";
    inputEx.registerType("url", inputEx.UrlField, [{
        type: "boolean",
        label: "Display favicon",
        name: "favicon",
        value: true
    }])
})();
(function () {
    var C = YAHOO.lang,
        A = YAHOO.util.Event,
        B = YAHOO.util.Dom;
    inputEx.ListField = function (D) {
        this.subFields = [];
        inputEx.ListField.superclass.constructor.call(this, D)
    };
    C.extend(inputEx.ListField, inputEx.Field, {
        setOptions: function (D) {
            inputEx.ListField.superclass.setOptions.call(this, D);
            this.options.className = D.className ? D.className : "inputEx-Field inputEx-ListField";
            this.options.sortable = C.isUndefined(D.sortable) ? false : D.sortable;
            this.options.elementType = D.elementType || {
                type: "string"
            };
            this.options.useButtons = C.isUndefined(D.useButtons) ? false : D.useButtons;
            this.options.unique = C.isUndefined(D.unique) ? false : D.unique;
            this.options.listAddLabel = D.listAddLabel || inputEx.messages.listAddLink;
            this.options.listRemoveLabel = D.listRemoveLabel || inputEx.messages.listRemoveLink;
            this.options.maxItems = D.maxItems;
            this.options.minItems = D.minItems
        },
        renderComponent: function () {
            if (this.options.useButtons) {
                this.addButton = inputEx.cn("img", {
                    src: inputEx.spacerUrl,
                    className: "inputEx-ListField-addButton"
                });
                this.fieldContainer.appendChild(this.addButton)
            }
            this.fieldContainer.appendChild(inputEx.cn("span", null, {
                marginLeft: "4px"
            }, this.options.listLabel));
            this.childContainer = inputEx.cn("div", {
                className: "inputEx-ListField-childContainer"
            });
            this.fieldContainer.appendChild(this.childContainer);
            if (!this.options.useButtons) {
                this.addButton = inputEx.cn("a", {
                    className: "inputEx-List-link"
                }, null, this.options.listAddLabel);
                this.fieldContainer.appendChild(this.addButton)
            }
        },
        initEvents: function () {
            A.addListener(this.addButton, "click", this.onAddButton, this, true)
        },
        validate: function () {
            var F = true;
            var J = {};
            var D = this.subFields.length;
            if (C.isNumber(this.options.minItems) && D < this.options.minItems) {
                F = false
            }
            if (C.isNumber(this.options.maxItems) && D > this.options.maxItems) {
                F = false
            }
            for (var G = 0; G < D && F; G++) {
                var E = this.subFields[G];
                E.setClassFromState();
                var H = E.getState();
                if (H == inputEx.stateRequired || H == inputEx.stateInvalid) {
                    F = false
                }
                if (this.options.unique) {
                    var I = C.dump(E.getValue());
                    if (J[I]) {
                        F = false
                    } else {
                        J[I] = true
                    }
                }
            }
            return F
        },
        setValue: function (G, D) {
            if (!C.isArray(G)) {
                throw new Error("inputEx.ListField.setValue expected an array, got " + (typeof G))
            }
            for (var F = 0; F < G.length; F++) {
                if (F == this.subFields.length) {
                    this.addElement(G[F])
                } else {
                    this.subFields[F].setValue(G[F], false)
                }
            }
            var E = this.subFields.length - G.length;
            if (E > 0) {
                for (F = 0; F < E; F++) {
                    this.removeElement(G.length)
                }
            }
            inputEx.ListField.superclass.setValue.call(this, G, D)
        },
        getValue: function () {
            var D = [];
            for (var E = 0; E < this.subFields.length; E++) {
                D[E] = this.subFields[E].getValue()
            }
            return D
        },
        addElement: function (E) {
            var D = this.renderSubField(E);
            this.subFields.push(D);
            return D
        },
        onAddButton: function (E) {
            A.stopEvent(E);
            if (C.isNumber(this.options.maxItems) && this.subFields.length >= this.options.maxItems) {
                return
            }
            var D = this.addElement();
            D.focus();
            this.fireUpdatedEvt()
        },
        renderSubField: function (K) {
            var G = inputEx.cn("div"),
                E;
            if (this.options.useButtons) {
                E = inputEx.cn("img", {
                    src: inputEx.spacerUrl,
                    className: "inputEx-ListField-delButton"
                });
                A.addListener(E, "click", this.onDelete, this, true);
                G.appendChild(E)
            }
            var J = C.merge({}, this.options.elementType);
            if (C.isObject(J.inputParams) && !C.isUndefined(K)) {
                J.inputParams.value = K
            } else {
                if (!C.isUndefined(K)) {
                    J.value = K
                }
            }
            var H = inputEx(J, this);
            var F = H.getEl();
            B.setStyle(F, "margin-left", "4px");
            B.setStyle(F, "float", "left");
            G.appendChild(F);
            H.updatedEvt.subscribe(this.onChange, this, true);
            if (this.options.sortable) {
                var I = inputEx.cn("div", {
                    className: "inputEx-ListField-Arrow inputEx-ListField-ArrowUp"
                });
                A.addListener(I, "click", this.onArrowUp, this, true);
                var D = inputEx.cn("div", {
                    className: "inputEx-ListField-Arrow inputEx-ListField-ArrowDown"
                });
                A.addListener(D, "click", this.onArrowDown, this, true);
                G.appendChild(I);
                G.appendChild(D)
            }
            if (!this.options.useButtons) {
                E = inputEx.cn("a", {
                    className: "inputEx-List-link"
                }, null, this.options.listRemoveLabel);
                A.addListener(E, "click", this.onDelete, this, true);
                G.appendChild(E)
            }
            G.appendChild(inputEx.cn("div", null, {
                clear: "both"
            }));
            this.childContainer.appendChild(G);
            return H
        },
        onArrowUp: function (J) {
            var G = A.getTarget(J).parentNode;
            var E = null;
            var F = -1;
            for (var H = 1; H < G.parentNode.childNodes.length; H++) {
                var D = G.parentNode.childNodes[H];
                if (D == G) {
                    E = G.parentNode.childNodes[H - 1];
                    F = H;
                    break
                }
            }
            if (E) {
                var K = this.childContainer.removeChild(G);
                var I = this.childContainer.insertBefore(K, E);
                var L = this.subFields[F];
                this.subFields[F] = this.subFields[F - 1];
                this.subFields[F - 1] = L;
                if (this.arrowAnim) {
                    this.arrowAnim.stop(true)
                }
                this.arrowAnim = new YAHOO.util.ColorAnim(I, {
                    backgroundColor: {
                        from: "#eeee33",
                        to: "#eeeeee"
                    }
                }, 0.4);
                this.arrowAnim.onComplete.subscribe(function () {
                    B.setStyle(I, "background-color", "")
                });
                this.arrowAnim.animate();
                this.fireUpdatedEvt()
            }
        },
        onArrowDown: function (J) {
            var F = A.getTarget(J).parentNode;
            var E = -1;
            var I = null;
            for (var G = 0; G < F.parentNode.childNodes.length; G++) {
                var D = F.parentNode.childNodes[G];
                if (D == F) {
                    I = F.parentNode.childNodes[G + 1];
                    E = G;
                    break
                }
            }
            if (I) {
                var K = this.childContainer.removeChild(F);
                var H = B.insertAfter(K, I);
                var L = this.subFields[E];
                this.subFields[E] = this.subFields[E + 1];
                this.subFields[E + 1] = L;
                if (this.arrowAnim) {
                    this.arrowAnim.stop(true)
                }
                this.arrowAnim = new YAHOO.util.ColorAnim(H, {
                    backgroundColor: {
                        from: "#eeee33",
                        to: "#eeeeee"
                    }
                }, 1);
                this.arrowAnim.onComplete.subscribe(function () {
                    B.setStyle(H, "background-color", "")
                });
                this.arrowAnim.animate();
                this.fireUpdatedEvt()
            }
        },
        onDelete: function (H) {
            A.stopEvent(H);
            if (C.isNumber(this.options.minItems) && this.subFields.length <= this.options.minItems) {
                return
            }
            var E = A.getTarget(H).parentNode;
            var D = -1;
            var G = E.childNodes[this.options.useButtons ? 1 : 0];
            for (var F = 0; F < this.subFields.length; F++) {
                if (this.subFields[F].getEl() == G) {
                    D = F;
                    break
                }
            }
            if (D != -1) {
                this.removeElement(D)
            }
            this.fireUpdatedEvt()
        },
        removeElement: function (E) {
            var D = this.subFields[E].getEl().parentNode;
            this.subFields[E] = undefined;
            this.subFields = inputEx.compactArray(this.subFields);
            D.parentNode.removeChild(D)
        }
    });
    inputEx.registerType("list", inputEx.ListField, [{
        type: "string",
        label: "List label",
        name: "listLabel",
        value: ""
    }, {
        type: "type",
        label: "List element type",
        required: true,
        name: "elementType"
    }]);
    inputEx.messages.listAddLink = "Add";
    inputEx.messages.listRemoveLink = "remove"
})();
(function () {
    var C = YAHOO.lang,
        A = YAHOO.util.Event,
        B = YAHOO.util.Dom;
    inputEx.CheckBox = function (D) {
        inputEx.CheckBox.superclass.constructor.call(this, D)
    };
    C.extend(inputEx.CheckBox, inputEx.Field, {
        setOptions: function (D) {
            inputEx.CheckBox.superclass.setOptions.call(this, D);
            this.options.className = D.className ? D.className : "inputEx-Field inputEx-CheckBox";
            this.options.rightLabel = D.rightLabel || "";
            this.sentValues = D.sentValues || [true, false];
            this.options.sentValues = this.sentValues;
            this.checkedValue = this.sentValues[0];
            this.uncheckedValue = this.sentValues[1]
        },
        renderComponent: function () {
            var D = this.divEl.id ? this.divEl.id + "-field" : YAHOO.util.Dom.generateId();
            this.el = inputEx.cn("input", {
                id: D,
                type: "checkbox"
            });
            this.fieldContainer.appendChild(this.el);
            this.rightLabelEl = inputEx.cn("label", {
                "for": D,
                className: "inputEx-CheckBox-rightLabel"
            }, null, this.options.rightLabel);
            this.fieldContainer.appendChild(this.rightLabelEl);
            this.hiddenEl = inputEx.cn("input", {
                type: "hidden",
                name: this.options.name || "",
                value: this.uncheckedValue
            });
            this.fieldContainer.appendChild(this.hiddenEl)
        },
        initEvents: function () {
            if (YAHOO.env.ua.ie) {
                A.addListener(this.el, "click", function (D) {
                    YAHOO.lang.later(10, this, function () {
                        this.onChange(D)
                    })
                }, this, true)
            } else {
                A.addListener(this.el, "change", this.onChange, this, true)
            }
            A.addFocusListener(this.el, this.onFocus, this, true);
            A.addBlurListener(this.el, this.onBlur, this, true)
        },
        onChange: function (D) {
            this.hiddenEl.value = this.el.checked ? this.checkedValue : this.uncheckedValue;
            inputEx.CheckBox.superclass.onChange.call(this, D)
        },
        getValue: function () {
            return this.el.checked ? this.checkedValue : this.uncheckedValue
        },
        setValue: function (E, D) {
            if (E === this.checkedValue || (typeof (E) == "string" && typeof (this.checkedValue) == "boolean" && E === String(this.checkedValue))) {
                this.hiddenEl.value = this.checkedValue;
                this.el.checked = true;
                if (YAHOO.env.ua.ie === 6) {
                    this.el.setAttribute("defaultChecked", "checked")
                }
            } else {
                this.hiddenEl.value = this.uncheckedValue;
                this.el.checked = false;
                if (YAHOO.env.ua.ie === 6) {
                    this.el.removeAttribute("defaultChecked")
                }
            }
            inputEx.CheckBox.superclass.setValue.call(this, E, D)
        },
        disable: function () {
            this.el.disabled = true
        },
        enable: function () {
            this.el.disabled = false
        }
    });
    inputEx.registerType("boolean", inputEx.CheckBox, [{
        type: "string",
        label: "Right Label",
        name: "rightLabel"
    }])
})();
(function () {
    var A = YAHOO.util.Event;
    inputEx.Textarea = function (B) {
        inputEx.Textarea.superclass.constructor.call(this, B)
    };
    YAHOO.lang.extend(inputEx.Textarea, inputEx.StringField, {
        setOptions: function (B) {
            inputEx.Textarea.superclass.setOptions.call(this, B);
            this.options.rows = B.rows || 6;
            this.options.cols = B.cols || 23;
            this.options.readonly = !! B.readonly
        },
        renderComponent: function () {
            this.wrapEl = inputEx.cn("div", {
                className: "inputEx-StringField-wrapper"
            });
            var B = {};
            B.id = this.divEl.id ? this.divEl.id + "-field" : YAHOO.util.Dom.generateId();
            B.rows = this.options.rows;
            B.cols = this.options.cols;
            if (this.options.name) {
                B.name = this.options.name
            }
            if (this.options.readonly) {
                B.readonly = "readonly"
            }
            this.el = inputEx.cn("textarea", B, null, this.options.value);
            this.wrapEl.appendChild(this.el);
            this.fieldContainer.appendChild(this.wrapEl)
        },
        validate: function () {
            var B = inputEx.Textarea.superclass.validate.call(this);
            if (this.options.maxLength) {
                B = B && this.getValue().length <= this.options.maxLength
            }
            return B
        },
        getStateString: function (B) {
            if (B == inputEx.stateInvalid && this.options.minLength && this.el.value.length < this.options.minLength) {
                return inputEx.messages.stringTooShort[0] + this.options.minLength + inputEx.messages.stringTooShort[1]
            } else {
                if (B == inputEx.stateInvalid && this.options.maxLength && this.el.value.length > this.options.maxLength) {
                    return inputEx.messages.stringTooLong[0] + this.options.maxLength + inputEx.messages.stringTooLong[1]
                }
            }
            return inputEx.Textarea.superclass.getStateString.call(this, B)
        },
        insert: function (E) {
            var D, C, B;
            if (document.selection) {
                this.el.focus();
                D = document.selection.createRange();
                D.text = E
            } else {
                if (this.el.selectionStart || this.el.selectionStart == "0") {
                    C = this.el.selectionStart;
                    B = this.el.selectionEnd;
                    this.el.value = this.el.value.substring(0, C) + E + this.el.value.substring(B, this.el.value.length)
                } else {
                    this.el.value += E
                }
            }
        }
    });
    inputEx.messages.stringTooLong = ["This field should contain at most ", " numbers or characters"];
    inputEx.registerType("text", inputEx.Textarea, [{
        type: "integer",
        label: "Rows",
        name: "rows",
        value: 6
    }, {
        type: "integer",
        label: "Cols",
        name: "cols",
        value: 23
    }])
})();
(function () {
    var D = YAHOO.lang,
        A = YAHOO.util.Event,
        B = YAHOO.util.Dom,
        C = "inputEx-InPlaceEdit-";
    inputEx.InPlaceEdit = function (E) {
        inputEx.InPlaceEdit.superclass.constructor.call(this, E)
    };
    D.extend(inputEx.InPlaceEdit, inputEx.Field, {
        setOptions: function (E) {
            inputEx.InPlaceEdit.superclass.setOptions.call(this, E);
            this.options.visu = E.visu;
            this.options.editorField = E.editorField;
            this.options.buttonTypes = E.buttonTypes || {
                ok: "submit",
                cancel: "link"
            };
            this.options.animColors = E.animColors || null
        },
        renderComponent: function () {
            this.renderVisuDiv();
            this.renderEditor()
        },
        renderEditor: function () {
            this.editorContainer = inputEx.cn("div", {
                className: C + "editor"
            }, {
                display: "none"
            });
            this.editorField = inputEx(this.options.editorField, this);
            var E = this.editorField.getEl();
            this.editorContainer.appendChild(E);
            B.addClass(E, C + "editorDiv");
            this.okButton = new inputEx.widget.Button({
                type: this.options.buttonTypes.ok,
                parentEl: this.editorContainer,
                value: inputEx.messages.okEditor,
                className: "inputEx-Button " + C + "OkButton",
                onClick: {
                    fn: this.onOkEditor,
                    scope: this
                }
            });
            this.cancelLink = new inputEx.widget.Button({
                type: this.options.buttonTypes.cancel,
                parentEl: this.editorContainer,
                value: inputEx.messages.cancelEditor,
                className: "inputEx-Button " + C + "CancelLink",
                onClick: {
                    fn: this.onCancelEditor,
                    scope: this
                }
            });
            this.editorContainer.appendChild(inputEx.cn("div", null, {
                clear: "both"
            }));
            this.fieldContainer.appendChild(this.editorContainer)
        },
        onVisuMouseOver: function (E) {
            if (this.colorAnim) {
                this.colorAnim.stop(true)
            }
            inputEx.sn(this.formattedContainer, null, {
                backgroundColor: this.options.animColors.from
            })
        },
        onVisuMouseOut: function (E) {
            if (this.colorAnim) {
                this.colorAnim.stop(true)
            }
            this.colorAnim = new YAHOO.util.ColorAnim(this.formattedContainer, {
                backgroundColor: this.options.animColors
            }, 1);
            this.colorAnim.onComplete.subscribe(function () {
                B.setStyle(this.formattedContainer, "background-color", "")
            }, this, true);
            this.colorAnim.animate()
        },
        renderVisuDiv: function () {
            this.formattedContainer = inputEx.cn("div", {
                className: "inputEx-InPlaceEdit-visu"
            });
            if (D.isFunction(this.options.formatDom)) {
                this.formattedContainer.appendChild(this.options.formatDom(this.options.value))
            } else {
                if (D.isFunction(this.options.formatValue)) {
                    this.formattedContainer.innerHTML = this.options.formatValue(this.options.value)
                } else {
                    this.formattedContainer.innerHTML = D.isUndefined(this.options.value) ? inputEx.messages.emptyInPlaceEdit : this.options.value
                }
            }
            this.fieldContainer.appendChild(this.formattedContainer)
        },
        initEvents: function () {
            A.addListener(this.formattedContainer, "click", this.openEditor, this, true);
            if (this.options.animColors) {
                A.addListener(this.formattedContainer, "mouseover", this.onVisuMouseOver, this, true);
                A.addListener(this.formattedContainer, "mouseout", this.onVisuMouseOut, this, true)
            }
            if (this.editorField.el) {
                A.addListener(this.editorField.el, "keyup", this.onKeyUp, this, true);
                A.addListener(this.editorField.el, "keydown", this.onKeyDown, this, true)
            }
        },
        onKeyUp: function (E) {
            if (E.keyCode == 13) {
                this.onOkEditor(E)
            }
            if (E.keyCode == 27) {
                this.onCancelEditor(E)
            }
        },
        onKeyDown: function (E) {
            if (E.keyCode == 9) {
                this.onOkEditor(E)
            }
        },
        onOkEditor: function (G) {
            A.stopEvent(G);
            var F = this.editorField.getValue();
            this.setValue(F);
            this.editorContainer.style.display = "none";
            this.formattedContainer.style.display = "";
            var E = this;
            setTimeout(function () {
                E.updatedEvt.fire(F)
            }, 50)
        },
        onCancelEditor: function (E) {
            A.stopEvent(E);
            this.editorContainer.style.display = "none";
            this.formattedContainer.style.display = ""
        },
        openEditor: function () {
            var E = this.getValue();
            this.editorContainer.style.display = "";
            this.formattedContainer.style.display = "none";
            if (!D.isUndefined(E)) {
                this.editorField.setValue(E)
            }
            this.editorField.focus();
            if (this.editorField.el && D.isFunction(this.editorField.el.setSelectionRange) && ( !! E && !! E.length)) {
                this.editorField.el.setSelectionRange(0, E.length)
            }
        },
        getValue: function () {
            var E = (this.editorContainer.style.display == "");
            return E ? this.editorField.getValue() : this.value
        },
        setValue: function (F, E) {
            this.value = F;
            if (D.isUndefined(F) || F == "") {
                inputEx.renderVisu(this.options.visu, inputEx.messages.emptyInPlaceEdit, this.formattedContainer)
            } else {
                inputEx.renderVisu(this.options.visu, this.value, this.formattedContainer)
            }
            if (this.editorContainer.style.display == "") {
                this.editorField.setValue(F)
            }
            inputEx.InPlaceEdit.superclass.setValue.call(this, F, E)
        },
        close: function () {
            this.editorContainer.style.display = "none";
            this.formattedContainer.style.display = ""
        }
    });
    inputEx.messages.emptyInPlaceEdit = "(click to edit)";
    inputEx.messages.cancelEditor = "cancel";
    inputEx.messages.okEditor = "Ok";
    inputEx.registerType("inplaceedit", inputEx.InPlaceEdit, [{
        type: "type",
        label: "Editor",
        name: "editorField"
    }])
})();
(function () {
    var A = YAHOO.util.Event,
        B = YAHOO.util.Dom,
        C = YAHOO.lang;
    inputEx.TypeField = function (D) {
        inputEx.TypeField.superclass.constructor.call(this, D);
        this.updateFieldValue()
    };
    C.extend(inputEx.TypeField, inputEx.Field, {
        renderComponent: function () {
            this.fieldValueWrapper = inputEx.cn("div", {
                className: "inputEx-TypeField-FieldValueWrapper"
            });
            this.fieldContainer.appendChild(this.fieldValueWrapper);
            this.propertyPanel = inputEx.cn("div", {
                className: "inputEx-TypeField-PropertiesPanel"
            }, {
                display: "none"
            });
            var D = [];
            for (var E in inputEx.typeClasses) {
                if (inputEx.typeClasses.hasOwnProperty(E)) {
                    D.push({
                        value: E
                    })
                }
            }
            this.typeSelect = new inputEx.SelectField({
                label: "Type",
                choices: D,
                parentEl: this.propertyPanel
            });
            this.groupOptionsWrapper = inputEx.cn("div");
            this.propertyPanel.appendChild(this.groupOptionsWrapper);
            this.button = inputEx.cn("div", {
                className: "inputEx-TypeField-EditButton"
            });
            this.button.appendChild(this.propertyPanel);
            this.fieldContainer.appendChild(this.button);
            this.rebuildGroupOptions()
        },
        initEvents: function () {
            inputEx.TypeField.superclass.initEvents.call(this);
            A.addListener(this.button, "click", this.onTogglePropertiesPanel, this, true);
            A.addListener(this.propertyPanel, "click", function (D) {
                A.stopPropagation(D)
            }, this, true);
            this.typeSelect.updatedEvt.subscribe(this.rebuildGroupOptions, this, true)
        },
        rebuildGroupOptions: function () {
            try {
                var D = null;
                if (this.group) {
                    D = this.group.getValue();
                    this.group.close();
                    this.group.destroy();
                    this.groupOptionsWrapper.innerHTML = ""
                }
                var G = inputEx.getFieldClass(this.typeSelect.getValue());
                var E = {
                    fields: G.groupOptions,
                    parentEl: this.groupOptionsWrapper
                };
                this.group = new inputEx.Group(E);
                if (D) {
                    this.group.setValue({
                        name: D.name,
                        label: D.label
                    })
                }
                this.group.updatedEvt.subscribe(this.onChangeGroupOptions, this, true);
                this.updateFieldValue()
            } catch (F) {
                if (YAHOO.lang.isObject(window.console) && YAHOO.lang.isFunction(window.console["log"])) {
                    console.log("inputEx.TypeField.rebuildGroupOptions: ", F)
                }
            }
        },
        onTogglePropertiesPanel: function () {
            if (this.propertyPanel.style.display == "none") {
                this.propertyPanel.style.display = "";
                B.addClass(this.button, "opened")
            } else {
                this.propertyPanel.style.display = "none";
                B.removeClass(this.button, "opened")
            }
        },
        onChangeGroupOptions: function () {
            this.updateFieldValue();
            this.fireUpdatedEvt()
        },
        updateFieldValue: function () {
            try {
                if (this.fieldValue) {
                    this.fieldValue.close();
                    this.fieldValue.destroy();
                    delete this.fieldValue;
                    this.fieldValueWrapper.innerHTML = ""
                }
                var E = this.group.getValue();
                E.type = this.getValue().type;
                E.parentEl = this.fieldValueWrapper;
                this.fieldValue = inputEx(E, this);
                this.fieldValue.updatedEvt.subscribe(this.fireUpdatedEvt, this, true)
            } catch (D) {
                console.log("Error while updateFieldValue", D.message)
            }
        },
        setValue: function (E, D) {
            this.typeSelect.setValue(E.type, false);
            this.rebuildGroupOptions();
            if (C.isObject(E.inputParams)) {
                this.group.setValue(E.inputParams, false)
            } else {
                this.group.setValue(E, false)
            }
            this.updateFieldValue();
            if (C.isObject(E.inputParams) && !C.isUndefined(E.inputParams.value)) {
                this.fieldValue.setValue(E.inputParams.value)
            } else {
                if (!C.isUndefined(E.value)) {
                    this.fieldValue.setValue(E.value)
                }
            }
            if (D !== false) {
                this.fireUpdatedEvt()
            }
        },
        getValue: function () {
            var I = function (K, N) {
                    var J, L = K.groupOptions.length,
                        M;
                    for (J = 0; J < L; J++) {
                        M = K.groupOptions[J];
                        if (C.isObject(M.inputParams) && M.inputParams.name == N) {
                            return M.inputParams.value
                        } else {
                            if (M.name == N) {
                                return M.value
                            }
                        }
                    }
                    return undefined
                };
            var E = this.group.getValue();
            var H = inputEx.getFieldClass(this.typeSelect.getValue());
            for (var G in E) {
                if (E.hasOwnProperty(G)) {
                    var F = I(H, G);
                    var D = E[G];
                    if (F == D) {
                        E[G] = undefined
                    }
                }
            }
            E.type = this.typeSelect.getValue();
            if (this.fieldValue) {
                E.value = this.fieldValue.getValue()
            }
            return E
        }
    });
    inputEx.registerType("type", inputEx.TypeField, [])
})();
(function () {
    var C = YAHOO.util,
        G = YAHOO.lang;
    var B = C.Event,
        D = C.Dom,
        A = C.Connect,
        F = G.JSON,
        E = YAHOO.widget;
    WireIt.BaseEditor = function (H) {
        this.el = D.get(H.parentEl);
        this.setOptions(H);
        this.render()
    };
    WireIt.BaseEditor.defaultOptions = {
        layoutOptions: {
            units: [{
                position: "top",
                height: 57,
                body: "top"
            }, {
                position: "left",
                width: 200,
                resize: true,
                body: "left",
                gutter: "5px",
                collapse: true,
                collapseSize: 25,
                header: "Modules",
                scroll: true,
                animate: true
            }, {
                position: "center",
                body: "center",
                gutter: "5px"
            }, {
                position: "right",
                width: 320,
                resize: true,
                body: "right",
                gutter: "5px",
                collapse: true,
                collapseSize: 25,
                animate: true
            }]
        },
        propertiesFields: [{
            type: "string",
            name: "name",
            label: "Title",
            typeInvite: "Enter a title"
        }, {
            type: "text",
            name: "description",
            label: "Description",
            cols: 30,
            rows: 4
        }],
        accordionViewParams: {
            collapsible: true,
            expandable: true,
            width: "auto",
            expandItem: 0,
            animationSpeed: "0.3",
            animate: true,
            effect: YAHOO.util.Easing.easeBothStrong
        }
    };
    WireIt.BaseEditor.prototype = {
        setOptions: function (H) {
            this.options = {};
            this.options.propertiesFields = H.propertiesFields || WireIt.BaseEditor.defaultOptions.propertiesFields;
            this.options.layoutOptions = H.layoutOptions || WireIt.BaseEditor.defaultOptions.layoutOptions;
            this.options.accordionViewParams = H.accordionViewParams || WireIt.BaseEditor.defaultOptions.accordionViewParams
        },
        render: function () {
            this.renderHelpPanel();
            this.layout = new E.Layout(this.el, this.options.layoutOptions);
            this.layout.render();
            this.renderPropertiesAccordion();
            this.renderButtons();
            this.renderSavedStatus();
            this.renderPropertiesForm()
        },
        renderHelpPanel: function () {
            this.helpPanel = new E.Panel("helpPanel", {
                fixedcenter: true,
                draggable: true,
                visible: false,
                modal: true
            });
            this.helpPanel.render()
        },
        renderAlertPanel: function () {
            this.alertPanel = new E.Panel("WiringEditor-alertPanel", {
                fixedcenter: true,
                draggable: true,
                width: "500px",
                visible: false,
                modal: true
            });
            this.alertPanel.setHeader("Message");
            this.alertPanel.setBody("<div id='alertPanelBody'></div><button id='alertPanelButton'>Ok</button>");
            this.alertPanel.render(document.body);
            B.addListener("alertPanelButton", "click", function () {
                this.alertPanel.hide()
            }, this, true)
        },
        renderButtons: function () {
            var I = D.get("toolbar");
            var H = new E.Button({
                label: "New",
                id: "WiringEditor-newButton",
                container: I
            });
            H.on("click", this.onNew, this, true);
            var K = new E.Button({
                label: "Load",
                id: "WiringEditor-loadButton",
                container: I
            });
            K.on("click", this.load, this, true);
            var J = new E.Button({
                label: "Save",
                id: "WiringEditor-saveButton",
                container: I
            });
            J.on("click", this.onSave, this, true);
            var M = new E.Button({
                label: "Delete",
                id: "WiringEditor-deleteButton",
                container: I
            });
            M.on("click", this.onDelete, this, true);
            var L = new E.Button({
                label: "Help",
                id: "WiringEditor-helpButton",
                container: I
            });
            L.on("click", this.onHelp, this, true)
        },
        renderSavedStatus: function () {
            this.savedStatusEl = WireIt.cn("div", {
                className: "savedStatus",
                title: "Not saved"
            }, {
                display: "none"
            }, "*");
            D.get("toolbar").appendChild(this.savedStatusEl)
        },
        onSave: function () {
            this.save()
        },
        save: function () {},
        alert: function (H) {
            if (!this.alertPanel) {
                this.renderAlertPanel()
            }
            D.get("alertPanelBody").innerHTML = H;
            this.alertPanel.show()
        },
        onHelp: function () {
            this.helpPanel.show()
        },
        renderPropertiesAccordion: function () {
            this.accordionView = new YAHOO.widget.AccordionView("accordionView", this.options.accordionViewParams)
        },
        renderPropertiesForm: function () {
            this.propertiesForm = new inputEx.Group({
                parentEl: YAHOO.util.Dom.get("propertiesForm"),
                fields: this.options.propertiesFields
            });
            this.propertiesForm.updatedEvt.subscribe(function () {
                this.markUnsaved()
            }, this, true)
        },
        markSaved: function () {
            this.savedStatusEl.style.display = "none"
        },
        markUnsaved: function () {
            this.savedStatusEl.style.display = ""
        },
        isSaved: function () {
            return (this.savedStatusEl.style.display == "none")
        }
    }
})();
(function () {
    var A = YAHOO.util,
        C = YAHOO.lang,
        B = A.Dom;
    WireIt.ModuleProxy = function (E, D) {
        this._WiringEditor = D;
        WireIt.ModuleProxy.superclass.constructor.call(this, E, "module", {
            dragElId: "moduleProxy"
        });
        this.isTarget = false
    };
    C.extend(WireIt.ModuleProxy, YAHOO.util.DDProxy, {
        startDrag: function (F) {
            WireIt.ModuleProxy.superclass.startDrag.call(this, F);
            var D = this.getDragEl(),
                E = this.getEl();
            D.innerHTML = E.innerHTML;
            D.className = E.className
        },
        endDrag: function (D) {},
        onDragDrop: function (H, F) {
            var I = F[0],
                G = F[0]._layer,
                E = this.getDragEl(),
                J = B.getXY(E),
                D = B.getXY(G.el);
            this._WiringEditor.addModule(this._module, [J[0] - D[0] + G.el.scrollLeft, J[1] - D[1] + G.el.scrollTop])
        }
    })
})();
(function () {
    var C = YAHOO.util,
        F = YAHOO.lang;
    var B = C.Event,
        D = C.Dom,
        A = C.Connect,
        E = YAHOO.widget;
    WireIt.WiringEditor = function (G) {
        this.modulesByName = {};
        WireIt.WiringEditor.superclass.constructor.call(this, G);
        if (this.adapter.init && YAHOO.lang.isFunction(this.adapter.init)) {
            this.adapter.init()
        }
        this.load()
    };
    F.extend(WireIt.WiringEditor, WireIt.BaseEditor, {
        setOptions: function (J) {
            WireIt.WiringEditor.superclass.setOptions.call(this, J);
            this.modules = J.modules || [];
            for (var K = 0; K < this.modules.length; K++) {
                var G = this.modules[K];
                this.modulesByName[G.name] = G
            }
            this.adapter = J.adapter || WireIt.WiringEditor.adapters.JsonRpc;
            this.options.languageName = J.languageName || "anonymousLanguage";
            this.options.layerOptions = {};
            var L = J.layerOptions || {};
            this.options.layerOptions.parentEl = L.parentEl ? L.parentEl : D.get("center");
            this.options.layerOptions.layerMap = YAHOO.lang.isUndefined(L.layerMap) ? true : L.layerMap;
            this.options.layerOptions.layerMapOptions = L.layerMapOptions || {
                parentEl: "layerMap"
            };
            this.options.modulesAccordionViewParams = YAHOO.lang.merge({
                collapsible: true,
                expandable: true,
                width: "auto",
                expandItem: 0,
                animationSpeed: "0.3",
                animate: true,
                effect: YAHOO.util.Easing.easeBothStrong
            }, J.modulesAccordionViewParams || {});
            var H = this;
            var I = function (M) {
                    return (M == "Group") ? ({
                        xtype: "WireIt.GroupFormContainer",
                        title: "Group",
                        collapsible: true,
                        fields: [],
                        legend: "Inner group fields",
                        getBaseConfigFunction: I
                    }) : H.modulesByName[M].container
                };
            this.options.layerOptions.grouper = {
                baseConfigFunction: I
            }
        },
        render: function () {
            WireIt.WiringEditor.superclass.render.call(this);
            this.layer = new WireIt.Layer(this.options.layerOptions);
            this.layer.eventChanged.subscribe(this.onLayerChanged, this, true);
            this.renderModulesAccordion();
            this.buildModulesList()
        },
        renderModulesAccordion: function () {
            if (!D.get("modulesAccordionView")) {
                D.get("left").appendChild(WireIt.cn("ul", {
                    id: "modulesAccordionView"
                }));
                var G = WireIt.cn("li");
                G.appendChild(WireIt.cn("h2", null, null, "Main"));
                var I = WireIt.cn("div");
                I.appendChild(WireIt.cn("div", {
                    id: "module-category-main"
                }));
                G.appendChild(I);
                D.get("modulesAccordionView").appendChild(G)
            }
            this.modulesAccordionView = new YAHOO.widget.AccordionView("modulesAccordionView", this.options.modulesAccordionViewParams);
            for (var H = 1, J = this.modulesAccordionView.getPanels().length; H < J; H++) {
                this.modulesAccordionView.openPanel(H)
            }
        },
        buildModulesList: function () {
            var G = this.modules;
            for (var H = 0; H < G.length; H++) {
                this.addModuleToList(G[H])
            }
            if (!this.ddTarget) {
                this.ddTarget = new YAHOO.util.DDTarget(this.layer.el, "module");
                this.ddTarget._layer = this.layer
            }
        },
        addModuleToList: function (H) {
            try {
                var L = WireIt.cn("div", {
                    className: "WiringEditor-module"
                });
                if (H.description) {
                    L.title = H.description
                }
                if (H.container.icon) {
                    L.appendChild(WireIt.cn("img", {
                        src: H.container.icon
                    }))
                }
                L.appendChild(WireIt.cn("span", null, null, H.name));
                var K = new WireIt.ModuleProxy(L, this);
                K._module = H;
                var J = H.category || "main";
                var I = D.get("module-category-" + J);
                if (!I) {
                    this.modulesAccordionView.addPanel({
                        label: J,
                        content: "<div id='module-category-" + J + "'></div>"
                    });
                    this.modulesAccordionView.openPanel(this.modulesAccordionView._panels.length - 1);
                    I = D.get("module-category-" + J)
                }
                I.appendChild(L)
            } catch (G) {
                console.log(G)
            }
        },
        getCurrentGrouper: function (G) {
            return G.currentGrouper
        },
        addModule: function (J, M) {
            try {
                var L = J.container;
                L.position = M;
                L.title = J.name;
                var H = this;
                L.getGrouper = function () {
                    return H.getCurrentGrouper(H)
                };
                var G = this.layer.addContainer(L);
                var K = J.category || "main";
                D.addClass(G.el, "WiringEditor-module-category-" + K.replace(/ /g, "-"));
                D.addClass(G.el, "WiringEditor-module-" + J.name.replace(/ /g, "-"))
            } catch (I) {
                this.alert("Error Layer.addContainer: " + I.message);
                if (window.console && YAHOO.lang.isFunction(console.log)) {
                    console.log(I)
                }
            }
        },
        save: function () {
            var G = this.getValue();
            if (G.name === "") {
                this.alert("Please choose a name");
                return
            }
            this.tempSavedWiring = {
                name: G.name,
                working: G.working,
                language: this.options.languageName
            };
            this.adapter.saveWiring(this.tempSavedWiring, {
                success: this.saveModuleSuccess,
                failure: this.saveModuleFailure,
                scope: this
            })
        },
        saveModuleSuccess: function (G) {
            this.markSaved();
            this.alert("Saved !")
        },
        saveModuleFailure: function (G) {
            this.alert("Unable to save the wiring : " + G)
        },
        onNew: function () {
            if (!this.isSaved()) {
                if (!confirm("Warning: Your work is not saved yet ! Press ok to continue anyway.")) {
                    return
                }
            }
            this.preventLayerChangedEvent = true;
            this.layer.clear();
            this.propertiesForm.clear(false);
            this.markSaved();
            this.preventLayerChangedEvent = false
        },
        onDelete: function () {
            if (confirm("Are you sure you want to delete this wiring ?")) {
                var G = this.getValue();
                this.adapter.deleteWiring({
                    name: G.name,
                    language: this.options.languageName
                }, {
                    success: function (H) {
                        this.onNew();
                        this.alert("Deleted !")
                    },
                    failure: function (H) {
                        this.alert("Unable to delete wiring: " + H)
                    },
                    scope: this
                })
            }
        },
        renderLoadPanel: function () {
            if (!this.loadPanel) {
                this.loadPanel = new E.Panel("WiringEditor-loadPanel", {
                    fixedcenter: true,
                    draggable: true,
                    width: "500px",
                    visible: false,
                    modal: true
                });
                this.loadPanel.setHeader("Select the wiring to load");
                this.loadPanel.setBody("Filter: <input type='text' id='loadFilter' /><div id='loadPanelBody'></div>");
                this.loadPanel.render(document.body);
                B.onAvailable("loadFilter", function () {
                    B.addListener("loadFilter", "keyup", this.inputFilterTimer, this, true)
                }, this, true)
            }
        },
        inputFilterTimer: function () {
            if (this.inputFilterTimeout) {
                clearTimeout(this.inputFilterTimeout);
                this.inputFilterTimeout = null
            }
            var G = this;
            this.inputFilterTimeout = setTimeout(function () {
                G.updateLoadPanelList(D.get("loadFilter").value)
            }, 500)
        },
        updateLoadPanelList: function (I) {
            var K = WireIt.cn("ul");
            if (F.isArray(this.pipes)) {
                for (var H = 0; H < this.pipes.length; H++) {
                    var G = this.pipes[H];
                    this.pipesByName[G.name] = G;
                    if (!I || I === "" || G.name.match(new RegExp(I, "i"))) {
                        K.appendChild(WireIt.cn("li", null, {
                            cursor: "pointer"
                        }, G.name))
                    }
                }
            }
            var J = D.get("loadPanelBody");
            YAHOO.util.Event.purgeElement(J, true);
            J.innerHTML = "";
            J.appendChild(K);
            B.addListener(K, "click", function (M, L) {
                this.loadPipe(B.getTarget(M).innerHTML)
            }, this, true)
        },
        load: function () {
            this.adapter.listWirings({
                language: this.options.languageName
            }, {
                success: function (G) {
                    this.onLoadSuccess(G)
                },
                failure: function (G) {
                    this.alert("Unable to load the wirings: " + G)
                },
                scope: this
            })
        },
        onLoadSuccess: function (K) {
            this.pipes = K;
            this.pipesByName = {};
            this.renderLoadPanel();
            this.updateLoadPanelList();
            if (!this.afterFirstRun) {
                var I = window.location.search.substr(1).split("&");
                var J = {};
                for (var H = 0; H < I.length; H++) {
                    var G = I[H].split("=");
                    J[G[0]] = window.decodeURIComponent(G[1])
                }
                this.afterFirstRun = true;
                if (J.autoload) {
                    this.loadPipe(J.autoload);
                    return
                }
            }
            this.loadPanel.show()
        },
        getPipeByName: function (H) {
            var J = this.pipes.length,
                G;
            for (var I = 0; I < J; I++) {
                if (this.pipes[I].name == H) {
                    return this.pipes[I].working
                }
            }
            return null
        },
        loadPipe: function (I) {
            if (!this.isSaved()) {
                if (!confirm("Warning: Your work is not saved yet ! Press ok to continue anyway.")) {
                    return
                }
            }
            try {
                this.preventLayerChangedEvent = true;
                if (this.loadPanel) {
                    this.loadPanel.hide()
                }
                var M = this.getPipeByName(I),
                    K;
                if (!M) {
                    this.alert("The wiring '" + I + "' was not found.");
                    return
                }
                this.layer.clear();
                this.propertiesForm.setValue(M.properties, false);
                if (F.isArray(M.modules)) {
                    for (K = 0; K < M.modules.length; K++) {
                        var G = M.modules[K];
                        if (this.modulesByName[G.name]) {
                            var L = this.modulesByName[G.name].container;
                            YAHOO.lang.augmentObject(G.config, L);
                            G.config.title = G.name;
                            var H = this.layer.addContainer(G.config);
                            D.addClass(H.el, "WiringEditor-module-" + G.name);
                            H.setValue(G.value)
                        } else {
                            throw new Error("WiringEditor: module '" + G.name + "' not found !")
                        }
                    }
                    if (F.isArray(M.wires)) {
                        for (K = 0; K < M.wires.length; K++) {
                            this.layer.addWire(M.wires[K])
                        }
                    }
                }
                this.markSaved();
                this.preventLayerChangedEvent = false
            } catch (J) {
                this.alert(J);
                if (window.console && YAHOO.lang.isFunction(console.log)) {
                    console.log(J)
                }
            }
        },
        onLayerChanged: function () {
            if (!this.preventLayerChangedEvent) {
                this.markUnsaved()
            }
        },
        getValue: function () {
            var H;
            var I = {
                modules: [],
                wires: [],
                properties: null
            };
            for (H = 0; H < this.layer.containers.length; H++) {
                I.modules.push({
                    name: this.layer.containers[H].title,
                    value: this.layer.containers[H].getValue(),
                    config: this.layer.containers[H].getConfig()
                })
            }
            for (H = 0; H < this.layer.wires.length; H++) {
                var J = this.layer.wires[H];
                var G = J.getConfig();
                G.src = {
                    moduleId: WireIt.indexOf(J.terminal1.container, this.layer.containers),
                    terminal: J.terminal1.name
                };
                G.tgt = {
                    moduleId: WireIt.indexOf(J.terminal2.container, this.layer.containers),
                    terminal: J.terminal2.name
                };
                I.wires.push(G)
            }
            I.properties = this.propertiesForm.getValue();
            return {
                name: I.properties.name,
                working: I
            }
        }
    });
    WireIt.WiringEditor.adapters = {}
})();