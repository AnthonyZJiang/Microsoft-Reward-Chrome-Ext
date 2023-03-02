if (typeof DynScopesDropdown !== 'undefined') {
    DynScopesDropdown.init("", "", "marketplace");
};
var sb_de = _d.documentElement;
_w["IDBbOv"] = true;
_w["IDPTit"] = null;;
var SmartEvent;
(function(n) {
    function o(n, i, r, u) {
        u === void 0 && (u = !0);
        sj_be(n, i, r);
        t.push({
            el: n,
            evt: i,
            h: r,
            baj: u
        })
    }

    function s(n, i, r, u, f) {
        r === void 0 && (r = !0);
        sj_evt.bind(n, i, u, f);
        t.push({
            evt: n,
            h: i,
            baj: r
        })
    }

    function u() {
        e(!1)
    }

    function f() {
        e(!0);
        sj_ue(_w, i, f);
        sj_evt.unbind(r, u)
    }

    function e(n) {
        for (var i, u, f = [], r = 0; r < t.length; ++r) i = t[r], n || i.baj ? (u = i.el, u ? sj_ue(u, i.evt, i.h) : sj_evt.unbind(i.evt, i.h)) : f.push(i);
        t = f
    }
    var i = "unload",
        r = "ajax.unload",
        t = [];
    n.bind = o;
    n.bindc = s;
    sj_be(_w, i, f);
    sj_evt.bind(r, u)
})(SmartEvent || (SmartEvent = {}));
var SharedAnimation;
(function(n) {
    function v() {
        var n, t;
        if (!("transition" in _d.documentElement.style))
            for (n in o) t = "-" + n + "-", t + "transition" in _d.documentElement.style && (u = o[n])
    }

    function y() {
        var i, n;
        if (!("transform" in _d.documentElement.style))
            for (i in o) n = "-" + i + "-transform", n in _d.documentElement.style && (t = n)
    }

    function p() {
        v();
        y()
    }

    function s(n) {
        if (n.AnimationKey) {
            var t = l[n.AnimationKey];
            t.endTime = Date.now();
            _w.Log2 && Log2.LogEvent("ClientInst", {
                T: "AnimationTiming",
                startTime: t.startTime,
                endTime: t.endTime,
                AnimationName: t.animationName
            }, null, null, null, null, null, null)
        }
    }

    function h(n, t) {
        e += 1;
        n.AnimationKey = e;
        l[e] = {
            startTime: Date.now(),
            endTime: -1,
            animationName: t
        }
    }

    function w(n) {
        var f, r;
        n && n.children && n.children.length != 0 && (f = _w.innerHeight, n.style[t] = "translateY(" + f + "px)", i(n, "b_slideListUp"), Lib.CssClass.remove(n, "b_slideListHide"), n.style[t] = "", r = n.children[n.children.length - 1], r && (sj_be(r, u, function(i) {
            var u, f;
            if (i.target === r && i.propertyName === t)
                for (s(n), u = 0; u < n.children.length; u++) f = n.children[u], f.style[t] = ""
        }), h(n, "cascadeListOld")))
    }

    function b(n, r) {
        if (n && n.children && n.children.length != 0) n.style[t] = "translateY(200px)", i(n, "b_slideListUp"), Lib.CssClass.remove(n, "b_slideListHide"), n.style[t] = "", r && i(n, "b_slideListUp")
    }

    function k(n) {
        n && f(n, "b_slideTranslate", !1, [t, t])
    }

    function d(n) {
        n && f(n, "b_slide", !0, ["height", "height"])
    }

    function g(n) {
        n && f(n, "b_fade", !1, ["opacity", "opacity"])
    }

    function nt(n) {
        n && f(n, "b_fadeUp", !1, [t, t])
    }

    function tt(n) {
        if (n) {
            for (var t = 0; t < c.length; t++) Lib.CssClass.remove(n, c[t]);
            i(n, r);
            sj_evt.fire("transitionDone", n);
            h(n, "Hide");
            s(n)
        }
    }

    function it(n) {
        var t = n.offsetTop
    }

    function i(n, t) {
        it(n);
        Lib.CssClass.toggle(n, t)
    }

    function rt(n) {
        var t = n.clientHeight;
        t == 0 && Lib.CssClass.contains(n, r) && (Lib.CssClass.remove(n, r), t = n.clientHeight, Lib.CssClass.add(n, r));
        t > 0 && (n.style.height = t + "px")
    }

    function a(n, t, i, r) {
        if (n.target == t) {
            var f = Lib.CssClass.contains(t, "b_hide") ? i[1] : i[0];
            n.propertyName === f && (s(t), Lib.CssClass.remove(t, r), n.propertyName === "height" && t.style.removeProperty("height"), sj_ue(t, u, a), sj_evt.fire("transitionDone", t))
        }
    }

    function f(n, t, f, e) {
        f && rt(n);
        i(n, t);
        i(n, r);
        sj_be(n, u, function(i) {
            a(i, n, e, t)
        });
        h(n, t)
    }
    var r = "b_hide",
        c = ["b_slideListUp", "b_slide", "b_fade", "b_fadeUp"],
        l = {},
        e = 0,
        u = "transitionend",
        t = "transform",
        o = {
            o: "oTransitionEnd",
            moz: "transitionend",
            webkit: "webkitTransitionEnd"
        };
    n.cascadeListOld = w;
    n.cascadeList = b;
    n.toggleSlideTranslate = k;
    n.toggleSlide = d;
    n.toggleFade = g;
    n.toggleFadeUp = nt;
    n.toggleHide = tt;
    p()
})(SharedAnimation || (SharedAnimation = {}));

function sa_cl(n, t, i) {
    if (n && t) {
        var r = n.className;
        i ? r.indexOf(t) == -1 && (r = r.concat(" ", t)) : r = r.replace(t, "");
        n.className = r
    }
};
var TriviaOverlayRefresh;
(function(n) {
    function b(n, i) {
        return (i === void 0 && (i = !1), t = _ge("btOverlay"), f = n, h = i, !t) ? !1 : (g(), !0)
    }

    function k(n) {
        r();
        n ? (t.style.bottom = p, y(t), setTimeout(function() {
            var n = h ? "auto" : "0";
            i(t, {
                bottom: n
            }, "1s")
        }, 50)) : y(t);
        setTimeout(function() {
            sj_evt.fire("onPopTR")
        }, 500);
        typeof QAOverlayBootstrap == "undefined" && l()
    }

    function c() {
        var t = _ge("rqMinMaxBtn"),
            n = _ge("overlayPanel");
        t.classList.contains("minmizeIcon") ? (t.classList.remove("minmizeIcon"), t.classList.add("maximizeIcon"), t.setAttribute("aria-expanded", "false"), u = o(n), n.style.transition = "", n.style.height = u + "px", setTimeout(function() {
            i(n, {
                height: "45px"
            }, "1s");
            i(n, {
                "min-height": "45px"
            }, "1s");
            n.style.paddingBottom = "0"
        }, 50)) : (t.classList.remove("maximizeIcon"), t.classList.add("minmizeIcon"), t.setAttribute("aria-expanded", "true"), i(n, {
            height: "100%"
        }, "1s"), n.style.paddingBottom = "18px", n.style.minHeight = null)
    }

    function d(n) {
        n.key === " " && c()
    }

    function l() {
        var i = _ge(s);
        f ? (i.style.position = "fixed", i.style.bottom = "0") : (i.style.paddingBottom = o(t) + n.overlayMaxPaddingBottom + "px", i.style.width = tt(t) + "px")
    }

    function g() {
        sj_be(_w, "resize", r);
        sj_be(_w, "scroll", r);
        sj_be(_ge("rqCloseBtn"), "click", e)
    }

    function a() {
        sj_ue(_w, "resize", r);
        sj_ue(_w, "scroll", r);
        sj_ue(_ge("rqCloseBtn"), "click", e)
    }

    function e() {
        var n = 500,
            r = -1 * o(t) + "px";
        i(t, {
            bottom: r
        }, n + "ms");
        setTimeout(function() {
            v("overlayWrapper");
            a()
        }, n + 50)
    }

    function r() {
        t.style.left = (-1 * nt()).toString();
        var n = _d.body.scrollWidth,
            i = f ? 0 : w,
            r = n > i ? n : i;
        t.style.width = r.toString()
    }

    function v(n) {
        var t = _ge(n);
        t && t.parentNode && t.parentNode.removeChild(t)
    }

    function nt() {
        var n = 0;
        return typeof _w.pageXOffset == "number" ? n = _w.pageXOffset : sj_b && sj_b.scrollLeft ? n = sj_b.scrollLeft : sb_de && sb_de.scrollLeft && (n = sb_de.scrollLeft), n
    }

    function tt(n) {
        return n.getBoundingClientRect().width
    }

    function o(n) {
        return n.getBoundingClientRect().height
    }

    function y(n) {
        n !== null && n.classList.remove("b_hide")
    }

    function i(n, t, i) {
        n.style.transition = "all " + i;
        setTimeout(function() {
            Object.keys(t).forEach(function(i) {
                return n.style[i] = t[i]
            })
        }, 50)
    }
    var p = "-500px",
        w = 1024,
        s, u, t, f, h;
    n.overlayMaxPaddingBottom = 110;
    s = "overlayWrapper";
    u = 0;
    n.InitializeOverlay = b;
    n.ShowContainer = k;
    n.ToggleMinMaxOverlay = c;
    n.ToggleMinMaxOverlayForKB = d;
    n.adjustDynamicContainerPadding = l;
    n.unbindEvents = a;
    n.doneQuiz = e;
    n.removeFromDom = v;
    n.customAnimation = i
})(TriviaOverlayRefresh || (TriviaOverlayRefresh = {}));
var AriaTelemetry;
(function(n) {
    function o(n) {
        return t.hasOwnProperty(n) || (t[n] = new e(n, i)), t[n]
    }

    function s() {
        u = setInterval(c, 150)
    }

    function r() {
        sj_ue(window, "beforeunload", r);
        sj_evt.unbind("unload", r);
        try {
            AWT.flush(function() {})
        } catch (n) {}
    }
    var f, e;
    n.getLogger = o;
    n.autoInitialize = s,
        function(n) {
            n[n.NotSet = 0] = "NotSet";
            n[n.DistinguishedName = 1] = "DistinguishedName";
            n[n.GenericData = 2] = "GenericData";
            n[n.IPV4Address = 3] = "IPV4Address";
            n[n.IPv6Address = 4] = "IPv6Address";
            n[n.MailSubject = 5] = "MailSubject";
            n[n.PhoneNumber = 6] = "PhoneNumber";
            n[n.QueryString = 7] = "QueryString";
            n[n.SipAddress = 8] = "SipAddress";
            n[n.SmtpAddress = 9] = "SmtpAddress";
            n[n.Identity = 10] = "Identity";
            n[n.Uri = 11] = "Uri";
            n[n.Fqdn = 12] = "Fqdn";
            n[n.IPV4AddressLegacy = 13] = "IPV4AddressLegacy"
        }(f = n.PIIKind || (n.PIIKind = {}));
    var t = {},
        i = !1,
        u = 0,
        h = function() {
            typeof sj_evt != "undefined" && sj_evt.bind("OnScriptLoad:AriaTelemetry", function() {
                var n, u, f;
                if (!i) {
                    for (i = !0, n = 0, u = Object.getOwnPropertyNames(t); n < u.length; n++) f = u[n], t[f].init();
                    sj_be(window, "beforeunload", r, !1);
                    sj_evt.bind("unload", r, !1)
                }
            }, !0, null, !0)
        },
        c = function() {
            if (i) {
                u > 0 && clearInterval(u);
                return
            }
            typeof sj_evt != "undefined" && typeof AWTPiiKind != "undefined" && sj_evt.fire("OnScriptLoad:AriaTelemetry")
        };
    e = function() {
        function n(n, t) {
            this.buf = [];
            this.initialized = !1;
            this.ariaTenantToken = n;
            t && this.init()
        }
        return n.prototype.logEvent = function(n) {
            n.timestamp = (new Date).getTime();
            this.initialized ? AWT.logEvent(this.getEventData(n)) : this.buf.push(n)
        }, n.prototype.flush = function() {
            if (this.initialized) try {
                AWT.flush(function() {})
            } catch (n) {}
        }, n.prototype.init = function() {
            var n, t, r;
            if (!this.initialized) {
                this.initialized = !0;
                try {
                    AWT.initialize(this.ariaTenantToken)
                } catch (i) {
                    if (i !== "Already Initialized") throw i;
                }
                if (this.buf != null && this.buf.length > 0) {
                    for (n = 0, t = this.buf; n < t.length; n++) r = t[n], AWT.logEvent(this.getEventData(r));
                    this.buf = []
                }
            }
        }, n.prototype.getEventData = function(n) {
            var s = n.eventType,
                h = n.name,
                c = n.timestamp,
                i = n.properties,
                o = {},
                l = {
                    name: h,
                    properties: o,
                    type: s,
                    tenantToken: this.ariaTenantToken,
                    timestamp: c
                },
                t, r, u, e;
            if (i != null)
                for (t = 0, r = Object.getOwnPropertyNames(i); t < r.length; t++) u = r[t], e = i[u], o[u] = {
                    value: e.value,
                    pii: AWTPiiKind[f[e.pii]]
                };
            return l
        }, n
    }();
    h()
})(AriaTelemetry || (AriaTelemetry = {}));
var BingQAWebTelemetry, bingQATel;
(function(n) {
    var t = function() {
        function n() {}
        return n.init = function(t, i) {
            t != null && t.cfg != null && (n.ctx = t, n.edgeRef = t.eref, n.quizId = i, n.enabled && !n.initialized && (n.initialized = !0, n.ariaLogger = AriaTelemetry.getLogger(t.cfg.AriaTenantToken)))
        }, n.logValue = function(t, i) {
            var f, e, o, s;
            if (n.enabled && n.ariaLogger != null) {
                var r = n.ctx,
                    h = r.cfg,
                    c = r.ig,
                    l = r.sid,
                    a = r.tid,
                    v = r.muid,
                    y = r.f,
                    p = r.mkt,
                    w = r.b,
                    b = r.dvc,
                    u = {
                        eventType: "Client_Events",
                        name: n.bingQASourceName || "",
                        properties: {
                            ENV: {
                                value: h.Environment || ""
                            },
                            IG: {
                                value: c || ""
                            },
                            SID: {
                                value: l || ""
                            },
                            TID: {
                                value: a || ""
                            },
                            MUID: {
                                value: v || ""
                            },
                            F: {
                                value: y || ""
                            },
                            MKT: {
                                value: p || ""
                            },
                            B: {
                                value: w || ""
                            },
                            Dvc: {
                                value: b || ""
                            },
                            qid: {
                                value: n.quizId || ""
                            }
                        }
                    };
                if (u.properties.Action = {
                        value: t
                    }, u.properties.EdgeRef = {
                        value: n.edgeRef
                    }, i != null)
                    for (f = 0, e = Object.getOwnPropertyNames(i); f < e.length; f++) o = e[f], s = i[o], u.properties[o] = {
                        value: s != null ? s : ""
                    };
                n.ariaLogger.logEvent(u)
            }
        }, n.bingQASourceName = "BTOverlayCI", n.ariaLogger = null, n.enabled = !0, n.initialized = !1, n
    }();
    n.WebTelemetry = t
})(BingQAWebTelemetry || (BingQAWebTelemetry = {}));
bingQATel = BingQAWebTelemetry.WebTelemetry;
BingQAWebTelemetry.WebTelemetry.init({
    "cfg": {
        "Environment": "PROD",
        "AriaTenantToken": "d6213f32dcc240adbad0e9eeebe4d08b-cef18e29-a3c3-4bb9-a4bc-9cc68899b07f-7530"
    },
    "ig": "7DDC39D651E4448ABA9494604282E0E2",
    "sid": "24F17EE0EC9661D20F6C6C26ED3E60A0",
    "tid": "63fe0aedfae64db6b24413bbc4d1f2d7",
    "muid": "3CFD5793AF5F6B8736004522AE746A9D",
    "f": "ML12JG",
    "mkt": "ES-ES",
    "b": "Chrome",
    "eref": "Ref A: F11357D5E49B4B619B369935A817DBD0 Ref B: MAD30EDGE1005 Ref C: 2023-02-28T14:08:45Z",
    "dvc": "Desktop"
}, "REWARDSQUIZ_ESES_MicrosoftRewardsQuizCB_20230228");;
var _w = _w || {};
_w.rewardsQuizRenderInfo = {
        "offerId": "Gamification_DailySet_ESES_20230228_Child2",
        "quizId": "REWARDSQUIZ_ESES_MicrosoftRewardsQuizCB_20230228",
        "quizCategory": "Rewards",
        "IsCurrentQuestionCompleted": false,
        "quizRenderSummaryPage": false,
        "resetQuiz": true,
        "userClickedOnHint": false,
        "isDemoEnabled": true,
        "correctAnswer": "242",
        "isMultiChoiceQuizType": false,
        "isPutInOrderQuizType": false,
        "isListicleQuizType": true,
        "isWOTQuizType": false,
        "currentQuestionNumber": 1,
        "maxQuestions": 3,
        "resetTrackingCounters": false,
        