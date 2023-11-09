var $t = new Intl.Collator(0, { numeric: 1 }).compare;
function al(e, t, n) {
  return e = e.split("."), t = t.split("."), $t(e[0], t[0]) || $t(e[1], t[1]) || (t[2] = t.slice(2).join("."), n = /[.-]/.test(e[2] = e.slice(2).join(".")), n == /[.-]/.test(t[2]) ? $t(e[2], t[2]) : n ? -1 : 1);
}
function Te(e, t, n) {
  return t.startsWith("http://") || t.startsWith("https://") ? n ? e : t : e + t;
}
function en(e) {
  if (e.startsWith("http")) {
    const { protocol: t, host: n } = new URL(e);
    return n.endsWith("hf.space") ? {
      ws_protocol: "wss",
      host: n,
      http_protocol: t
    } : {
      ws_protocol: t === "https:" ? "wss" : "ws",
      http_protocol: t,
      host: n
    };
  } else if (e.startsWith("file:"))
    return {
      ws_protocol: "ws",
      http_protocol: "http:",
      host: "lite.local"
      // Special fake hostname only used for this case. This matches the hostname allowed in `is_self_host()` in `js/wasm/network/host.ts`.
    };
  return {
    ws_protocol: "wss",
    http_protocol: "https:",
    host: e
  };
}
const Wi = /^[^\/]*\/[^\/]*$/, gr = /.*hf\.space\/{0,1}$/;
async function yr(e, t) {
  const n = {};
  t && (n.Authorization = `Bearer ${t}`);
  const l = e.trim();
  if (Wi.test(l))
    try {
      const i = await fetch(
        `https://huggingface.co/api/spaces/${l}/host`,
        { headers: n }
      );
      if (i.status !== 200)
        throw new Error("Space metadata could not be loaded.");
      const r = (await i.json()).host;
      return {
        space_id: e,
        ...en(r)
      };
    } catch (i) {
      throw new Error("Space metadata could not be loaded." + i.message);
    }
  if (gr.test(l)) {
    const { ws_protocol: i, http_protocol: r, host: a } = en(l);
    return {
      space_id: a.replace(".hf.space", ""),
      ws_protocol: i,
      http_protocol: r,
      host: a
    };
  }
  return {
    space_id: !1,
    ...en(l)
  };
}
function Jr(e) {
  let t = {};
  return e.forEach(({ api_name: n }, l) => {
    n && (t[n] = l);
  }), t;
}
const Nr = /^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function sl(e) {
  try {
    const n = (await fetch(
      `https://huggingface.co/api/spaces/${e}/discussions`,
      {
        method: "HEAD"
      }
    )).headers.get("x-error-message");
    return !(n && Nr.test(n));
  } catch {
    return !1;
  }
}
function ze(e, t, n) {
  if (e == null)
    return null;
  if (Array.isArray(e)) {
    const l = [];
    for (const i of e)
      i == null ? l.push(null) : l.push(ze(i, t, n));
    return l;
  }
  return e.is_stream ? n == null ? new tt({
    ...e,
    url: t + "/stream/" + e.path
  }) : new tt({
    ...e,
    url: "/proxy=" + n + "stream/" + e.path
  }) : new tt({
    ...e,
    url: Gr(e.path, t, n)
  });
}
function Sr(e) {
  try {
    const t = new URL(e);
    return t.protocol === "http:" || t.protocol === "https:";
  } catch {
    return !1;
  }
}
function Gr(e, t, n) {
  return e == null ? n ? `/proxy=${n}file=` : `${t}/file=` : Sr(e) ? e : n ? `/proxy=${n}file=${e}` : `${t}/file=${e}`;
}
async function Xr(e, t, n = Tr) {
  let l = (Array.isArray(e) ? e : [e]).map(
    (i) => i.blob
  );
  return await Promise.all(
    await n(t, l).then(
      async (i) => {
        if (i.error)
          throw new Error(i.error);
        return i.files ? i.files.map((r, a) => {
          const s = new tt({ ...e[a], path: r });
          return ze(s, t, null);
        }) : [];
      }
    )
  );
}
async function Er(e, t) {
  return e.map(
    (n, l) => new tt({
      path: n.name,
      orig_name: n.name,
      blob: n,
      size: n.size,
      mime_type: n.type,
      is_stream: t
    })
  );
}
class tt {
  constructor({
    path: t,
    url: n,
    orig_name: l,
    size: i,
    blob: r,
    is_stream: a,
    mime_type: s,
    alt_text: o
  }) {
    this.path = t, this.url = n, this.orig_name = l, this.size = i, this.blob = n ? void 0 : r, this.is_stream = a, this.mime_type = s, this.alt_text = o;
  }
}
const kr = "This application is too busy. Keep trying!", bt = "Connection errored out.";
let _i;
function vr(e, t) {
  return { post_data: n, upload_files: l, client: i, handle_blob: r };
  async function n(a, s, o) {
    const c = { "Content-Type": "application/json" };
    o && (c.Authorization = `Bearer ${o}`);
    try {
      var d = await e(a, {
        method: "POST",
        body: JSON.stringify(s),
        headers: c
      });
    } catch {
      return [{ error: bt }, 500];
    }
    return [await d.json(), d.status];
  }
  async function l(a, s, o) {
    const c = {};
    o && (c.Authorization = `Bearer ${o}`);
    const d = 1e3, u = [];
    for (let f = 0; f < s.length; f += d) {
      const V = s.slice(f, f + d), U = new FormData();
      V.forEach((b) => {
        U.append("files", b);
      });
      try {
        var h = await e(`${a}/upload`, {
          method: "POST",
          body: U,
          headers: c
        });
      } catch {
        return { error: bt };
      }
      const m = await h.json();
      u.push(...m);
    }
    return { files: u };
  }
  async function i(a, s = { normalise_files: !0 }) {
    return new Promise(async (o) => {
      const { status_callback: c, hf_token: d, normalise_files: u } = s, h = {
        predict: g,
        submit: ie,
        view_api: H,
        component_server: E
      }, f = u ?? !0;
      if ((typeof window > "u" || !("WebSocket" in window)) && !global.Websocket) {
        const F = await import("./wrapper-98f94c21-f7f71f53.js");
        _i = (await import("./__vite-browser-external-2447137e.js")).Blob, global.WebSocket = F.WebSocket;
      }
      const { ws_protocol: V, http_protocol: U, host: m, space_id: b } = await yr(a, d), _ = Math.random().toString(36).substring(2), p = {};
      let B, Z = {}, J = !1;
      d && b && (J = await Ir(b, d));
      async function w(F) {
        if (B = F, Z = Jr((F == null ? void 0 : F.dependencies) || []), B.auth_required)
          return {
            config: B,
            ...h
          };
        try {
          x = await H(B);
        } catch (y) {
          console.error(`Could not get api details: ${y.message}`);
        }
        return {
          config: B,
          ...h
        };
      }
      let x;
      async function D(F) {
        if (c && c(F), F.status === "running")
          try {
            B = await ul(
              e,
              `${U}//${m}`,
              d
            );
            const y = await w(B);
            o(y);
          } catch (y) {
            console.error(y), c && c({
              status: "error",
              message: "Could not load this space.",
              load_status: "error",
              detail: "NOT_FOUND"
            });
          }
      }
      try {
        B = await ul(
          e,
          `${U}//${m}`,
          d
        );
        const F = await w(B);
        o(F);
      } catch (F) {
        console.error(F), b ? Jn(
          b,
          Wi.test(b) ? "space_name" : "subdomain",
          D
        ) : c && c({
          status: "error",
          message: "Could not load this space.",
          load_status: "error",
          detail: "NOT_FOUND"
        });
      }
      function g(F, y, Q) {
        let R = !1, I = !1, N;
        if (typeof F == "number")
          N = B.dependencies[F];
        else {
          const k = F.replace(/^\//, "");
          N = B.dependencies[Z[k]];
        }
        if (N.types.continuous)
          throw new Error(
            "Cannot call predict on this function as it may run forever. Use submit instead"
          );
        return new Promise((k, j) => {
          const S = ie(F, y, Q);
          let W;
          S.on("data", (ee) => {
            I && (S.destroy(), k(ee)), R = !0, W = ee;
          }).on("status", (ee) => {
            ee.stage === "error" && j(ee), ee.stage === "complete" && (I = !0, R && (S.destroy(), k(W)));
          });
        });
      }
      function ie(F, y, Q) {
        let R, I;
        if (typeof F == "number")
          R = F, I = x.unnamed_endpoints[R];
        else {
          const K = F.replace(/^\//, "");
          R = Z[K], I = x.named_endpoints[F.trim()];
        }
        if (typeof R != "number")
          throw new Error(
            "There is no endpoint matching that name of fn_index matching that number."
          );
        let N, k, j = B.protocol ?? "sse";
        const S = typeof F == "number" ? "/predict" : F;
        let W, ee = null, fe = !1;
        const Ft = {};
        let Ce = "";
        typeof window < "u" && (Ce = new URLSearchParams(window.location.search).toString()), r(
          `${U}//${Te(m, B.path, !0)}`,
          y,
          I,
          d
        ).then((K) => {
          if (W = { data: K || [], event_data: Q, fn_index: R }, Cr(R, B))
            A({
              type: "status",
              endpoint: S,
              stage: "pending",
              queue: !1,
              fn_index: R,
              time: /* @__PURE__ */ new Date()
            }), n(
              `${U}//${Te(m, B.path, !0)}/run${S.startsWith("/") ? S : `/${S}`}${Ce ? "?" + Ce : ""}`,
              {
                ...W,
                session_hash: _
              },
              d
            ).then(([O, q]) => {
              const Se = f ? tn(
                O.data,
                I,
                B.root,
                B.root_url
              ) : O.data;
              q == 200 ? (A({
                type: "data",
                endpoint: S,
                fn_index: R,
                data: Se,
                time: /* @__PURE__ */ new Date()
              }), A({
                type: "status",
                endpoint: S,
                fn_index: R,
                stage: "complete",
                eta: O.average_duration,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              })) : A({
                type: "status",
                stage: "error",
                endpoint: S,
                fn_index: R,
                message: O.error,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            }).catch((O) => {
              A({
                type: "status",
                stage: "error",
                message: O.message,
                endpoint: S,
                fn_index: R,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            });
          else if (j == "ws") {
            A({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: S,
              fn_index: R,
              time: /* @__PURE__ */ new Date()
            });
            let O = new URL(`${V}://${Te(
              m,
              B.path,
              !0
            )}
							/queue/join${Ce ? "?" + Ce : ""}`);
            J && O.searchParams.set("__sign", J), N = t(O), N.onclose = (q) => {
              q.wasClean || A({
                type: "status",
                stage: "error",
                broken: !0,
                message: bt,
                queue: !0,
                endpoint: S,
                fn_index: R,
                time: /* @__PURE__ */ new Date()
              });
            }, N.onmessage = function(q) {
              const Se = JSON.parse(q.data), { type: se, status: L, data: me } = hl(
                Se,
                p[R]
              );
              if (se === "update" && L && !fe)
                A({
                  type: "status",
                  endpoint: S,
                  fn_index: R,
                  time: /* @__PURE__ */ new Date(),
                  ...L
                }), L.stage === "error" && N.close();
              else if (se === "hash") {
                N.send(JSON.stringify({ fn_index: R, session_hash: _ }));
                return;
              } else
                se === "data" ? N.send(JSON.stringify({ ...W, session_hash: _ })) : se === "complete" ? fe = L : se === "log" ? A({
                  type: "log",
                  log: me.log,
                  level: me.level,
                  endpoint: S,
                  fn_index: R
                }) : se === "generating" && A({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...L,
                  stage: L == null ? void 0 : L.stage,
                  queue: !0,
                  endpoint: S,
                  fn_index: R
                });
              me && (A({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: f ? tn(
                  me.data,
                  I,
                  B.root,
                  B.root_url
                ) : me.data,
                endpoint: S,
                fn_index: R
              }), fe && (A({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...fe,
                stage: L == null ? void 0 : L.stage,
                queue: !0,
                endpoint: S,
                fn_index: R
              }), N.close()));
            }, al(B.version || "2.0.0", "3.6") < 0 && addEventListener(
              "open",
              () => N.send(JSON.stringify({ hash: _ }))
            );
          } else {
            A({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: S,
              fn_index: R,
              time: /* @__PURE__ */ new Date()
            });
            var ae = new URLSearchParams({
              fn_index: R.toString(),
              session_hash: _
            }).toString();
            let O = new URL(
              `${U}//${Te(
                m,
                B.path,
                !0
              )}/queue/join?${Ce ? Ce + "&" : ""}${ae}`
            );
            k = new EventSource(O), k.onmessage = async function(q) {
              const Se = JSON.parse(q.data), { type: se, status: L, data: me } = hl(
                Se,
                p[R]
              );
              if (se === "update" && L && !fe)
                A({
                  type: "status",
                  endpoint: S,
                  fn_index: R,
                  time: /* @__PURE__ */ new Date(),
                  ...L
                }), L.stage === "error" && k.close();
              else if (se === "data") {
                ee = Se.event_id;
                let [su, _r] = await n(
                  `${U}//${Te(
                    m,
                    B.path,
                    !0
                  )}/queue/data`,
                  {
                    ...W,
                    session_hash: _,
                    event_id: ee
                  },
                  d
                );
                _r !== 200 && (A({
                  type: "status",
                  stage: "error",
                  message: bt,
                  queue: !0,
                  endpoint: S,
                  fn_index: R,
                  time: /* @__PURE__ */ new Date()
                }), k.close());
              } else
                se === "complete" ? fe = L : se === "log" ? A({
                  type: "log",
                  log: me.log,
                  level: me.level,
                  endpoint: S,
                  fn_index: R
                }) : se === "generating" && A({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...L,
                  stage: L == null ? void 0 : L.stage,
                  queue: !0,
                  endpoint: S,
                  fn_index: R
                });
              me && (A({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: f ? tn(
                  me.data,
                  I,
                  B.root,
                  B.root_url
                ) : me.data,
                endpoint: S,
                fn_index: R
              }), fe && (A({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...fe,
                stage: L == null ? void 0 : L.stage,
                queue: !0,
                endpoint: S,
                fn_index: R
              }), k.close()));
            };
          }
        });
        function A(K) {
          const O = Ft[K.type] || [];
          O == null || O.forEach((q) => q(K));
        }
        function Lt(K, ae) {
          const O = Ft, q = O[K] || [];
          return O[K] = q, q == null || q.push(ae), { on: Lt, off: yt, cancel: Kt, destroy: qt };
        }
        function yt(K, ae) {
          const O = Ft;
          let q = O[K] || [];
          return q = q == null ? void 0 : q.filter((Se) => Se !== ae), O[K] = q, { on: Lt, off: yt, cancel: Kt, destroy: qt };
        }
        async function Kt() {
          const K = {
            stage: "complete",
            queue: !1,
            time: /* @__PURE__ */ new Date()
          };
          fe = K, A({
            ...K,
            type: "status",
            endpoint: S,
            fn_index: R
          });
          let ae = {};
          j === "ws" ? (N && N.readyState === 0 ? N.addEventListener("open", () => {
            N.close();
          }) : N.close(), ae = { fn_index: R, session_hash: _ }) : (k.close(), ae = { event_id: ee });
          try {
            await e(
              `${U}//${Te(
                m,
                B.path,
                !0
              )}/reset`,
              {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(ae)
              }
            );
          } catch {
            console.warn(
              "The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
            );
          }
        }
        function qt() {
          for (const K in Ft)
            Ft[K].forEach((ae) => {
              yt(K, ae);
            });
        }
        return {
          on: Lt,
          off: yt,
          cancel: Kt,
          destroy: qt
        };
      }
      async function E(F, y, Q) {
        var R;
        const I = { "Content-Type": "application/json" };
        d && (I.Authorization = `Bearer ${d}`);
        let N, k = B.components.find(
          (W) => W.id === F
        );
        (R = k == null ? void 0 : k.props) != null && R.root_url ? N = k.props.root_url : N = `${U}//${Te(
          m,
          B.path,
          !0
        )}/`;
        const j = await e(
          `${N}component_server/`,
          {
            method: "POST",
            body: JSON.stringify({
              data: Q,
              component_id: F,
              fn_name: y,
              session_hash: _
            }),
            headers: I
          }
        );
        if (!j.ok)
          throw new Error(
            "Could not connect to component server: " + j.statusText
          );
        return await j.json();
      }
      async function H(F) {
        if (x)
          return x;
        const y = { "Content-Type": "application/json" };
        d && (y.Authorization = `Bearer ${d}`);
        let Q;
        if (al(F.version || "2.0.0", "3.30") < 0 ? Q = await e(
          "https://gradio-space-api-fetcher-v2.hf.space/api",
          {
            method: "POST",
            body: JSON.stringify({
              serialize: !1,
              config: JSON.stringify(F)
            }),
            headers: y
          }
        ) : Q = await e(`${F.root}/info`, {
          headers: y
        }), !Q.ok)
          throw new Error(bt);
        let R = await Q.json();
        return "api" in R && (R = R.api), R.named_endpoints["/predict"] && !R.unnamed_endpoints[0] && (R.unnamed_endpoints[0] = R.named_endpoints["/predict"]), wr(R, F, Z);
      }
    });
  }
  async function r(a, s, o, c) {
    const d = await yn(
      s,
      void 0,
      [],
      !0,
      o
    );
    return Promise.all(
      d.map(async ({ path: u, blob: h, type: f }) => {
        if (h) {
          const V = (await l(a, [h], c)).files[0];
          return { path: u, file_url: V, type: f, name: h == null ? void 0 : h.name };
        }
        return { path: u, type: f };
      })
    ).then((u) => (u.forEach(({ path: h, file_url: f, type: V, name: U }) => {
      if (V === "Gallery")
        dl(s, f, h);
      else if (f) {
        const m = new tt({ path: f, orig_name: U });
        dl(s, m, h);
      }
    }), s));
  }
}
const { post_data: ou, upload_files: Tr, client: cu, handle_blob: du } = vr(
  fetch,
  (...e) => new WebSocket(...e)
);
function tn(e, t, n, l) {
  return e.map((i, r) => {
    var a, s, o, c;
    return ((s = (a = t == null ? void 0 : t.returns) == null ? void 0 : a[r]) == null ? void 0 : s.component) === "File" ? ze(i, n, l) : ((c = (o = t == null ? void 0 : t.returns) == null ? void 0 : o[r]) == null ? void 0 : c.component) === "Gallery" ? i.map((d) => Array.isArray(d) ? [ze(d[0], n, l), d[1]] : [ze(d, n, l), null]) : typeof i == "object" && i.path ? ze(i, n, l) : i;
  });
}
function ol(e, t, n, l) {
  switch (e.type) {
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "number":
      return "number";
  }
  if (n === "JSONSerializable" || n === "StringSerializable")
    return "any";
  if (n === "ListStringSerializable")
    return "string[]";
  if (t === "Image")
    return l === "parameter" ? "Blob | File | Buffer" : "string";
  if (n === "FileSerializable")
    return (e == null ? void 0 : e.type) === "array" ? l === "parameter" ? "(Blob | File | Buffer)[]" : "{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}[]" : l === "parameter" ? "Blob | File | Buffer" : "{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}";
  if (n === "GallerySerializable")
    return l === "parameter" ? "[(Blob | File | Buffer), (string | null)][]" : "[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]";
}
function cl(e, t) {
  return t === "GallerySerializable" ? "array of [file, label] tuples" : t === "ListStringSerializable" ? "array of strings" : t === "FileSerializable" ? "array of files or single file" : e.description;
}
function wr(e, t, n) {
  const l = {
    named_endpoints: {},
    unnamed_endpoints: {}
  };
  for (const i in e) {
    const r = e[i];
    for (const a in r) {
      const s = t.dependencies[a] ? a : n[a.replace("/", "")], o = r[a];
      l[i][a] = {}, l[i][a].parameters = {}, l[i][a].returns = {}, l[i][a].type = t.dependencies[s].types, l[i][a].parameters = o.parameters.map(
        ({ label: c, component: d, type: u, serializer: h }) => ({
          label: c,
          component: d,
          type: ol(u, d, h, "parameter"),
          description: cl(u, h)
        })
      ), l[i][a].returns = o.returns.map(
        ({ label: c, component: d, type: u, serializer: h }) => ({
          label: c,
          component: d,
          type: ol(u, d, h, "return"),
          description: cl(u, h)
        })
      );
    }
  }
  return l;
}
async function Ir(e, t) {
  try {
    return (await (await fetch(`https://huggingface.co/api/spaces/${e}/jwt`, {
      headers: {
        Authorization: `Bearer ${t}`
      }
    })).json()).token || !1;
  } catch (n) {
    return console.error(n), !1;
  }
}
function dl(e, t, n) {
  for (; n.length > 1; )
    e = e[n.shift()];
  e[n.shift()] = t;
}
async function yn(e, t = void 0, n = [], l = !1, i = void 0) {
  if (Array.isArray(e)) {
    let r = [];
    return await Promise.all(
      e.map(async (a, s) => {
        var o;
        let c = n.slice();
        c.push(s);
        const d = await yn(
          e[s],
          l ? ((o = i == null ? void 0 : i.parameters[s]) == null ? void 0 : o.component) || void 0 : t,
          c,
          !1,
          i
        );
        r = r.concat(d);
      })
    ), r;
  } else {
    if (globalThis.Buffer && e instanceof globalThis.Buffer)
      return [
        {
          path: n,
          blob: t === "Image" ? !1 : new _i([e]),
          type: t
        }
      ];
    if (typeof e == "object") {
      let r = [];
      for (let a in e)
        if (e.hasOwnProperty(a)) {
          let s = n.slice();
          s.push(a), r = r.concat(
            await yn(
              e[a],
              void 0,
              s,
              !1,
              i
            )
          );
        }
      return r;
    }
  }
  return [];
}
function Cr(e, t) {
  var n, l, i, r;
  return !(((l = (n = t == null ? void 0 : t.dependencies) == null ? void 0 : n[e]) == null ? void 0 : l.queue) === null ? t.enable_queue : (r = (i = t == null ? void 0 : t.dependencies) == null ? void 0 : i[e]) != null && r.queue) || !1;
}
async function ul(e, t, n) {
  const l = {};
  if (n && (l.Authorization = `Bearer ${n}`), typeof window < "u" && window.gradio_config && location.origin !== "http://localhost:9876" && !window.gradio_config.dev_mode) {
    const i = window.gradio_config.root, r = window.gradio_config;
    return r.root = Te(t, r.root, !1), { ...r, path: i };
  } else if (t) {
    let i = await e(`${t}/config`, {
      headers: l
    });
    if (i.status === 200) {
      const r = await i.json();
      return r.path = r.path ?? "", r.root = t, r;
    }
    throw new Error("Could not get config.");
  }
  throw new Error("No config or app endpoint found");
}
async function Jn(e, t, n) {
  let l = t === "subdomain" ? `https://huggingface.co/api/spaces/by-subdomain/${e}` : `https://huggingface.co/api/spaces/${e}`, i, r;
  try {
    if (i = await fetch(l), r = i.status, r !== 200)
      throw new Error();
    i = await i.json();
  } catch {
    n({
      status: "error",
      load_status: "error",
      message: "Could not get space status",
      detail: "NOT_FOUND"
    });
    return;
  }
  if (!i || r !== 200)
    return;
  const {
    runtime: { stage: a },
    id: s
  } = i;
  switch (a) {
    case "STOPPED":
    case "SLEEPING":
      n({
        status: "sleeping",
        load_status: "pending",
        message: "Space is asleep. Waking it up...",
        detail: a
      }), setTimeout(() => {
        Jn(e, t, n);
      }, 1e3);
      break;
    case "PAUSED":
      n({
        status: "paused",
        load_status: "error",
        message: "This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
        detail: a,
        discussions_enabled: await sl(s)
      });
      break;
    case "RUNNING":
    case "RUNNING_BUILDING":
      n({
        status: "running",
        load_status: "complete",
        message: "",
        detail: a
      });
      break;
    case "BUILDING":
      n({
        status: "building",
        load_status: "pending",
        message: "Space is building...",
        detail: a
      }), setTimeout(() => {
        Jn(e, t, n);
      }, 1e3);
      break;
    default:
      n({
        status: "space_error",
        load_status: "error",
        message: "This space is experiencing an issue.",
        detail: a,
        discussions_enabled: await sl(s)
      });
      break;
  }
}
function hl(e, t) {
  switch (e.msg) {
    case "send_data":
      return { type: "data" };
    case "send_hash":
      return { type: "hash" };
    case "queue_full":
      return {
        type: "update",
        status: {
          queue: !0,
          message: kr,
          stage: "error",
          code: e.code,
          success: e.success
        }
      };
    case "estimation":
      return {
        type: "update",
        status: {
          queue: !0,
          stage: t || "pending",
          code: e.code,
          size: e.queue_size,
          position: e.rank,
          eta: e.rank_eta,
          success: e.success
        }
      };
    case "progress":
      return {
        type: "update",
        status: {
          queue: !0,
          stage: "pending",
          code: e.code,
          progress_data: e.progress_data,
          success: e.success
        }
      };
    case "log":
      return { type: "log", data: e };
    case "process_generating":
      return {
        type: "generating",
        status: {
          queue: !0,
          message: e.success ? null : e.output.error,
          stage: e.success ? "generating" : "error",
          code: e.code,
          progress_data: e.progress_data,
          eta: e.average_duration
        },
        data: e.success ? e.output : null
      };
    case "process_completed":
      return "error" in e.output ? {
        type: "update",
        status: {
          queue: !0,
          message: e.output.error,
          stage: "error",
          code: e.code,
          success: e.success
        }
      } : {
        type: "complete",
        status: {
          queue: !0,
          message: e.success ? void 0 : e.output.error,
          stage: e.success ? "complete" : "error",
          code: e.code,
          progress_data: e.progress_data,
          eta: e.output.average_duration
        },
        data: e.success ? e.output : null
      };
    case "process_starts":
      return {
        type: "update",
        status: {
          queue: !0,
          stage: "pending",
          code: e.code,
          size: e.rank,
          position: 0,
          success: e.success
        }
      };
  }
  return { type: "none", status: { stage: "error", queue: !0 } };
}
const {
  SvelteComponent: Hr,
  assign: Yr,
  create_slot: xr,
  detach: Mr,
  element: Dr,
  get_all_dirty_from_scope: zr,
  get_slot_changes: Or,
  get_spread_update: Ar,
  init: Pr,
  insert: jr,
  safe_not_equal: Lr,
  set_dynamic_element_data: fl,
  set_style: re,
  toggle_class: Ge,
  transition_in: gi,
  transition_out: yi,
  update_slot_base: Kr
} = window.__gradio__svelte__internal;
function qr(e) {
  let t, n, l;
  const i = (
    /*#slots*/
    e[17].default
  ), r = xr(
    i,
    e,
    /*$$scope*/
    e[16],
    null
  );
  let a = [
    { "data-testid": (
      /*test_id*/
      e[7]
    ) },
    { id: (
      /*elem_id*/
      e[2]
    ) },
    {
      class: n = "block " + /*elem_classes*/
      e[3].join(" ") + " svelte-1t38q2d"
    }
  ], s = {};
  for (let o = 0; o < a.length; o += 1)
    s = Yr(s, a[o]);
  return {
    c() {
      t = Dr(
        /*tag*/
        e[14]
      ), r && r.c(), fl(
        /*tag*/
        e[14]
      )(t, s), Ge(
        t,
        "hidden",
        /*visible*/
        e[10] === !1
      ), Ge(
        t,
        "padded",
        /*padding*/
        e[6]
      ), Ge(
        t,
        "border_focus",
        /*border_mode*/
        e[5] === "focus"
      ), Ge(t, "hide-container", !/*explicit_call*/
      e[8] && !/*container*/
      e[9]), re(t, "height", typeof /*height*/
      e[0] == "number" ? (
        /*height*/
        e[0] + "px"
      ) : void 0), re(t, "width", typeof /*width*/
      e[1] == "number" ? `calc(min(${/*width*/
      e[1]}px, 100%))` : void 0), re(
        t,
        "border-style",
        /*variant*/
        e[4]
      ), re(
        t,
        "overflow",
        /*allow_overflow*/
        e[11] ? "visible" : "hidden"
      ), re(
        t,
        "flex-grow",
        /*scale*/
        e[12]
      ), re(t, "min-width", `calc(min(${/*min_width*/
      e[13]}px, 100%))`), re(t, "border-width", "var(--block-border-width)");
    },
    m(o, c) {
      jr(o, t, c), r && r.m(t, null), l = !0;
    },
    p(o, c) {
      r && r.p && (!l || c & /*$$scope*/
      65536) && Kr(
        r,
        i,
        o,
        /*$$scope*/
        o[16],
        l ? Or(
          i,
          /*$$scope*/
          o[16],
          c,
          null
        ) : zr(
          /*$$scope*/
          o[16]
        ),
        null
      ), fl(
        /*tag*/
        o[14]
      )(t, s = Ar(a, [
        (!l || c & /*test_id*/
        128) && { "data-testid": (
          /*test_id*/
          o[7]
        ) },
        (!l || c & /*elem_id*/
        4) && { id: (
          /*elem_id*/
          o[2]
        ) },
        (!l || c & /*elem_classes*/
        8 && n !== (n = "block " + /*elem_classes*/
        o[3].join(" ") + " svelte-1t38q2d")) && { class: n }
      ])), Ge(
        t,
        "hidden",
        /*visible*/
        o[10] === !1
      ), Ge(
        t,
        "padded",
        /*padding*/
        o[6]
      ), Ge(
        t,
        "border_focus",
        /*border_mode*/
        o[5] === "focus"
      ), Ge(t, "hide-container", !/*explicit_call*/
      o[8] && !/*container*/
      o[9]), c & /*height*/
      1 && re(t, "height", typeof /*height*/
      o[0] == "number" ? (
        /*height*/
        o[0] + "px"
      ) : void 0), c & /*width*/
      2 && re(t, "width", typeof /*width*/
      o[1] == "number" ? `calc(min(${/*width*/
      o[1]}px, 100%))` : void 0), c & /*variant*/
      16 && re(
        t,
        "border-style",
        /*variant*/
        o[4]
      ), c & /*allow_overflow*/
      2048 && re(
        t,
        "overflow",
        /*allow_overflow*/
        o[11] ? "visible" : "hidden"
      ), c & /*scale*/
      4096 && re(
        t,
        "flex-grow",
        /*scale*/
        o[12]
      ), c & /*min_width*/
      8192 && re(t, "min-width", `calc(min(${/*min_width*/
      o[13]}px, 100%))`);
    },
    i(o) {
      l || (gi(r, o), l = !0);
    },
    o(o) {
      yi(r, o), l = !1;
    },
    d(o) {
      o && Mr(t), r && r.d(o);
    }
  };
}
function $r(e) {
  let t, n = (
    /*tag*/
    e[14] && qr(e)
  );
  return {
    c() {
      n && n.c();
    },
    m(l, i) {
      n && n.m(l, i), t = !0;
    },
    p(l, [i]) {
      /*tag*/
      l[14] && n.p(l, i);
    },
    i(l) {
      t || (gi(n, l), t = !0);
    },
    o(l) {
      yi(n, l), t = !1;
    },
    d(l) {
      n && n.d(l);
    }
  };
}
function ea(e, t, n) {
  let { $$slots: l = {}, $$scope: i } = t, { height: r = void 0 } = t, { width: a = void 0 } = t, { elem_id: s = "" } = t, { elem_classes: o = [] } = t, { variant: c = "solid" } = t, { border_mode: d = "base" } = t, { padding: u = !0 } = t, { type: h = "normal" } = t, { test_id: f = void 0 } = t, { explicit_call: V = !1 } = t, { container: U = !0 } = t, { visible: m = !0 } = t, { allow_overflow: b = !0 } = t, { scale: _ = null } = t, { min_width: p = 0 } = t, B = h === "fieldset" ? "fieldset" : "div";
  return e.$$set = (Z) => {
    "height" in Z && n(0, r = Z.height), "width" in Z && n(1, a = Z.width), "elem_id" in Z && n(2, s = Z.elem_id), "elem_classes" in Z && n(3, o = Z.elem_classes), "variant" in Z && n(4, c = Z.variant), "border_mode" in Z && n(5, d = Z.border_mode), "padding" in Z && n(6, u = Z.padding), "type" in Z && n(15, h = Z.type), "test_id" in Z && n(7, f = Z.test_id), "explicit_call" in Z && n(8, V = Z.explicit_call), "container" in Z && n(9, U = Z.container), "visible" in Z && n(10, m = Z.visible), "allow_overflow" in Z && n(11, b = Z.allow_overflow), "scale" in Z && n(12, _ = Z.scale), "min_width" in Z && n(13, p = Z.min_width), "$$scope" in Z && n(16, i = Z.$$scope);
  }, [
    r,
    a,
    s,
    o,
    c,
    d,
    u,
    f,
    V,
    U,
    m,
    b,
    _,
    p,
    B,
    h,
    i,
    l
  ];
}
class Ji extends Hr {
  constructor(t) {
    super(), Pr(this, t, ea, $r, Lr, {
      height: 0,
      width: 1,
      elem_id: 2,
      elem_classes: 3,
      variant: 4,
      border_mode: 5,
      padding: 6,
      type: 15,
      test_id: 7,
      explicit_call: 8,
      container: 9,
      visible: 10,
      allow_overflow: 11,
      scale: 12,
      min_width: 13
    });
  }
}
const {
  SvelteComponent: ta,
  append: nn,
  attr: Jt,
  create_component: na,
  destroy_component: la,
  detach: ia,
  element: ml,
  init: ra,
  insert: aa,
  mount_component: sa,
  safe_not_equal: oa,
  set_data: ca,
  space: da,
  text: ua,
  toggle_class: Xe,
  transition_in: ha,
  transition_out: fa
} = window.__gradio__svelte__internal;
function ma(e) {
  let t, n, l, i, r, a;
  return l = new /*Icon*/
  e[1]({}), {
    c() {
      t = ml("label"), n = ml("span"), na(l.$$.fragment), i = da(), r = ua(
        /*label*/
        e[0]
      ), Jt(n, "class", "svelte-9gxdi0"), Jt(t, "for", ""), Jt(t, "data-testid", "block-label"), Jt(t, "class", "svelte-9gxdi0"), Xe(t, "hide", !/*show_label*/
      e[2]), Xe(t, "sr-only", !/*show_label*/
      e[2]), Xe(
        t,
        "float",
        /*float*/
        e[4]
      ), Xe(
        t,
        "hide-label",
        /*disable*/
        e[3]
      );
    },
    m(s, o) {
      aa(s, t, o), nn(t, n), sa(l, n, null), nn(t, i), nn(t, r), a = !0;
    },
    p(s, [o]) {
      (!a || o & /*label*/
      1) && ca(
        r,
        /*label*/
        s[0]
      ), (!a || o & /*show_label*/
      4) && Xe(t, "hide", !/*show_label*/
      s[2]), (!a || o & /*show_label*/
      4) && Xe(t, "sr-only", !/*show_label*/
      s[2]), (!a || o & /*float*/
      16) && Xe(
        t,
        "float",
        /*float*/
        s[4]
      ), (!a || o & /*disable*/
      8) && Xe(
        t,
        "hide-label",
        /*disable*/
        s[3]
      );
    },
    i(s) {
      a || (ha(l.$$.fragment, s), a = !0);
    },
    o(s) {
      fa(l.$$.fragment, s), a = !1;
    },
    d(s) {
      s && ia(t), la(l);
    }
  };
}
function Ua(e, t, n) {
  let { label: l = null } = t, { Icon: i } = t, { show_label: r = !0 } = t, { disable: a = !1 } = t, { float: s = !0 } = t;
  return e.$$set = (o) => {
    "label" in o && n(0, l = o.label), "Icon" in o && n(1, i = o.Icon), "show_label" in o && n(2, r = o.show_label), "disable" in o && n(3, a = o.disable), "float" in o && n(4, s = o.float);
  }, [l, i, r, a, s];
}
class Mt extends ta {
  constructor(t) {
    super(), ra(this, t, Ua, ma, oa, {
      label: 0,
      Icon: 1,
      show_label: 2,
      disable: 3,
      float: 4
    });
  }
}
const {
  SvelteComponent: Fa,
  append: Nn,
  attr: Me,
  bubble: ba,
  create_component: Va,
  destroy_component: pa,
  detach: Ni,
  element: Sn,
  init: Za,
  insert: Si,
  listen: Ba,
  mount_component: Qa,
  safe_not_equal: Ra,
  set_data: Wa,
  space: _a,
  text: ga,
  toggle_class: Ee,
  transition_in: ya,
  transition_out: Ja
} = window.__gradio__svelte__internal;
function Ul(e) {
  let t, n;
  return {
    c() {
      t = Sn("span"), n = ga(
        /*label*/
        e[1]
      ), Me(t, "class", "svelte-xtz2g8");
    },
    m(l, i) {
      Si(l, t, i), Nn(t, n);
    },
    p(l, i) {
      i & /*label*/
      2 && Wa(
        n,
        /*label*/
        l[1]
      );
    },
    d(l) {
      l && Ni(t);
    }
  };
}
function Na(e) {
  let t, n, l, i, r, a, s, o = (
    /*show_label*/
    e[2] && Ul(e)
  );
  return i = new /*Icon*/
  e[0]({}), {
    c() {
      t = Sn("button"), o && o.c(), n = _a(), l = Sn("div"), Va(i.$$.fragment), Me(l, "class", "svelte-xtz2g8"), Ee(
        l,
        "small",
        /*size*/
        e[4] === "small"
      ), Ee(
        l,
        "large",
        /*size*/
        e[4] === "large"
      ), Me(
        t,
        "aria-label",
        /*label*/
        e[1]
      ), Me(
        t,
        "title",
        /*label*/
        e[1]
      ), Me(t, "class", "svelte-xtz2g8"), Ee(
        t,
        "pending",
        /*pending*/
        e[3]
      ), Ee(
        t,
        "padded",
        /*padded*/
        e[5]
      );
    },
    m(c, d) {
      Si(c, t, d), o && o.m(t, null), Nn(t, n), Nn(t, l), Qa(i, l, null), r = !0, a || (s = Ba(
        t,
        "click",
        /*click_handler*/
        e[6]
      ), a = !0);
    },
    p(c, [d]) {
      /*show_label*/
      c[2] ? o ? o.p(c, d) : (o = Ul(c), o.c(), o.m(t, n)) : o && (o.d(1), o = null), (!r || d & /*size*/
      16) && Ee(
        l,
        "small",
        /*size*/
        c[4] === "small"
      ), (!r || d & /*size*/
      16) && Ee(
        l,
        "large",
        /*size*/
        c[4] === "large"
      ), (!r || d & /*label*/
      2) && Me(
        t,
        "aria-label",
        /*label*/
        c[1]
      ), (!r || d & /*label*/
      2) && Me(
        t,
        "title",
        /*label*/
        c[1]
      ), (!r || d & /*pending*/
      8) && Ee(
        t,
        "pending",
        /*pending*/
        c[3]
      ), (!r || d & /*padded*/
      32) && Ee(
        t,
        "padded",
        /*padded*/
        c[5]
      );
    },
    i(c) {
      r || (ya(i.$$.fragment, c), r = !0);
    },
    o(c) {
      Ja(i.$$.fragment, c), r = !1;
    },
    d(c) {
      c && Ni(t), o && o.d(), pa(i), a = !1, s();
    }
  };
}
function Sa(e, t, n) {
  let { Icon: l } = t, { label: i = "" } = t, { show_label: r = !1 } = t, { pending: a = !1 } = t, { size: s = "small" } = t, { padded: o = !0 } = t;
  function c(d) {
    ba.call(this, e, d);
  }
  return e.$$set = (d) => {
    "Icon" in d && n(0, l = d.Icon), "label" in d && n(1, i = d.label), "show_label" in d && n(2, r = d.show_label), "pending" in d && n(3, a = d.pending), "size" in d && n(4, s = d.size), "padded" in d && n(5, o = d.padded);
  }, [l, i, r, a, s, o, c];
}
class Dt extends Fa {
  constructor(t) {
    super(), Za(this, t, Sa, Na, Ra, {
      Icon: 0,
      label: 1,
      show_label: 2,
      pending: 3,
      size: 4,
      padded: 5
    });
  }
}
const {
  SvelteComponent: Ga,
  append: Xa,
  attr: ln,
  binding_callbacks: Ea,
  create_slot: ka,
  detach: va,
  element: Fl,
  get_all_dirty_from_scope: Ta,
  get_slot_changes: wa,
  init: Ia,
  insert: Ca,
  safe_not_equal: Ha,
  toggle_class: ke,
  transition_in: Ya,
  transition_out: xa,
  update_slot_base: Ma
} = window.__gradio__svelte__internal;
function Da(e) {
  let t, n, l;
  const i = (
    /*#slots*/
    e[5].default
  ), r = ka(
    i,
    e,
    /*$$scope*/
    e[4],
    null
  );
  return {
    c() {
      t = Fl("div"), n = Fl("div"), r && r.c(), ln(n, "class", "icon svelte-3w3rth"), ln(t, "class", "empty svelte-3w3rth"), ln(t, "aria-label", "Empty value"), ke(
        t,
        "small",
        /*size*/
        e[0] === "small"
      ), ke(
        t,
        "large",
        /*size*/
        e[0] === "large"
      ), ke(
        t,
        "unpadded_box",
        /*unpadded_box*/
        e[1]
      ), ke(
        t,
        "small_parent",
        /*parent_height*/
        e[3]
      );
    },
    m(a, s) {
      Ca(a, t, s), Xa(t, n), r && r.m(n, null), e[6](t), l = !0;
    },
    p(a, [s]) {
      r && r.p && (!l || s & /*$$scope*/
      16) && Ma(
        r,
        i,
        a,
        /*$$scope*/
        a[4],
        l ? wa(
          i,
          /*$$scope*/
          a[4],
          s,
          null
        ) : Ta(
          /*$$scope*/
          a[4]
        ),
        null
      ), (!l || s & /*size*/
      1) && ke(
        t,
        "small",
        /*size*/
        a[0] === "small"
      ), (!l || s & /*size*/
      1) && ke(
        t,
        "large",
        /*size*/
        a[0] === "large"
      ), (!l || s & /*unpadded_box*/
      2) && ke(
        t,
        "unpadded_box",
        /*unpadded_box*/
        a[1]
      ), (!l || s & /*parent_height*/
      8) && ke(
        t,
        "small_parent",
        /*parent_height*/
        a[3]
      );
    },
    i(a) {
      l || (Ya(r, a), l = !0);
    },
    o(a) {
      xa(r, a), l = !1;
    },
    d(a) {
      a && va(t), r && r.d(a), e[6](null);
    }
  };
}
function za(e) {
  let t, n = e[0], l = 1;
  for (; l < e.length; ) {
    const i = e[l], r = e[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (t = n, n = r(n)) : (i === "call" || i === "optionalCall") && (n = r((...a) => n.call(t, ...a)), t = void 0);
  }
  return n;
}
function Oa(e, t, n) {
  let l, { $$slots: i = {}, $$scope: r } = t, { size: a = "small" } = t, { unpadded_box: s = !1 } = t, o;
  function c(u) {
    if (!u)
      return !1;
    const { height: h } = u.getBoundingClientRect(), { height: f } = za([
      u,
      "access",
      (V) => V.parentElement,
      "optionalAccess",
      (V) => V.getBoundingClientRect,
      "call",
      (V) => V()
    ]) || { height: h };
    return h > f + 2;
  }
  function d(u) {
    Ea[u ? "unshift" : "push"](() => {
      o = u, n(2, o);
    });
  }
  return e.$$set = (u) => {
    "size" in u && n(0, a = u.size), "unpadded_box" in u && n(1, s = u.unpadded_box), "$$scope" in u && n(4, r = u.$$scope);
  }, e.$$.update = () => {
    e.$$.dirty & /*el*/
    4 && n(3, l = c(o));
  }, [a, s, o, l, r, i, d];
}
class Aa extends Ga {
  constructor(t) {
    super(), Ia(this, t, Oa, Da, Ha, { size: 0, unpadded_box: 1 });
  }
}
const {
  SvelteComponent: Pa,
  append: rn,
  attr: Ue,
  detach: ja,
  init: La,
  insert: Ka,
  noop: an,
  safe_not_equal: qa,
  set_style: Qe,
  svg_element: Nt
} = window.__gradio__svelte__internal;
function $a(e) {
  let t, n, l, i;
  return {
    c() {
      t = Nt("svg"), n = Nt("g"), l = Nt("path"), i = Nt("path"), Ue(l, "d", "M18,6L6.087,17.913"), Qe(l, "fill", "none"), Qe(l, "fill-rule", "nonzero"), Qe(l, "stroke-width", "2px"), Ue(n, "transform", "matrix(1.14096,-0.140958,-0.140958,1.14096,-0.0559523,0.0559523)"), Ue(i, "d", "M4.364,4.364L19.636,19.636"), Qe(i, "fill", "none"), Qe(i, "fill-rule", "nonzero"), Qe(i, "stroke-width", "2px"), Ue(t, "width", "100%"), Ue(t, "height", "100%"), Ue(t, "viewBox", "0 0 24 24"), Ue(t, "version", "1.1"), Ue(t, "xmlns", "http://www.w3.org/2000/svg"), Ue(t, "xmlns:xlink", "http://www.w3.org/1999/xlink"), Ue(t, "xml:space", "preserve"), Ue(t, "stroke", "currentColor"), Qe(t, "fill-rule", "evenodd"), Qe(t, "clip-rule", "evenodd"), Qe(t, "stroke-linecap", "round"), Qe(t, "stroke-linejoin", "round");
    },
    m(r, a) {
      Ka(r, t, a), rn(t, n), rn(n, l), rn(t, i);
    },
    p: an,
    i: an,
    o: an,
    d(r) {
      r && ja(t);
    }
  };
}
class es extends Pa {
  constructor(t) {
    super(), La(this, t, null, $a, qa, {});
  }
}
const {
  SvelteComponent: ts,
  append: ns,
  attr: Ke,
  detach: ls,
  init: is,
  insert: rs,
  noop: sn,
  safe_not_equal: as,
  svg_element: bl
} = window.__gradio__svelte__internal;
function ss(e) {
  let t, n;
  return {
    c() {
      t = bl("svg"), n = bl("path"), Ke(n, "fill", "currentColor"), Ke(n, "d", "M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z"), Ke(t, "xmlns", "http://www.w3.org/2000/svg"), Ke(t, "width", "100%"), Ke(t, "height", "100%"), Ke(t, "viewBox", "0 0 32 32");
    },
    m(l, i) {
      rs(l, t, i), ns(t, n);
    },
    p: sn,
    i: sn,
    o: sn,
    d(l) {
      l && ls(t);
    }
  };
}
class os extends ts {
  constructor(t) {
    super(), is(this, t, null, ss, as, {});
  }
}
const {
  SvelteComponent: cs,
  append: ds,
  attr: Fe,
  detach: us,
  init: hs,
  insert: fs,
  noop: on,
  safe_not_equal: ms,
  svg_element: Vl
} = window.__gradio__svelte__internal;
function Us(e) {
  let t, n;
  return {
    c() {
      t = Vl("svg"), n = Vl("path"), Fe(n, "d", "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"), Fe(t, "xmlns", "http://www.w3.org/2000/svg"), Fe(t, "width", "100%"), Fe(t, "height", "100%"), Fe(t, "viewBox", "0 0 24 24"), Fe(t, "fill", "none"), Fe(t, "stroke", "currentColor"), Fe(t, "stroke-width", "1.5"), Fe(t, "stroke-linecap", "round"), Fe(t, "stroke-linejoin", "round"), Fe(t, "class", "feather feather-edit-2");
    },
    m(l, i) {
      fs(l, t, i), ds(t, n);
    },
    p: on,
    i: on,
    o: on,
    d(l) {
      l && us(t);
    }
  };
}
class Fs extends cs {
  constructor(t) {
    super(), hs(this, t, null, Us, ms, {});
  }
}
const {
  SvelteComponent: bs,
  append: pl,
  attr: oe,
  detach: Vs,
  init: ps,
  insert: Zs,
  noop: cn,
  safe_not_equal: Bs,
  svg_element: dn
} = window.__gradio__svelte__internal;
function Qs(e) {
  let t, n, l;
  return {
    c() {
      t = dn("svg"), n = dn("path"), l = dn("polyline"), oe(n, "d", "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"), oe(l, "points", "13 2 13 9 20 9"), oe(t, "xmlns", "http://www.w3.org/2000/svg"), oe(t, "width", "100%"), oe(t, "height", "100%"), oe(t, "viewBox", "0 0 24 24"), oe(t, "fill", "none"), oe(t, "stroke", "currentColor"), oe(t, "stroke-width", "1.5"), oe(t, "stroke-linecap", "round"), oe(t, "stroke-linejoin", "round"), oe(t, "class", "feather feather-file");
    },
    m(i, r) {
      Zs(i, t, r), pl(t, n), pl(t, l);
    },
    p: cn,
    i: cn,
    o: cn,
    d(i) {
      i && Vs(t);
    }
  };
}
let Rt = class extends bs {
  constructor(t) {
    super(), ps(this, t, null, Qs, Bs, {});
  }
};
const {
  SvelteComponent: Rs,
  append: Zl,
  attr: ce,
  detach: Ws,
  init: _s,
  insert: gs,
  noop: un,
  safe_not_equal: ys,
  svg_element: hn
} = window.__gradio__svelte__internal;
function Js(e) {
  let t, n, l;
  return {
    c() {
      t = hn("svg"), n = hn("polyline"), l = hn("path"), ce(n, "points", "1 4 1 10 7 10"), ce(l, "d", "M3.51 15a9 9 0 1 0 2.13-9.36L1 10"), ce(t, "xmlns", "http://www.w3.org/2000/svg"), ce(t, "width", "100%"), ce(t, "height", "100%"), ce(t, "viewBox", "0 0 24 24"), ce(t, "fill", "none"), ce(t, "stroke", "currentColor"), ce(t, "stroke-width", "2"), ce(t, "stroke-linecap", "round"), ce(t, "stroke-linejoin", "round"), ce(t, "class", "feather feather-rotate-ccw");
    },
    m(i, r) {
      gs(i, t, r), Zl(t, n), Zl(t, l);
    },
    p: un,
    i: un,
    o: un,
    d(i) {
      i && Ws(t);
    }
  };
}
class Ns extends Rs {
  constructor(t) {
    super(), _s(this, t, null, Js, ys, {});
  }
}
const {
  SvelteComponent: Ss,
  append: fn,
  attr: $,
  detach: Gs,
  init: Xs,
  insert: Es,
  noop: mn,
  safe_not_equal: ks,
  svg_element: St
} = window.__gradio__svelte__internal;
function vs(e) {
  let t, n, l, i;
  return {
    c() {
      t = St("svg"), n = St("path"), l = St("polyline"), i = St("line"), $(n, "d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), $(l, "points", "17 8 12 3 7 8"), $(i, "x1", "12"), $(i, "y1", "3"), $(i, "x2", "12"), $(i, "y2", "15"), $(t, "xmlns", "http://www.w3.org/2000/svg"), $(t, "width", "90%"), $(t, "height", "90%"), $(t, "viewBox", "0 0 24 24"), $(t, "fill", "none"), $(t, "stroke", "currentColor"), $(t, "stroke-width", "2"), $(t, "stroke-linecap", "round"), $(t, "stroke-linejoin", "round"), $(t, "class", "feather feather-upload");
    },
    m(r, a) {
      Es(r, t, a), fn(t, n), fn(t, l), fn(t, i);
    },
    p: mn,
    i: mn,
    o: mn,
    d(r) {
      r && Gs(t);
    }
  };
}
let Ts = class extends Ss {
  constructor(t) {
    super(), Xs(this, t, null, vs, ks, {});
  }
};
const ws = [
  { color: "red", primary: 600, secondary: 100 },
  { color: "green", primary: 600, secondary: 100 },
  { color: "blue", primary: 600, secondary: 100 },
  { color: "yellow", primary: 500, secondary: 100 },
  { color: "purple", primary: 600, secondary: 100 },
  { color: "teal", primary: 600, secondary: 100 },
  { color: "orange", primary: 600, secondary: 100 },
  { color: "cyan", primary: 600, secondary: 100 },
  { color: "lime", primary: 500, secondary: 100 },
  { color: "pink", primary: 600, secondary: 100 }
], Bl = {
  inherit: "inherit",
  current: "currentColor",
  transparent: "transparent",
  black: "#000",
  white: "#fff",
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617"
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712"
  },
  zinc: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b"
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a"
  },
  stone: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
    950: "#0c0a09"
  },
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a"
  },
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407"
  },
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03"
  },
  yellow: {
    50: "#fefce8",
    100: "#fef9c3",
    200: "#fef08a",
    300: "#fde047",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
    800: "#854d0e",
    900: "#713f12",
    950: "#422006"
  },
  lime: {
    50: "#f7fee7",
    100: "#ecfccb",
    200: "#d9f99d",
    300: "#bef264",
    400: "#a3e635",
    500: "#84cc16",
    600: "#65a30d",
    700: "#4d7c0f",
    800: "#3f6212",
    900: "#365314",
    950: "#1a2e05"
  },
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16"
  },
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22"
  },
  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
    950: "#042f2e"
  },
  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
    950: "#083344"
  },
  sky: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49"
  },
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554"
  },
  indigo: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b"
  },
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065"
  },
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
    950: "#3b0764"
  },
  fuchsia: {
    50: "#fdf4ff",
    100: "#fae8ff",
    200: "#f5d0fe",
    300: "#f0abfc",
    400: "#e879f9",
    500: "#d946ef",
    600: "#c026d3",
    700: "#a21caf",
    800: "#86198f",
    900: "#701a75",
    950: "#4a044e"
  },
  pink: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
    950: "#500724"
  },
  rose: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
    800: "#9f1239",
    900: "#881337",
    950: "#4c0519"
  }
};
ws.reduce(
  (e, { color: t, primary: n, secondary: l }) => ({
    ...e,
    [t]: {
      primary: Bl[t][n],
      secondary: Bl[t][l]
    }
  }),
  {}
);
const {
  SvelteComponent: Is,
  append: Oe,
  attr: Gn,
  create_component: Cs,
  destroy_component: Hs,
  detach: kt,
  element: Xn,
  init: Ys,
  insert: vt,
  mount_component: xs,
  safe_not_equal: Ms,
  set_data: En,
  space: kn,
  text: pt,
  toggle_class: Ql,
  transition_in: Ds,
  transition_out: zs
} = window.__gradio__svelte__internal;
function Rl(e) {
  let t, n, l = (
    /*i18n*/
    e[1]("common.or") + ""
  ), i, r, a, s = (
    /*message*/
    (e[2] || /*i18n*/
    e[1]("upload_text.click_to_upload")) + ""
  ), o;
  return {
    c() {
      t = Xn("span"), n = pt("- "), i = pt(l), r = pt(" -"), a = kn(), o = pt(s), Gn(t, "class", "or svelte-kzcjhc");
    },
    m(c, d) {
      vt(c, t, d), Oe(t, n), Oe(t, i), Oe(t, r), vt(c, a, d), vt(c, o, d);
    },
    p(c, d) {
      d & /*i18n*/
      2 && l !== (l = /*i18n*/
      c[1]("common.or") + "") && En(i, l), d & /*message, i18n*/
      6 && s !== (s = /*message*/
      (c[2] || /*i18n*/
      c[1]("upload_text.click_to_upload")) + "") && En(o, s);
    },
    d(c) {
      c && (kt(t), kt(a), kt(o));
    }
  };
}
function Os(e) {
  let t, n, l, i, r = (
    /*i18n*/
    e[1](
      /*defs*/
      e[5][
        /*type*/
        e[0]
      ] || /*defs*/
      e[5].file
    ) + ""
  ), a, s, o;
  l = new Ts({});
  let c = (
    /*mode*/
    e[3] !== "short" && Rl(e)
  );
  return {
    c() {
      t = Xn("div"), n = Xn("span"), Cs(l.$$.fragment), i = kn(), a = pt(r), s = kn(), c && c.c(), Gn(n, "class", "icon-wrap svelte-kzcjhc"), Ql(
        n,
        "hovered",
        /*hovered*/
        e[4]
      ), Gn(t, "class", "wrap svelte-kzcjhc");
    },
    m(d, u) {
      vt(d, t, u), Oe(t, n), xs(l, n, null), Oe(t, i), Oe(t, a), Oe(t, s), c && c.m(t, null), o = !0;
    },
    p(d, [u]) {
      (!o || u & /*hovered*/
      16) && Ql(
        n,
        "hovered",
        /*hovered*/
        d[4]
      ), (!o || u & /*i18n, type*/
      3) && r !== (r = /*i18n*/
      d[1](
        /*defs*/
        d[5][
          /*type*/
          d[0]
        ] || /*defs*/
        d[5].file
      ) + "") && En(a, r), /*mode*/
      d[3] !== "short" ? c ? c.p(d, u) : (c = Rl(d), c.c(), c.m(t, null)) : c && (c.d(1), c = null);
    },
    i(d) {
      o || (Ds(l.$$.fragment, d), o = !0);
    },
    o(d) {
      zs(l.$$.fragment, d), o = !1;
    },
    d(d) {
      d && kt(t), Hs(l), c && c.d();
    }
  };
}
function As(e, t, n) {
  let { type: l = "file" } = t, { i18n: i } = t, { message: r = void 0 } = t, { mode: a = "full" } = t, { hovered: s = !1 } = t;
  const o = {
    image: "upload_text.drop_image",
    video: "upload_text.drop_video",
    audio: "upload_text.drop_audio",
    file: "upload_text.drop_file",
    csv: "upload_text.drop_csv"
  };
  return e.$$set = (c) => {
    "type" in c && n(0, l = c.type), "i18n" in c && n(1, i = c.i18n), "message" in c && n(2, r = c.message), "mode" in c && n(3, a = c.mode), "hovered" in c && n(4, s = c.hovered);
  }, [l, i, r, a, s, o];
}
class Ps extends Is {
  constructor(t) {
    super(), Ys(this, t, As, Os, Ms, {
      type: 0,
      i18n: 1,
      message: 2,
      mode: 3,
      hovered: 4
    });
  }
}
class P {
  constructor(t = 0, n = 0, l = 0) {
    this.x = t, this.y = n, this.z = l;
  }
  set(t, n, l) {
    return this.x = t, this.y = n, this.z = l, this;
  }
  add(t) {
    return typeof t == "number" ? new P(this.x + t, this.y + t, this.z + t) : new P(this.x + t.x, this.y + t.y, this.z + t.z);
  }
  subtract(t) {
    return typeof t == "number" ? new P(this.x - t, this.y - t, this.z - t) : new P(this.x - t.x, this.y - t.y, this.z - t.z);
  }
  multiply(t) {
    return typeof t == "number" ? new P(this.x * t, this.y * t, this.z * t) : new P(this.x * t.x, this.y * t.y, this.z * t.z);
  }
  lerp(t, n) {
    return new P(this.x + (t.x - this.x) * n, this.y + (t.y - this.y) * n, this.z + (t.z - this.z) * n);
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  normalize() {
    const t = this.length();
    return this.x /= t, this.y /= t, this.z /= t, this;
  }
  flat() {
    return [this.x, this.y, this.z];
  }
  clone() {
    return new P(this.x, this.y, this.z);
  }
}
class Je {
  constructor(t = 0, n = 0, l = 0, i = 1) {
    this.x = t, this.y = n, this.z = l, this.w = i, this.normalize();
  }
  set(t, n, l, i) {
    return this.x = t, this.y = n, this.z = l, this.w = i, this.normalize(), this;
  }
  normalize() {
    const t = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    return this.x /= t, this.y /= t, this.z /= t, this.w /= t, this;
  }
  multiply(t) {
    const n = this.w, l = this.x, i = this.y, r = this.z, a = t.w, s = t.x, o = t.y, c = t.z;
    return new Je(n * s + l * a + i * c - r * o, n * o - l * c + i * a + r * s, n * c + l * o - i * s + r * a, n * a - l * s - i * o - r * c);
  }
  flat() {
    return [this.x, this.y, this.z, this.w];
  }
  clone() {
    return new Je(this.x, this.y, this.z, this.w);
  }
  static FromEuler(t) {
    const n = t.x / 2, l = t.y / 2, i = t.z / 2, r = Math.cos(l), a = Math.sin(l), s = Math.cos(n), o = Math.sin(n), c = Math.cos(i), d = Math.sin(i);
    return new Je(r * o * c + a * s * d, a * s * c - r * o * d, r * s * d - a * o * c, r * s * c + a * o * d);
  }
  toEuler() {
    const t = new P(), n = 2 * (this.w * this.x + this.y * this.z), l = 1 - 2 * (this.x * this.x + this.y * this.y);
    t.x = Math.atan2(n, l);
    const i = 2 * (this.w * this.y - this.z * this.x);
    Math.abs(i) >= 1 ? t.y = Math.sign(i) * Math.PI / 2 : t.y = Math.asin(i);
    const r = 2 * (this.w * this.z + this.x * this.y), a = 1 - 2 * (this.y * this.y + this.z * this.z);
    return t.z = Math.atan2(r, a), t;
  }
  static FromMatrix3(t) {
    const n = t.buffer, l = new Je(), i = n[0] + n[4] + n[8];
    if (i > 0) {
      const r = 0.5 / Math.sqrt(i + 1);
      l.w = 0.25 / r, l.x = (n[7] - n[5]) * r, l.y = (n[2] - n[6]) * r, l.z = (n[3] - n[1]) * r;
    } else if (n[0] > n[4] && n[0] > n[8]) {
      const r = 2 * Math.sqrt(1 + n[0] - n[4] - n[8]);
      l.w = (n[7] - n[5]) / r, l.x = 0.25 * r, l.y = (n[1] + n[3]) / r, l.z = (n[2] + n[6]) / r;
    } else if (n[4] > n[8]) {
      const r = 2 * Math.sqrt(1 + n[4] - n[0] - n[8]);
      l.w = (n[2] - n[6]) / r, l.x = (n[1] + n[3]) / r, l.y = 0.25 * r, l.z = (n[5] + n[7]) / r;
    } else {
      const r = 2 * Math.sqrt(1 + n[8] - n[0] - n[4]);
      l.w = (n[3] - n[1]) / r, l.x = (n[2] + n[6]) / r, l.y = (n[5] + n[7]) / r, l.z = 0.25 * r;
    }
    return l;
  }
}
class Gi {
  constructor() {
    this.position = new P(), this.rotation = new Je();
  }
}
class Re {
  constructor(t = 1, n = 0, l = 0, i = 0, r = 1, a = 0, s = 0, o = 0, c = 1) {
    this.buffer = new Array(9), this.set(t, n, l, i, r, a, s, o, c);
  }
  set(t, n, l, i, r, a, s, o, c) {
    const d = this.buffer;
    return d[0] = t, d[1] = n, d[2] = l, d[3] = i, d[4] = r, d[5] = a, d[6] = s, d[7] = o, d[8] = c, this;
  }
  multiply(t) {
    const n = this.buffer, l = t.buffer;
    return new Re(l[0] * n[0] + l[3] * n[1] + l[6] * n[2], l[1] * n[0] + l[4] * n[1] + l[7] * n[2], l[2] * n[0] + l[5] * n[1] + l[8] * n[2], l[0] * n[3] + l[3] * n[4] + l[6] * n[5], l[1] * n[3] + l[4] * n[4] + l[7] * n[5], l[2] * n[3] + l[5] * n[4] + l[8] * n[5], l[0] * n[6] + l[3] * n[7] + l[6] * n[8], l[1] * n[6] + l[4] * n[7] + l[7] * n[8], l[2] * n[6] + l[5] * n[7] + l[8] * n[8]);
  }
  clone() {
    const t = this.buffer;
    return new Re(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]);
  }
  static RotationFromQuaternion(t) {
    return new Re(1 - 2 * t.y * t.y - 2 * t.z * t.z, 2 * t.x * t.y - 2 * t.z * t.w, 2 * t.x * t.z + 2 * t.y * t.w, 2 * t.x * t.y + 2 * t.z * t.w, 1 - 2 * t.x * t.x - 2 * t.z * t.z, 2 * t.y * t.z - 2 * t.x * t.w, 2 * t.x * t.z - 2 * t.y * t.w, 2 * t.y * t.z + 2 * t.x * t.w, 1 - 2 * t.x * t.x - 2 * t.y * t.y);
  }
  static RotationFromEuler(t) {
    const n = Math.cos(t.x), l = Math.sin(t.x), i = Math.cos(t.y), r = Math.sin(t.y), a = Math.cos(t.z), s = Math.sin(t.z);
    return new Re(i * a + r * l * s, -i * s + r * l * a, r * n, n * s, n * a, -l, -r * a + i * l * s, r * s + i * l * a, i * n);
  }
}
class Ae {
  constructor(t = 1, n = 0, l = 0, i = 0, r = 0, a = 1, s = 0, o = 0, c = 0, d = 0, u = 1, h = 0, f = 0, V = 0, U = 0, m = 1) {
    this.buffer = new Array(16), this.set(t, n, l, i, r, a, s, o, c, d, u, h, f, V, U, m);
  }
  set(t, n, l, i, r, a, s, o, c, d, u, h, f, V, U, m) {
    const b = this.buffer;
    return b[0] = t, b[1] = n, b[2] = l, b[3] = i, b[4] = r, b[5] = a, b[6] = s, b[7] = o, b[8] = c, b[9] = d, b[10] = u, b[11] = h, b[12] = f, b[13] = V, b[14] = U, b[15] = m, this;
  }
  multiply(t) {
    const n = this.buffer, l = t.buffer;
    return new Ae(l[0] * n[0] + l[1] * n[4] + l[2] * n[8] + l[3] * n[12], l[0] * n[1] + l[1] * n[5] + l[2] * n[9] + l[3] * n[13], l[0] * n[2] + l[1] * n[6] + l[2] * n[10] + l[3] * n[14], l[0] * n[3] + l[1] * n[7] + l[2] * n[11] + l[3] * n[15], l[4] * n[0] + l[5] * n[4] + l[6] * n[8] + l[7] * n[12], l[4] * n[1] + l[5] * n[5] + l[6] * n[9] + l[7] * n[13], l[4] * n[2] + l[5] * n[6] + l[6] * n[10] + l[7] * n[14], l[4] * n[3] + l[5] * n[7] + l[6] * n[11] + l[7] * n[15], l[8] * n[0] + l[9] * n[4] + l[10] * n[8] + l[11] * n[12], l[8] * n[1] + l[9] * n[5] + l[10] * n[9] + l[11] * n[13], l[8] * n[2] + l[9] * n[6] + l[10] * n[10] + l[11] * n[14], l[8] * n[3] + l[9] * n[7] + l[10] * n[11] + l[11] * n[15], l[12] * n[0] + l[13] * n[4] + l[14] * n[8] + l[15] * n[12], l[12] * n[1] + l[13] * n[5] + l[14] * n[9] + l[15] * n[13], l[12] * n[2] + l[13] * n[6] + l[14] * n[10] + l[15] * n[14], l[12] * n[3] + l[13] * n[7] + l[14] * n[11] + l[15] * n[15]);
  }
  clone() {
    const t = this.buffer;
    return new Ae(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]);
  }
}
class Xi extends Gi {
  constructor(t = new P(0, 0, -5), n = new Je(), l = 1132, i = 1132, r = 0.1, a = 100) {
    super();
    const s = () => {
      const o = Re.RotationFromQuaternion(this.rotation).buffer, c = this.position.flat(), d = [[o[0], o[1], o[2], 0], [o[3], o[4], o[5], 0], [o[6], o[7], o[8], 0], [-c[0] * o[0] - c[1] * o[3] - c[2] * o[6], -c[0] * o[1] - c[1] * o[4] - c[2] * o[7], -c[0] * o[2] - c[1] * o[5] - c[2] * o[8], 1]].flat();
      return new Ae(...d);
    };
    this.position = t, this.rotation = n, this.fx = l, this.fy = i, this.near = r, this.far = a, this.projectionMatrix = new Ae(), this.viewMatrix = new Ae(), this.viewProj = new Ae(), this.update = (o, c) => {
      this.projectionMatrix.set(2 * this.fx / o, 0, 0, 0, 0, -2 * this.fy / c, 0, 0, 0, 0, this.far / (this.far - this.near), 1, 0, 0, -this.far * this.near / (this.far - this.near), 0), this.viewMatrix = s(), this.viewProj = this.projectionMatrix.multiply(this.viewMatrix);
    };
  }
}
class Ct {
  constructor(t, n, l) {
    this.data = t, this.width = n, this.height = l;
  }
  static FromScene(t) {
    const n = new Float32Array(1), l = new Int32Array(n.buffer), i = (f) => {
      n[0] = f;
      const V = l[0], U = V >> 23 & 255;
      let m, b = 8388607 & V;
      return U == 0 ? m = 0 : U < 113 ? (m = 0, b |= 8388608, b >>= 113 - U, 16777216 & b && (m = 1, b = 0)) : U < 142 ? m = U - 112 : (m = 31, b = 0), (V >> 31 & 1) << 15 | m << 10 | b >> 13;
    }, r = (f, V) => (i(f) | i(V) << 16) >>> 0, a = 2048, s = Math.ceil(2 * t.vertexCount / a), o = new Uint32Array(a * s * 4), c = new Uint8Array(o.buffer), d = new Float32Array(o.buffer), u = new Float32Array(t.data.buffer), h = new Uint8Array(t.data.buffer);
    for (let f = 0; f < t.vertexCount; f++) {
      d[8 * f + 0] = u[8 * f + 0], d[8 * f + 1] = u[8 * f + 1], d[8 * f + 2] = u[8 * f + 2], c[4 * (8 * f + 7) + 0] = h[32 * f + 24 + 0], c[4 * (8 * f + 7) + 1] = h[32 * f + 24 + 1], c[4 * (8 * f + 7) + 2] = h[32 * f + 24 + 2], c[4 * (8 * f + 7) + 3] = h[32 * f + 24 + 3];
      const V = [u[8 * f + 3 + 0], u[8 * f + 3 + 1], u[8 * f + 3 + 2]], U = [(h[32 * f + 28 + 0] - 128) / 128, (h[32 * f + 28 + 1] - 128) / 128, (h[32 * f + 28 + 2] - 128) / 128, (h[32 * f + 28 + 3] - 128) / 128], m = [1 - 2 * (U[2] * U[2] + U[3] * U[3]), 2 * (U[1] * U[2] + U[0] * U[3]), 2 * (U[1] * U[3] - U[0] * U[2]), 2 * (U[1] * U[2] - U[0] * U[3]), 1 - 2 * (U[1] * U[1] + U[3] * U[3]), 2 * (U[2] * U[3] + U[0] * U[1]), 2 * (U[1] * U[3] + U[0] * U[2]), 2 * (U[2] * U[3] - U[0] * U[1]), 1 - 2 * (U[1] * U[1] + U[2] * U[2])].map((_, p) => _ * V[Math.floor(p / 3)]), b = [m[0] * m[0] + m[3] * m[3] + m[6] * m[6], m[0] * m[1] + m[3] * m[4] + m[6] * m[7], m[0] * m[2] + m[3] * m[5] + m[6] * m[8], m[1] * m[1] + m[4] * m[4] + m[7] * m[7], m[1] * m[2] + m[4] * m[5] + m[7] * m[8], m[2] * m[2] + m[5] * m[5] + m[8] * m[8]];
      o[8 * f + 4] = r(4 * b[0], 4 * b[1]), o[8 * f + 5] = r(4 * b[2], 4 * b[3]), o[8 * f + 6] = r(4 * b[4], 4 * b[5]);
    }
    return new Ct(o, a, s);
  }
}
class Ei extends Gi {
  constructor() {
    super(), this.data = new Uint8Array(0), this.vertexCount = 0, this.f_buffer = new Float32Array(0), this.u_buffer = new Uint8Array(0), this.tex = new Ct(new Uint32Array(0), 0, 0), this.dirty = !0;
  }
  updateTex() {
    this.tex = Ct.FromScene(this);
  }
  setData(t) {
    this.data = t, this.vertexCount = this.data.length / 32, this.f_buffer = new Float32Array(this.data.buffer), this.u_buffer = new Uint8Array(this.data.buffer), this.dirty = !0;
  }
  translate(t) {
    for (let n = 0; n < this.vertexCount; n++) {
      const l = this.f_buffer[8 * n + 0], i = this.f_buffer[8 * n + 1], r = this.f_buffer[8 * n + 2];
      this.f_buffer[8 * n + 0] = l + t.x, this.f_buffer[8 * n + 1] = i + t.y, this.f_buffer[8 * n + 2] = r + t.z;
    }
    this.dirty = !0;
  }
  rotate(t) {
    const n = Re.RotationFromQuaternion(t).buffer;
    for (let l = 0; l < this.vertexCount; l++) {
      const i = this.f_buffer[8 * l + 0], r = this.f_buffer[8 * l + 1], a = this.f_buffer[8 * l + 2];
      this.f_buffer[8 * l + 0] = n[0] * i + n[1] * r + n[2] * a, this.f_buffer[8 * l + 1] = n[3] * i + n[4] * r + n[5] * a, this.f_buffer[8 * l + 2] = n[6] * i + n[7] * r + n[8] * a;
      const s = new Je((this.u_buffer[32 * l + 28 + 1] - 128) / 128, (this.u_buffer[32 * l + 28 + 2] - 128) / 128, (this.u_buffer[32 * l + 28 + 3] - 128) / 128, (this.u_buffer[32 * l + 28 + 0] - 128) / 128), o = t.multiply(s);
      this.u_buffer[32 * l + 28 + 1] = Math.round((128 * o.x + 128) % 256), this.u_buffer[32 * l + 28 + 2] = Math.round((128 * o.y + 128) % 256), this.u_buffer[32 * l + 28 + 3] = Math.round((128 * o.z + 128) % 256), this.u_buffer[32 * l + 28 + 0] = Math.round((128 * o.w + 128) % 256);
    }
    this.dirty = !0;
  }
}
class ki {
  static async LoadAsync(t, n, l) {
    const i = await fetch(t, { mode: "cors", credentials: "omit" });
    if (i.status != 200)
      throw new Error(i.status + " Unable to load " + i.url);
    const r = i.body.getReader(), a = parseInt(i.headers.get("content-length")), s = new Uint8Array(a);
    let o = 0;
    for (; ; ) {
      const { done: c, value: d } = await r.read();
      if (c)
        break;
      s.set(d, o), o += d.length, l == null || l(o / a);
    }
    n.setData(s);
  }
  static async LoadFromFileAsync(t, n, l) {
    const i = new FileReader();
    i.onload = (r) => {
      const a = new Uint8Array(r.target.result);
      n.setData(a);
    }, i.onprogress = (r) => {
      l == null || l(r.loaded / r.total);
    }, i.readAsArrayBuffer(t), await new Promise((r) => {
      i.onloadend = () => {
        r();
      };
    });
  }
}
function js(e, t, n) {
  var l = t === void 0 ? null : t, i = function(o, c) {
    var d = atob(o);
    if (c) {
      for (var u = new Uint8Array(d.length), h = 0, f = d.length; h < f; ++h)
        u[h] = d.charCodeAt(h);
      return String.fromCharCode.apply(null, new Uint16Array(u.buffer));
    }
    return d;
  }(e, n !== void 0 && n), r = i.indexOf(`
`, 10) + 1, a = i.substring(r) + (l ? "//# sourceMappingURL=" + l : ""), s = new Blob([a], { type: "application/javascript" });
  return URL.createObjectURL(s);
}
var Wl, _l, gl, Un, Ls = (Wl = "Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgdmFyIGxvYWRXYXNtID0gKCgpID0+IHsKICAgIAogICAgcmV0dXJuICgKICBmdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkgewoKICB2YXIgTW9kdWxlPW1vZHVsZUFyZzt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdDt9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkQmluYXJ5O3t7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZjt9aWYoc2NyaXB0RGlyZWN0b3J5LmluZGV4T2YoImJsb2I6IikhPT0wKXtzY3JpcHREaXJlY3Rvcnk9c2NyaXB0RGlyZWN0b3J5LnN1YnN0cigwLHNjcmlwdERpcmVjdG9yeS5yZXBsYWNlKC9bPyNdLiovLCIiKS5sYXN0SW5kZXhPZigiLyIpKzEpO31lbHNlIHtzY3JpcHREaXJlY3Rvcnk9IiI7fXt7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX07fX19TW9kdWxlWyJwcmludCJdfHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO3ZhciBlcnI9TW9kdWxlWyJwcmludEVyciJdfHxjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlNb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIik7fWZ1bmN0aW9uIGludEFycmF5RnJvbUJhc2U2NChzKXt2YXIgZGVjb2RlZD1hdG9iKHMpO3ZhciBieXRlcz1uZXcgVWludDhBcnJheShkZWNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkZWNvZGVkLmxlbmd0aDsrK2kpe2J5dGVzW2ldPWRlY29kZWQuY2hhckNvZGVBdChpKTt9cmV0dXJuIGJ5dGVzfWZ1bmN0aW9uIHRyeVBhcnNlQXNEYXRhVVJJKGZpbGVuYW1lKXtpZighaXNEYXRhVVJJKGZpbGVuYW1lKSl7cmV0dXJufXJldHVybiBpbnRBcnJheUZyb21CYXNlNjQoZmlsZW5hbWUuc2xpY2UoZGF0YVVSSVByZWZpeC5sZW5ndGgpKX12YXIgd2FzbU1lbW9yeTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7ZnVuY3Rpb24gdXBkYXRlTWVtb3J5Vmlld3MoKXt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjtNb2R1bGVbIkhFQVA4Il09SEVBUDg9bmV3IEludDhBcnJheShiKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVBVOCJdPUhFQVBVOD1uZXcgVWludDhBcnJheShiKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBGMzIiXT1IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGIpO312YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO2Z1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpO319Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTt9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKTt9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKTt9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pO31mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpO31mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYik7fWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKTt9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztpZihNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXSl7TW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0ocnVuRGVwZW5kZW5jaWVzKTt9fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO2lmKE1vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKXtNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXShydW5EZXBlbmRlbmNpZXMpO31pZihydW5EZXBlbmRlbmNpZXM9PTApe2lmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpO319fWZ1bmN0aW9uIGFib3J0KHdoYXQpe2lmKE1vZHVsZVsib25BYm9ydCJdKXtNb2R1bGVbIm9uQWJvcnQiXSh3aGF0KTt9d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO3doYXQrPSIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uIjt2YXIgZT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKHdoYXQpO3JlYWR5UHJvbWlzZVJlamVjdChlKTt0aHJvdyBlfXZhciBkYXRhVVJJUHJlZml4PSJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsIjt2YXIgaXNEYXRhVVJJPWZpbGVuYW1lPT5maWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpO3ZhciB3YXNtQmluYXJ5RmlsZTt3YXNtQmluYXJ5RmlsZT0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LEFHRnpiUUVBQUFBQlNBdGdCSDkvZjM4QVlBTi9mMzhBWUFWL2YzOS9md0JnQm45L2YzOS9md0JnQW45L0FHQUJmd0YvWUFOL2YzOEJmMkFCZndCZ0IzOS9mMzkvZjM4QVlBQUFZQVIvZjM1K0FBSTlDZ0ZoQVdFQUFRRmhBV0lBQWdGaEFXTUFBUUZoQVdRQUJBRmhBV1VBQVFGaEFXWUFDQUZoQVdjQUJRRmhBV2dBQkFGaEFXa0FBQUZoQVdvQUJBTVlGd1lGQndjSkJ3VUVDZ2tCQUFFRkF3TUNBZ0FBQmdZSUJBVUJjQUVRRUFVSEFRR0FBb0NBQWdZSUFYOEJRZUNkQkFzSEdRWUJhd0lBQVd3QURnRnRBQ0FCYmdBTUFXOEJBQUZ3QUJBSkZRRUFRUUVMRHhNWERROFBIdzBlR0JvZERSa2JIQXFXUnhkeEFRRi9JQUpGQkVBZ0FDZ0NCQ0FCS0FJRVJnOExJQUFnQVVZRVFFRUJEd3NDUUNBQUtBSUVJZ0l0QUFBaUFFVWdBQ0FCS0FJRUlnRXRBQUFpQTBkeURRQURRQ0FCTFFBQklRTWdBaTBBQVNJQVJRMEJJQUZCQVdvaEFTQUNRUUZxSVFJZ0FDQURSZzBBQ3dzZ0FDQURSZ3RQQVFKL1FkZ1pLQUlBSWdFZ0FFRUhha0Y0Y1NJQ2FpRUFBa0FnQWtFQUlBQWdBVTBiRFFBZ0FEOEFRUkIwU3dSQUlBQVFCa1VOQVF0QjJCa2dBRFlDQUNBQkR3dEI2QmxCTURZQ0FFRi9DOUlMQVFkL0FrQWdBRVVOQUNBQVFRaHJJZ0lnQUVFRWF5Z0NBQ0lCUVhoeElnQnFJUVVDUUNBQlFRRnhEUUFnQVVFRGNVVU5BU0FDSUFJb0FnQWlBV3NpQWtIOEdTZ0NBRWtOQVNBQUlBRnFJUUFDUUFKQVFZQWFLQUlBSUFKSEJFQWdBVUgvQVUwRVFDQUJRUU4ySVFRZ0FpZ0NEQ0lCSUFJb0FnZ2lBMFlFUUVIc0dVSHNHU2dDQUVGK0lBUjNjVFlDQUF3RkN5QURJQUUyQWd3Z0FTQUROZ0lJREFRTElBSW9BaGdoQmlBQ0lBSW9BZ3dpQVVjRVFDQUNLQUlJSWdNZ0FUWUNEQ0FCSUFNMkFnZ01Bd3NnQWtFVWFpSUVLQUlBSWdORkJFQWdBaWdDRUNJRFJRMENJQUpCRUdvaEJBc0RRQ0FFSVFjZ0F5SUJRUlJxSWdRb0FnQWlBdzBBSUFGQkVHb2hCQ0FCS0FJUUlnTU5BQXNnQjBFQU5nSUFEQUlMSUFVb0FnUWlBVUVEY1VFRFJ3MENRZlFaSUFBMkFnQWdCU0FCUVg1eE5nSUVJQUlnQUVFQmNqWUNCQ0FGSUFBMkFnQVBDMEVBSVFFTElBWkZEUUFDUUNBQ0tBSWNJZ05CQW5SQm5CeHFJZ1FvQWdBZ0FrWUVRQ0FFSUFFMkFnQWdBUTBCUWZBWlFmQVpLQUlBUVg0Z0EzZHhOZ0lBREFJTElBWkJFRUVVSUFZb0FoQWdBa1liYWlBQk5nSUFJQUZGRFFFTElBRWdCallDR0NBQ0tBSVFJZ01FUUNBQklBTTJBaEFnQXlBQk5nSVlDeUFDS0FJVUlnTkZEUUFnQVNBRE5nSVVJQU1nQVRZQ0dBc2dBaUFGVHcwQUlBVW9BZ1FpQVVFQmNVVU5BQUpBQWtBQ1FBSkFJQUZCQW5GRkJFQkJoQm9vQWdBZ0JVWUVRRUdFR2lBQ05nSUFRZmdaUWZnWktBSUFJQUJxSWdBMkFnQWdBaUFBUVFGeU5nSUVJQUpCZ0Jvb0FnQkhEUVpCOUJsQkFEWUNBRUdBR2tFQU5nSUFEd3RCZ0Jvb0FnQWdCVVlFUUVHQUdpQUNOZ0lBUWZRWlFmUVpLQUlBSUFCcUlnQTJBZ0FnQWlBQVFRRnlOZ0lFSUFBZ0Ftb2dBRFlDQUE4TElBRkJlSEVnQUdvaEFDQUJRZjhCVFFSQUlBRkJBM1loQkNBRktBSU1JZ0VnQlNnQ0NDSURSZ1JBUWV3WlFld1pLQUlBUVg0Z0JIZHhOZ0lBREFVTElBTWdBVFlDRENBQklBTTJBZ2dNQkFzZ0JTZ0NHQ0VHSUFVZ0JTZ0NEQ0lCUndSQVFmd1pLQUlBR2lBRktBSUlJZ01nQVRZQ0RDQUJJQU0yQWdnTUF3c2dCVUVVYWlJRUtBSUFJZ05GQkVBZ0JTZ0NFQ0lEUlEwQ0lBVkJFR29oQkFzRFFDQUVJUWNnQXlJQlFSUnFJZ1FvQWdBaUF3MEFJQUZCRUdvaEJDQUJLQUlRSWdNTkFBc2dCMEVBTmdJQURBSUxJQVVnQVVGK2NUWUNCQ0FDSUFCQkFYSTJBZ1FnQUNBQ2FpQUFOZ0lBREFNTFFRQWhBUXNnQmtVTkFBSkFJQVVvQWh3aUEwRUNkRUdjSEdvaUJDZ0NBQ0FGUmdSQUlBUWdBVFlDQUNBQkRRRkI4QmxCOEJrb0FnQkJmaUFEZDNFMkFnQU1BZ3NnQmtFUVFSUWdCaWdDRUNBRlJodHFJQUUyQWdBZ0FVVU5BUXNnQVNBR05nSVlJQVVvQWhBaUF3UkFJQUVnQXpZQ0VDQURJQUUyQWhnTElBVW9BaFFpQTBVTkFDQUJJQU0yQWhRZ0F5QUJOZ0lZQ3lBQ0lBQkJBWEkyQWdRZ0FDQUNhaUFBTmdJQUlBSkJnQm9vQWdCSERRQkI5QmtnQURZQ0FBOExJQUJCL3dGTkJFQWdBRUY0Y1VHVUdtb2hBUUovUWV3WktBSUFJZ05CQVNBQVFRTjJkQ0lBY1VVRVFFSHNHU0FBSUFOeU5nSUFJQUVNQVFzZ0FTZ0NDQXNoQUNBQklBSTJBZ2dnQUNBQ05nSU1JQUlnQVRZQ0RDQUNJQUEyQWdnUEMwRWZJUU1nQUVILy8vOEhUUVJBSUFCQkppQUFRUWgyWnlJQmEzWkJBWEVnQVVFQmRHdEJQbW9oQXdzZ0FpQUROZ0ljSUFKQ0FEY0NFQ0FEUVFKMFFad2NhaUVCQWtBQ1FBSkFRZkFaS0FJQUlnUkJBU0FEZENJSGNVVUVRRUh3R1NBRUlBZHlOZ0lBSUFFZ0FqWUNBQ0FDSUFFMkFoZ01BUXNnQUVFWklBTkJBWFpyUVFBZ0EwRWZSeHQwSVFNZ0FTZ0NBQ0VCQTBBZ0FTSUVLQUlFUVhoeElBQkdEUUlnQTBFZGRpRUJJQU5CQVhRaEF5QUVJQUZCQkhGcUlnZEJFR29vQWdBaUFRMEFDeUFISUFJMkFoQWdBaUFFTmdJWUN5QUNJQUkyQWd3Z0FpQUNOZ0lJREFFTElBUW9BZ2dpQUNBQ05nSU1JQVFnQWpZQ0NDQUNRUUEyQWhnZ0FpQUVOZ0lNSUFJZ0FEWUNDQXRCakJwQmpCb29BZ0JCQVdzaUFFRi9JQUFiTmdJQUN3c0dBQ0FBRUF3TEtRQkI0QmxCQVRZQ0FFSGtHVUVBTmdJQUVCTkI1QmxCM0Jrb0FnQTJBZ0JCM0JsQjRCazJBZ0FMQWdBTHhTY0JESDhqQUVFUWF5SUtKQUFDUUFKQUFrQUNRQUpBQWtBQ1FBSkFBa0FnQUVIMEFVMEVRRUhzR1NnQ0FDSUdRUkFnQUVFTGFrRjRjU0FBUVF0Skd5SUZRUU4ySWdCMklnRkJBM0VFUUFKQUlBRkJmM05CQVhFZ0FHb2lBa0VEZENJQlFaUWFhaUlBSUFGQm5CcHFLQUlBSWdFb0FnZ2lBMFlFUUVIc0dTQUdRWDRnQW5keE5nSUFEQUVMSUFNZ0FEWUNEQ0FBSUFNMkFnZ0xJQUZCQ0dvaEFDQUJJQUpCQTNRaUFrRURjallDQkNBQklBSnFJZ0VnQVNnQ0JFRUJjallDQkF3S0N5QUZRZlFaS0FJQUlnZE5EUUVnQVFSQUFrQkJBaUFBZENJQ1FRQWdBbXR5SUFFZ0FIUnhhQ0lCUVFOMElnQkJsQnBxSWdJZ0FFR2NHbW9vQWdBaUFDZ0NDQ0lEUmdSQVFld1pJQVpCZmlBQmQzRWlCallDQUF3QkN5QURJQUkyQWd3Z0FpQUROZ0lJQ3lBQUlBVkJBM0kyQWdRZ0FDQUZhaUlFSUFGQkEzUWlBU0FGYXlJRFFRRnlOZ0lFSUFBZ0FXb2dBellDQUNBSEJFQWdCMEY0Y1VHVUdtb2hBVUdBR2lnQ0FDRUNBbjhnQmtFQklBZEJBM1owSWdWeFJRUkFRZXdaSUFVZ0JuSTJBZ0FnQVF3QkN5QUJLQUlJQ3lFRklBRWdBallDQ0NBRklBSTJBZ3dnQWlBQk5nSU1JQUlnQlRZQ0NBc2dBRUVJYWlFQVFZQWFJQVEyQWdCQjlCa2dBellDQUF3S0MwSHdHU2dDQUNJTFJRMEJJQXRvUVFKMFFad2NhaWdDQUNJQ0tBSUVRWGh4SUFWcklRUWdBaUVCQTBBQ1FDQUJLQUlRSWdCRkJFQWdBU2dDRkNJQVJRMEJDeUFBS0FJRVFYaHhJQVZySWdFZ0JDQUJJQVJKSWdFYklRUWdBQ0FDSUFFYklRSWdBQ0VCREFFTEN5QUNLQUlZSVFrZ0FpQUNLQUlNSWdOSEJFQkIvQmtvQWdBYUlBSW9BZ2dpQUNBRE5nSU1JQU1nQURZQ0NBd0pDeUFDUVJScUlnRW9BZ0FpQUVVRVFDQUNLQUlRSWdCRkRRTWdBa0VRYWlFQkN3TkFJQUVoQ0NBQUlnTkJGR29pQVNnQ0FDSUFEUUFnQTBFUWFpRUJJQU1vQWhBaUFBMEFDeUFJUVFBMkFnQU1DQXRCZnlFRklBQkJ2MzlMRFFBZ0FFRUxhaUlBUVhoeElRVkI4QmtvQWdBaUNFVU5BRUVBSUFWcklRUUNRQUpBQWtBQ2YwRUFJQVZCZ0FKSkRRQWFRUjhnQlVILy8vOEhTdzBBR2lBRlFTWWdBRUVJZG1jaUFHdDJRUUZ4SUFCQkFYUnJRVDVxQ3lJSFFRSjBRWndjYWlnQ0FDSUJSUVJBUVFBaEFBd0JDMEVBSVFBZ0JVRVpJQWRCQVhaclFRQWdCMEVmUnh0MElRSURRQUpBSUFFb0FnUkJlSEVnQldzaUJpQUVUdzBBSUFFaEF5QUdJZ1FOQUVFQUlRUWdBU0VBREFNTElBQWdBU2dDRkNJR0lBWWdBU0FDUVIxMlFRUnhhaWdDRUNJQlJoc2dBQ0FHR3lFQUlBSkJBWFFoQWlBQkRRQUxDeUFBSUFOeVJRUkFRUUFoQTBFQ0lBZDBJZ0JCQUNBQWEzSWdDSEVpQUVVTkF5QUFhRUVDZEVHY0hHb29BZ0FoQUFzZ0FFVU5BUXNEUUNBQUtBSUVRWGh4SUFWcklnSWdCRWtoQVNBQ0lBUWdBUnNoQkNBQUlBTWdBUnNoQXlBQUtBSVFJZ0VFZnlBQkJTQUFLQUlVQ3lJQURRQUxDeUFEUlEwQUlBUkI5QmtvQWdBZ0JXdFBEUUFnQXlnQ0dDRUhJQU1nQXlnQ0RDSUNSd1JBUWZ3WktBSUFHaUFES0FJSUlnQWdBallDRENBQ0lBQTJBZ2dNQndzZ0EwRVVhaUlCS0FJQUlnQkZCRUFnQXlnQ0VDSUFSUTBESUFOQkVHb2hBUXNEUUNBQklRWWdBQ0lDUVJScUlnRW9BZ0FpQUEwQUlBSkJFR29oQVNBQ0tBSVFJZ0FOQUFzZ0JrRUFOZ0lBREFZTElBVkI5QmtvQWdBaUEwMEVRRUdBR2lnQ0FDRUFBa0FnQXlBRmF5SUJRUkJQQkVBZ0FDQUZhaUlDSUFGQkFYSTJBZ1FnQUNBRGFpQUJOZ0lBSUFBZ0JVRURjallDQkF3QkN5QUFJQU5CQTNJMkFnUWdBQ0FEYWlJQklBRW9BZ1JCQVhJMkFnUkJBQ0VDUVFBaEFRdEI5QmtnQVRZQ0FFR0FHaUFDTmdJQUlBQkJDR29oQUF3SUN5QUZRZmdaS0FJQUlnSkpCRUJCK0JrZ0FpQUZheUlCTmdJQVFZUWFRWVFhS0FJQUlnQWdCV29pQWpZQ0FDQUNJQUZCQVhJMkFnUWdBQ0FGUVFOeU5nSUVJQUJCQ0dvaEFBd0lDMEVBSVFBZ0JVRXZhaUlFQW45QnhCMG9BZ0FFUUVITUhTZ0NBQXdCQzBIUUhVSi9Od0lBUWNnZFFvQ2dnSUNBZ0FRM0FnQkJ4QjBnQ2tFTWFrRndjVUhZcXRXcUJYTTJBZ0JCMkIxQkFEWUNBRUdvSFVFQU5nSUFRWUFnQ3lJQmFpSUdRUUFnQVdzaUNIRWlBU0FGVFEwSFFhUWRLQUlBSWdNRVFFR2NIU2dDQUNJSElBRnFJZ2tnQjAwZ0F5QUpTWElOQ0FzQ1FFR29IUzBBQUVFRWNVVUVRQUpBQWtBQ1FBSkFRWVFhS0FJQUlnTUVRRUdzSFNFQUEwQWdBeUFBS0FJQUlnZFBCRUFnQnlBQUtBSUVhaUFEU3cwREN5QUFLQUlJSWdBTkFBc0xRUUFRQ3lJQ1FYOUdEUU1nQVNFR1FjZ2RLQUlBSWdCQkFXc2lBeUFDY1FSQUlBRWdBbXNnQWlBRGFrRUFJQUJyY1dvaEJnc2dCU0FHVHcwRFFhUWRLQUlBSWdBRVFFR2NIU2dDQUNJRElBWnFJZ2dnQTAwZ0FDQUlTWElOQkFzZ0JoQUxJZ0FnQWtjTkFRd0ZDeUFHSUFKcklBaHhJZ1lRQ3lJQ0lBQW9BZ0FnQUNnQ0JHcEdEUUVnQWlFQUN5QUFRWDlHRFFFZ0JVRXdhaUFHVFFSQUlBQWhBZ3dFQzBITUhTZ0NBQ0lDSUFRZ0JtdHFRUUFnQW10eElnSVFDMEYvUmcwQklBSWdCbW9oQmlBQUlRSU1Bd3NnQWtGL1J3MENDMEdvSFVHb0hTZ0NBRUVFY2pZQ0FBc2dBUkFMSWdKQmYwWkJBQkFMSWdCQmYwWnlJQUFnQWsxeURRVWdBQ0FDYXlJR0lBVkJLR3BORFFVTFFad2RRWndkS0FJQUlBWnFJZ0EyQWdCQm9CMG9BZ0FnQUVrRVFFR2dIU0FBTmdJQUN3SkFRWVFhS0FJQUlnUUVRRUdzSFNFQUEwQWdBaUFBS0FJQUlnRWdBQ2dDQkNJRGFrWU5BaUFBS0FJSUlnQU5BQXNNQkF0Qi9Ca29BZ0FpQUVFQUlBQWdBazBiUlFSQVFmd1pJQUkyQWdBTFFRQWhBRUd3SFNBR05nSUFRYXdkSUFJMkFnQkJqQnBCZnpZQ0FFR1FHa0hFSFNnQ0FEWUNBRUc0SFVFQU5nSUFBMEFnQUVFRGRDSUJRWndhYWlBQlFaUWFhaUlETmdJQUlBRkJvQnBxSUFNMkFnQWdBRUVCYWlJQVFTQkhEUUFMUWZnWklBWkJLR3NpQUVGNElBSnJRUWR4SWdGcklnTTJBZ0JCaEJvZ0FTQUNhaUlCTmdJQUlBRWdBMEVCY2pZQ0JDQUFJQUpxUVNnMkFnUkJpQnBCMUIwb0FnQTJBZ0FNQkFzZ0FpQUVUU0FCSUFSTGNnMENJQUFvQWd4QkNIRU5BaUFBSUFNZ0JtbzJBZ1JCaEJvZ0JFRjRJQVJyUVFkeElnQnFJZ0UyQWdCQitCbEIrQmtvQWdBZ0Jtb2lBaUFBYXlJQU5nSUFJQUVnQUVFQmNqWUNCQ0FDSUFScVFTZzJBZ1JCaUJwQjFCMG9BZ0EyQWdBTUF3dEJBQ0VEREFVTFFRQWhBZ3dEQzBIOEdTZ0NBQ0FDU3dSQVFmd1pJQUkyQWdBTElBSWdCbW9oQVVHc0hTRUFBa0FDUUFKQUEwQWdBU0FBS0FJQVJ3UkFJQUFvQWdnaUFBMEJEQUlMQ3lBQUxRQU1RUWh4UlEwQkMwR3NIU0VBQTBBQ1FDQUVJQUFvQWdBaUFVOEVRQ0FCSUFBb0FnUnFJZ01nQkVzTkFRc2dBQ2dDQ0NFQURBRUxDMEg0R1NBR1FTaHJJZ0JCZUNBQ2EwRUhjU0lCYXlJSU5nSUFRWVFhSUFFZ0Ftb2lBVFlDQUNBQklBaEJBWEkyQWdRZ0FDQUNha0VvTmdJRVFZZ2FRZFFkS0FJQU5nSUFJQVFnQTBFbklBTnJRUWR4YWtFdmF5SUFJQUFnQkVFUWFra2JJZ0ZCR3pZQ0JDQUJRYlFkS1FJQU53SVFJQUZCckIwcEFnQTNBZ2hCdEIwZ0FVRUlhallDQUVHd0hTQUdOZ0lBUWF3ZElBSTJBZ0JCdUIxQkFEWUNBQ0FCUVJocUlRQURRQ0FBUVFjMkFnUWdBRUVJYWlFTUlBQkJCR29oQUNBTUlBTkpEUUFMSUFFZ0JFWU5BaUFCSUFFb0FnUkJmbkUyQWdRZ0JDQUJJQVJySWdKQkFYSTJBZ1FnQVNBQ05nSUFJQUpCL3dGTkJFQWdBa0Y0Y1VHVUdtb2hBQUovUWV3WktBSUFJZ0ZCQVNBQ1FRTjJkQ0lDY1VVRVFFSHNHU0FCSUFKeU5nSUFJQUFNQVFzZ0FDZ0NDQXNoQVNBQUlBUTJBZ2dnQVNBRU5nSU1JQVFnQURZQ0RDQUVJQUUyQWdnTUF3dEJIeUVBSUFKQi8vLy9CMDBFUUNBQ1FTWWdBa0VJZG1jaUFHdDJRUUZ4SUFCQkFYUnJRVDVxSVFBTElBUWdBRFlDSENBRVFnQTNBaEFnQUVFQ2RFR2NIR29oQVFKQVFmQVpLQUlBSWdOQkFTQUFkQ0lHY1VVRVFFSHdHU0FESUFaeU5nSUFJQUVnQkRZQ0FBd0JDeUFDUVJrZ0FFRUJkbXRCQUNBQVFSOUhHM1FoQUNBQktBSUFJUU1EUUNBRElnRW9BZ1JCZUhFZ0FrWU5BeUFBUVIxMklRTWdBRUVCZENFQUlBRWdBMEVFY1dvaUJpZ0NFQ0lERFFBTElBWWdCRFlDRUFzZ0JDQUJOZ0lZSUFRZ0JEWUNEQ0FFSUFRMkFnZ01BZ3NnQUNBQ05nSUFJQUFnQUNnQ0JDQUdhallDQkNBQ1FYZ2dBbXRCQjNGcUlnY2dCVUVEY2pZQ0JDQUJRWGdnQVd0QkIzRnFJZ1FnQlNBSGFpSUZheUVHQWtCQmhCb29BZ0FnQkVZRVFFR0VHaUFGTmdJQVFmZ1pRZmdaS0FJQUlBWnFJZ0EyQWdBZ0JTQUFRUUZ5TmdJRURBRUxRWUFhS0FJQUlBUkdCRUJCZ0JvZ0JUWUNBRUgwR1VIMEdTZ0NBQ0FHYWlJQU5nSUFJQVVnQUVFQmNqWUNCQ0FBSUFWcUlBQTJBZ0FNQVFzZ0JDZ0NCQ0lDUVFOeFFRRkdCRUFnQWtGNGNTRUpBa0FnQWtIL0FVMEVRQ0FFS0FJTUlnQWdCQ2dDQ0NJQlJnUkFRZXdaUWV3WktBSUFRWDRnQWtFRGRuZHhOZ0lBREFJTElBRWdBRFlDRENBQUlBRTJBZ2dNQVFzZ0JDZ0NHQ0VJQWtBZ0JDQUVLQUlNSWdCSEJFQkIvQmtvQWdBYUlBUW9BZ2dpQVNBQU5nSU1JQUFnQVRZQ0NBd0JDd0pBSUFSQkZHb2lBU2dDQUNJQ1JRUkFJQVFvQWhBaUFrVU5BU0FFUVJCcUlRRUxBMEFnQVNFRElBSWlBRUVVYWlJQktBSUFJZ0lOQUNBQVFSQnFJUUVnQUNnQ0VDSUNEUUFMSUFOQkFEWUNBQXdCQzBFQUlRQUxJQWhGRFFBQ1FDQUVLQUljSWdGQkFuUkJuQnhxSWdJb0FnQWdCRVlFUUNBQ0lBQTJBZ0FnQUEwQlFmQVpRZkFaS0FJQVFYNGdBWGR4TmdJQURBSUxJQWhCRUVFVUlBZ29BaEFnQkVZYmFpQUFOZ0lBSUFCRkRRRUxJQUFnQ0RZQ0dDQUVLQUlRSWdFRVFDQUFJQUUyQWhBZ0FTQUFOZ0lZQ3lBRUtBSVVJZ0ZGRFFBZ0FDQUJOZ0lVSUFFZ0FEWUNHQXNnQmlBSmFpRUdJQVFnQ1dvaUJDZ0NCQ0VDQ3lBRUlBSkJmbkUyQWdRZ0JTQUdRUUZ5TmdJRUlBVWdCbW9nQmpZQ0FDQUdRZjhCVFFSQUlBWkJlSEZCbEJwcUlRQUNmMEhzR1NnQ0FDSUJRUUVnQmtFRGRuUWlBbkZGQkVCQjdCa2dBU0FDY2pZQ0FDQUFEQUVMSUFBb0FnZ0xJUUVnQUNBRk5nSUlJQUVnQlRZQ0RDQUZJQUEyQWd3Z0JTQUJOZ0lJREFFTFFSOGhBaUFHUWYvLy93ZE5CRUFnQmtFbUlBWkJDSFpuSWdCcmRrRUJjU0FBUVFGMGEwRSthaUVDQ3lBRklBSTJBaHdnQlVJQU53SVFJQUpCQW5SQm5CeHFJUUVDUUFKQVFmQVpLQUlBSWdCQkFTQUNkQ0lEY1VVRVFFSHdHU0FBSUFOeU5nSUFJQUVnQlRZQ0FBd0JDeUFHUVJrZ0FrRUJkbXRCQUNBQ1FSOUhHM1FoQWlBQktBSUFJUUFEUUNBQUlnRW9BZ1JCZUhFZ0JrWU5BaUFDUVIxMklRQWdBa0VCZENFQ0lBRWdBRUVFY1dvaUF5Z0NFQ0lBRFFBTElBTWdCVFlDRUFzZ0JTQUJOZ0lZSUFVZ0JUWUNEQ0FGSUFVMkFnZ01BUXNnQVNnQ0NDSUFJQVUyQWd3Z0FTQUZOZ0lJSUFWQkFEWUNHQ0FGSUFFMkFnd2dCU0FBTmdJSUN5QUhRUWhxSVFBTUJRc2dBU2dDQ0NJQUlBUTJBZ3dnQVNBRU5nSUlJQVJCQURZQ0dDQUVJQUUyQWd3Z0JDQUFOZ0lJQzBINEdTZ0NBQ0lBSUFWTkRRQkIrQmtnQUNBRmF5SUJOZ0lBUVlRYVFZUWFLQUlBSWdBZ0JXb2lBallDQUNBQ0lBRkJBWEkyQWdRZ0FDQUZRUU55TmdJRUlBQkJDR29oQUF3REMwSG9HVUV3TmdJQVFRQWhBQXdDQ3dKQUlBZEZEUUFDUUNBREtBSWNJZ0JCQW5SQm5CeHFJZ0VvQWdBZ0EwWUVRQ0FCSUFJMkFnQWdBZzBCUWZBWklBaEJmaUFBZDNFaUNEWUNBQXdDQ3lBSFFSQkJGQ0FIS0FJUUlBTkdHMm9nQWpZQ0FDQUNSUTBCQ3lBQ0lBYzJBaGdnQXlnQ0VDSUFCRUFnQWlBQU5nSVFJQUFnQWpZQ0dBc2dBeWdDRkNJQVJRMEFJQUlnQURZQ0ZDQUFJQUkyQWhnTEFrQWdCRUVQVFFSQUlBTWdCQ0FGYWlJQVFRTnlOZ0lFSUFBZ0Eyb2lBQ0FBS0FJRVFRRnlOZ0lFREFFTElBTWdCVUVEY2pZQ0JDQURJQVZxSWdJZ0JFRUJjallDQkNBQ0lBUnFJQVEyQWdBZ0JFSC9BVTBFUUNBRVFYaHhRWlFhYWlFQUFuOUI3QmtvQWdBaUFVRUJJQVJCQTNaMElnVnhSUVJBUWV3WklBRWdCWEkyQWdBZ0FBd0JDeUFBS0FJSUN5RUJJQUFnQWpZQ0NDQUJJQUkyQWd3Z0FpQUFOZ0lNSUFJZ0FUWUNDQXdCQzBFZklRQWdCRUgvLy84SFRRUkFJQVJCSmlBRVFRaDJaeUlBYTNaQkFYRWdBRUVCZEd0QlBtb2hBQXNnQWlBQU5nSWNJQUpDQURjQ0VDQUFRUUowUVp3Y2FpRUJBa0FDUUNBSVFRRWdBSFFpQlhGRkJFQkI4QmtnQlNBSWNqWUNBQ0FCSUFJMkFnQU1BUXNnQkVFWklBQkJBWFpyUVFBZ0FFRWZSeHQwSVFBZ0FTZ0NBQ0VGQTBBZ0JTSUJLQUlFUVhoeElBUkdEUUlnQUVFZGRpRUZJQUJCQVhRaEFDQUJJQVZCQkhGcUlnWW9BaEFpQlEwQUN5QUdJQUkyQWhBTElBSWdBVFlDR0NBQ0lBSTJBZ3dnQWlBQ05nSUlEQUVMSUFFb0FnZ2lBQ0FDTmdJTUlBRWdBallDQ0NBQ1FRQTJBaGdnQWlBQk5nSU1JQUlnQURZQ0NBc2dBMEVJYWlFQURBRUxBa0FnQ1VVTkFBSkFJQUlvQWh3aUFFRUNkRUdjSEdvaUFTZ0NBQ0FDUmdSQUlBRWdBellDQUNBRERRRkI4QmtnQzBGK0lBQjNjVFlDQUF3Q0N5QUpRUkJCRkNBSktBSVFJQUpHRzJvZ0F6WUNBQ0FEUlEwQkN5QURJQWsyQWhnZ0FpZ0NFQ0lBQkVBZ0F5QUFOZ0lRSUFBZ0F6WUNHQXNnQWlnQ0ZDSUFSUTBBSUFNZ0FEWUNGQ0FBSUFNMkFoZ0xBa0FnQkVFUFRRUkFJQUlnQkNBRmFpSUFRUU55TmdJRUlBQWdBbW9pQUNBQUtBSUVRUUZ5TmdJRURBRUxJQUlnQlVFRGNqWUNCQ0FDSUFWcUlnTWdCRUVCY2pZQ0JDQURJQVJxSUFRMkFnQWdCd1JBSUFkQmVIRkJsQnBxSVFCQmdCb29BZ0FoQVFKL1FRRWdCMEVEZG5RaUJTQUdjVVVFUUVIc0dTQUZJQVp5TmdJQUlBQU1BUXNnQUNnQ0NBc2hCU0FBSUFFMkFnZ2dCU0FCTmdJTUlBRWdBRFlDRENBQklBVTJBZ2dMUVlBYUlBTTJBZ0JCOUJrZ0JEWUNBQXNnQWtFSWFpRUFDeUFLUVJCcUpBQWdBQXNoQUNBQkJFQURRQ0FBUVFBNkFBQWdBRUVCYWlFQUlBRkJBV3NpQVEwQUN3c0xIQUFnQUNBQlFRZ2dBcWNnQWtJZ2lLY2dBNmNnQTBJZ2lLY1FCUXZoQXdCQmpCZEJtZ2tRQ1VHWUYwRzVDRUVCUVFBUUNFR2tGMEcwQ0VFQlFZQi9RZjhBRUFGQnZCZEJyUWhCQVVHQWYwSC9BQkFCUWJBWFFhc0lRUUZCQUVIL0FSQUJRY2dYUVlrSVFRSkJnSUIrUWYvL0FSQUJRZFFYUVlBSVFRSkJBRUgvL3dNUUFVSGdGMEdZQ0VFRVFZQ0FnSUI0UWYvLy8vOEhFQUZCN0JkQmp3aEJCRUVBUVg4UUFVSDRGMEhYQ0VFRVFZQ0FnSUI0UWYvLy8vOEhFQUZCaEJoQnpnaEJCRUVBUVg4UUFVR1FHRUdqQ0VLQWdJQ0FnSUNBZ0lCL1F2Ly8vLy8vLy8vLy93QVFFa0djR0VHaUNFSUFRbjhRRWtHb0dFR2NDRUVFRUFSQnRCaEJrd2xCQ0JBRVFZUVBRZWtJRUFOQnpBOUJsdzBRQTBHVUVFRUVRZHdJRUFKQjRCQkJBa0gxQ0JBQ1Fhd1JRUVJCaEFrUUFrSElFVUcrQ0JBSFFmQVJRUUJCMGd3UUFFR1lFa0VBUWJnTkVBQkJ3QkpCQVVId0RCQUFRZWdTUVFKQm53a1FBRUdRRTBFRFFiNEpFQUJCdUJOQkJFSG1DUkFBUWVBVFFRVkJnd29RQUVHSUZFRUVRZDBORUFCQnNCUkJCVUg3RFJBQVFaZ1NRUUJCNlFvUUFFSEFFa0VCUWNnS0VBQkI2QkpCQWtHckN4QUFRWkFUUVFOQmlRc1FBRUc0RTBFRVFiRU1FQUJCNEJOQkJVR1BEQkFBUWRnVVFRaEI3Z3NRQUVHQUZVRUpRY3dMRUFCQnFCVkJCa0dwQ2hBQVFkQVZRUWRCb2c0UUFBc2dBQUpBSUFBb0FnUWdBVWNOQUNBQUtBSWNRUUZHRFFBZ0FDQUNOZ0ljQ3d1YUFRQWdBRUVCT2dBMUFrQWdBQ2dDQkNBQ1J3MEFJQUJCQVRvQU5BSkFJQUFvQWhBaUFrVUVRQ0FBUVFFMkFpUWdBQ0FETmdJWUlBQWdBVFlDRUNBRFFRRkhEUUlnQUNnQ01FRUJSZzBCREFJTElBRWdBa1lFUUNBQUtBSVlJZ0pCQWtZRVFDQUFJQU0yQWhnZ0F5RUNDeUFBS0FJd1FRRkhEUUlnQWtFQlJnMEJEQUlMSUFBZ0FDZ0NKRUVCYWpZQ0pBc2dBRUVCT2dBMkN3dGRBUUYvSUFBb0FoQWlBMFVFUUNBQVFRRTJBaVFnQUNBQ05nSVlJQUFnQVRZQ0VBOExBa0FnQVNBRFJnUkFJQUFvQWhoQkFrY05BU0FBSUFJMkFoZ1BDeUFBUVFFNkFEWWdBRUVDTmdJWUlBQWdBQ2dDSkVFQmFqWUNKQXNMQkFBZ0FBc2FBQ0FBSUFFb0FnZ2dCUkFLQkVBZ0FTQUNJQU1nQkJBVkN3czNBQ0FBSUFFb0FnZ2dCUkFLQkVBZ0FTQUNJQU1nQkJBVkR3c2dBQ2dDQ0NJQUlBRWdBaUFESUFRZ0JTQUFLQUlBS0FJVUVRTUFDNUVCQUNBQUlBRW9BZ2dnQkJBS0JFQWdBU0FDSUFNUUZBOExBa0FnQUNBQktBSUFJQVFRQ2tVTkFBSkFJQUlnQVNnQ0VFY0VRQ0FCS0FJVUlBSkhEUUVMSUFOQkFVY05BU0FCUVFFMkFpQVBDeUFCSUFJMkFoUWdBU0FETmdJZ0lBRWdBU2dDS0VFQmFqWUNLQUpBSUFFb0FpUkJBVWNOQUNBQktBSVlRUUpIRFFBZ0FVRUJPZ0EyQ3lBQlFRUTJBaXdMQy9JQkFDQUFJQUVvQWdnZ0JCQUtCRUFnQVNBQ0lBTVFGQThMQWtBZ0FDQUJLQUlBSUFRUUNnUkFBa0FnQWlBQktBSVFSd1JBSUFFb0FoUWdBa2NOQVFzZ0EwRUJSdzBDSUFGQkFUWUNJQThMSUFFZ0F6WUNJQUpBSUFFb0FpeEJCRVlOQUNBQlFRQTdBVFFnQUNnQ0NDSUFJQUVnQWlBQ1FRRWdCQ0FBS0FJQUtBSVVFUU1BSUFFdEFEVUVRQ0FCUVFNMkFpd2dBUzBBTkVVTkFRd0RDeUFCUVFRMkFpd0xJQUVnQWpZQ0ZDQUJJQUVvQWloQkFXbzJBaWdnQVNnQ0pFRUJSdzBCSUFFb0FoaEJBa2NOQVNBQlFRRTZBRFlQQ3lBQUtBSUlJZ0FnQVNBQ0lBTWdCQ0FBS0FJQUtBSVlFUUlBQ3dzeEFDQUFJQUVvQWdoQkFCQUtCRUFnQVNBQ0lBTVFGZzhMSUFBb0FnZ2lBQ0FCSUFJZ0F5QUFLQUlBS0FJY0VRQUFDeGdBSUFBZ0FTZ0NDRUVBRUFvRVFDQUJJQUlnQXhBV0N3dkpBd0VGZnlNQVFVQnFJZ1FrQUFKL1FRRWdBQ0FCUVFBUUNnMEFHa0VBSUFGRkRRQWFJd0JCUUdvaUF5UUFJQUVvQWdBaUJVRUVheWdDQUNFR0lBVkJDR3NvQWdBaEJTQURRZ0EzQWlBZ0EwSUFOd0lvSUFOQ0FEY0NNQ0FEUWdBM0FEY2dBMElBTndJWUlBTkJBRFlDRkNBRFFmd1ZOZ0lRSUFNZ0FUWUNEQ0FEUWF3V05nSUlJQUVnQldvaEFVRUFJUVVDUUNBR1Fhd1dRUUFRQ2dSQUlBTkJBVFlDT0NBR0lBTkJDR29nQVNBQlFRRkJBQ0FHS0FJQUtBSVVFUU1BSUFGQkFDQURLQUlnUVFGR0d5RUZEQUVMSUFZZ0EwRUlhaUFCUVFGQkFDQUdLQUlBS0FJWUVRSUFBa0FDUUNBREtBSXNEZ0lBQVFJTElBTW9BaHhCQUNBREtBSW9RUUZHRzBFQUlBTW9BaVJCQVVZYlFRQWdBeWdDTUVFQlJoc2hCUXdCQ3lBREtBSWdRUUZIQkVBZ0F5Z0NNQTBCSUFNb0FpUkJBVWNOQVNBREtBSW9RUUZIRFFFTElBTW9BaGdoQlFzZ0EwRkFheVFBUVFBZ0JTSUJSUTBBR2lBRVFReHFRVFFRRVNBRVFRRTJBamdnQkVGL05nSVVJQVFnQURZQ0VDQUVJQUUyQWdnZ0FTQUVRUWhxSUFJb0FnQkJBU0FCS0FJQUtBSWNFUUFBSUFRb0FpQWlBRUVCUmdSQUlBSWdCQ2dDR0RZQ0FBc2dBRUVCUmdzaEJ5QUVRVUJySkFBZ0J3c0tBQ0FBSUFGQkFCQUtDOFVEQWdOL0FuMUIvLy8vL3djaENVR0FnSUNBZUNFREEwQWdBU0FIUmdSQVF3QUFnRWNnQXlBSmE3S1ZJUXRCQUNFREFrQkJnSUFRRUJBaUFFVU5BQ0FBUVFSckxRQUFRUU54UlEwQUlBQkJnSUFRRUJFTEEwQWdBU0FEUmdSQVFRQWhBeUFHUVFBMkFnQWdBRUVFYXlFQ1FRQWhDVUVCSVFjRFFDQUhRWUNBQkVjRVFDQUdJQWRCQW5RaUNHb2dBaUFJYWlnQ0FDQUphaUlKTmdJQUlBZEJBV29oQnd3QkN3c0RRQ0FCSUFOSEJFQWdCaUFFSUFOQkFuUnFLQUlBUVFKMGFpSUNJQUlvQWdBaUFrRUJhallDQUNBRklBSkJBblJxSUFNMkFnQWdBMEVCYWlFRERBRUxDeUFBRUF3RkFuOGdDeUFFSUFOQkFuUnFJZ2NvQWdBZ0NXdXpsQ0lLUXdBQWdFOWRJQXBEQUFBQUFHQnhCRUFnQ3FrTUFRdEJBQXNoQWlBSElBSTJBZ0FnQUNBQ1FRSjBhaUlDSUFJb0FnQkJBV28yQWdBZ0EwRUJhaUVEREFFTEN3VWdCQ0FIUVFKMGFnSi9JQUFxQWdnZ0FpQUhRUVYwYWlJSUtnSUFsQ0FBS2dJWUlBZ3FBZ1NVa2lBQUtnSW9JQWdxQWdpVWtrTUFBSUJGbENJS2kwTUFBQUJQWFFSQUlBcW9EQUVMUVlDQWdJQjRDeUlJTmdJQUlBa2dDQ0FJSUFsS0d5RUpJQU1nQ0NBRElBaEtHeUVESUFkQkFXb2hCd3dCQ3dzTEMrY1JBZ0JCZ0FnTDFoRjFibk5wWjI1bFpDQnphRzl5ZEFCMWJuTnBaMjVsWkNCcGJuUUFabXh2WVhRQWRXbHVkRFkwWDNRQWRXNXphV2R1WldRZ1kyaGhjZ0JpYjI5c0FHVnRjMk55YVhCMFpXNDZPblpoYkFCMWJuTnBaMjVsWkNCc2IyNW5BSE4wWkRvNmQzTjBjbWx1WndCemRHUTZPbk4wY21sdVp3QnpkR1E2T25VeE5uTjBjbWx1WndCemRHUTZPblV6TW5OMGNtbHVad0JrYjNWaWJHVUFkbTlwWkFCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenh6YUc5eWRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXNXphV2R1WldRZ2MyaHZjblErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQR2x1ZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4ZFc1emFXZHVaV1FnYVc1MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4bWJHOWhkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhkV2x1ZERoZmRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGFXNTBPRjkwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYVc1ME1UWmZkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhhVzUwTVRaZmRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXbHVkRFkwWDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEdsdWREWTBYM1ErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQSFZwYm5Rek1sOTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHBiblF6TWw5MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4amFHRnlQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eDFibk5wWjI1bFpDQmphR0Z5UGdCemRHUTZPbUpoYzJsalgzTjBjbWx1Wnp4MWJuTnBaMjVsWkNCamFHRnlQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHphV2R1WldRZ1kyaGhjajRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhiRzl1Wno0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4ZFc1emFXZHVaV1FnYkc5dVp6NEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOFpHOTFZbXhsUGdCT1UzUXpYMTh5TVRKaVlYTnBZMTl6ZEhKcGJtZEpZMDVUWHpFeFkyaGhjbDkwY21GcGRITkpZMFZGVGxOZk9XRnNiRzlqWVhSdmNrbGpSVVZGUlFBQUFBQkVEQUFBUWdjQUFFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGxvVGxOZk1URmphR0Z5WDNSeVlXbDBjMGxvUlVWT1UxODVZV3hzYjJOaGRHOXlTV2hGUlVWRkFBQkVEQUFBakFjQUFFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGwzVGxOZk1URmphR0Z5WDNSeVlXbDBjMGwzUlVWT1UxODVZV3hzYjJOaGRHOXlTWGRGUlVWRkFBQkVEQUFBMUFjQUFFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGxFYzA1VFh6RXhZMmhoY2w5MGNtRnBkSE5KUkhORlJVNVRYemxoYkd4dlkyRjBiM0pKUkhORlJVVkZBQUFBUkF3QUFCd0lBQUJPVTNRelgxOHlNVEppWVhOcFkxOXpkSEpwYm1kSlJHbE9VMTh4TVdOb1lYSmZkSEpoYVhSelNVUnBSVVZPVTE4NVlXeHNiMk5oZEc5eVNVUnBSVVZGUlFBQUFFUU1BQUJvQ0FBQVRqRXdaVzF6WTNKcGNIUmxiak4yWVd4RkFBQkVEQUFBdEFnQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NXTkZSUUFBUkF3QUFOQUlBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGxoUlVVQUFFUU1BQUQ0Q0FBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSmFFVkZBQUJFREFBQUlBa0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTWE5GUlFBQVJBd0FBRWdKQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsMFJVVUFBRVFNQUFCd0NRQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEphVVZGQUFCRURBQUFtQWtBQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1dwRlJRQUFSQXdBQU1BSkFBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbHNSVVVBQUVRTUFBRG9DUUFBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKYlVWRkFBQkVEQUFBRUFvQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NYaEZSUUFBUkF3QUFEZ0tBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGw1UlVVQUFFUU1BQUJnQ2dBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSlprVkZBQUJFREFBQWlBb0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTV1JGUlFBQVJBd0FBTEFLQUFCT01UQmZYMk40ZUdGaWFYWXhNVFpmWDNOb2FXMWZkSGx3WlY5cGJtWnZSUUFBQUFCc0RBQUEyQW9BQU5BTUFBQk9NVEJmWDJONGVHRmlhWFl4TVRkZlgyTnNZWE56WDNSNWNHVmZhVzVtYjBVQUFBQnNEQUFBQ0FzQUFQd0tBQUFBQUFBQWZBc0FBQUlBQUFBREFBQUFCQUFBQUFVQUFBQUdBQUFBVGpFd1gxOWplSGhoWW1sMk1USXpYMTltZFc1a1lXMWxiblJoYkY5MGVYQmxYMmx1Wm05RkFHd01BQUJVQ3dBQS9Bb0FBSFlBQUFCQUN3QUFpQXNBQUdJQUFBQkFDd0FBbEFzQUFHTUFBQUJBQ3dBQW9Bc0FBR2dBQUFCQUN3QUFyQXNBQUdFQUFBQkFDd0FBdUFzQUFITUFBQUJBQ3dBQXhBc0FBSFFBQUFCQUN3QUEwQXNBQUdrQUFBQkFDd0FBM0FzQUFHb0FBQUJBQ3dBQTZBc0FBR3dBQUFCQUN3QUE5QXNBQUcwQUFBQkFDd0FBQUF3QUFIZ0FBQUJBQ3dBQURBd0FBSGtBQUFCQUN3QUFHQXdBQUdZQUFBQkFDd0FBSkF3QUFHUUFBQUJBQ3dBQU1Bd0FBQUFBQUFBc0N3QUFBZ0FBQUFjQUFBQUVBQUFBQlFBQUFBZ0FBQUFKQUFBQUNnQUFBQXNBQUFBQUFBQUF0QXdBQUFJQUFBQU1BQUFBQkFBQUFBVUFBQUFJQUFBQURRQUFBQTRBQUFBUEFBQUFUakV3WDE5amVIaGhZbWwyTVRJd1gxOXphVjlqYkdGemMxOTBlWEJsWDJsdVptOUZBQUFBQUd3TUFBQ01EQUFBTEFzQUFGTjBPWFI1Y0dWZmFXNW1id0FBQUFCRURBQUF3QXdBUWRnWkN3UGdEZ0U9IjtpZighaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSl7d2FzbUJpbmFyeUZpbGU9bG9jYXRlRmlsZSh3YXNtQmluYXJ5RmlsZSk7fWZ1bmN0aW9uIGdldEJpbmFyeVN5bmMoZmlsZSl7aWYoZmlsZT09d2FzbUJpbmFyeUZpbGUmJndhc21CaW5hcnkpe3JldHVybiBuZXcgVWludDhBcnJheSh3YXNtQmluYXJ5KX12YXIgYmluYXJ5PXRyeVBhcnNlQXNEYXRhVVJJKGZpbGUpO2lmKGJpbmFyeSl7cmV0dXJuIGJpbmFyeX1pZihyZWFkQmluYXJ5KXtyZXR1cm4gcmVhZEJpbmFyeShmaWxlKX10aHJvdyAiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWQifWZ1bmN0aW9uIGdldEJpbmFyeVByb21pc2UoYmluYXJ5RmlsZSl7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9PmdldEJpbmFyeVN5bmMoYmluYXJ5RmlsZSkpfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIoYmluYXJ5RmlsZSxpbXBvcnRzLHJlY2VpdmVyKXtyZXR1cm4gZ2V0QmluYXJ5UHJvbWlzZShiaW5hcnlGaWxlKS50aGVuKGJpbmFyeT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LGltcG9ydHMpKS50aGVuKGluc3RhbmNlPT5pbnN0YW5jZSkudGhlbihyZWNlaXZlcixyZWFzb249PntlcnIoYGZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICR7cmVhc29ufWApO2Fib3J0KHJlYXNvbik7fSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBc3luYyhiaW5hcnksYmluYXJ5RmlsZSxpbXBvcnRzLGNhbGxiYWNrKXtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spfWZ1bmN0aW9uIGNyZWF0ZVdhc20oKXt2YXIgaW5mbz17ImEiOndhc21JbXBvcnRzfTtmdW5jdGlvbiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UsbW9kdWxlKXt3YXNtRXhwb3J0cz1pbnN0YW5jZS5leHBvcnRzO3dhc21NZW1vcnk9d2FzbUV4cG9ydHNbImsiXTt1cGRhdGVNZW1vcnlWaWV3cygpO2FkZE9uSW5pdCh3YXNtRXhwb3J0c1sibCJdKTtyZW1vdmVSdW5EZXBlbmRlbmN5KCk7cmV0dXJuIHdhc21FeHBvcnRzfWFkZFJ1bkRlcGVuZGVuY3koKTtmdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpe3JlY2VpdmVJbnN0YW5jZShyZXN1bHRbImluc3RhbmNlIl0pO31pZihNb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKXt0cnl7cmV0dXJuIE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0oaW5mbyxyZWNlaXZlSW5zdGFuY2UpfWNhdGNoKGUpe2VycihgTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogJHtlfWApO3JlYWR5UHJvbWlzZVJlamVjdChlKTt9fWluc3RhbnRpYXRlQXN5bmMod2FzbUJpbmFyeSx3YXNtQmluYXJ5RmlsZSxpbmZvLHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KS5jYXRjaChyZWFkeVByb21pc2VSZWplY3QpO3JldHVybiB7fX12YXIgY2FsbFJ1bnRpbWVDYWxsYmFja3M9Y2FsbGJhY2tzPT57d2hpbGUoY2FsbGJhY2tzLmxlbmd0aD4wKXtjYWxsYmFja3Muc2hpZnQoKShNb2R1bGUpO319O01vZHVsZVsibm9FeGl0UnVudGltZSJdfHx0cnVlO3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQ9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e307dmFyIGVtYmluZF9pbml0X2NoYXJDb2Rlcz0oKT0+e3ZhciBjb2Rlcz1uZXcgQXJyYXkoMjU2KTtmb3IodmFyIGk9MDtpPDI1NjsrK2kpe2NvZGVzW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoaSk7fWVtYmluZF9jaGFyQ29kZXM9Y29kZXM7fTt2YXIgZW1iaW5kX2NoYXJDb2Rlczt2YXIgcmVhZExhdGluMVN0cmluZz1wdHI9Pnt2YXIgcmV0PSIiO3ZhciBjPXB0cjt3aGlsZShIRUFQVThbY10pe3JldCs9ZW1iaW5kX2NoYXJDb2Rlc1tIRUFQVThbYysrXV07fXJldHVybiByZXR9O3ZhciBhd2FpdGluZ0RlcGVuZGVuY2llcz17fTt2YXIgcmVnaXN0ZXJlZFR5cGVzPXt9O3ZhciBCaW5kaW5nRXJyb3I7dmFyIHRocm93QmluZGluZ0Vycm9yPW1lc3NhZ2U9Pnt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG1lc3NhZ2UpfTtmdW5jdGlvbiBzaGFyZWRSZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucz17fSl7dmFyIG5hbWU9cmVnaXN0ZXJlZEluc3RhbmNlLm5hbWU7aWYoIXJhd1R5cGUpe3Rocm93QmluZGluZ0Vycm9yKGB0eXBlICIke25hbWV9IiBtdXN0IGhhdmUgYSBwb3NpdGl2ZSBpbnRlZ2VyIHR5cGVpZCBwb2ludGVyYCk7fWlmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7aWYob3B0aW9ucy5pZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zKXtyZXR1cm59ZWxzZSB7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCByZWdpc3RlciB0eXBlICcke25hbWV9JyB0d2ljZWApO319cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdPXJlZ2lzdGVyZWRJbnN0YW5jZTtpZihhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7dmFyIGNhbGxiYWNrcz1hd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtkZWxldGUgYXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07Y2FsbGJhY2tzLmZvckVhY2goY2I9PmNiKCkpO319ZnVuY3Rpb24gcmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe2lmKCEoImFyZ1BhY2tBZHZhbmNlImluIHJlZ2lzdGVyZWRJbnN0YW5jZSkpe3Rocm93IG5ldyBUeXBlRXJyb3IoInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2UiKX1yZXR1cm4gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnMpfXZhciBHZW5lcmljV2lyZVR5cGVTaXplPTg7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2w9KHJhd1R5cGUsbmFtZSx0cnVlVmFsdWUsZmFsc2VWYWx1ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih3dCl7cmV0dXJuICEhd3R9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyxvKXtyZXR1cm4gbz90cnVlVmFsdWU6ZmFsc2VWYWx1ZX0sImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVOFtwb2ludGVyXSl9LGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTtmdW5jdGlvbiBoYW5kbGVBbGxvY2F0b3JJbml0KCl7T2JqZWN0LmFzc2lnbihIYW5kbGVBbGxvY2F0b3IucHJvdG90eXBlLHtnZXQoaWQpe3JldHVybiB0aGlzLmFsbG9jYXRlZFtpZF19LGhhcyhpZCl7cmV0dXJuIHRoaXMuYWxsb2NhdGVkW2lkXSE9PXVuZGVmaW5lZH0sYWxsb2NhdGUoaGFuZGxlKXt2YXIgaWQ9dGhpcy5mcmVlbGlzdC5wb3AoKXx8dGhpcy5hbGxvY2F0ZWQubGVuZ3RoO3RoaXMuYWxsb2NhdGVkW2lkXT1oYW5kbGU7cmV0dXJuIGlkfSxmcmVlKGlkKXt0aGlzLmFsbG9jYXRlZFtpZF09dW5kZWZpbmVkO3RoaXMuZnJlZWxpc3QucHVzaChpZCk7fX0pO31mdW5jdGlvbiBIYW5kbGVBbGxvY2F0b3IoKXt0aGlzLmFsbG9jYXRlZD1bdW5kZWZpbmVkXTt0aGlzLmZyZWVsaXN0PVtdO312YXIgZW12YWxfaGFuZGxlcz1uZXcgSGFuZGxlQWxsb2NhdG9yO3ZhciBfX2VtdmFsX2RlY3JlZj1oYW5kbGU9PntpZihoYW5kbGU+PWVtdmFsX2hhbmRsZXMucmVzZXJ2ZWQmJjA9PT0tLWVtdmFsX2hhbmRsZXMuZ2V0KGhhbmRsZSkucmVmY291bnQpe2VtdmFsX2hhbmRsZXMuZnJlZShoYW5kbGUpO319O3ZhciBjb3VudF9lbXZhbF9oYW5kbGVzPSgpPT57dmFyIGNvdW50PTA7Zm9yKHZhciBpPWVtdmFsX2hhbmRsZXMucmVzZXJ2ZWQ7aTxlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGg7KytpKXtpZihlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZFtpXSE9PXVuZGVmaW5lZCl7Kytjb3VudDt9fXJldHVybiBjb3VudH07dmFyIGluaXRfZW12YWw9KCk9PntlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5wdXNoKHt2YWx1ZTp1bmRlZmluZWR9LHt2YWx1ZTpudWxsfSx7dmFsdWU6dHJ1ZX0se3ZhbHVlOmZhbHNlfSk7ZW12YWxfaGFuZGxlcy5yZXNlcnZlZD1lbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGg7TW9kdWxlWyJjb3VudF9lbXZhbF9oYW5kbGVzIl09Y291bnRfZW12YWxfaGFuZGxlczt9O3ZhciBFbXZhbD17dG9WYWx1ZTpoYW5kbGU9PntpZighaGFuZGxlKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHVzZSBkZWxldGVkIHZhbC4gaGFuZGxlID0gIitoYW5kbGUpO31yZXR1cm4gZW12YWxfaGFuZGxlcy5nZXQoaGFuZGxlKS52YWx1ZX0sdG9IYW5kbGU6dmFsdWU9Pntzd2l0Y2godmFsdWUpe2Nhc2UgdW5kZWZpbmVkOnJldHVybiAxO2Nhc2UgbnVsbDpyZXR1cm4gMjtjYXNlIHRydWU6cmV0dXJuIDM7Y2FzZSBmYWxzZTpyZXR1cm4gNDtkZWZhdWx0OntyZXR1cm4gZW12YWxfaGFuZGxlcy5hbGxvY2F0ZSh7cmVmY291bnQ6MSx2YWx1ZTp2YWx1ZX0pfX19fTtmdW5jdGlvbiBzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUDMyW3BvaW50ZXI+PjJdKX12YXIgX19lbWJpbmRfcmVnaXN0ZXJfZW12YWw9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpoYW5kbGU9Pnt2YXIgcnY9RW12YWwudG9WYWx1ZShoYW5kbGUpO19fZW12YWxfZGVjcmVmKGhhbmRsZSk7cmV0dXJuIHJ2fSwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLHZhbHVlKT0+RW12YWwudG9IYW5kbGUodmFsdWUpLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTt2YXIgZmxvYXRSZWFkVmFsdWVGcm9tUG9pbnRlcj0obmFtZSx3aWR0aCk9Pntzd2l0Y2god2lkdGgpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGMzJbcG9pbnRlcj4+Ml0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQRjY0W3BvaW50ZXI+PjNdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke3dpZHRofSk6ICR7bmFtZX1gKX19O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdD0ocmF3VHlwZSxuYW1lLHNpemUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6dmFsdWU9PnZhbHVlLCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsdmFsdWUpPT52YWx1ZSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2l6ZSksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KTt9O3ZhciBpbnRlZ2VyUmVhZFZhbHVlRnJvbVBvaW50ZXI9KG5hbWUsd2lkdGgsc2lnbmVkKT0+e3N3aXRjaCh3aWR0aCl7Y2FzZSAxOnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDhbcG9pbnRlcj4+MF06cG9pbnRlcj0+SEVBUFU4W3BvaW50ZXI+PjBdO2Nhc2UgMjpyZXR1cm4gc2lnbmVkP3BvaW50ZXI9PkhFQVAxNltwb2ludGVyPj4xXTpwb2ludGVyPT5IRUFQVTE2W3BvaW50ZXI+PjFdO2Nhc2UgNDpyZXR1cm4gc2lnbmVkP3BvaW50ZXI9PkhFQVAzMltwb2ludGVyPj4yXTpwb2ludGVyPT5IRUFQVTMyW3BvaW50ZXI+PjJdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke3dpZHRofSk6ICR7bmFtZX1gKX19O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyPShwcmltaXRpdmVUeXBlLG5hbWUsc2l6ZSxtaW5SYW5nZSxtYXhSYW5nZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGZyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU7aWYobWluUmFuZ2U9PT0wKXt2YXIgYml0c2hpZnQ9MzItOCpzaXplO2Zyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU8PGJpdHNoaWZ0Pj4+Yml0c2hpZnQ7fXZhciBpc1Vuc2lnbmVkVHlwZT1uYW1lLmluY2x1ZGVzKCJ1bnNpZ25lZCIpO3ZhciBjaGVja0Fzc2VydGlvbnM9KHZhbHVlLHRvVHlwZU5hbWUpPT57fTt2YXIgdG9XaXJlVHlwZTtpZihpc1Vuc2lnbmVkVHlwZSl7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlPj4+MH07fWVsc2Uge3RvV2lyZVR5cGU9ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2NoZWNrQXNzZXJ0aW9ucyh2YWx1ZSx0aGlzLm5hbWUpO3JldHVybiB2YWx1ZX07fXJlZ2lzdGVyVHlwZShwcmltaXRpdmVUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnJvbVdpcmVUeXBlLCJ0b1dpcmVUeXBlIjp0b1dpcmVUeXBlLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNpemUsbWluUmFuZ2UhPT0wKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pO307dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3PShyYXdUeXBlLGRhdGFUeXBlSW5kZXgsbmFtZSk9Pnt2YXIgdHlwZU1hcHBpbmc9W0ludDhBcnJheSxVaW50OEFycmF5LEludDE2QXJyYXksVWludDE2QXJyYXksSW50MzJBcnJheSxVaW50MzJBcnJheSxGbG9hdDMyQXJyYXksRmxvYXQ2NEFycmF5XTt2YXIgVEE9dHlwZU1hcHBpbmdbZGF0YVR5cGVJbmRleF07ZnVuY3Rpb24gZGVjb2RlTWVtb3J5VmlldyhoYW5kbGUpe3ZhciBzaXplPUhFQVBVMzJbaGFuZGxlPj4yXTt2YXIgZGF0YT1IRUFQVTMyW2hhbmRsZSs0Pj4yXTtyZXR1cm4gbmV3IFRBKEhFQVA4LmJ1ZmZlcixkYXRhLHNpemUpfW5hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmRlY29kZU1lbW9yeVZpZXcsImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZGVjb2RlTWVtb3J5Vmlld30se2lnbm9yZUR1cGxpY2F0ZVJlZ2lzdHJhdGlvbnM6dHJ1ZX0pO307ZnVuY3Rpb24gcmVhZFBvaW50ZXIocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVMzJbcG9pbnRlcj4+Ml0pfXZhciBzdHJpbmdUb1VURjhBcnJheT0oc3RyLGhlYXAsb3V0SWR4LG1heEJ5dGVzVG9Xcml0ZSk9PntpZighKG1heEJ5dGVzVG9Xcml0ZT4wKSlyZXR1cm4gMDt2YXIgc3RhcnRJZHg9b3V0SWR4O3ZhciBlbmRJZHg9b3V0SWR4K21heEJ5dGVzVG9Xcml0ZS0xO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciB1PXN0ci5jaGFyQ29kZUF0KGkpO2lmKHU+PTU1Mjk2JiZ1PD01NzM0Myl7dmFyIHUxPXN0ci5jaGFyQ29kZUF0KCsraSk7dT02NTUzNisoKHUmMTAyMyk8PDEwKXx1MSYxMDIzO31pZih1PD0xMjcpe2lmKG91dElkeD49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPXU7fWVsc2UgaWYodTw9MjA0Nyl7aWYob3V0SWR4KzE+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0xOTJ8dT4+NjtoZWFwW291dElkeCsrXT0xMjh8dSY2Mzt9ZWxzZSBpZih1PD02NTUzNSl7aWYob3V0SWR4KzI+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yMjR8dT4+MTI7aGVhcFtvdXRJZHgrK109MTI4fHU+PjYmNjM7aGVhcFtvdXRJZHgrK109MTI4fHUmNjM7fWVsc2Uge2lmKG91dElkeCszPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjQwfHU+PjE4O2hlYXBbb3V0SWR4KytdPTEyOHx1Pj4xMiY2MztoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2Mzt9fWhlYXBbb3V0SWR4XT0wO3JldHVybiBvdXRJZHgtc3RhcnRJZHh9O3ZhciBzdHJpbmdUb1VURjg9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+c3RyaW5nVG9VVEY4QXJyYXkoc3RyLEhFQVBVOCxvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKTt2YXIgbGVuZ3RoQnl0ZXNVVEY4PXN0cj0+e3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgYz1zdHIuY2hhckNvZGVBdChpKTtpZihjPD0xMjcpe2xlbisrO31lbHNlIGlmKGM8PTIwNDcpe2xlbis9Mjt9ZWxzZSBpZihjPj01NTI5NiYmYzw9NTczNDMpe2xlbis9NDsrK2k7fWVsc2Uge2xlbis9Mzt9fXJldHVybiBsZW59O3ZhciBVVEY4RGVjb2Rlcj10eXBlb2YgVGV4dERlY29kZXIhPSJ1bmRlZmluZWQiP25ldyBUZXh0RGVjb2RlcigidXRmOCIpOnVuZGVmaW5lZDt2YXIgVVRGOEFycmF5VG9TdHJpbmc9KGhlYXBPckFycmF5LGlkeCxtYXhCeXRlc1RvUmVhZCk9Pnt2YXIgZW5kSWR4PWlkeCttYXhCeXRlc1RvUmVhZDt2YXIgZW5kUHRyPWlkeDt3aGlsZShoZWFwT3JBcnJheVtlbmRQdHJdJiYhKGVuZFB0cj49ZW5kSWR4KSkrK2VuZFB0cjtpZihlbmRQdHItaWR4PjE2JiZoZWFwT3JBcnJheS5idWZmZXImJlVURjhEZWNvZGVyKXtyZXR1cm4gVVRGOERlY29kZXIuZGVjb2RlKGhlYXBPckFycmF5LnN1YmFycmF5KGlkeCxlbmRQdHIpKX12YXIgc3RyPSIiO3doaWxlKGlkeDxlbmRQdHIpe3ZhciB1MD1oZWFwT3JBcnJheVtpZHgrK107aWYoISh1MCYxMjgpKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodTApO2NvbnRpbnVlfXZhciB1MT1oZWFwT3JBcnJheVtpZHgrK10mNjM7aWYoKHUwJjIyNCk9PTE5Mil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKCh1MCYzMSk8PDZ8dTEpO2NvbnRpbnVlfXZhciB1Mj1oZWFwT3JBcnJheVtpZHgrK10mNjM7aWYoKHUwJjI0MCk9PTIyNCl7dTA9KHUwJjE1KTw8MTJ8dTE8PDZ8dTI7fWVsc2Uge3UwPSh1MCY3KTw8MTh8dTE8PDEyfHUyPDw2fGhlYXBPckFycmF5W2lkeCsrXSY2Mzt9aWYodTA8NjU1MzYpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7fWVsc2Uge3ZhciBjaD11MC02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpO319cmV0dXJuIHN0cn07dmFyIFVURjhUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+cHRyP1VURjhBcnJheVRvU3RyaW5nKEhFQVBVOCxwdHIsbWF4Qnl0ZXNUb1JlYWQpOiIiO3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nPShyYXdUeXBlLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBzdGRTdHJpbmdJc1VURjg9bmFtZT09PSJzdGQ6OnN0cmluZyI7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIih2YWx1ZSl7dmFyIGxlbmd0aD1IRUFQVTMyW3ZhbHVlPj4yXTt2YXIgcGF5bG9hZD12YWx1ZSs0O3ZhciBzdHI7aWYoc3RkU3RyaW5nSXNVVEY4KXt2YXIgZGVjb2RlU3RhcnRQdHI9cGF5bG9hZDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9cGF5bG9hZCtpO2lmKGk9PWxlbmd0aHx8SEVBUFU4W2N1cnJlbnRCeXRlUHRyXT09MCl7dmFyIG1heFJlYWQ9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9VVRGOFRvU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWQpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnQ7fWVsc2Uge3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnQ7fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyKzE7fX19ZWxzZSB7dmFyIGE9bmV3IEFycmF5KGxlbmd0aCk7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXthW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoSEVBUFU4W3BheWxvYWQraV0pO31zdHI9YS5qb2luKCIiKTt9X2ZyZWUodmFsdWUpO3JldHVybiBzdHJ9LCJ0b1dpcmVUeXBlIihkZXN0cnVjdG9ycyx2YWx1ZSl7aWYodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7dmFsdWU9bmV3IFVpbnQ4QXJyYXkodmFsdWUpO312YXIgbGVuZ3RoO3ZhciB2YWx1ZUlzT2ZUeXBlU3RyaW5nPXR5cGVvZiB2YWx1ZT09InN0cmluZyI7aWYoISh2YWx1ZUlzT2ZUeXBlU3RyaW5nfHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgSW50OEFycmF5KSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmciKTt9aWYoc3RkU3RyaW5nSXNVVEY4JiZ2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtsZW5ndGg9bGVuZ3RoQnl0ZXNVVEY4KHZhbHVlKTt9ZWxzZSB7bGVuZ3RoPXZhbHVlLmxlbmd0aDt9dmFyIGJhc2U9X21hbGxvYyg0K2xlbmd0aCsxKTt2YXIgcHRyPWJhc2UrNDtIRUFQVTMyW2Jhc2U+PjJdPWxlbmd0aDtpZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe3N0cmluZ1RvVVRGOCh2YWx1ZSxwdHIsbGVuZ3RoKzEpO31lbHNlIHtpZih2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe3ZhciBjaGFyQ29kZT12YWx1ZS5jaGFyQ29kZUF0KGkpO2lmKGNoYXJDb2RlPjI1NSl7X2ZyZWUocHRyKTt0aHJvd0JpbmRpbmdFcnJvcigiU3RyaW5nIGhhcyBVVEYtMTYgY29kZSB1bml0cyB0aGF0IGRvIG5vdCBmaXQgaW4gOCBiaXRzIik7fUhFQVBVOFtwdHIraV09Y2hhckNvZGU7fX1lbHNlIHtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe0hFQVBVOFtwdHIraV09dmFsdWVbaV07fX19aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLGJhc2UpO31yZXR1cm4gYmFzZX0sImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6cmVhZFBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uKHB0cil7X2ZyZWUocHRyKTt9fSk7fTt2YXIgVVRGMTZEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGYtMTZsZSIpOnVuZGVmaW5lZDt2YXIgVVRGMTZUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBlbmRQdHI9cHRyO3ZhciBpZHg9ZW5kUHRyPj4xO3ZhciBtYXhJZHg9aWR4K21heEJ5dGVzVG9SZWFkLzI7d2hpbGUoIShpZHg+PW1heElkeCkmJkhFQVBVMTZbaWR4XSkrK2lkeDtlbmRQdHI9aWR4PDwxO2lmKGVuZFB0ci1wdHI+MzImJlVURjE2RGVjb2RlcilyZXR1cm4gVVRGMTZEZWNvZGVyLmRlY29kZShIRUFQVTguc3ViYXJyYXkocHRyLGVuZFB0cikpO3ZhciBzdHI9IiI7Zm9yKHZhciBpPTA7IShpPj1tYXhCeXRlc1RvUmVhZC8yKTsrK2kpe3ZhciBjb2RlVW5pdD1IRUFQMTZbcHRyK2kqMj4+MV07aWYoY29kZVVuaXQ9PTApYnJlYWs7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGVVbml0KTt9cmV0dXJuIHN0cn07dmFyIHN0cmluZ1RvVVRGMTY9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+e2lmKG1heEJ5dGVzVG9Xcml0ZT09PXVuZGVmaW5lZCl7bWF4Qnl0ZXNUb1dyaXRlPTIxNDc0ODM2NDc7fWlmKG1heEJ5dGVzVG9Xcml0ZTwyKXJldHVybiAwO21heEJ5dGVzVG9Xcml0ZS09Mjt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBudW1DaGFyc1RvV3JpdGU9bWF4Qnl0ZXNUb1dyaXRlPHN0ci5sZW5ndGgqMj9tYXhCeXRlc1RvV3JpdGUvMjpzdHIubGVuZ3RoO2Zvcih2YXIgaT0wO2k8bnVtQ2hhcnNUb1dyaXRlOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO0hFQVAxNltvdXRQdHI+PjFdPWNvZGVVbml0O291dFB0cis9Mjt9SEVBUDE2W291dFB0cj4+MV09MDtyZXR1cm4gb3V0UHRyLXN0YXJ0UHRyfTt2YXIgbGVuZ3RoQnl0ZXNVVEYxNj1zdHI9PnN0ci5sZW5ndGgqMjt2YXIgVVRGMzJUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBpPTA7dmFyIHN0cj0iIjt3aGlsZSghKGk+PW1heEJ5dGVzVG9SZWFkLzQpKXt2YXIgdXRmMzI9SEVBUDMyW3B0citpKjQ+PjJdO2lmKHV0ZjMyPT0wKWJyZWFrOysraTtpZih1dGYzMj49NjU1MzYpe3ZhciBjaD11dGYzMi02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpO31lbHNlIHtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodXRmMzIpO319cmV0dXJuIHN0cn07dmFyIHN0cmluZ1RvVVRGMzI9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+e2lmKG1heEJ5dGVzVG9Xcml0ZT09PXVuZGVmaW5lZCl7bWF4Qnl0ZXNUb1dyaXRlPTIxNDc0ODM2NDc7fWlmKG1heEJ5dGVzVG9Xcml0ZTw0KXJldHVybiAwO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIGVuZFB0cj1zdGFydFB0cittYXhCeXRlc1RvV3JpdGUtNDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpe3ZhciB0cmFpbFN1cnJvZ2F0ZT1zdHIuY2hhckNvZGVBdCgrK2kpO2NvZGVVbml0PTY1NTM2KygoY29kZVVuaXQmMTAyMyk8PDEwKXx0cmFpbFN1cnJvZ2F0ZSYxMDIzO31IRUFQMzJbb3V0UHRyPj4yXT1jb2RlVW5pdDtvdXRQdHIrPTQ7aWYob3V0UHRyKzQ+ZW5kUHRyKWJyZWFrfUhFQVAzMltvdXRQdHI+PjJdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn07dmFyIGxlbmd0aEJ5dGVzVVRGMzI9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0MykrK2k7bGVuKz00O31yZXR1cm4gbGVufTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmc9KHJhd1R5cGUsY2hhclNpemUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGRlY29kZVN0cmluZyxlbmNvZGVTdHJpbmcsZ2V0SGVhcCxsZW5ndGhCeXRlc1VURixzaGlmdDtpZihjaGFyU2l6ZT09PTIpe2RlY29kZVN0cmluZz1VVEYxNlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjE2O2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMTY7Z2V0SGVhcD0oKT0+SEVBUFUxNjtzaGlmdD0xO31lbHNlIGlmKGNoYXJTaXplPT09NCl7ZGVjb2RlU3RyaW5nPVVURjMyVG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMzI7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYzMjtnZXRIZWFwPSgpPT5IRUFQVTMyO3NoaWZ0PTI7fXJlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6dmFsdWU9Pnt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBIRUFQPWdldEhlYXAoKTt2YXIgc3RyO3ZhciBkZWNvZGVTdGFydFB0cj12YWx1ZSs0O2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj12YWx1ZSs0K2kqY2hhclNpemU7aWYoaT09bGVuZ3RofHxIRUFQW2N1cnJlbnRCeXRlUHRyPj5zaGlmdF09PTApe3ZhciBtYXhSZWFkQnl0ZXM9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9ZGVjb2RlU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWRCeXRlcyk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudDt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudDt9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrY2hhclNpemU7fX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PntpZighKHR5cGVvZiB2YWx1ZT09InN0cmluZyIpKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHtuYW1lfWApO312YXIgbGVuZ3RoPWxlbmd0aEJ5dGVzVVRGKHZhbHVlKTt2YXIgcHRyPV9tYWxsb2MoNCtsZW5ndGgrY2hhclNpemUpO0hFQVBVMzJbcHRyPj4yXT1sZW5ndGg+PnNoaWZ0O2VuY29kZVN0cmluZyh2YWx1ZSxwdHIrNCxsZW5ndGgrY2hhclNpemUpO2lmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaChfZnJlZSxwdHIpO31yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpO319KTt9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl92b2lkPShyYXdUeXBlLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtpc1ZvaWQ6dHJ1ZSxuYW1lOm5hbWUsImFyZ1BhY2tBZHZhbmNlIjowLCJmcm9tV2lyZVR5cGUiOigpPT51bmRlZmluZWQsInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyxvKT0+dW5kZWZpbmVkfSk7fTt2YXIgZ2V0SGVhcE1heD0oKT0+MjE0NzQ4MzY0ODt2YXIgZ3Jvd01lbW9yeT1zaXplPT57dmFyIGI9d2FzbU1lbW9yeS5idWZmZXI7dmFyIHBhZ2VzPShzaXplLWIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e3dhc21NZW1vcnkuZ3JvdyhwYWdlcyk7dXBkYXRlTWVtb3J5Vmlld3MoKTtyZXR1cm4gMX1jYXRjaChlKXt9fTt2YXIgX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXA9cmVxdWVzdGVkU2l6ZT0+e3ZhciBvbGRTaXplPUhFQVBVOC5sZW5ndGg7cmVxdWVzdGVkU2l6ZT4+Pj0wO3ZhciBtYXhIZWFwU2l6ZT1nZXRIZWFwTWF4KCk7aWYocmVxdWVzdGVkU2l6ZT5tYXhIZWFwU2l6ZSl7cmV0dXJuIGZhbHNlfXZhciBhbGlnblVwPSh4LG11bHRpcGxlKT0+eCsobXVsdGlwbGUteCVtdWx0aXBsZSklbXVsdGlwbGU7Zm9yKHZhciBjdXREb3duPTE7Y3V0RG93bjw9NDtjdXREb3duKj0yKXt2YXIgb3Zlckdyb3duSGVhcFNpemU9b2xkU2l6ZSooMSsuMi9jdXREb3duKTtvdmVyR3Jvd25IZWFwU2l6ZT1NYXRoLm1pbihvdmVyR3Jvd25IZWFwU2l6ZSxyZXF1ZXN0ZWRTaXplKzEwMDY2MzI5Nik7dmFyIG5ld1NpemU9TWF0aC5taW4obWF4SGVhcFNpemUsYWxpZ25VcChNYXRoLm1heChyZXF1ZXN0ZWRTaXplLG92ZXJHcm93bkhlYXBTaXplKSw2NTUzNikpO3ZhciByZXBsYWNlbWVudD1ncm93TWVtb3J5KG5ld1NpemUpO2lmKHJlcGxhY2VtZW50KXtyZXR1cm4gdHJ1ZX19cmV0dXJuIGZhbHNlfTtlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKTtCaW5kaW5nRXJyb3I9TW9kdWxlWyJCaW5kaW5nRXJyb3IiXT1jbGFzcyBCaW5kaW5nRXJyb3IgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihtZXNzYWdlKXtzdXBlcihtZXNzYWdlKTt0aGlzLm5hbWU9IkJpbmRpbmdFcnJvciI7fX07TW9kdWxlWyJJbnRlcm5hbEVycm9yIl09Y2xhc3MgSW50ZXJuYWxFcnJvciBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKG1lc3NhZ2Upe3N1cGVyKG1lc3NhZ2UpO3RoaXMubmFtZT0iSW50ZXJuYWxFcnJvciI7fX07aGFuZGxlQWxsb2NhdG9ySW5pdCgpO2luaXRfZW12YWwoKTt2YXIgd2FzbUltcG9ydHM9e2Y6X19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50LGk6X19lbWJpbmRfcmVnaXN0ZXJfYm9vbCxoOl9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsLGU6X19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQsYjpfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyLGE6X19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcsZDpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nLGM6X19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcsajpfX2VtYmluZF9yZWdpc3Rlcl92b2lkLGc6X2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXB9O3ZhciB3YXNtRXhwb3J0cz1jcmVhdGVXYXNtKCk7TW9kdWxlWyJfc29ydCJdPShhMCxhMSxhMixhMyxhNCxhNSxhNik9PihNb2R1bGVbIl9zb3J0Il09d2FzbUV4cG9ydHNbIm0iXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYpO3ZhciBfZnJlZT1Nb2R1bGVbIl9mcmVlIl09YTA9PihfZnJlZT1Nb2R1bGVbIl9mcmVlIl09d2FzbUV4cG9ydHNbIm4iXSkoYTApO3ZhciBfbWFsbG9jPU1vZHVsZVsiX21hbGxvYyJdPWEwPT4oX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT13YXNtRXhwb3J0c1sicCJdKShhMCk7dmFyIGNhbGxlZFJ1bjtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9ZnVuY3Rpb24gcnVuQ2FsbGVyKCl7aWYoIWNhbGxlZFJ1bilydW4oKTtpZighY2FsbGVkUnVuKWRlcGVuZGVuY2llc0Z1bGZpbGxlZD1ydW5DYWxsZXI7fTtmdW5jdGlvbiBydW4oKXtpZihydW5EZXBlbmRlbmNpZXM+MCl7cmV0dXJufXByZVJ1bigpO2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59ZnVuY3Rpb24gZG9SdW4oKXtpZihjYWxsZWRSdW4pcmV0dXJuO2NhbGxlZFJ1bj10cnVlO01vZHVsZVsiY2FsbGVkUnVuIl09dHJ1ZTtpZihBQk9SVClyZXR1cm47aW5pdFJ1bnRpbWUoKTtyZWFkeVByb21pc2VSZXNvbHZlKE1vZHVsZSk7aWYoTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKU1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSgpO3Bvc3RSdW4oKTt9aWYoTW9kdWxlWyJzZXRTdGF0dXMiXSl7TW9kdWxlWyJzZXRTdGF0dXMiXSgiUnVubmluZy4uLiIpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7TW9kdWxlWyJzZXRTdGF0dXMiXSgiIik7fSwxKTtkb1J1bigpO30sMSk7fWVsc2Uge2RvUnVuKCk7fX1pZihNb2R1bGVbInByZUluaXQiXSl7aWYodHlwZW9mIE1vZHVsZVsicHJlSW5pdCJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlSW5pdCJdPVtNb2R1bGVbInByZUluaXQiXV07d2hpbGUoTW9kdWxlWyJwcmVJbml0Il0ubGVuZ3RoPjApe01vZHVsZVsicHJlSW5pdCJdLnBvcCgpKCk7fX1ydW4oKTsKCgogICAgcmV0dXJuIG1vZHVsZUFyZy5yZWFkeQogIH0KICApOwogIH0pKCk7CgogIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55CiAgbGV0IHdhc21Nb2R1bGU7CiAgYXN5bmMgZnVuY3Rpb24gaW5pdFdhc20oKSB7CiAgICAgIHdhc21Nb2R1bGUgPSBhd2FpdCBsb2FkV2FzbSgpOwogIH0KICBsZXQgc2NlbmU7CiAgbGV0IHZpZXdQcm9qOwogIGxldCBzb3J0UnVubmluZyA9IGZhbHNlOwogIGxldCB2aWV3UHJvalB0cjsKICBsZXQgZkJ1ZmZlclB0cjsKICBsZXQgdUJ1ZmZlclB0cjsKICBsZXQgZGVwdGhCdWZmZXJQdHI7CiAgbGV0IGRlcHRoSW5kZXhQdHI7CiAgbGV0IHN0YXJ0c1B0cjsKICBjb25zdCBpbml0U2NlbmUgPSBhc3luYyAoKSA9PiB7CiAgICAgIGlmICghd2FzbU1vZHVsZSkKICAgICAgICAgIGF3YWl0IGluaXRXYXNtKCk7CiAgICAgIGZCdWZmZXJQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2Moc2NlbmUuZl9idWZmZXIubGVuZ3RoICogc2NlbmUuZl9idWZmZXIuQllURVNfUEVSX0VMRU1FTlQpOwogICAgICB1QnVmZmVyUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKHNjZW5lLnVfYnVmZmVyLmxlbmd0aCAqIHNjZW5lLnVfYnVmZmVyLkJZVEVTX1BFUl9FTEVNRU5UKTsKICAgICAgd2FzbU1vZHVsZS5IRUFQRjMyLnNldChzY2VuZS5mX2J1ZmZlciwgZkJ1ZmZlclB0ciAvIDQpOwogICAgICB3YXNtTW9kdWxlLkhFQVBVOC5zZXQoc2NlbmUudV9idWZmZXIsIHVCdWZmZXJQdHIpOwogICAgICB2aWV3UHJvalB0ciA9IHdhc21Nb2R1bGUuX21hbGxvYygxNiAqIDQpOwogICAgICBkZXB0aEJ1ZmZlclB0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhzY2VuZS52ZXJ0ZXhDb3VudCAqIDQpOwogICAgICBkZXB0aEluZGV4UHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKHNjZW5lLnZlcnRleENvdW50ICogNCk7CiAgICAgIHN0YXJ0c1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhzY2VuZS52ZXJ0ZXhDb3VudCAqIDQpOwogIH07CiAgY29uc3QgcnVuU29ydCA9ICh2aWV3UHJvaikgPT4gewogICAgICBjb25zdCB2aWV3UHJvakJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkodmlld1Byb2ouYnVmZmVyKTsKICAgICAgd2FzbU1vZHVsZS5IRUFQRjMyLnNldCh2aWV3UHJvakJ1ZmZlciwgdmlld1Byb2pQdHIgLyA0KTsKICAgICAgd2FzbU1vZHVsZS5fc29ydCh2aWV3UHJvalB0ciwgc2NlbmUudmVydGV4Q291bnQsIGZCdWZmZXJQdHIsIHVCdWZmZXJQdHIsIGRlcHRoQnVmZmVyUHRyLCBkZXB0aEluZGV4UHRyLCBzdGFydHNQdHIpOwogICAgICBjb25zdCBkZXB0aEluZGV4ID0gbmV3IFVpbnQzMkFycmF5KHdhc21Nb2R1bGUuSEVBUFUzMi5idWZmZXIsIGRlcHRoSW5kZXhQdHIsIHNjZW5lLnZlcnRleENvdW50KTsKICAgICAgY29uc3QgdHJhbnNmZXJhYmxlRGVwdGhJbmRleCA9IG5ldyBVaW50MzJBcnJheShkZXB0aEluZGV4LnNsaWNlKCkpOwogICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgZGVwdGhJbmRleDogdHJhbnNmZXJhYmxlRGVwdGhJbmRleCB9LCBbdHJhbnNmZXJhYmxlRGVwdGhJbmRleC5idWZmZXJdKTsKICB9OwogIGNvbnN0IHRocm90dGxlZFNvcnQgPSAoKSA9PiB7CiAgICAgIGlmICghc29ydFJ1bm5pbmcpIHsKICAgICAgICAgIHNvcnRSdW5uaW5nID0gdHJ1ZTsKICAgICAgICAgIGNvbnN0IGxhc3RWaWV3ID0gdmlld1Byb2o7CiAgICAgICAgICBydW5Tb3J0KGxhc3RWaWV3KTsKICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgICAgICAgIHNvcnRSdW5uaW5nID0gZmFsc2U7CiAgICAgICAgICAgICAgaWYgKGxhc3RWaWV3ICE9PSB2aWV3UHJvaikgewogICAgICAgICAgICAgICAgICB0aHJvdHRsZWRTb3J0KCk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgfSwgMCk7CiAgICAgIH0KICB9OwogIHNlbGYub25tZXNzYWdlID0gKGUpID0+IHsKICAgICAgaWYgKGUuZGF0YS5zY2VuZSkgewogICAgICAgICAgc2NlbmUgPSBlLmRhdGEuc2NlbmU7CiAgICAgICAgICBpbml0U2NlbmUoKTsKICAgICAgfQogICAgICBpZiAoIXNjZW5lIHx8ICF3YXNtTW9kdWxlKQogICAgICAgICAgcmV0dXJuOwogICAgICBpZiAoZS5kYXRhLnZpZXdQcm9qKSB7CiAgICAgICAgICB2aWV3UHJvaiA9IGUuZGF0YS52aWV3UHJvajsKICAgICAgICAgIHRocm90dGxlZFNvcnQoKTsKICAgICAgfQogIH07Cgp9KSgpOwovLyMgc291cmNlTWFwcGluZ1VSTD1Xb3JrZXIuanMubWFwCgo=", _l = null, gl = !1, function(e) {
  return Un = Un || js(Wl, _l, gl), new Worker(Un, e);
});
class Ks {
  constructor(t = 1) {
    let n, l, i, r = 0, a = !1;
    this.init = (s, o) => {
      r = 0, a = !0, n = s, l = s.gl.getUniformLocation(o, "u_useDepthFade"), n.gl.uniform1i(l, 1), i = s.gl.getUniformLocation(o, "u_depthFade"), n.gl.uniform1f(i, r);
    }, this.render = () => {
      a && (r = Math.min(r + 0.01 * t, 1), r >= 1 && (a = !1, n.gl.uniform1i(l, 0)), n.gl.uniform1f(i, r));
    };
  }
}
class vi {
  constructor(t = null, n = null) {
    const l = t || document.createElement("canvas");
    t || (l.style.display = "block", l.style.boxSizing = "border-box", l.style.width = "100%", l.style.height = "100%", l.style.margin = "0", l.style.padding = "0", document.body.appendChild(l)), l.style.background = "#000", this.domElement = l;
    const i = l.getContext("webgl2", { antialias: !1 });
    this.gl = i;
    const r = n || [];
    let a, s, o, c, d, u, h, f, V, U, m, b, _, p;
    n || r.push(new Ks());
    let B = !1;
    this.resize = () => {
      const J = l.clientWidth, w = l.clientHeight;
      l.width === J && l.height === w || this.setSize(J, w);
    }, this.setSize = (J, w) => {
      l.width = J, l.height = w, s && (i.viewport(0, 0, l.width, l.height), s.update(l.width, l.height), h = i.getUniformLocation(u, "projection"), i.uniformMatrix4fv(h, !1, s.projectionMatrix.buffer), f = i.getUniformLocation(u, "viewport"), i.uniform2fv(f, new Float32Array([l.width, l.height])));
    };
    const Z = () => {
      o = new Ls(), o.postMessage({ scene: a }), i.viewport(0, 0, l.width, l.height), c = i.createShader(i.VERTEX_SHADER), i.shaderSource(c, `#version 300 es
precision highp float;
precision highp int;

uniform highp usampler2D u_texture;
uniform mat4 projection, view;
uniform vec2 focal;
uniform vec2 viewport;

uniform bool u_useDepthFade;
uniform float u_depthFade;

in vec2 position;
in int index;

out vec4 vColor;
out vec2 vPosition;

void main () {
    uvec4 cen = texelFetch(u_texture, ivec2((uint(index) & 0x3ffu) << 1, uint(index) >> 10), 0);
    vec4 cam = view * vec4(uintBitsToFloat(cen.xyz), 1);
    vec4 pos2d = projection * cam;

    float clip = 1.2 * pos2d.w;
    if (pos2d.z < -pos2d.w || pos2d.x < -clip || pos2d.x > clip || pos2d.y < -clip || pos2d.y > clip) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }


    uvec4 cov = texelFetch(u_texture, ivec2(((uint(index) & 0x3ffu) << 1) | 1u, uint(index) >> 10), 0);
    vec2 u1 = unpackHalf2x16(cov.x), u2 = unpackHalf2x16(cov.y), u3 = unpackHalf2x16(cov.z);
    mat3 Vrk = mat3(u1.x, u1.y, u2.x, u1.y, u2.y, u3.x, u2.x, u3.x, u3.y);

    mat3 J = mat3(
        focal.x / cam.z, 0., -(focal.x * cam.x) / (cam.z * cam.z), 
        0., -focal.y / cam.z, (focal.y * cam.y) / (cam.z * cam.z), 
        0., 0., 0.
    );

    mat3 T = transpose(mat3(view)) * J;
    mat3 cov2d = transpose(T) * Vrk * T;

    float mid = (cov2d[0][0] + cov2d[1][1]) / 2.0;
    float radius = length(vec2((cov2d[0][0] - cov2d[1][1]) / 2.0, cov2d[0][1]));
    float lambda1 = mid + radius, lambda2 = mid - radius;

    if(lambda2 < 0.0) return;
    vec2 diagonalVector = normalize(vec2(cov2d[0][1], lambda1 - cov2d[0][0]));
    vec2 majorAxis = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector;
    vec2 minorAxis = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);

    vColor = vec4((cov.w) & 0xffu, (cov.w >> 8) & 0xffu, (cov.w >> 16) & 0xffu, (cov.w >> 24) & 0xffu) / 255.0;
    vPosition = position;

    float scalingFactor = 1.0;

    if(u_useDepthFade) {
        float depthNorm = (pos2d.z / pos2d.w + 1.0) / 2.0;
        float near = 0.1; float far = 100.0;
        float normalizedDepth = (2.0 * near) / (far + near - depthNorm * (far - near));
        float start = max(normalizedDepth - 0.1, 0.0);
        float end = min(normalizedDepth + 0.1, 1.0);
        scalingFactor = clamp((u_depthFade - start) / (end - start), 0.0, 1.0);
    }

    vec2 vCenter = vec2(pos2d) / pos2d.w;
    gl_Position = vec4(
        vCenter 
        + position.x * majorAxis * scalingFactor / viewport 
        + position.y * minorAxis * scalingFactor / viewport, 0.0, 1.0);

}
`), i.compileShader(c), i.getShaderParameter(c, i.COMPILE_STATUS) || console.error(i.getShaderInfoLog(c)), d = i.createShader(i.FRAGMENT_SHADER), i.shaderSource(d, `#version 300 es
precision highp float;

in vec4 vColor;
in vec2 vPosition;

out vec4 fragColor;

void main () {
    float A = -dot(vPosition, vPosition);
    if (A < -4.0) discard;
    float B = exp(A) * vColor.a;
    fragColor = vec4(B * vColor.rgb, B);
}
`), i.compileShader(d), i.getShaderParameter(d, i.COMPILE_STATUS) || console.error(i.getShaderInfoLog(d)), u = i.createProgram(), i.attachShader(u, c), i.attachShader(u, d), i.linkProgram(u), i.useProgram(u), i.getProgramParameter(u, i.LINK_STATUS) || console.error(i.getProgramInfoLog(u)), i.disable(i.DEPTH_TEST), i.enable(i.BLEND), i.blendFuncSeparate(i.ONE_MINUS_DST_ALPHA, i.ONE, i.ONE_MINUS_DST_ALPHA, i.ONE), i.blendEquationSeparate(i.FUNC_ADD, i.FUNC_ADD), s.update(l.width, l.height), h = i.getUniformLocation(u, "projection"), i.uniformMatrix4fv(h, !1, s.projectionMatrix.buffer), f = i.getUniformLocation(u, "viewport"), i.uniform2fv(f, new Float32Array([l.width, l.height])), V = i.getUniformLocation(u, "focal"), i.uniform2fv(V, new Float32Array([s.fx, s.fy])), U = i.getUniformLocation(u, "view"), i.uniformMatrix4fv(U, !1, s.viewMatrix.buffer);
      const J = new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]);
      p = i.createBuffer(), i.bindBuffer(i.ARRAY_BUFFER, p), i.bufferData(i.ARRAY_BUFFER, J, i.STATIC_DRAW), b = i.getAttribLocation(u, "position"), i.enableVertexAttribArray(b), i.vertexAttribPointer(b, 2, i.FLOAT, !1, 0, 0);
      const w = i.createTexture();
      i.bindTexture(i.TEXTURE_2D, w), m = i.getUniformLocation(u, "u_texture"), i.uniform1i(m, 0);
      const x = i.createBuffer();
      _ = i.getAttribLocation(u, "index"), i.enableVertexAttribArray(_), i.bindBuffer(i.ARRAY_BUFFER, x), i.vertexAttribIPointer(_, 1, i.INT, 0, 0), i.vertexAttribDivisor(_, 1), i.bindTexture(i.TEXTURE_2D, w), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA32UI, a.tex.width, a.tex.height, 0, i.RGBA_INTEGER, i.UNSIGNED_INT, a.tex.data), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, w);
      for (const D of r)
        D.init(this, u);
      o.onmessage = (D) => {
        if (D.data.depthIndex) {
          const { depthIndex: g } = D.data;
          i.bindBuffer(i.ARRAY_BUFFER, x), i.bufferData(i.ARRAY_BUFFER, g, i.STATIC_DRAW);
        }
      }, B = !0;
    };
    this.render = (J, w) => {
      if ((J.dirty || J !== a || w !== s) && (B && this.dispose(), a = J, s = w, J.updateTex(), Z(), J.dirty = !1), s.update(l.width, l.height), o.postMessage({ viewProj: s.viewProj }), a.vertexCount > 0) {
        for (const x of r)
          x.render();
        i.uniformMatrix4fv(U, !1, s.viewMatrix.buffer), i.clear(i.COLOR_BUFFER_BIT), i.drawArraysInstanced(i.TRIANGLE_FAN, 0, 4, a.vertexCount);
      } else
        i.clear(i.COLOR_BUFFER_BIT);
    }, this.dispose = () => {
      o.terminate(), i.deleteShader(c), i.deleteShader(d), i.deleteProgram(u), i.deleteBuffer(p), i.deleteBuffer(void 0), i.deleteBuffer(void 0), i.deleteBuffer(void 0), i.deleteBuffer(void 0), B = !1;
    }, this.resize();
  }
}
class Ti {
  constructor(t, n, l = 0.5, i = 0.5, r = 5, a = !0) {
    this.minAngle = -90, this.maxAngle = 90, this.minZoom = 0.1, this.maxZoom = 30, this.orbitSpeed = 1, this.panSpeed = 1, this.zoomSpeed = 1, this.dampening = 0.12;
    let s = new P(), o = s.clone(), c = l, d = i, u = r, h = !1, f = !1, V = 0, U = 0, m = 0;
    const b = {}, _ = () => 0.1 + 0.9 * (u - this.minZoom) / (this.maxZoom - this.minZoom), p = (F) => {
      b[F.code] = !0, F.code === "ArrowUp" && (b.KeyW = !0), F.code === "ArrowDown" && (b.KeyS = !0), F.code === "ArrowLeft" && (b.KeyA = !0), F.code === "ArrowRight" && (b.KeyD = !0);
    }, B = (F) => {
      b[F.code] = !1, F.code === "ArrowUp" && (b.KeyW = !1), F.code === "ArrowDown" && (b.KeyS = !1), F.code === "ArrowLeft" && (b.KeyA = !1), F.code === "ArrowRight" && (b.KeyD = !1);
    }, Z = (F) => {
      H(F), h = !0, f = F.button === 2, U = F.clientX, m = F.clientY, window.addEventListener("mouseup", J);
    }, J = (F) => {
      H(F), h = !1, f = !1, window.removeEventListener("mouseup", J);
    }, w = (F) => {
      if (H(F), !h)
        return;
      const y = F.clientX - U, Q = F.clientY - m;
      if (f) {
        const R = _(), I = -y * this.panSpeed * 0.01 * R, N = -Q * this.panSpeed * 0.01 * R, k = Re.RotationFromQuaternion(t.rotation).buffer, j = new P(k[0], k[3], k[6]), S = new P(k[1], k[4], k[7]);
        o = o.add(j.multiply(I)), o = o.add(S.multiply(N));
      } else
        c -= y * this.orbitSpeed * 3e-3, d += Q * this.orbitSpeed * 3e-3, d = Math.min(Math.max(d, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180);
      U = F.clientX, m = F.clientY;
    }, x = (F) => {
      H(F);
      const y = _();
      u += F.deltaY * this.zoomSpeed * 0.025 * y, u = Math.min(Math.max(u, this.minZoom), this.maxZoom);
    }, D = (F) => {
      if (H(F), F.touches.length === 1)
        h = !0, f = !1, U = F.touches[0].clientX, m = F.touches[0].clientY, V = 0;
      else if (F.touches.length === 2) {
        h = !0, f = !0, U = (F.touches[0].clientX + F.touches[1].clientX) / 2, m = (F.touches[0].clientY + F.touches[1].clientY) / 2;
        const y = F.touches[0].clientX - F.touches[1].clientX, Q = F.touches[0].clientY - F.touches[1].clientY;
        V = Math.sqrt(y * y + Q * Q);
      }
    }, g = (F) => {
      H(F), h = !1, f = !1;
    }, ie = (F) => {
      if (H(F), h)
        if (f) {
          const y = _(), Q = F.touches[0].clientX - F.touches[1].clientX, R = F.touches[0].clientY - F.touches[1].clientY, I = Math.sqrt(Q * Q + R * R);
          u += (V - I) * this.zoomSpeed * 0.1 * y, u = Math.min(Math.max(u, this.minZoom), this.maxZoom), V = I;
          const N = (F.touches[0].clientX + F.touches[1].clientX) / 2, k = (F.touches[0].clientY + F.touches[1].clientY) / 2, j = N - U, S = k - m, W = Re.RotationFromQuaternion(t.rotation).buffer, ee = new P(W[0], W[3], W[6]), fe = new P(W[1], W[4], W[7]);
          o = o.add(ee.multiply(-j * this.panSpeed * 0.025 * y)), o = o.add(fe.multiply(-S * this.panSpeed * 0.025 * y)), U = N, m = k;
        } else {
          const y = F.touches[0].clientX - U, Q = F.touches[0].clientY - m;
          c -= y * this.orbitSpeed * 3e-3, d += Q * this.orbitSpeed * 3e-3, d = Math.min(Math.max(d, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180), U = F.touches[0].clientX, m = F.touches[0].clientY;
        }
    }, E = (F, y, Q) => (1 - Q) * F + Q * y;
    this.update = () => {
      l = E(l, c, this.dampening), i = E(i, d, this.dampening), r = E(r, u, this.dampening), s = s.lerp(o, this.dampening);
      const F = s.x + r * Math.sin(l) * Math.cos(i), y = s.y - r * Math.sin(i), Q = s.z - r * Math.cos(l) * Math.cos(i);
      t.position.set(F, y, Q);
      const R = s.subtract(t.position).normalize(), I = Math.asin(-R.y), N = Math.atan2(R.x, R.z);
      t.rotation = Je.FromEuler(new P(I, N, 0));
      const k = 0.025, j = 0.01, S = Re.RotationFromQuaternion(t.rotation).buffer, W = new P(-S[2], -S[5], -S[8]), ee = new P(S[0], S[3], S[6]);
      b.KeyS && (o = o.add(W.multiply(k))), b.KeyW && (o = o.subtract(W.multiply(k))), b.KeyA && (o = o.subtract(ee.multiply(k))), b.KeyD && (o = o.add(ee.multiply(k))), b.KeyE && (c += j), b.KeyQ && (c -= j), b.KeyR && (d += j), b.KeyF && (d -= j);
    };
    const H = (F) => {
      F.preventDefault(), F.stopPropagation();
    };
    this.dispose = () => {
      n.removeEventListener("dragenter", H), n.removeEventListener("dragover", H), n.removeEventListener("dragleave", H), n.removeEventListener("contextmenu", H), n.removeEventListener("mousedown", Z), n.removeEventListener("mousemove", w), n.removeEventListener("wheel", x), n.removeEventListener("touchstart", D), n.removeEventListener("touchend", g), n.removeEventListener("touchmove", ie), a && (window.removeEventListener("keydown", p), window.removeEventListener("keyup", B));
    }, a && (window.addEventListener("keydown", p), window.addEventListener("keyup", B)), n.addEventListener("dragenter", H), n.addEventListener("dragover", H), n.addEventListener("dragleave", H), n.addEventListener("contextmenu", H), n.addEventListener("mousedown", Z), n.addEventListener("mousemove", w), n.addEventListener("wheel", x), n.addEventListener("touchstart", D), n.addEventListener("touchend", g), n.addEventListener("touchmove", ie), this.update();
  }
}
const {
  SvelteComponent: qs,
  append: Fn,
  attr: bn,
  binding_callbacks: $s,
  check_outros: eo,
  create_component: wi,
  destroy_component: Ii,
  detach: vn,
  element: Vn,
  empty: to,
  group_outros: no,
  init: lo,
  insert: Tn,
  mount_component: Ci,
  safe_not_equal: io,
  space: Hi,
  transition_in: Zt,
  transition_out: Tt
} = window.__gradio__svelte__internal, { onMount: ro } = window.__gradio__svelte__internal;
function yl(e) {
  let t, n, l, i, r, a;
  return l = new Dt({
    props: {
      Icon: os,
      label: (
        /*i18n*/
        e[3]("common.download")
      )
    }
  }), l.$on(
    "click",
    /*download*/
    e[5]
  ), {
    c() {
      t = Vn("div"), n = Vn("div"), wi(l.$$.fragment), i = Hi(), r = Vn("canvas"), bn(n, "class", "buttons svelte-1jnxgzx"), bn(r, "class", "svelte-1jnxgzx"), bn(t, "class", "model3DGS svelte-1jnxgzx");
    },
    m(s, o) {
      Tn(s, t, o), Fn(t, n), Ci(l, n, null), Fn(t, i), Fn(t, r), e[10](r), a = !0;
    },
    p(s, o) {
      const c = {};
      o & /*i18n*/
      8 && (c.label = /*i18n*/
      s[3]("common.download")), l.$set(c);
    },
    i(s) {
      a || (Zt(l.$$.fragment, s), a = !0);
    },
    o(s) {
      Tt(l.$$.fragment, s), a = !1;
    },
    d(s) {
      s && vn(t), Ii(l), e[10](null);
    }
  };
}
function ao(e) {
  let t, n, l, i;
  t = new Mt({
    props: {
      show_label: (
        /*show_label*/
        e[2]
      ),
      Icon: Rt,
      label: (
        /*label*/
        e[1] || /*i18n*/
        e[3]("3DGS_model.splat")
      )
    }
  });
  let r = (
    /*value*/
    e[0] && yl(e)
  );
  return {
    c() {
      wi(t.$$.fragment), n = Hi(), r && r.c(), l = to();
    },
    m(a, s) {
      Ci(t, a, s), Tn(a, n, s), r && r.m(a, s), Tn(a, l, s), i = !0;
    },
    p(a, [s]) {
      const o = {};
      s & /*show_label*/
      4 && (o.show_label = /*show_label*/
      a[2]), s & /*label, i18n*/
      10 && (o.label = /*label*/
      a[1] || /*i18n*/
      a[3]("3DGS_model.splat")), t.$set(o), /*value*/
      a[0] ? r ? (r.p(a, s), s & /*value*/
      1 && Zt(r, 1)) : (r = yl(a), r.c(), Zt(r, 1), r.m(l.parentNode, l)) : r && (no(), Tt(r, 1, 1, () => {
        r = null;
      }), eo());
    },
    i(a) {
      i || (Zt(t.$$.fragment, a), Zt(r), i = !0);
    },
    o(a) {
      Tt(t.$$.fragment, a), Tt(r), i = !1;
    },
    d(a) {
      a && (vn(n), vn(l)), Ii(t, a), r && r.d(a);
    }
  };
}
function so(e, t, n) {
  let l, { value: i } = t, { label: r = "" } = t, { show_label: a } = t, { i18n: s } = t, { zoom_speed: o = 1 } = t, { pan_speed: c = 1 } = t, d, u, h, f = null, V, U = !1, m = !1, b = !1;
  ro(() => {
    u = new Ei(), h = new Xi(), n(8, b = !0);
  });
  function _() {
    if (!i)
      return;
    const Z = new Blob([u.data.buffer], { type: "application/octet-stream" }), J = document.createElement("a");
    J.download = "model.splat", J.href = window.URL.createObjectURL(Z), J.click();
  }
  function p() {
    if (f !== null && f.dispose(), f = new vi(d), V = new Ti(h, d), V.zoomSpeed = o, V.panSpeed = c, !i)
      return;
    const Z = async () => {
      if (U) {
        console.error("Already loading");
        return;
      }
      U = !0, await ki.LoadAsync(i.url, u, (w) => {
      }), U = !1;
    }, J = () => {
      if (m) {
        if (U) {
          requestAnimationFrame(J);
          return;
        }
        V.update(), f.render(u, h), requestAnimationFrame(J);
      }
    };
    Z(), m = !0, requestAnimationFrame(J);
  }
  function B(Z) {
    $s[Z ? "unshift" : "push"](() => {
      d = Z, n(4, d);
    });
  }
  return e.$$set = (Z) => {
    "value" in Z && n(0, i = Z.value), "label" in Z && n(1, r = Z.label), "show_label" in Z && n(2, a = Z.show_label), "i18n" in Z && n(3, s = Z.i18n), "zoom_speed" in Z && n(6, o = Z.zoom_speed), "pan_speed" in Z && n(7, c = Z.pan_speed);
  }, e.$$.update = () => {
    e.$$.dirty & /*value*/
    1 && n(9, { path: l } = i || { path: void 0 }, l), e.$$.dirty & /*canvas, mounted, path*/
    784 && d && b && l && p();
  }, [
    i,
    r,
    a,
    s,
    d,
    _,
    o,
    c,
    b,
    l,
    B
  ];
}
class oo extends qs {
  constructor(t) {
    super(), lo(this, t, so, ao, io, {
      value: 0,
      label: 1,
      show_label: 2,
      i18n: 3,
      zoom_speed: 6,
      pan_speed: 7
    });
  }
}
function je() {
}
function co(e) {
  return e();
}
function uo(e) {
  e.forEach(co);
}
function ho(e) {
  return typeof e == "function";
}
function fo(e, t) {
  return e != e ? t == t : e !== t || e && typeof e == "object" || typeof e == "function";
}
function mo(e, ...t) {
  if (e == null) {
    for (const l of t)
      l(void 0);
    return je;
  }
  const n = e.subscribe(...t);
  return n.unsubscribe ? () => n.unsubscribe() : n;
}
const Yi = typeof window < "u";
let Jl = Yi ? () => window.performance.now() : () => Date.now(), xi = Yi ? (e) => requestAnimationFrame(e) : je;
const nt = /* @__PURE__ */ new Set();
function Mi(e) {
  nt.forEach((t) => {
    t.c(e) || (nt.delete(t), t.f());
  }), nt.size !== 0 && xi(Mi);
}
function Uo(e) {
  let t;
  return nt.size === 0 && xi(Mi), {
    promise: new Promise((n) => {
      nt.add(t = { c: e, f: n });
    }),
    abort() {
      nt.delete(t);
    }
  };
}
const qe = [];
function Fo(e, t) {
  return {
    subscribe: Wt(e, t).subscribe
  };
}
function Wt(e, t = je) {
  let n;
  const l = /* @__PURE__ */ new Set();
  function i(s) {
    if (fo(e, s) && (e = s, n)) {
      const o = !qe.length;
      for (const c of l)
        c[1](), qe.push(c, e);
      if (o) {
        for (let c = 0; c < qe.length; c += 2)
          qe[c][0](qe[c + 1]);
        qe.length = 0;
      }
    }
  }
  function r(s) {
    i(s(e));
  }
  function a(s, o = je) {
    const c = [s, o];
    return l.add(c), l.size === 1 && (n = t(i, r) || je), s(e), () => {
      l.delete(c), l.size === 0 && n && (n(), n = null);
    };
  }
  return { set: i, update: r, subscribe: a };
}
function ft(e, t, n) {
  const l = !Array.isArray(e), i = l ? [e] : e;
  if (!i.every(Boolean))
    throw new Error("derived() expects stores as input, got a falsy value");
  const r = t.length < 2;
  return Fo(n, (a, s) => {
    let o = !1;
    const c = [];
    let d = 0, u = je;
    const h = () => {
      if (d)
        return;
      u();
      const V = t(l ? c[0] : c, a, s);
      r ? a(V) : u = ho(V) ? V : je;
    }, f = i.map(
      (V, U) => mo(
        V,
        (m) => {
          c[U] = m, d &= ~(1 << U), o && h();
        },
        () => {
          d |= 1 << U;
        }
      )
    );
    return o = !0, h(), function() {
      uo(f), u(), o = !1;
    };
  });
}
function Nl(e) {
  return Object.prototype.toString.call(e) === "[object Date]";
}
function wn(e, t, n, l) {
  if (typeof n == "number" || Nl(n)) {
    const i = l - n, r = (n - t) / (e.dt || 1 / 60), a = e.opts.stiffness * i, s = e.opts.damping * r, o = (a - s) * e.inv_mass, c = (r + o) * e.dt;
    return Math.abs(c) < e.opts.precision && Math.abs(i) < e.opts.precision ? l : (e.settled = !1, Nl(n) ? new Date(n.getTime() + c) : n + c);
  } else {
    if (Array.isArray(n))
      return n.map(
        (i, r) => wn(e, t[r], n[r], l[r])
      );
    if (typeof n == "object") {
      const i = {};
      for (const r in n)
        i[r] = wn(e, t[r], n[r], l[r]);
      return i;
    } else
      throw new Error(`Cannot spring ${typeof n} values`);
  }
}
function Sl(e, t = {}) {
  const n = Wt(e), { stiffness: l = 0.15, damping: i = 0.8, precision: r = 0.01 } = t;
  let a, s, o, c = e, d = e, u = 1, h = 0, f = !1;
  function V(m, b = {}) {
    d = m;
    const _ = o = {};
    return e == null || b.hard || U.stiffness >= 1 && U.damping >= 1 ? (f = !0, a = Jl(), c = m, n.set(e = d), Promise.resolve()) : (b.soft && (h = 1 / ((b.soft === !0 ? 0.5 : +b.soft) * 60), u = 0), s || (a = Jl(), f = !1, s = Uo((p) => {
      if (f)
        return f = !1, s = null, !1;
      u = Math.min(u + h, 1);
      const B = {
        inv_mass: u,
        opts: U,
        settled: !0,
        dt: (p - a) * 60 / 1e3
      }, Z = wn(B, c, e, d);
      return a = p, c = e, n.set(e = Z), B.settled && (s = null), !B.settled;
    })), new Promise((p) => {
      s.promise.then(() => {
        _ === o && p();
      });
    }));
  }
  const U = {
    set: V,
    update: (m, b) => V(m(d, e), b),
    subscribe: n.subscribe,
    stiffness: l,
    damping: i,
    precision: r
  };
  return U;
}
function bo(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Vo = function(t) {
  return po(t) && !Zo(t);
};
function po(e) {
  return !!e && typeof e == "object";
}
function Zo(e) {
  var t = Object.prototype.toString.call(e);
  return t === "[object RegExp]" || t === "[object Date]" || Ro(e);
}
var Bo = typeof Symbol == "function" && Symbol.for, Qo = Bo ? Symbol.for("react.element") : 60103;
function Ro(e) {
  return e.$$typeof === Qo;
}
function Wo(e) {
  return Array.isArray(e) ? [] : {};
}
function Bt(e, t) {
  return t.clone !== !1 && t.isMergeableObject(e) ? rt(Wo(e), e, t) : e;
}
function _o(e, t, n) {
  return e.concat(t).map(function(l) {
    return Bt(l, n);
  });
}
function go(e, t) {
  if (!t.customMerge)
    return rt;
  var n = t.customMerge(e);
  return typeof n == "function" ? n : rt;
}
function yo(e) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(e).filter(function(t) {
    return Object.propertyIsEnumerable.call(e, t);
  }) : [];
}
function Gl(e) {
  return Object.keys(e).concat(yo(e));
}
function Di(e, t) {
  try {
    return t in e;
  } catch {
    return !1;
  }
}
function Jo(e, t) {
  return Di(e, t) && !(Object.hasOwnProperty.call(e, t) && Object.propertyIsEnumerable.call(e, t));
}
function No(e, t, n) {
  var l = {};
  return n.isMergeableObject(e) && Gl(e).forEach(function(i) {
    l[i] = Bt(e[i], n);
  }), Gl(t).forEach(function(i) {
    Jo(e, i) || (Di(e, i) && n.isMergeableObject(t[i]) ? l[i] = go(i, n)(e[i], t[i], n) : l[i] = Bt(t[i], n));
  }), l;
}
function rt(e, t, n) {
  n = n || {}, n.arrayMerge = n.arrayMerge || _o, n.isMergeableObject = n.isMergeableObject || Vo, n.cloneUnlessOtherwiseSpecified = Bt;
  var l = Array.isArray(t), i = Array.isArray(e), r = l === i;
  return r ? l ? n.arrayMerge(e, t, n) : No(e, t, n) : Bt(t, n);
}
rt.all = function(t, n) {
  if (!Array.isArray(t))
    throw new Error("first argument should be an array");
  return t.reduce(function(l, i) {
    return rt(l, i, n);
  }, {});
};
var So = rt, Go = So;
const Xo = /* @__PURE__ */ bo(Go);
var In = function(e, t) {
  return In = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, l) {
    n.__proto__ = l;
  } || function(n, l) {
    for (var i in l)
      Object.prototype.hasOwnProperty.call(l, i) && (n[i] = l[i]);
  }, In(e, t);
};
function zt(e, t) {
  if (typeof t != "function" && t !== null)
    throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  In(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var Y = function() {
  return Y = Object.assign || function(t) {
    for (var n, l = 1, i = arguments.length; l < i; l++) {
      n = arguments[l];
      for (var r in n)
        Object.prototype.hasOwnProperty.call(n, r) && (t[r] = n[r]);
    }
    return t;
  }, Y.apply(this, arguments);
};
function pn(e, t, n) {
  if (n || arguments.length === 2)
    for (var l = 0, i = t.length, r; l < i; l++)
      (r || !(l in t)) && (r || (r = Array.prototype.slice.call(t, 0, l)), r[l] = t[l]);
  return e.concat(r || Array.prototype.slice.call(t));
}
var v;
(function(e) {
  e[e.EXPECT_ARGUMENT_CLOSING_BRACE = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE", e[e.EMPTY_ARGUMENT = 2] = "EMPTY_ARGUMENT", e[e.MALFORMED_ARGUMENT = 3] = "MALFORMED_ARGUMENT", e[e.EXPECT_ARGUMENT_TYPE = 4] = "EXPECT_ARGUMENT_TYPE", e[e.INVALID_ARGUMENT_TYPE = 5] = "INVALID_ARGUMENT_TYPE", e[e.EXPECT_ARGUMENT_STYLE = 6] = "EXPECT_ARGUMENT_STYLE", e[e.INVALID_NUMBER_SKELETON = 7] = "INVALID_NUMBER_SKELETON", e[e.INVALID_DATE_TIME_SKELETON = 8] = "INVALID_DATE_TIME_SKELETON", e[e.EXPECT_NUMBER_SKELETON = 9] = "EXPECT_NUMBER_SKELETON", e[e.EXPECT_DATE_TIME_SKELETON = 10] = "EXPECT_DATE_TIME_SKELETON", e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE", e[e.EXPECT_SELECT_ARGUMENT_OPTIONS = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS", e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE", e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE", e[e.EXPECT_SELECT_ARGUMENT_SELECTOR = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR", e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR", e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT", e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT", e[e.INVALID_PLURAL_ARGUMENT_SELECTOR = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR", e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR", e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR", e[e.MISSING_OTHER_CLAUSE = 22] = "MISSING_OTHER_CLAUSE", e[e.INVALID_TAG = 23] = "INVALID_TAG", e[e.INVALID_TAG_NAME = 25] = "INVALID_TAG_NAME", e[e.UNMATCHED_CLOSING_TAG = 26] = "UNMATCHED_CLOSING_TAG", e[e.UNCLOSED_TAG = 27] = "UNCLOSED_TAG";
})(v || (v = {}));
var M;
(function(e) {
  e[e.literal = 0] = "literal", e[e.argument = 1] = "argument", e[e.number = 2] = "number", e[e.date = 3] = "date", e[e.time = 4] = "time", e[e.select = 5] = "select", e[e.plural = 6] = "plural", e[e.pound = 7] = "pound", e[e.tag = 8] = "tag";
})(M || (M = {}));
var at;
(function(e) {
  e[e.number = 0] = "number", e[e.dateTime = 1] = "dateTime";
})(at || (at = {}));
function Xl(e) {
  return e.type === M.literal;
}
function Eo(e) {
  return e.type === M.argument;
}
function zi(e) {
  return e.type === M.number;
}
function Oi(e) {
  return e.type === M.date;
}
function Ai(e) {
  return e.type === M.time;
}
function Pi(e) {
  return e.type === M.select;
}
function ji(e) {
  return e.type === M.plural;
}
function ko(e) {
  return e.type === M.pound;
}
function Li(e) {
  return e.type === M.tag;
}
function Ki(e) {
  return !!(e && typeof e == "object" && e.type === at.number);
}
function Cn(e) {
  return !!(e && typeof e == "object" && e.type === at.dateTime);
}
var qi = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/, vo = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
function To(e) {
  var t = {};
  return e.replace(vo, function(n) {
    var l = n.length;
    switch (n[0]) {
      case "G":
        t.era = l === 4 ? "long" : l === 5 ? "narrow" : "short";
        break;
      case "y":
        t.year = l === 2 ? "2-digit" : "numeric";
        break;
      case "Y":
      case "u":
      case "U":
      case "r":
        throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");
      case "q":
      case "Q":
        throw new RangeError("`q/Q` (quarter) patterns are not supported");
      case "M":
      case "L":
        t.month = ["numeric", "2-digit", "short", "long", "narrow"][l - 1];
        break;
      case "w":
      case "W":
        throw new RangeError("`w/W` (week) patterns are not supported");
      case "d":
        t.day = ["numeric", "2-digit"][l - 1];
        break;
      case "D":
      case "F":
      case "g":
        throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");
      case "E":
        t.weekday = l === 4 ? "short" : l === 5 ? "narrow" : "short";
        break;
      case "e":
        if (l < 4)
          throw new RangeError("`e..eee` (weekday) patterns are not supported");
        t.weekday = ["short", "long", "narrow", "short"][l - 4];
        break;
      case "c":
        if (l < 4)
          throw new RangeError("`c..ccc` (weekday) patterns are not supported");
        t.weekday = ["short", "long", "narrow", "short"][l - 4];
        break;
      case "a":
        t.hour12 = !0;
        break;
      case "b":
      case "B":
        throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");
      case "h":
        t.hourCycle = "h12", t.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "H":
        t.hourCycle = "h23", t.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "K":
        t.hourCycle = "h11", t.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "k":
        t.hourCycle = "h24", t.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "j":
      case "J":
      case "C":
        throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");
      case "m":
        t.minute = ["numeric", "2-digit"][l - 1];
        break;
      case "s":
        t.second = ["numeric", "2-digit"][l - 1];
        break;
      case "S":
      case "A":
        throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");
      case "z":
        t.timeZoneName = l < 4 ? "short" : "long";
        break;
      case "Z":
      case "O":
      case "v":
      case "V":
      case "X":
      case "x":
        throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead");
    }
    return "";
  }), t;
}
var wo = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
function Io(e) {
  if (e.length === 0)
    throw new Error("Number skeleton cannot be empty");
  for (var t = e.split(wo).filter(function(h) {
    return h.length > 0;
  }), n = [], l = 0, i = t; l < i.length; l++) {
    var r = i[l], a = r.split("/");
    if (a.length === 0)
      throw new Error("Invalid number skeleton");
    for (var s = a[0], o = a.slice(1), c = 0, d = o; c < d.length; c++) {
      var u = d[c];
      if (u.length === 0)
        throw new Error("Invalid number skeleton");
    }
    n.push({ stem: s, options: o });
  }
  return n;
}
function Co(e) {
  return e.replace(/^(.*?)-/, "");
}
var El = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g, $i = /^(@+)?(\+|#+)?[rs]?$/g, Ho = /(\*)(0+)|(#+)(0+)|(0+)/g, er = /^(0+)$/;
function kl(e) {
  var t = {};
  return e[e.length - 1] === "r" ? t.roundingPriority = "morePrecision" : e[e.length - 1] === "s" && (t.roundingPriority = "lessPrecision"), e.replace($i, function(n, l, i) {
    return typeof i != "string" ? (t.minimumSignificantDigits = l.length, t.maximumSignificantDigits = l.length) : i === "+" ? t.minimumSignificantDigits = l.length : l[0] === "#" ? t.maximumSignificantDigits = l.length : (t.minimumSignificantDigits = l.length, t.maximumSignificantDigits = l.length + (typeof i == "string" ? i.length : 0)), "";
  }), t;
}
function tr(e) {
  switch (e) {
    case "sign-auto":
      return {
        signDisplay: "auto"
      };
    case "sign-accounting":
    case "()":
      return {
        currencySign: "accounting"
      };
    case "sign-always":
    case "+!":
      return {
        signDisplay: "always"
      };
    case "sign-accounting-always":
    case "()!":
      return {
        signDisplay: "always",
        currencySign: "accounting"
      };
    case "sign-except-zero":
    case "+?":
      return {
        signDisplay: "exceptZero"
      };
    case "sign-accounting-except-zero":
    case "()?":
      return {
        signDisplay: "exceptZero",
        currencySign: "accounting"
      };
    case "sign-never":
    case "+_":
      return {
        signDisplay: "never"
      };
  }
}
function Yo(e) {
  var t;
  if (e[0] === "E" && e[1] === "E" ? (t = {
    notation: "engineering"
  }, e = e.slice(2)) : e[0] === "E" && (t = {
    notation: "scientific"
  }, e = e.slice(1)), t) {
    var n = e.slice(0, 2);
    if (n === "+!" ? (t.signDisplay = "always", e = e.slice(2)) : n === "+?" && (t.signDisplay = "exceptZero", e = e.slice(2)), !er.test(e))
      throw new Error("Malformed concise eng/scientific notation");
    t.minimumIntegerDigits = e.length;
  }
  return t;
}
function vl(e) {
  var t = {}, n = tr(e);
  return n || t;
}
function xo(e) {
  for (var t = {}, n = 0, l = e; n < l.length; n++) {
    var i = l[n];
    switch (i.stem) {
      case "percent":
      case "%":
        t.style = "percent";
        continue;
      case "%x100":
        t.style = "percent", t.scale = 100;
        continue;
      case "currency":
        t.style = "currency", t.currency = i.options[0];
        continue;
      case "group-off":
      case ",_":
        t.useGrouping = !1;
        continue;
      case "precision-integer":
      case ".":
        t.maximumFractionDigits = 0;
        continue;
      case "measure-unit":
      case "unit":
        t.style = "unit", t.unit = Co(i.options[0]);
        continue;
      case "compact-short":
      case "K":
        t.notation = "compact", t.compactDisplay = "short";
        continue;
      case "compact-long":
      case "KK":
        t.notation = "compact", t.compactDisplay = "long";
        continue;
      case "scientific":
        t = Y(Y(Y({}, t), { notation: "scientific" }), i.options.reduce(function(o, c) {
          return Y(Y({}, o), vl(c));
        }, {}));
        continue;
      case "engineering":
        t = Y(Y(Y({}, t), { notation: "engineering" }), i.options.reduce(function(o, c) {
          return Y(Y({}, o), vl(c));
        }, {}));
        continue;
      case "notation-simple":
        t.notation = "standard";
        continue;
      case "unit-width-narrow":
        t.currencyDisplay = "narrowSymbol", t.unitDisplay = "narrow";
        continue;
      case "unit-width-short":
        t.currencyDisplay = "code", t.unitDisplay = "short";
        continue;
      case "unit-width-full-name":
        t.currencyDisplay = "name", t.unitDisplay = "long";
        continue;
      case "unit-width-iso-code":
        t.currencyDisplay = "symbol";
        continue;
      case "scale":
        t.scale = parseFloat(i.options[0]);
        continue;
      case "integer-width":
        if (i.options.length > 1)
          throw new RangeError("integer-width stems only accept a single optional option");
        i.options[0].replace(Ho, function(o, c, d, u, h, f) {
          if (c)
            t.minimumIntegerDigits = d.length;
          else {
            if (u && h)
              throw new Error("We currently do not support maximum integer digits");
            if (f)
              throw new Error("We currently do not support exact integer digits");
          }
          return "";
        });
        continue;
    }
    if (er.test(i.stem)) {
      t.minimumIntegerDigits = i.stem.length;
      continue;
    }
    if (El.test(i.stem)) {
      if (i.options.length > 1)
        throw new RangeError("Fraction-precision stems only accept a single optional option");
      i.stem.replace(El, function(o, c, d, u, h, f) {
        return d === "*" ? t.minimumFractionDigits = c.length : u && u[0] === "#" ? t.maximumFractionDigits = u.length : h && f ? (t.minimumFractionDigits = h.length, t.maximumFractionDigits = h.length + f.length) : (t.minimumFractionDigits = c.length, t.maximumFractionDigits = c.length), "";
      });
      var r = i.options[0];
      r === "w" ? t = Y(Y({}, t), { trailingZeroDisplay: "stripIfInteger" }) : r && (t = Y(Y({}, t), kl(r)));
      continue;
    }
    if ($i.test(i.stem)) {
      t = Y(Y({}, t), kl(i.stem));
      continue;
    }
    var a = tr(i.stem);
    a && (t = Y(Y({}, t), a));
    var s = Yo(i.stem);
    s && (t = Y(Y({}, t), s));
  }
  return t;
}
var Gt = {
  AX: [
    "H"
  ],
  BQ: [
    "H"
  ],
  CP: [
    "H"
  ],
  CZ: [
    "H"
  ],
  DK: [
    "H"
  ],
  FI: [
    "H"
  ],
  ID: [
    "H"
  ],
  IS: [
    "H"
  ],
  ML: [
    "H"
  ],
  NE: [
    "H"
  ],
  RU: [
    "H"
  ],
  SE: [
    "H"
  ],
  SJ: [
    "H"
  ],
  SK: [
    "H"
  ],
  AS: [
    "h",
    "H"
  ],
  BT: [
    "h",
    "H"
  ],
  DJ: [
    "h",
    "H"
  ],
  ER: [
    "h",
    "H"
  ],
  GH: [
    "h",
    "H"
  ],
  IN: [
    "h",
    "H"
  ],
  LS: [
    "h",
    "H"
  ],
  PG: [
    "h",
    "H"
  ],
  PW: [
    "h",
    "H"
  ],
  SO: [
    "h",
    "H"
  ],
  TO: [
    "h",
    "H"
  ],
  VU: [
    "h",
    "H"
  ],
  WS: [
    "h",
    "H"
  ],
  "001": [
    "H",
    "h"
  ],
  AL: [
    "h",
    "H",
    "hB"
  ],
  TD: [
    "h",
    "H",
    "hB"
  ],
  "ca-ES": [
    "H",
    "h",
    "hB"
  ],
  CF: [
    "H",
    "h",
    "hB"
  ],
  CM: [
    "H",
    "h",
    "hB"
  ],
  "fr-CA": [
    "H",
    "h",
    "hB"
  ],
  "gl-ES": [
    "H",
    "h",
    "hB"
  ],
  "it-CH": [
    "H",
    "h",
    "hB"
  ],
  "it-IT": [
    "H",
    "h",
    "hB"
  ],
  LU: [
    "H",
    "h",
    "hB"
  ],
  NP: [
    "H",
    "h",
    "hB"
  ],
  PF: [
    "H",
    "h",
    "hB"
  ],
  SC: [
    "H",
    "h",
    "hB"
  ],
  SM: [
    "H",
    "h",
    "hB"
  ],
  SN: [
    "H",
    "h",
    "hB"
  ],
  TF: [
    "H",
    "h",
    "hB"
  ],
  VA: [
    "H",
    "h",
    "hB"
  ],
  CY: [
    "h",
    "H",
    "hb",
    "hB"
  ],
  GR: [
    "h",
    "H",
    "hb",
    "hB"
  ],
  CO: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  DO: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  KP: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  KR: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  NA: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  PA: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  PR: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  VE: [
    "h",
    "H",
    "hB",
    "hb"
  ],
  AC: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  AI: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  BW: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  BZ: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  CC: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  CK: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  CX: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  DG: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  FK: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  GB: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  GG: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  GI: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  IE: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  IM: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  IO: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  JE: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  LT: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  MK: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  MN: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  MS: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  NF: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  NG: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  NR: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  NU: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  PN: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  SH: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  SX: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  TA: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  ZA: [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "af-ZA": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  AR: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  CL: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  CR: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  CU: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  EA: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-BO": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-BR": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-EC": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-ES": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-GQ": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-PE": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  GT: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  HN: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  IC: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  KG: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  KM: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  LK: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  MA: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  MX: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  NI: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  PY: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  SV: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  UY: [
    "H",
    "h",
    "hB",
    "hb"
  ],
  JP: [
    "H",
    "h",
    "K"
  ],
  AD: [
    "H",
    "hB"
  ],
  AM: [
    "H",
    "hB"
  ],
  AO: [
    "H",
    "hB"
  ],
  AT: [
    "H",
    "hB"
  ],
  AW: [
    "H",
    "hB"
  ],
  BE: [
    "H",
    "hB"
  ],
  BF: [
    "H",
    "hB"
  ],
  BJ: [
    "H",
    "hB"
  ],
  BL: [
    "H",
    "hB"
  ],
  BR: [
    "H",
    "hB"
  ],
  CG: [
    "H",
    "hB"
  ],
  CI: [
    "H",
    "hB"
  ],
  CV: [
    "H",
    "hB"
  ],
  DE: [
    "H",
    "hB"
  ],
  EE: [
    "H",
    "hB"
  ],
  FR: [
    "H",
    "hB"
  ],
  GA: [
    "H",
    "hB"
  ],
  GF: [
    "H",
    "hB"
  ],
  GN: [
    "H",
    "hB"
  ],
  GP: [
    "H",
    "hB"
  ],
  GW: [
    "H",
    "hB"
  ],
  HR: [
    "H",
    "hB"
  ],
  IL: [
    "H",
    "hB"
  ],
  IT: [
    "H",
    "hB"
  ],
  KZ: [
    "H",
    "hB"
  ],
  MC: [
    "H",
    "hB"
  ],
  MD: [
    "H",
    "hB"
  ],
  MF: [
    "H",
    "hB"
  ],
  MQ: [
    "H",
    "hB"
  ],
  MZ: [
    "H",
    "hB"
  ],
  NC: [
    "H",
    "hB"
  ],
  NL: [
    "H",
    "hB"
  ],
  PM: [
    "H",
    "hB"
  ],
  PT: [
    "H",
    "hB"
  ],
  RE: [
    "H",
    "hB"
  ],
  RO: [
    "H",
    "hB"
  ],
  SI: [
    "H",
    "hB"
  ],
  SR: [
    "H",
    "hB"
  ],
  ST: [
    "H",
    "hB"
  ],
  TG: [
    "H",
    "hB"
  ],
  TR: [
    "H",
    "hB"
  ],
  WF: [
    "H",
    "hB"
  ],
  YT: [
    "H",
    "hB"
  ],
  BD: [
    "h",
    "hB",
    "H"
  ],
  PK: [
    "h",
    "hB",
    "H"
  ],
  AZ: [
    "H",
    "hB",
    "h"
  ],
  BA: [
    "H",
    "hB",
    "h"
  ],
  BG: [
    "H",
    "hB",
    "h"
  ],
  CH: [
    "H",
    "hB",
    "h"
  ],
  GE: [
    "H",
    "hB",
    "h"
  ],
  LI: [
    "H",
    "hB",
    "h"
  ],
  ME: [
    "H",
    "hB",
    "h"
  ],
  RS: [
    "H",
    "hB",
    "h"
  ],
  UA: [
    "H",
    "hB",
    "h"
  ],
  UZ: [
    "H",
    "hB",
    "h"
  ],
  XK: [
    "H",
    "hB",
    "h"
  ],
  AG: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  AU: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  BB: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  BM: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  BS: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  CA: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  DM: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "en-001": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  FJ: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  FM: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  GD: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  GM: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  GU: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  GY: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  JM: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  KI: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  KN: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  KY: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  LC: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  LR: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  MH: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  MP: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  MW: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  NZ: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  SB: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  SG: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  SL: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  SS: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  SZ: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  TC: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  TT: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  UM: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  US: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  VC: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  VG: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  VI: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  ZM: [
    "h",
    "hb",
    "H",
    "hB"
  ],
  BO: [
    "H",
    "hB",
    "h",
    "hb"
  ],
  EC: [
    "H",
    "hB",
    "h",
    "hb"
  ],
  ES: [
    "H",
    "hB",
    "h",
    "hb"
  ],
  GQ: [
    "H",
    "hB",
    "h",
    "hb"
  ],
  PE: [
    "H",
    "hB",
    "h",
    "hb"
  ],
  AE: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "ar-001": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  BH: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  DZ: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  EG: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  EH: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  HK: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  IQ: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  JO: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  KW: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  LB: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  LY: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  MO: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  MR: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  OM: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  PH: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  PS: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  QA: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  SA: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  SD: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  SY: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  TN: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  YE: [
    "h",
    "hB",
    "hb",
    "H"
  ],
  AF: [
    "H",
    "hb",
    "hB",
    "h"
  ],
  LA: [
    "H",
    "hb",
    "hB",
    "h"
  ],
  CN: [
    "H",
    "hB",
    "hb",
    "h"
  ],
  LV: [
    "H",
    "hB",
    "hb",
    "h"
  ],
  TL: [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "zu-ZA": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  CD: [
    "hB",
    "H"
  ],
  IR: [
    "hB",
    "H"
  ],
  "hi-IN": [
    "hB",
    "h",
    "H"
  ],
  "kn-IN": [
    "hB",
    "h",
    "H"
  ],
  "ml-IN": [
    "hB",
    "h",
    "H"
  ],
  "te-IN": [
    "hB",
    "h",
    "H"
  ],
  KH: [
    "hB",
    "h",
    "H",
    "hb"
  ],
  "ta-IN": [
    "hB",
    "h",
    "hb",
    "H"
  ],
  BN: [
    "hb",
    "hB",
    "h",
    "H"
  ],
  MY: [
    "hb",
    "hB",
    "h",
    "H"
  ],
  ET: [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "gu-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "mr-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "pa-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  TW: [
    "hB",
    "hb",
    "h",
    "H"
  ],
  KE: [
    "hB",
    "hb",
    "H",
    "h"
  ],
  MM: [
    "hB",
    "hb",
    "H",
    "h"
  ],
  TZ: [
    "hB",
    "hb",
    "H",
    "h"
  ],
  UG: [
    "hB",
    "hb",
    "H",
    "h"
  ]
};
function Mo(e, t) {
  for (var n = "", l = 0; l < e.length; l++) {
    var i = e.charAt(l);
    if (i === "j") {
      for (var r = 0; l + 1 < e.length && e.charAt(l + 1) === i; )
        r++, l++;
      var a = 1 + (r & 1), s = r < 2 ? 1 : 3 + (r >> 1), o = "a", c = Do(t);
      for ((c == "H" || c == "k") && (s = 0); s-- > 0; )
        n += o;
      for (; a-- > 0; )
        n = c + n;
    } else
      i === "J" ? n += "H" : n += i;
  }
  return n;
}
function Do(e) {
  var t = e.hourCycle;
  if (t === void 0 && // @ts-ignore hourCycle(s) is not identified yet
  e.hourCycles && // @ts-ignore
  e.hourCycles.length && (t = e.hourCycles[0]), t)
    switch (t) {
      case "h24":
        return "k";
      case "h23":
        return "H";
      case "h12":
        return "h";
      case "h11":
        return "K";
      default:
        throw new Error("Invalid hourCycle");
    }
  var n = e.language, l;
  n !== "root" && (l = e.maximize().region);
  var i = Gt[l || ""] || Gt[n || ""] || Gt["".concat(n, "-001")] || Gt["001"];
  return i[0];
}
var Zn, zo = new RegExp("^".concat(qi.source, "*")), Oo = new RegExp("".concat(qi.source, "*$"));
function T(e, t) {
  return { start: e, end: t };
}
var Ao = !!String.prototype.startsWith, Po = !!String.fromCodePoint, jo = !!Object.fromEntries, Lo = !!String.prototype.codePointAt, Ko = !!String.prototype.trimStart, qo = !!String.prototype.trimEnd, $o = !!Number.isSafeInteger, e0 = $o ? Number.isSafeInteger : function(e) {
  return typeof e == "number" && isFinite(e) && Math.floor(e) === e && Math.abs(e) <= 9007199254740991;
}, Hn = !0;
try {
  var t0 = lr("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  Hn = ((Zn = t0.exec("a")) === null || Zn === void 0 ? void 0 : Zn[0]) === "a";
} catch {
  Hn = !1;
}
var Tl = Ao ? (
  // Native
  function(t, n, l) {
    return t.startsWith(n, l);
  }
) : (
  // For IE11
  function(t, n, l) {
    return t.slice(l, l + n.length) === n;
  }
), Yn = Po ? String.fromCodePoint : (
  // IE11
  function() {
    for (var t = [], n = 0; n < arguments.length; n++)
      t[n] = arguments[n];
    for (var l = "", i = t.length, r = 0, a; i > r; ) {
      if (a = t[r++], a > 1114111)
        throw RangeError(a + " is not a valid code point");
      l += a < 65536 ? String.fromCharCode(a) : String.fromCharCode(((a -= 65536) >> 10) + 55296, a % 1024 + 56320);
    }
    return l;
  }
), wl = (
  // native
  jo ? Object.fromEntries : (
    // Ponyfill
    function(t) {
      for (var n = {}, l = 0, i = t; l < i.length; l++) {
        var r = i[l], a = r[0], s = r[1];
        n[a] = s;
      }
      return n;
    }
  )
), nr = Lo ? (
  // Native
  function(t, n) {
    return t.codePointAt(n);
  }
) : (
  // IE 11
  function(t, n) {
    var l = t.length;
    if (!(n < 0 || n >= l)) {
      var i = t.charCodeAt(n), r;
      return i < 55296 || i > 56319 || n + 1 === l || (r = t.charCodeAt(n + 1)) < 56320 || r > 57343 ? i : (i - 55296 << 10) + (r - 56320) + 65536;
    }
  }
), n0 = Ko ? (
  // Native
  function(t) {
    return t.trimStart();
  }
) : (
  // Ponyfill
  function(t) {
    return t.replace(zo, "");
  }
), l0 = qo ? (
  // Native
  function(t) {
    return t.trimEnd();
  }
) : (
  // Ponyfill
  function(t) {
    return t.replace(Oo, "");
  }
);
function lr(e, t) {
  return new RegExp(e, t);
}
var xn;
if (Hn) {
  var Il = lr("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  xn = function(t, n) {
    var l;
    Il.lastIndex = n;
    var i = Il.exec(t);
    return (l = i[1]) !== null && l !== void 0 ? l : "";
  };
} else
  xn = function(t, n) {
    for (var l = []; ; ) {
      var i = nr(t, n);
      if (i === void 0 || ir(i) || s0(i))
        break;
      l.push(i), n += i >= 65536 ? 2 : 1;
    }
    return Yn.apply(void 0, l);
  };
var i0 = (
  /** @class */
  function() {
    function e(t, n) {
      n === void 0 && (n = {}), this.message = t, this.position = { offset: 0, line: 1, column: 1 }, this.ignoreTag = !!n.ignoreTag, this.locale = n.locale, this.requiresOtherClause = !!n.requiresOtherClause, this.shouldParseSkeletons = !!n.shouldParseSkeletons;
    }
    return e.prototype.parse = function() {
      if (this.offset() !== 0)
        throw Error("parser can only be used once");
      return this.parseMessage(0, "", !1);
    }, e.prototype.parseMessage = function(t, n, l) {
      for (var i = []; !this.isEOF(); ) {
        var r = this.char();
        if (r === 123) {
          var a = this.parseArgument(t, l);
          if (a.err)
            return a;
          i.push(a.val);
        } else {
          if (r === 125 && t > 0)
            break;
          if (r === 35 && (n === "plural" || n === "selectordinal")) {
            var s = this.clonePosition();
            this.bump(), i.push({
              type: M.pound,
              location: T(s, this.clonePosition())
            });
          } else if (r === 60 && !this.ignoreTag && this.peek() === 47) {
            if (l)
              break;
            return this.error(v.UNMATCHED_CLOSING_TAG, T(this.clonePosition(), this.clonePosition()));
          } else if (r === 60 && !this.ignoreTag && Mn(this.peek() || 0)) {
            var a = this.parseTag(t, n);
            if (a.err)
              return a;
            i.push(a.val);
          } else {
            var a = this.parseLiteral(t, n);
            if (a.err)
              return a;
            i.push(a.val);
          }
        }
      }
      return { val: i, err: null };
    }, e.prototype.parseTag = function(t, n) {
      var l = this.clonePosition();
      this.bump();
      var i = this.parseTagName();
      if (this.bumpSpace(), this.bumpIf("/>"))
        return {
          val: {
            type: M.literal,
            value: "<".concat(i, "/>"),
            location: T(l, this.clonePosition())
          },
          err: null
        };
      if (this.bumpIf(">")) {
        var r = this.parseMessage(t + 1, n, !0);
        if (r.err)
          return r;
        var a = r.val, s = this.clonePosition();
        if (this.bumpIf("</")) {
          if (this.isEOF() || !Mn(this.char()))
            return this.error(v.INVALID_TAG, T(s, this.clonePosition()));
          var o = this.clonePosition(), c = this.parseTagName();
          return i !== c ? this.error(v.UNMATCHED_CLOSING_TAG, T(o, this.clonePosition())) : (this.bumpSpace(), this.bumpIf(">") ? {
            val: {
              type: M.tag,
              value: i,
              children: a,
              location: T(l, this.clonePosition())
            },
            err: null
          } : this.error(v.INVALID_TAG, T(s, this.clonePosition())));
        } else
          return this.error(v.UNCLOSED_TAG, T(l, this.clonePosition()));
      } else
        return this.error(v.INVALID_TAG, T(l, this.clonePosition()));
    }, e.prototype.parseTagName = function() {
      var t = this.offset();
      for (this.bump(); !this.isEOF() && a0(this.char()); )
        this.bump();
      return this.message.slice(t, this.offset());
    }, e.prototype.parseLiteral = function(t, n) {
      for (var l = this.clonePosition(), i = ""; ; ) {
        var r = this.tryParseQuote(n);
        if (r) {
          i += r;
          continue;
        }
        var a = this.tryParseUnquoted(t, n);
        if (a) {
          i += a;
          continue;
        }
        var s = this.tryParseLeftAngleBracket();
        if (s) {
          i += s;
          continue;
        }
        break;
      }
      var o = T(l, this.clonePosition());
      return {
        val: { type: M.literal, value: i, location: o },
        err: null
      };
    }, e.prototype.tryParseLeftAngleBracket = function() {
      return !this.isEOF() && this.char() === 60 && (this.ignoreTag || // If at the opening tag or closing tag position, bail.
      !r0(this.peek() || 0)) ? (this.bump(), "<") : null;
    }, e.prototype.tryParseQuote = function(t) {
      if (this.isEOF() || this.char() !== 39)
        return null;
      switch (this.peek()) {
        case 39:
          return this.bump(), this.bump(), "'";
        case 123:
        case 60:
        case 62:
        case 125:
          break;
        case 35:
          if (t === "plural" || t === "selectordinal")
            break;
          return null;
        default:
          return null;
      }
      this.bump();
      var n = [this.char()];
      for (this.bump(); !this.isEOF(); ) {
        var l = this.char();
        if (l === 39)
          if (this.peek() === 39)
            n.push(39), this.bump();
          else {
            this.bump();
            break;
          }
        else
          n.push(l);
        this.bump();
      }
      return Yn.apply(void 0, n);
    }, e.prototype.tryParseUnquoted = function(t, n) {
      if (this.isEOF())
        return null;
      var l = this.char();
      return l === 60 || l === 123 || l === 35 && (n === "plural" || n === "selectordinal") || l === 125 && t > 0 ? null : (this.bump(), Yn(l));
    }, e.prototype.parseArgument = function(t, n) {
      var l = this.clonePosition();
      if (this.bump(), this.bumpSpace(), this.isEOF())
        return this.error(v.EXPECT_ARGUMENT_CLOSING_BRACE, T(l, this.clonePosition()));
      if (this.char() === 125)
        return this.bump(), this.error(v.EMPTY_ARGUMENT, T(l, this.clonePosition()));
      var i = this.parseIdentifierIfPossible().value;
      if (!i)
        return this.error(v.MALFORMED_ARGUMENT, T(l, this.clonePosition()));
      if (this.bumpSpace(), this.isEOF())
        return this.error(v.EXPECT_ARGUMENT_CLOSING_BRACE, T(l, this.clonePosition()));
      switch (this.char()) {
        case 125:
          return this.bump(), {
            val: {
              type: M.argument,
              // value does not include the opening and closing braces.
              value: i,
              location: T(l, this.clonePosition())
            },
            err: null
          };
        case 44:
          return this.bump(), this.bumpSpace(), this.isEOF() ? this.error(v.EXPECT_ARGUMENT_CLOSING_BRACE, T(l, this.clonePosition())) : this.parseArgumentOptions(t, n, i, l);
        default:
          return this.error(v.MALFORMED_ARGUMENT, T(l, this.clonePosition()));
      }
    }, e.prototype.parseIdentifierIfPossible = function() {
      var t = this.clonePosition(), n = this.offset(), l = xn(this.message, n), i = n + l.length;
      this.bumpTo(i);
      var r = this.clonePosition(), a = T(t, r);
      return { value: l, location: a };
    }, e.prototype.parseArgumentOptions = function(t, n, l, i) {
      var r, a = this.clonePosition(), s = this.parseIdentifierIfPossible().value, o = this.clonePosition();
      switch (s) {
        case "":
          return this.error(v.EXPECT_ARGUMENT_TYPE, T(a, o));
        case "number":
        case "date":
        case "time": {
          this.bumpSpace();
          var c = null;
          if (this.bumpIf(",")) {
            this.bumpSpace();
            var d = this.clonePosition(), u = this.parseSimpleArgStyleIfPossible();
            if (u.err)
              return u;
            var h = l0(u.val);
            if (h.length === 0)
              return this.error(v.EXPECT_ARGUMENT_STYLE, T(this.clonePosition(), this.clonePosition()));
            var f = T(d, this.clonePosition());
            c = { style: h, styleLocation: f };
          }
          var V = this.tryParseArgumentClose(i);
          if (V.err)
            return V;
          var U = T(i, this.clonePosition());
          if (c && Tl(c == null ? void 0 : c.style, "::", 0)) {
            var m = n0(c.style.slice(2));
            if (s === "number") {
              var u = this.parseNumberSkeletonFromString(m, c.styleLocation);
              return u.err ? u : {
                val: { type: M.number, value: l, location: U, style: u.val },
                err: null
              };
            } else {
              if (m.length === 0)
                return this.error(v.EXPECT_DATE_TIME_SKELETON, U);
              var b = m;
              this.locale && (b = Mo(m, this.locale));
              var h = {
                type: at.dateTime,
                pattern: b,
                location: c.styleLocation,
                parsedOptions: this.shouldParseSkeletons ? To(b) : {}
              }, _ = s === "date" ? M.date : M.time;
              return {
                val: { type: _, value: l, location: U, style: h },
                err: null
              };
            }
          }
          return {
            val: {
              type: s === "number" ? M.number : s === "date" ? M.date : M.time,
              value: l,
              location: U,
              style: (r = c == null ? void 0 : c.style) !== null && r !== void 0 ? r : null
            },
            err: null
          };
        }
        case "plural":
        case "selectordinal":
        case "select": {
          var p = this.clonePosition();
          if (this.bumpSpace(), !this.bumpIf(","))
            return this.error(v.EXPECT_SELECT_ARGUMENT_OPTIONS, T(p, Y({}, p)));
          this.bumpSpace();
          var B = this.parseIdentifierIfPossible(), Z = 0;
          if (s !== "select" && B.value === "offset") {
            if (!this.bumpIf(":"))
              return this.error(v.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, T(this.clonePosition(), this.clonePosition()));
            this.bumpSpace();
            var u = this.tryParseDecimalInteger(v.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, v.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
            if (u.err)
              return u;
            this.bumpSpace(), B = this.parseIdentifierIfPossible(), Z = u.val;
          }
          var J = this.tryParsePluralOrSelectOptions(t, s, n, B);
          if (J.err)
            return J;
          var V = this.tryParseArgumentClose(i);
          if (V.err)
            return V;
          var w = T(i, this.clonePosition());
          return s === "select" ? {
            val: {
              type: M.select,
              value: l,
              options: wl(J.val),
              location: w
            },
            err: null
          } : {
            val: {
              type: M.plural,
              value: l,
              options: wl(J.val),
              offset: Z,
              pluralType: s === "plural" ? "cardinal" : "ordinal",
              location: w
            },
            err: null
          };
        }
        default:
          return this.error(v.INVALID_ARGUMENT_TYPE, T(a, o));
      }
    }, e.prototype.tryParseArgumentClose = function(t) {
      return this.isEOF() || this.char() !== 125 ? this.error(v.EXPECT_ARGUMENT_CLOSING_BRACE, T(t, this.clonePosition())) : (this.bump(), { val: !0, err: null });
    }, e.prototype.parseSimpleArgStyleIfPossible = function() {
      for (var t = 0, n = this.clonePosition(); !this.isEOF(); ) {
        var l = this.char();
        switch (l) {
          case 39: {
            this.bump();
            var i = this.clonePosition();
            if (!this.bumpUntil("'"))
              return this.error(v.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, T(i, this.clonePosition()));
            this.bump();
            break;
          }
          case 123: {
            t += 1, this.bump();
            break;
          }
          case 125: {
            if (t > 0)
              t -= 1;
            else
              return {
                val: this.message.slice(n.offset, this.offset()),
                err: null
              };
            break;
          }
          default:
            this.bump();
            break;
        }
      }
      return {
        val: this.message.slice(n.offset, this.offset()),
        err: null
      };
    }, e.prototype.parseNumberSkeletonFromString = function(t, n) {
      var l = [];
      try {
        l = Io(t);
      } catch {
        return this.error(v.INVALID_NUMBER_SKELETON, n);
      }
      return {
        val: {
          type: at.number,
          tokens: l,
          location: n,
          parsedOptions: this.shouldParseSkeletons ? xo(l) : {}
        },
        err: null
      };
    }, e.prototype.tryParsePluralOrSelectOptions = function(t, n, l, i) {
      for (var r, a = !1, s = [], o = /* @__PURE__ */ new Set(), c = i.value, d = i.location; ; ) {
        if (c.length === 0) {
          var u = this.clonePosition();
          if (n !== "select" && this.bumpIf("=")) {
            var h = this.tryParseDecimalInteger(v.EXPECT_PLURAL_ARGUMENT_SELECTOR, v.INVALID_PLURAL_ARGUMENT_SELECTOR);
            if (h.err)
              return h;
            d = T(u, this.clonePosition()), c = this.message.slice(u.offset, this.offset());
          } else
            break;
        }
        if (o.has(c))
          return this.error(n === "select" ? v.DUPLICATE_SELECT_ARGUMENT_SELECTOR : v.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, d);
        c === "other" && (a = !0), this.bumpSpace();
        var f = this.clonePosition();
        if (!this.bumpIf("{"))
          return this.error(n === "select" ? v.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : v.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, T(this.clonePosition(), this.clonePosition()));
        var V = this.parseMessage(t + 1, n, l);
        if (V.err)
          return V;
        var U = this.tryParseArgumentClose(f);
        if (U.err)
          return U;
        s.push([
          c,
          {
            value: V.val,
            location: T(f, this.clonePosition())
          }
        ]), o.add(c), this.bumpSpace(), r = this.parseIdentifierIfPossible(), c = r.value, d = r.location;
      }
      return s.length === 0 ? this.error(n === "select" ? v.EXPECT_SELECT_ARGUMENT_SELECTOR : v.EXPECT_PLURAL_ARGUMENT_SELECTOR, T(this.clonePosition(), this.clonePosition())) : this.requiresOtherClause && !a ? this.error(v.MISSING_OTHER_CLAUSE, T(this.clonePosition(), this.clonePosition())) : { val: s, err: null };
    }, e.prototype.tryParseDecimalInteger = function(t, n) {
      var l = 1, i = this.clonePosition();
      this.bumpIf("+") || this.bumpIf("-") && (l = -1);
      for (var r = !1, a = 0; !this.isEOF(); ) {
        var s = this.char();
        if (s >= 48 && s <= 57)
          r = !0, a = a * 10 + (s - 48), this.bump();
        else
          break;
      }
      var o = T(i, this.clonePosition());
      return r ? (a *= l, e0(a) ? { val: a, err: null } : this.error(n, o)) : this.error(t, o);
    }, e.prototype.offset = function() {
      return this.position.offset;
    }, e.prototype.isEOF = function() {
      return this.offset() === this.message.length;
    }, e.prototype.clonePosition = function() {
      return {
        offset: this.position.offset,
        line: this.position.line,
        column: this.position.column
      };
    }, e.prototype.char = function() {
      var t = this.position.offset;
      if (t >= this.message.length)
        throw Error("out of bound");
      var n = nr(this.message, t);
      if (n === void 0)
        throw Error("Offset ".concat(t, " is at invalid UTF-16 code unit boundary"));
      return n;
    }, e.prototype.error = function(t, n) {
      return {
        val: null,
        err: {
          kind: t,
          message: this.message,
          location: n
        }
      };
    }, e.prototype.bump = function() {
      if (!this.isEOF()) {
        var t = this.char();
        t === 10 ? (this.position.line += 1, this.position.column = 1, this.position.offset += 1) : (this.position.column += 1, this.position.offset += t < 65536 ? 1 : 2);
      }
    }, e.prototype.bumpIf = function(t) {
      if (Tl(this.message, t, this.offset())) {
        for (var n = 0; n < t.length; n++)
          this.bump();
        return !0;
      }
      return !1;
    }, e.prototype.bumpUntil = function(t) {
      var n = this.offset(), l = this.message.indexOf(t, n);
      return l >= 0 ? (this.bumpTo(l), !0) : (this.bumpTo(this.message.length), !1);
    }, e.prototype.bumpTo = function(t) {
      if (this.offset() > t)
        throw Error("targetOffset ".concat(t, " must be greater than or equal to the current offset ").concat(this.offset()));
      for (t = Math.min(t, this.message.length); ; ) {
        var n = this.offset();
        if (n === t)
          break;
        if (n > t)
          throw Error("targetOffset ".concat(t, " is at invalid UTF-16 code unit boundary"));
        if (this.bump(), this.isEOF())
          break;
      }
    }, e.prototype.bumpSpace = function() {
      for (; !this.isEOF() && ir(this.char()); )
        this.bump();
    }, e.prototype.peek = function() {
      if (this.isEOF())
        return null;
      var t = this.char(), n = this.offset(), l = this.message.charCodeAt(n + (t >= 65536 ? 2 : 1));
      return l ?? null;
    }, e;
  }()
);
function Mn(e) {
  return e >= 97 && e <= 122 || e >= 65 && e <= 90;
}
function r0(e) {
  return Mn(e) || e === 47;
}
function a0(e) {
  return e === 45 || e === 46 || e >= 48 && e <= 57 || e === 95 || e >= 97 && e <= 122 || e >= 65 && e <= 90 || e == 183 || e >= 192 && e <= 214 || e >= 216 && e <= 246 || e >= 248 && e <= 893 || e >= 895 && e <= 8191 || e >= 8204 && e <= 8205 || e >= 8255 && e <= 8256 || e >= 8304 && e <= 8591 || e >= 11264 && e <= 12271 || e >= 12289 && e <= 55295 || e >= 63744 && e <= 64975 || e >= 65008 && e <= 65533 || e >= 65536 && e <= 983039;
}
function ir(e) {
  return e >= 9 && e <= 13 || e === 32 || e === 133 || e >= 8206 && e <= 8207 || e === 8232 || e === 8233;
}
function s0(e) {
  return e >= 33 && e <= 35 || e === 36 || e >= 37 && e <= 39 || e === 40 || e === 41 || e === 42 || e === 43 || e === 44 || e === 45 || e >= 46 && e <= 47 || e >= 58 && e <= 59 || e >= 60 && e <= 62 || e >= 63 && e <= 64 || e === 91 || e === 92 || e === 93 || e === 94 || e === 96 || e === 123 || e === 124 || e === 125 || e === 126 || e === 161 || e >= 162 && e <= 165 || e === 166 || e === 167 || e === 169 || e === 171 || e === 172 || e === 174 || e === 176 || e === 177 || e === 182 || e === 187 || e === 191 || e === 215 || e === 247 || e >= 8208 && e <= 8213 || e >= 8214 && e <= 8215 || e === 8216 || e === 8217 || e === 8218 || e >= 8219 && e <= 8220 || e === 8221 || e === 8222 || e === 8223 || e >= 8224 && e <= 8231 || e >= 8240 && e <= 8248 || e === 8249 || e === 8250 || e >= 8251 && e <= 8254 || e >= 8257 && e <= 8259 || e === 8260 || e === 8261 || e === 8262 || e >= 8263 && e <= 8273 || e === 8274 || e === 8275 || e >= 8277 && e <= 8286 || e >= 8592 && e <= 8596 || e >= 8597 && e <= 8601 || e >= 8602 && e <= 8603 || e >= 8604 && e <= 8607 || e === 8608 || e >= 8609 && e <= 8610 || e === 8611 || e >= 8612 && e <= 8613 || e === 8614 || e >= 8615 && e <= 8621 || e === 8622 || e >= 8623 && e <= 8653 || e >= 8654 && e <= 8655 || e >= 8656 && e <= 8657 || e === 8658 || e === 8659 || e === 8660 || e >= 8661 && e <= 8691 || e >= 8692 && e <= 8959 || e >= 8960 && e <= 8967 || e === 8968 || e === 8969 || e === 8970 || e === 8971 || e >= 8972 && e <= 8991 || e >= 8992 && e <= 8993 || e >= 8994 && e <= 9e3 || e === 9001 || e === 9002 || e >= 9003 && e <= 9083 || e === 9084 || e >= 9085 && e <= 9114 || e >= 9115 && e <= 9139 || e >= 9140 && e <= 9179 || e >= 9180 && e <= 9185 || e >= 9186 && e <= 9254 || e >= 9255 && e <= 9279 || e >= 9280 && e <= 9290 || e >= 9291 && e <= 9311 || e >= 9472 && e <= 9654 || e === 9655 || e >= 9656 && e <= 9664 || e === 9665 || e >= 9666 && e <= 9719 || e >= 9720 && e <= 9727 || e >= 9728 && e <= 9838 || e === 9839 || e >= 9840 && e <= 10087 || e === 10088 || e === 10089 || e === 10090 || e === 10091 || e === 10092 || e === 10093 || e === 10094 || e === 10095 || e === 10096 || e === 10097 || e === 10098 || e === 10099 || e === 10100 || e === 10101 || e >= 10132 && e <= 10175 || e >= 10176 && e <= 10180 || e === 10181 || e === 10182 || e >= 10183 && e <= 10213 || e === 10214 || e === 10215 || e === 10216 || e === 10217 || e === 10218 || e === 10219 || e === 10220 || e === 10221 || e === 10222 || e === 10223 || e >= 10224 && e <= 10239 || e >= 10240 && e <= 10495 || e >= 10496 && e <= 10626 || e === 10627 || e === 10628 || e === 10629 || e === 10630 || e === 10631 || e === 10632 || e === 10633 || e === 10634 || e === 10635 || e === 10636 || e === 10637 || e === 10638 || e === 10639 || e === 10640 || e === 10641 || e === 10642 || e === 10643 || e === 10644 || e === 10645 || e === 10646 || e === 10647 || e === 10648 || e >= 10649 && e <= 10711 || e === 10712 || e === 10713 || e === 10714 || e === 10715 || e >= 10716 && e <= 10747 || e === 10748 || e === 10749 || e >= 10750 && e <= 11007 || e >= 11008 && e <= 11055 || e >= 11056 && e <= 11076 || e >= 11077 && e <= 11078 || e >= 11079 && e <= 11084 || e >= 11085 && e <= 11123 || e >= 11124 && e <= 11125 || e >= 11126 && e <= 11157 || e === 11158 || e >= 11159 && e <= 11263 || e >= 11776 && e <= 11777 || e === 11778 || e === 11779 || e === 11780 || e === 11781 || e >= 11782 && e <= 11784 || e === 11785 || e === 11786 || e === 11787 || e === 11788 || e === 11789 || e >= 11790 && e <= 11798 || e === 11799 || e >= 11800 && e <= 11801 || e === 11802 || e === 11803 || e === 11804 || e === 11805 || e >= 11806 && e <= 11807 || e === 11808 || e === 11809 || e === 11810 || e === 11811 || e === 11812 || e === 11813 || e === 11814 || e === 11815 || e === 11816 || e === 11817 || e >= 11818 && e <= 11822 || e === 11823 || e >= 11824 && e <= 11833 || e >= 11834 && e <= 11835 || e >= 11836 && e <= 11839 || e === 11840 || e === 11841 || e === 11842 || e >= 11843 && e <= 11855 || e >= 11856 && e <= 11857 || e === 11858 || e >= 11859 && e <= 11903 || e >= 12289 && e <= 12291 || e === 12296 || e === 12297 || e === 12298 || e === 12299 || e === 12300 || e === 12301 || e === 12302 || e === 12303 || e === 12304 || e === 12305 || e >= 12306 && e <= 12307 || e === 12308 || e === 12309 || e === 12310 || e === 12311 || e === 12312 || e === 12313 || e === 12314 || e === 12315 || e === 12316 || e === 12317 || e >= 12318 && e <= 12319 || e === 12320 || e === 12336 || e === 64830 || e === 64831 || e >= 65093 && e <= 65094;
}
function Dn(e) {
  e.forEach(function(t) {
    if (delete t.location, Pi(t) || ji(t))
      for (var n in t.options)
        delete t.options[n].location, Dn(t.options[n].value);
    else
      zi(t) && Ki(t.style) || (Oi(t) || Ai(t)) && Cn(t.style) ? delete t.style.location : Li(t) && Dn(t.children);
  });
}
function o0(e, t) {
  t === void 0 && (t = {}), t = Y({ shouldParseSkeletons: !0, requiresOtherClause: !0 }, t);
  var n = new i0(e, t).parse();
  if (n.err) {
    var l = SyntaxError(v[n.err.kind]);
    throw l.location = n.err.location, l.originalMessage = n.err.message, l;
  }
  return t != null && t.captureLocation || Dn(n.val), n.val;
}
function Bn(e, t) {
  var n = t && t.cache ? t.cache : m0, l = t && t.serializer ? t.serializer : f0, i = t && t.strategy ? t.strategy : d0;
  return i(e, {
    cache: n,
    serializer: l
  });
}
function c0(e) {
  return e == null || typeof e == "number" || typeof e == "boolean";
}
function rr(e, t, n, l) {
  var i = c0(l) ? l : n(l), r = t.get(i);
  return typeof r > "u" && (r = e.call(this, l), t.set(i, r)), r;
}
function ar(e, t, n) {
  var l = Array.prototype.slice.call(arguments, 3), i = n(l), r = t.get(i);
  return typeof r > "u" && (r = e.apply(this, l), t.set(i, r)), r;
}
function Ln(e, t, n, l, i) {
  return n.bind(t, e, l, i);
}
function d0(e, t) {
  var n = e.length === 1 ? rr : ar;
  return Ln(e, this, n, t.cache.create(), t.serializer);
}
function u0(e, t) {
  return Ln(e, this, ar, t.cache.create(), t.serializer);
}
function h0(e, t) {
  return Ln(e, this, rr, t.cache.create(), t.serializer);
}
var f0 = function() {
  return JSON.stringify(arguments);
};
function Kn() {
  this.cache = /* @__PURE__ */ Object.create(null);
}
Kn.prototype.get = function(e) {
  return this.cache[e];
};
Kn.prototype.set = function(e, t) {
  this.cache[e] = t;
};
var m0 = {
  create: function() {
    return new Kn();
  }
}, Qn = {
  variadic: u0,
  monadic: h0
}, st;
(function(e) {
  e.MISSING_VALUE = "MISSING_VALUE", e.INVALID_VALUE = "INVALID_VALUE", e.MISSING_INTL_API = "MISSING_INTL_API";
})(st || (st = {}));
var Ot = (
  /** @class */
  function(e) {
    zt(t, e);
    function t(n, l, i) {
      var r = e.call(this, n) || this;
      return r.code = l, r.originalMessage = i, r;
    }
    return t.prototype.toString = function() {
      return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
    }, t;
  }(Error)
), Cl = (
  /** @class */
  function(e) {
    zt(t, e);
    function t(n, l, i, r) {
      return e.call(this, 'Invalid values for "'.concat(n, '": "').concat(l, '". Options are "').concat(Object.keys(i).join('", "'), '"'), st.INVALID_VALUE, r) || this;
    }
    return t;
  }(Ot)
), U0 = (
  /** @class */
  function(e) {
    zt(t, e);
    function t(n, l, i) {
      return e.call(this, 'Value for "'.concat(n, '" must be of type ').concat(l), st.INVALID_VALUE, i) || this;
    }
    return t;
  }(Ot)
), F0 = (
  /** @class */
  function(e) {
    zt(t, e);
    function t(n, l) {
      return e.call(this, 'The intl string context variable "'.concat(n, '" was not provided to the string "').concat(l, '"'), st.MISSING_VALUE, l) || this;
    }
    return t;
  }(Ot)
), te;
(function(e) {
  e[e.literal = 0] = "literal", e[e.object = 1] = "object";
})(te || (te = {}));
function b0(e) {
  return e.length < 2 ? e : e.reduce(function(t, n) {
    var l = t[t.length - 1];
    return !l || l.type !== te.literal || n.type !== te.literal ? t.push(n) : l.value += n.value, t;
  }, []);
}
function V0(e) {
  return typeof e == "function";
}
function wt(e, t, n, l, i, r, a) {
  if (e.length === 1 && Xl(e[0]))
    return [
      {
        type: te.literal,
        value: e[0].value
      }
    ];
  for (var s = [], o = 0, c = e; o < c.length; o++) {
    var d = c[o];
    if (Xl(d)) {
      s.push({
        type: te.literal,
        value: d.value
      });
      continue;
    }
    if (ko(d)) {
      typeof r == "number" && s.push({
        type: te.literal,
        value: n.getNumberFormat(t).format(r)
      });
      continue;
    }
    var u = d.value;
    if (!(i && u in i))
      throw new F0(u, a);
    var h = i[u];
    if (Eo(d)) {
      (!h || typeof h == "string" || typeof h == "number") && (h = typeof h == "string" || typeof h == "number" ? String(h) : ""), s.push({
        type: typeof h == "string" ? te.literal : te.object,
        value: h
      });
      continue;
    }
    if (Oi(d)) {
      var f = typeof d.style == "string" ? l.date[d.style] : Cn(d.style) ? d.style.parsedOptions : void 0;
      s.push({
        type: te.literal,
        value: n.getDateTimeFormat(t, f).format(h)
      });
      continue;
    }
    if (Ai(d)) {
      var f = typeof d.style == "string" ? l.time[d.style] : Cn(d.style) ? d.style.parsedOptions : l.time.medium;
      s.push({
        type: te.literal,
        value: n.getDateTimeFormat(t, f).format(h)
      });
      continue;
    }
    if (zi(d)) {
      var f = typeof d.style == "string" ? l.number[d.style] : Ki(d.style) ? d.style.parsedOptions : void 0;
      f && f.scale && (h = h * (f.scale || 1)), s.push({
        type: te.literal,
        value: n.getNumberFormat(t, f).format(h)
      });
      continue;
    }
    if (Li(d)) {
      var V = d.children, U = d.value, m = i[U];
      if (!V0(m))
        throw new U0(U, "function", a);
      var b = wt(V, t, n, l, i, r), _ = m(b.map(function(Z) {
        return Z.value;
      }));
      Array.isArray(_) || (_ = [_]), s.push.apply(s, _.map(function(Z) {
        return {
          type: typeof Z == "string" ? te.literal : te.object,
          value: Z
        };
      }));
    }
    if (Pi(d)) {
      var p = d.options[h] || d.options.other;
      if (!p)
        throw new Cl(d.value, h, Object.keys(d.options), a);
      s.push.apply(s, wt(p.value, t, n, l, i));
      continue;
    }
    if (ji(d)) {
      var p = d.options["=".concat(h)];
      if (!p) {
        if (!Intl.PluralRules)
          throw new Ot(`Intl.PluralRules is not available in this environment.
Try polyfilling it using "@formatjs/intl-pluralrules"
`, st.MISSING_INTL_API, a);
        var B = n.getPluralRules(t, { type: d.pluralType }).select(h - (d.offset || 0));
        p = d.options[B] || d.options.other;
      }
      if (!p)
        throw new Cl(d.value, h, Object.keys(d.options), a);
      s.push.apply(s, wt(p.value, t, n, l, i, h - (d.offset || 0)));
      continue;
    }
  }
  return b0(s);
}
function p0(e, t) {
  return t ? Y(Y(Y({}, e || {}), t || {}), Object.keys(e).reduce(function(n, l) {
    return n[l] = Y(Y({}, e[l]), t[l] || {}), n;
  }, {})) : e;
}
function Z0(e, t) {
  return t ? Object.keys(e).reduce(function(n, l) {
    return n[l] = p0(e[l], t[l]), n;
  }, Y({}, e)) : e;
}
function Rn(e) {
  return {
    create: function() {
      return {
        get: function(t) {
          return e[t];
        },
        set: function(t, n) {
          e[t] = n;
        }
      };
    }
  };
}
function B0(e) {
  return e === void 0 && (e = {
    number: {},
    dateTime: {},
    pluralRules: {}
  }), {
    getNumberFormat: Bn(function() {
      for (var t, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((t = Intl.NumberFormat).bind.apply(t, pn([void 0], n, !1)))();
    }, {
      cache: Rn(e.number),
      strategy: Qn.variadic
    }),
    getDateTimeFormat: Bn(function() {
      for (var t, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((t = Intl.DateTimeFormat).bind.apply(t, pn([void 0], n, !1)))();
    }, {
      cache: Rn(e.dateTime),
      strategy: Qn.variadic
    }),
    getPluralRules: Bn(function() {
      for (var t, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((t = Intl.PluralRules).bind.apply(t, pn([void 0], n, !1)))();
    }, {
      cache: Rn(e.pluralRules),
      strategy: Qn.variadic
    })
  };
}
var Q0 = (
  /** @class */
  function() {
    function e(t, n, l, i) {
      var r = this;
      if (n === void 0 && (n = e.defaultLocale), this.formatterCache = {
        number: {},
        dateTime: {},
        pluralRules: {}
      }, this.format = function(a) {
        var s = r.formatToParts(a);
        if (s.length === 1)
          return s[0].value;
        var o = s.reduce(function(c, d) {
          return !c.length || d.type !== te.literal || typeof c[c.length - 1] != "string" ? c.push(d.value) : c[c.length - 1] += d.value, c;
        }, []);
        return o.length <= 1 ? o[0] || "" : o;
      }, this.formatToParts = function(a) {
        return wt(r.ast, r.locales, r.formatters, r.formats, a, void 0, r.message);
      }, this.resolvedOptions = function() {
        return {
          locale: r.resolvedLocale.toString()
        };
      }, this.getAst = function() {
        return r.ast;
      }, this.locales = n, this.resolvedLocale = e.resolveLocale(n), typeof t == "string") {
        if (this.message = t, !e.__parse)
          throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");
        this.ast = e.__parse(t, {
          ignoreTag: i == null ? void 0 : i.ignoreTag,
          locale: this.resolvedLocale
        });
      } else
        this.ast = t;
      if (!Array.isArray(this.ast))
        throw new TypeError("A message must be provided as a String or AST.");
      this.formats = Z0(e.formats, l), this.formatters = i && i.formatters || B0(this.formatterCache);
    }
    return Object.defineProperty(e, "defaultLocale", {
      get: function() {
        return e.memoizedDefaultLocale || (e.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale), e.memoizedDefaultLocale;
      },
      enumerable: !1,
      configurable: !0
    }), e.memoizedDefaultLocale = null, e.resolveLocale = function(t) {
      var n = Intl.NumberFormat.supportedLocalesOf(t);
      return n.length > 0 ? new Intl.Locale(n[0]) : new Intl.Locale(typeof t == "string" ? t : t[0]);
    }, e.__parse = o0, e.formats = {
      number: {
        integer: {
          maximumFractionDigits: 0
        },
        currency: {
          style: "currency"
        },
        percent: {
          style: "percent"
        }
      },
      date: {
        short: {
          month: "numeric",
          day: "numeric",
          year: "2-digit"
        },
        medium: {
          month: "short",
          day: "numeric",
          year: "numeric"
        },
        long: {
          month: "long",
          day: "numeric",
          year: "numeric"
        },
        full: {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }
      },
      time: {
        short: {
          hour: "numeric",
          minute: "numeric"
        },
        medium: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        },
        long: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZoneName: "short"
        },
        full: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZoneName: "short"
        }
      }
    }, e;
  }()
);
function R0(e, t) {
  if (t == null)
    return;
  if (t in e)
    return e[t];
  const n = t.split(".");
  let l = e;
  for (let i = 0; i < n.length; i++)
    if (typeof l == "object") {
      if (i > 0) {
        const r = n.slice(i, n.length).join(".");
        if (r in l) {
          l = l[r];
          break;
        }
      }
      l = l[n[i]];
    } else
      l = void 0;
  return l;
}
const we = {}, W0 = (e, t, n) => n && (t in we || (we[t] = {}), e in we[t] || (we[t][e] = n), n), sr = (e, t) => {
  if (t == null)
    return;
  if (t in we && e in we[t])
    return we[t][e];
  const n = At(t);
  for (let l = 0; l < n.length; l++) {
    const i = n[l], r = g0(i, e);
    if (r)
      return W0(e, t, r);
  }
};
let qn;
const _t = Wt({});
function _0(e) {
  return qn[e] || null;
}
function or(e) {
  return e in qn;
}
function g0(e, t) {
  if (!or(e))
    return null;
  const n = _0(e);
  return R0(n, t);
}
function y0(e) {
  if (e == null)
    return;
  const t = At(e);
  for (let n = 0; n < t.length; n++) {
    const l = t[n];
    if (or(l))
      return l;
  }
}
function J0(e, ...t) {
  delete we[e], _t.update((n) => (n[e] = Xo.all([n[e] || {}, ...t]), n));
}
ft(
  [_t],
  ([e]) => Object.keys(e)
);
_t.subscribe((e) => qn = e);
const It = {};
function N0(e, t) {
  It[e].delete(t), It[e].size === 0 && delete It[e];
}
function cr(e) {
  return It[e];
}
function S0(e) {
  return At(e).map((t) => {
    const n = cr(t);
    return [t, n ? [...n] : []];
  }).filter(([, t]) => t.length > 0);
}
function zn(e) {
  return e == null ? !1 : At(e).some(
    (t) => {
      var n;
      return (n = cr(t)) == null ? void 0 : n.size;
    }
  );
}
function G0(e, t) {
  return Promise.all(
    t.map((l) => (N0(e, l), l().then((i) => i.default || i)))
  ).then((l) => J0(e, ...l));
}
const Vt = {};
function dr(e) {
  if (!zn(e))
    return e in Vt ? Vt[e] : Promise.resolve();
  const t = S0(e);
  return Vt[e] = Promise.all(
    t.map(
      ([n, l]) => G0(n, l)
    )
  ).then(() => {
    if (zn(e))
      return dr(e);
    delete Vt[e];
  }), Vt[e];
}
const X0 = {
  number: {
    scientific: { notation: "scientific" },
    engineering: { notation: "engineering" },
    compactLong: { notation: "compact", compactDisplay: "long" },
    compactShort: { notation: "compact", compactDisplay: "short" }
  },
  date: {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  },
  time: {
    short: { hour: "numeric", minute: "numeric" },
    medium: { hour: "numeric", minute: "numeric", second: "numeric" },
    long: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short"
    },
    full: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short"
    }
  }
}, E0 = {
  fallbackLocale: null,
  loadingDelay: 200,
  formats: X0,
  warnOnMissingMessages: !0,
  handleMissingMessage: void 0,
  ignoreTag: !0
}, k0 = E0;
function ot() {
  return k0;
}
const Wn = Wt(!1);
var v0 = Object.defineProperty, T0 = Object.defineProperties, w0 = Object.getOwnPropertyDescriptors, Hl = Object.getOwnPropertySymbols, I0 = Object.prototype.hasOwnProperty, C0 = Object.prototype.propertyIsEnumerable, Yl = (e, t, n) => t in e ? v0(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, H0 = (e, t) => {
  for (var n in t || (t = {}))
    I0.call(t, n) && Yl(e, n, t[n]);
  if (Hl)
    for (var n of Hl(t))
      C0.call(t, n) && Yl(e, n, t[n]);
  return e;
}, Y0 = (e, t) => T0(e, w0(t));
let On;
const Ht = Wt(null);
function xl(e) {
  return e.split("-").map((t, n, l) => l.slice(0, n + 1).join("-")).reverse();
}
function At(e, t = ot().fallbackLocale) {
  const n = xl(e);
  return t ? [.../* @__PURE__ */ new Set([...n, ...xl(t)])] : n;
}
function Le() {
  return On ?? void 0;
}
Ht.subscribe((e) => {
  On = e ?? void 0, typeof window < "u" && e != null && document.documentElement.setAttribute("lang", e);
});
const x0 = (e) => {
  if (e && y0(e) && zn(e)) {
    const { loadingDelay: t } = ot();
    let n;
    return typeof window < "u" && Le() != null && t ? n = window.setTimeout(
      () => Wn.set(!0),
      t
    ) : Wn.set(!0), dr(e).then(() => {
      Ht.set(e);
    }).finally(() => {
      clearTimeout(n), Wn.set(!1);
    });
  }
  return Ht.set(e);
}, gt = Y0(H0({}, Ht), {
  set: x0
}), Pt = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (l) => {
    const i = JSON.stringify(l);
    return i in t ? t[i] : t[i] = e(l);
  };
};
var M0 = Object.defineProperty, Yt = Object.getOwnPropertySymbols, ur = Object.prototype.hasOwnProperty, hr = Object.prototype.propertyIsEnumerable, Ml = (e, t, n) => t in e ? M0(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, $n = (e, t) => {
  for (var n in t || (t = {}))
    ur.call(t, n) && Ml(e, n, t[n]);
  if (Yt)
    for (var n of Yt(t))
      hr.call(t, n) && Ml(e, n, t[n]);
  return e;
}, mt = (e, t) => {
  var n = {};
  for (var l in e)
    ur.call(e, l) && t.indexOf(l) < 0 && (n[l] = e[l]);
  if (e != null && Yt)
    for (var l of Yt(e))
      t.indexOf(l) < 0 && hr.call(e, l) && (n[l] = e[l]);
  return n;
};
const Qt = (e, t) => {
  const { formats: n } = ot();
  if (e in n && t in n[e])
    return n[e][t];
  throw new Error(`[svelte-i18n] Unknown "${t}" ${e} format.`);
}, D0 = Pt(
  (e) => {
    var t = e, { locale: n, format: l } = t, i = mt(t, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
    return l && (i = Qt("number", l)), new Intl.NumberFormat(n, i);
  }
), z0 = Pt(
  (e) => {
    var t = e, { locale: n, format: l } = t, i = mt(t, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format dates');
    return l ? i = Qt("date", l) : Object.keys(i).length === 0 && (i = Qt("date", "short")), new Intl.DateTimeFormat(n, i);
  }
), O0 = Pt(
  (e) => {
    var t = e, { locale: n, format: l } = t, i = mt(t, ["locale", "format"]);
    if (n == null)
      throw new Error(
        '[svelte-i18n] A "locale" must be set to format time values'
      );
    return l ? i = Qt("time", l) : Object.keys(i).length === 0 && (i = Qt("time", "short")), new Intl.DateTimeFormat(n, i);
  }
), A0 = (e = {}) => {
  var t = e, {
    locale: n = Le()
  } = t, l = mt(t, [
    "locale"
  ]);
  return D0($n({ locale: n }, l));
}, P0 = (e = {}) => {
  var t = e, {
    locale: n = Le()
  } = t, l = mt(t, [
    "locale"
  ]);
  return z0($n({ locale: n }, l));
}, j0 = (e = {}) => {
  var t = e, {
    locale: n = Le()
  } = t, l = mt(t, [
    "locale"
  ]);
  return O0($n({ locale: n }, l));
}, L0 = Pt(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (e, t = Le()) => new Q0(e, t, ot().formats, {
    ignoreTag: ot().ignoreTag
  })
), K0 = (e, t = {}) => {
  var n, l, i, r;
  let a = t;
  typeof e == "object" && (a = e, e = a.id);
  const {
    values: s,
    locale: o = Le(),
    default: c
  } = a;
  if (o == null)
    throw new Error(
      "[svelte-i18n] Cannot format a message without first setting the initial locale."
    );
  let d = sr(e, o);
  if (!d)
    d = (r = (i = (l = (n = ot()).handleMissingMessage) == null ? void 0 : l.call(n, { locale: o, id: e, defaultValue: c })) != null ? i : c) != null ? r : e;
  else if (typeof d != "string")
    return console.warn(
      `[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof d}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`
    ), d;
  if (!s)
    return d;
  let u = d;
  try {
    u = L0(d, o).format(s);
  } catch (h) {
    h instanceof Error && console.warn(
      `[svelte-i18n] Message "${e}" has syntax error:`,
      h.message
    );
  }
  return u;
}, q0 = (e, t) => j0(t).format(e), $0 = (e, t) => P0(t).format(e), ec = (e, t) => A0(t).format(e), tc = (e, t = Le()) => sr(e, t);
ft([gt, _t], () => K0);
ft([gt], () => q0);
ft([gt], () => $0);
ft([gt], () => ec);
ft([gt, _t], () => tc);
const {
  SvelteComponent: nc,
  append: Dl,
  attr: ge,
  binding_callbacks: lc,
  bubble: He,
  create_slot: ic,
  detach: rc,
  element: zl,
  get_all_dirty_from_scope: ac,
  get_slot_changes: sc,
  init: oc,
  insert: cc,
  listen: de,
  prevent_default: Ye,
  run_all: dc,
  safe_not_equal: uc,
  set_style: Ol,
  space: hc,
  stop_propagation: xe,
  toggle_class: ve,
  transition_in: fc,
  transition_out: mc,
  update_slot_base: Uc
} = window.__gradio__svelte__internal, { createEventDispatcher: Fc, tick: bc, getContext: Vc } = window.__gradio__svelte__internal;
function pc(e) {
  let t, n, l, i, r, a, s, o, c;
  const d = (
    /*#slots*/
    e[17].default
  ), u = ic(
    d,
    e,
    /*$$scope*/
    e[16],
    null
  );
  return {
    c() {
      t = zl("button"), u && u.c(), n = hc(), l = zl("input"), ge(l, "type", "file"), ge(
        l,
        "accept",
        /*filetype*/
        e[0]
      ), l.multiple = i = /*file_count*/
      e[4] === "multiple" || void 0, ge(l, "webkitdirectory", r = /*file_count*/
      e[4] === "directory" || void 0), ge(l, "mozdirectory", a = /*file_count*/
      e[4] === "directory" || void 0), ge(l, "class", "svelte-a356bc"), ge(t, "class", "svelte-a356bc"), ve(
        t,
        "hidden",
        /*hidden*/
        e[5]
      ), ve(
        t,
        "center",
        /*center*/
        e[2]
      ), ve(
        t,
        "boundedheight",
        /*boundedheight*/
        e[1]
      ), ve(
        t,
        "flex",
        /*flex*/
        e[3]
      ), Ol(
        t,
        "height",
        /*include_sources*/
        e[6] ? "calc(100% - 40px" : "100%"
      );
    },
    m(h, f) {
      cc(h, t, f), u && u.m(t, null), Dl(t, n), Dl(t, l), e[25](l), s = !0, o || (c = [
        de(
          l,
          "change",
          /*load_files_from_upload*/
          e[10]
        ),
        de(t, "drag", xe(Ye(
          /*drag_handler*/
          e[18]
        ))),
        de(t, "dragstart", xe(Ye(
          /*dragstart_handler*/
          e[19]
        ))),
        de(t, "dragend", xe(Ye(
          /*dragend_handler*/
          e[20]
        ))),
        de(t, "dragover", xe(Ye(
          /*dragover_handler*/
          e[21]
        ))),
        de(t, "dragenter", xe(Ye(
          /*dragenter_handler*/
          e[22]
        ))),
        de(t, "dragleave", xe(Ye(
          /*dragleave_handler*/
          e[23]
        ))),
        de(t, "drop", xe(Ye(
          /*drop_handler*/
          e[24]
        ))),
        de(
          t,
          "click",
          /*open_file_upload*/
          e[7]
        ),
        de(
          t,
          "drop",
          /*loadFilesFromDrop*/
          e[11]
        ),
        de(
          t,
          "dragenter",
          /*updateDragging*/
          e[9]
        ),
        de(
          t,
          "dragleave",
          /*updateDragging*/
          e[9]
        )
      ], o = !0);
    },
    p(h, [f]) {
      u && u.p && (!s || f & /*$$scope*/
      65536) && Uc(
        u,
        d,
        h,
        /*$$scope*/
        h[16],
        s ? sc(
          d,
          /*$$scope*/
          h[16],
          f,
          null
        ) : ac(
          /*$$scope*/
          h[16]
        ),
        null
      ), (!s || f & /*filetype*/
      1) && ge(
        l,
        "accept",
        /*filetype*/
        h[0]
      ), (!s || f & /*file_count*/
      16 && i !== (i = /*file_count*/
      h[4] === "multiple" || void 0)) && (l.multiple = i), (!s || f & /*file_count*/
      16 && r !== (r = /*file_count*/
      h[4] === "directory" || void 0)) && ge(l, "webkitdirectory", r), (!s || f & /*file_count*/
      16 && a !== (a = /*file_count*/
      h[4] === "directory" || void 0)) && ge(l, "mozdirectory", a), (!s || f & /*hidden*/
      32) && ve(
        t,
        "hidden",
        /*hidden*/
        h[5]
      ), (!s || f & /*center*/
      4) && ve(
        t,
        "center",
        /*center*/
        h[2]
      ), (!s || f & /*boundedheight*/
      2) && ve(
        t,
        "boundedheight",
        /*boundedheight*/
        h[1]
      ), (!s || f & /*flex*/
      8) && ve(
        t,
        "flex",
        /*flex*/
        h[3]
      ), f & /*include_sources*/
      64 && Ol(
        t,
        "height",
        /*include_sources*/
        h[6] ? "calc(100% - 40px" : "100%"
      );
    },
    i(h) {
      s || (fc(u, h), s = !0);
    },
    o(h) {
      mc(u, h), s = !1;
    },
    d(h) {
      h && rc(t), u && u.d(h), e[25](null), o = !1, dc(c);
    }
  };
}
function _n(e) {
  let t, n = e[0], l = 1;
  for (; l < e.length; ) {
    const i = e[l], r = e[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (t = n, n = r(n)) : (i === "call" || i === "optionalCall") && (n = r((...a) => n.call(t, ...a)), t = void 0);
  }
  return n;
}
function Zc(e, t) {
  return !e || e === "*" ? !0 : e.endsWith("/*") ? t.startsWith(e.slice(0, -1)) : e === t;
}
function Bc(e, t, n) {
  let { $$slots: l = {}, $$scope: i } = t, { filetype: r = null } = t, { dragging: a = !1 } = t, { boundedheight: s = !0 } = t, { center: o = !0 } = t, { flex: c = !0 } = t, { file_count: d = "single" } = t, { disable_click: u = !1 } = t, { root: h } = t, { hidden: f = !1 } = t, { include_sources: V = !1 } = t;
  const U = Vc("upload_files");
  let m;
  const b = Fc();
  function _() {
    n(12, a = !a);
  }
  function p() {
    u || (n(8, m.value = "", m), m.click());
  }
  async function B(Q) {
    await bc();
    const R = await Xr(Q, h, U);
    return b("load", d === "single" ? _n([R, "optionalAccess", (I) => I[0]]) : R), R || [];
  }
  async function Z(Q) {
    if (!Q.length)
      return;
    let R = Q.map((N) => new File([N], N.name)), I = await Er(R);
    return await B(I);
  }
  async function J(Q) {
    const R = Q.target;
    R.files && await Z(Array.from(R.files));
  }
  async function w(Q) {
    if (n(12, a = !1), !_n([Q, "access", (I) => I.dataTransfer, "optionalAccess", (I) => I.files]))
      return;
    const R = Array.from(Q.dataTransfer.files).filter((I) => _n([
      r,
      "optionalAccess",
      (N) => N.split,
      "call",
      (N) => N(","),
      "access",
      (N) => N.some,
      "call",
      (N) => N((k) => Zc(k, I.type))
    ]) ? !0 : (b("error", `Invalid file type only ${r} allowed.`), !1));
    await Z(R);
  }
  function x(Q) {
    He.call(this, e, Q);
  }
  function D(Q) {
    He.call(this, e, Q);
  }
  function g(Q) {
    He.call(this, e, Q);
  }
  function ie(Q) {
    He.call(this, e, Q);
  }
  function E(Q) {
    He.call(this, e, Q);
  }
  function H(Q) {
    He.call(this, e, Q);
  }
  function F(Q) {
    He.call(this, e, Q);
  }
  function y(Q) {
    lc[Q ? "unshift" : "push"](() => {
      m = Q, n(8, m);
    });
  }
  return e.$$set = (Q) => {
    "filetype" in Q && n(0, r = Q.filetype), "dragging" in Q && n(12, a = Q.dragging), "boundedheight" in Q && n(1, s = Q.boundedheight), "center" in Q && n(2, o = Q.center), "flex" in Q && n(3, c = Q.flex), "file_count" in Q && n(4, d = Q.file_count), "disable_click" in Q && n(13, u = Q.disable_click), "root" in Q && n(14, h = Q.root), "hidden" in Q && n(5, f = Q.hidden), "include_sources" in Q && n(6, V = Q.include_sources), "$$scope" in Q && n(16, i = Q.$$scope);
  }, [
    r,
    s,
    o,
    c,
    d,
    f,
    V,
    p,
    m,
    _,
    J,
    w,
    a,
    u,
    h,
    Z,
    i,
    l,
    x,
    D,
    g,
    ie,
    E,
    H,
    F,
    y
  ];
}
class Qc extends nc {
  constructor(t) {
    super(), oc(this, t, Bc, pc, uc, {
      filetype: 0,
      dragging: 12,
      boundedheight: 1,
      center: 2,
      flex: 3,
      file_count: 4,
      disable_click: 13,
      root: 14,
      hidden: 5,
      include_sources: 6,
      open_file_upload: 7,
      load_files: 15
    });
  }
  get open_file_upload() {
    return this.$$.ctx[7];
  }
  get load_files() {
    return this.$$.ctx[15];
  }
}
const {
  SvelteComponent: Rc,
  append: Al,
  attr: Wc,
  check_outros: Pl,
  create_component: el,
  destroy_component: tl,
  detach: _c,
  element: gc,
  group_outros: jl,
  init: yc,
  insert: Jc,
  mount_component: nl,
  safe_not_equal: Nc,
  set_style: Ll,
  space: Kl,
  toggle_class: ql,
  transition_in: ye,
  transition_out: De
} = window.__gradio__svelte__internal, { createEventDispatcher: Sc } = window.__gradio__svelte__internal;
function $l(e) {
  let t, n;
  return t = new Dt({
    props: {
      Icon: Fs,
      label: (
        /*i18n*/
        e[3]("common.edit")
      )
    }
  }), t.$on(
    "click",
    /*click_handler*/
    e[5]
  ), {
    c() {
      el(t.$$.fragment);
    },
    m(l, i) {
      nl(t, l, i), n = !0;
    },
    p(l, i) {
      const r = {};
      i & /*i18n*/
      8 && (r.label = /*i18n*/
      l[3]("common.edit")), t.$set(r);
    },
    i(l) {
      n || (ye(t.$$.fragment, l), n = !0);
    },
    o(l) {
      De(t.$$.fragment, l), n = !1;
    },
    d(l) {
      tl(t, l);
    }
  };
}
function ei(e) {
  let t, n;
  return t = new Dt({
    props: {
      Icon: Ns,
      label: (
        /*i18n*/
        e[3]("common.undo")
      )
    }
  }), t.$on(
    "click",
    /*click_handler_1*/
    e[6]
  ), {
    c() {
      el(t.$$.fragment);
    },
    m(l, i) {
      nl(t, l, i), n = !0;
    },
    p(l, i) {
      const r = {};
      i & /*i18n*/
      8 && (r.label = /*i18n*/
      l[3]("common.undo")), t.$set(r);
    },
    i(l) {
      n || (ye(t.$$.fragment, l), n = !0);
    },
    o(l) {
      De(t.$$.fragment, l), n = !1;
    },
    d(l) {
      tl(t, l);
    }
  };
}
function Gc(e) {
  let t, n, l, i, r, a = (
    /*editable*/
    e[0] && $l(e)
  ), s = (
    /*undoable*/
    e[1] && ei(e)
  );
  return i = new Dt({
    props: {
      Icon: es,
      label: (
        /*i18n*/
        e[3]("common.clear")
      )
    }
  }), i.$on(
    "click",
    /*click_handler_2*/
    e[7]
  ), {
    c() {
      t = gc("div"), a && a.c(), n = Kl(), s && s.c(), l = Kl(), el(i.$$.fragment), Wc(t, "class", "svelte-1wj0ocy"), ql(t, "not-absolute", !/*absolute*/
      e[2]), Ll(
        t,
        "position",
        /*absolute*/
        e[2] ? "absolute" : "static"
      );
    },
    m(o, c) {
      Jc(o, t, c), a && a.m(t, null), Al(t, n), s && s.m(t, null), Al(t, l), nl(i, t, null), r = !0;
    },
    p(o, [c]) {
      /*editable*/
      o[0] ? a ? (a.p(o, c), c & /*editable*/
      1 && ye(a, 1)) : (a = $l(o), a.c(), ye(a, 1), a.m(t, n)) : a && (jl(), De(a, 1, 1, () => {
        a = null;
      }), Pl()), /*undoable*/
      o[1] ? s ? (s.p(o, c), c & /*undoable*/
      2 && ye(s, 1)) : (s = ei(o), s.c(), ye(s, 1), s.m(t, l)) : s && (jl(), De(s, 1, 1, () => {
        s = null;
      }), Pl());
      const d = {};
      c & /*i18n*/
      8 && (d.label = /*i18n*/
      o[3]("common.clear")), i.$set(d), (!r || c & /*absolute*/
      4) && ql(t, "not-absolute", !/*absolute*/
      o[2]), c & /*absolute*/
      4 && Ll(
        t,
        "position",
        /*absolute*/
        o[2] ? "absolute" : "static"
      );
    },
    i(o) {
      r || (ye(a), ye(s), ye(i.$$.fragment, o), r = !0);
    },
    o(o) {
      De(a), De(s), De(i.$$.fragment, o), r = !1;
    },
    d(o) {
      o && _c(t), a && a.d(), s && s.d(), tl(i);
    }
  };
}
function Xc(e, t, n) {
  let { editable: l = !1 } = t, { undoable: i = !1 } = t, { absolute: r = !0 } = t, { i18n: a } = t;
  const s = Sc(), o = () => s("edit"), c = () => s("undo"), d = (u) => {
    s("clear"), u.stopPropagation();
  };
  return e.$$set = (u) => {
    "editable" in u && n(0, l = u.editable), "undoable" in u && n(1, i = u.undoable), "absolute" in u && n(2, r = u.absolute), "i18n" in u && n(3, a = u.i18n);
  }, [
    l,
    i,
    r,
    a,
    s,
    o,
    c,
    d
  ];
}
class Ec extends Rc {
  constructor(t) {
    super(), yc(this, t, Xc, Gc, Nc, {
      editable: 0,
      undoable: 1,
      absolute: 2,
      i18n: 3
    });
  }
}
const {
  SvelteComponent: kc,
  add_flush_callback: vc,
  append: ti,
  attr: ni,
  bind: Tc,
  binding_callbacks: fr,
  check_outros: wc,
  create_component: ll,
  create_slot: Ic,
  destroy_component: il,
  detach: An,
  element: li,
  empty: Cc,
  get_all_dirty_from_scope: Hc,
  get_slot_changes: Yc,
  group_outros: xc,
  init: Mc,
  insert: Pn,
  mount_component: rl,
  safe_not_equal: Dc,
  space: mr,
  transition_in: lt,
  transition_out: it,
  update_slot_base: zc
} = window.__gradio__svelte__internal, { createEventDispatcher: Oc, tick: ii, onMount: Ac } = window.__gradio__svelte__internal;
function Pc(e) {
  let t, n, l, i, r;
  return n = new Ec({
    props: { i18n: (
      /*i18n*/
      e[4]
    ), absolute: !0 }
  }), n.$on(
    "clear",
    /*handle_clear*/
    e[8]
  ), {
    c() {
      t = li("div"), ll(n.$$.fragment), l = mr(), i = li("canvas"), ni(i, "class", "svelte-pxj656"), ni(t, "class", "input-model svelte-pxj656");
    },
    m(a, s) {
      Pn(a, t, s), rl(n, t, null), ti(t, l), ti(t, i), e[15](i), r = !0;
    },
    p(a, s) {
      const o = {};
      s & /*i18n*/
      16 && (o.i18n = /*i18n*/
      a[4]), n.$set(o);
    },
    i(a) {
      r || (lt(n.$$.fragment, a), r = !0);
    },
    o(a) {
      it(n.$$.fragment, a), r = !1;
    },
    d(a) {
      a && An(t), il(n), e[15](null);
    }
  };
}
function jc(e) {
  let t, n, l;
  function i(a) {
    e[14](a);
  }
  let r = {
    root: (
      /*root*/
      e[3]
    ),
    filetype: ".ply, .splat",
    $$slots: { default: [Lc] },
    $$scope: { ctx: e }
  };
  return (
    /*dragging*/
    e[6] !== void 0 && (r.dragging = /*dragging*/
    e[6]), t = new Qc({ props: r }), fr.push(() => Tc(t, "dragging", i)), t.$on(
      "load",
      /*handle_upload*/
      e[7]
    ), {
      c() {
        ll(t.$$.fragment);
      },
      m(a, s) {
        rl(t, a, s), l = !0;
      },
      p(a, s) {
        const o = {};
        s & /*root*/
        8 && (o.root = /*root*/
        a[3]), s & /*$$scope*/
        65536 && (o.$$scope = { dirty: s, ctx: a }), !n && s & /*dragging*/
        64 && (n = !0, o.dragging = /*dragging*/
        a[6], vc(() => n = !1)), t.$set(o);
      },
      i(a) {
        l || (lt(t.$$.fragment, a), l = !0);
      },
      o(a) {
        it(t.$$.fragment, a), l = !1;
      },
      d(a) {
        il(t, a);
      }
    }
  );
}
function Lc(e) {
  let t;
  const n = (
    /*#slots*/
    e[13].default
  ), l = Ic(
    n,
    e,
    /*$$scope*/
    e[16],
    null
  );
  return {
    c() {
      l && l.c();
    },
    m(i, r) {
      l && l.m(i, r), t = !0;
    },
    p(i, r) {
      l && l.p && (!t || r & /*$$scope*/
      65536) && zc(
        l,
        n,
        i,
        /*$$scope*/
        i[16],
        t ? Yc(
          n,
          /*$$scope*/
          i[16],
          r,
          null
        ) : Hc(
          /*$$scope*/
          i[16]
        ),
        null
      );
    },
    i(i) {
      t || (lt(l, i), t = !0);
    },
    o(i) {
      it(l, i), t = !1;
    },
    d(i) {
      l && l.d(i);
    }
  };
}
function Kc(e) {
  let t, n, l, i, r, a;
  t = new Mt({
    props: {
      show_label: (
        /*show_label*/
        e[2]
      ),
      Icon: Rt,
      label: (
        /*label*/
        e[1] || "Splat"
      )
    }
  });
  const s = [jc, Pc], o = [];
  function c(d, u) {
    return (
      /*value*/
      d[0] === null ? 0 : 1
    );
  }
  return l = c(e), i = o[l] = s[l](e), {
    c() {
      ll(t.$$.fragment), n = mr(), i.c(), r = Cc();
    },
    m(d, u) {
      rl(t, d, u), Pn(d, n, u), o[l].m(d, u), Pn(d, r, u), a = !0;
    },
    p(d, [u]) {
      const h = {};
      u & /*show_label*/
      4 && (h.show_label = /*show_label*/
      d[2]), u & /*label*/
      2 && (h.label = /*label*/
      d[1] || "Splat"), t.$set(h);
      let f = l;
      l = c(d), l === f ? o[l].p(d, u) : (xc(), it(o[f], 1, 1, () => {
        o[f] = null;
      }), wc(), i = o[l], i ? i.p(d, u) : (i = o[l] = s[l](d), i.c()), lt(i, 1), i.m(r.parentNode, r));
    },
    i(d) {
      a || (lt(t.$$.fragment, d), lt(i), a = !0);
    },
    o(d) {
      it(t.$$.fragment, d), it(i), a = !1;
    },
    d(d) {
      d && (An(n), An(r)), il(t, d), o[l].d(d);
    }
  };
}
function qc(e, t, n) {
  let l, { $$slots: i = {}, $$scope: r } = t, { value: a } = t, { label: s = "" } = t, { show_label: o } = t, { root: c } = t, { i18n: d } = t, { zoom_speed: u = 1 } = t, { pan_speed: h = 1 } = t, f = !1, V, U, m, b = null, _, p = !1, B = !1;
  function Z() {
    if (b && b.dispose(), b = new vi(V), _ = new Ti(m, V), _.zoomSpeed = u, _.panSpeed = h, !a)
      return;
    const E = async () => {
      if (p) {
        console.error("Already loading");
        return;
      }
      p = !0, await ki.LoadAsync(a.url, U, (F) => {
      }), p = !1;
    }, H = () => {
      if (B) {
        if (p) {
          requestAnimationFrame(H);
          return;
        }
        _.update(), b.render(U, m), requestAnimationFrame(H);
      }
    };
    E(), B = !0, requestAnimationFrame(H);
  }
  Ac(() => {
    U = new Ei(), m = new Xi(), n(11, f = !0);
  });
  async function J({ detail: E }) {
    n(0, a = E), await ii(), Z(), x("change", a);
  }
  async function w() {
    n(0, a = null), b && (b.dispose(), b = null), p = !1, B = !1, await ii(), x("clear");
  }
  const x = Oc();
  let D = !1;
  function g(E) {
    D = E, n(6, D);
  }
  function ie(E) {
    fr[E ? "unshift" : "push"](() => {
      V = E, n(5, V);
    });
  }
  return e.$$set = (E) => {
    "value" in E && n(0, a = E.value), "label" in E && n(1, s = E.label), "show_label" in E && n(2, o = E.show_label), "root" in E && n(3, c = E.root), "i18n" in E && n(4, d = E.i18n), "zoom_speed" in E && n(9, u = E.zoom_speed), "pan_speed" in E && n(10, h = E.pan_speed), "$$scope" in E && n(16, r = E.$$scope);
  }, e.$$.update = () => {
    e.$$.dirty & /*value*/
    1 && n(12, { path: l } = a || { path: void 0 }, l), e.$$.dirty & /*canvas, mounted, path*/
    6176, e.$$.dirty & /*dragging*/
    64 && x("drag", D);
  }, [
    a,
    s,
    o,
    c,
    d,
    V,
    D,
    J,
    w,
    u,
    h,
    f,
    l,
    i,
    g,
    ie,
    r
  ];
}
class $c extends kc {
  constructor(t) {
    super(), Mc(this, t, qc, Kc, Dc, {
      value: 0,
      label: 1,
      show_label: 2,
      root: 3,
      i18n: 4,
      zoom_speed: 9,
      pan_speed: 10
    });
  }
}
function et(e) {
  let t = ["", "k", "M", "G", "T", "P", "E", "Z"], n = 0;
  for (; e > 1e3 && n < t.length - 1; )
    e /= 1e3, n++;
  let l = t[n];
  return (Number.isInteger(e) ? e : e.toFixed(1)) + l;
}
const {
  SvelteComponent: ed,
  append: be,
  attr: C,
  component_subscribe: ri,
  detach: td,
  element: nd,
  init: ld,
  insert: id,
  noop: ai,
  safe_not_equal: rd,
  set_style: Xt,
  svg_element: Ve,
  toggle_class: si
} = window.__gradio__svelte__internal, { onMount: ad } = window.__gradio__svelte__internal;
function sd(e) {
  let t, n, l, i, r, a, s, o, c, d, u, h;
  return {
    c() {
      t = nd("div"), n = Ve("svg"), l = Ve("g"), i = Ve("path"), r = Ve("path"), a = Ve("path"), s = Ve("path"), o = Ve("g"), c = Ve("path"), d = Ve("path"), u = Ve("path"), h = Ve("path"), C(i, "d", "M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z"), C(i, "fill", "#FF7C00"), C(i, "fill-opacity", "0.4"), C(i, "class", "svelte-43sxxs"), C(r, "d", "M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z"), C(r, "fill", "#FF7C00"), C(r, "class", "svelte-43sxxs"), C(a, "d", "M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z"), C(a, "fill", "#FF7C00"), C(a, "fill-opacity", "0.4"), C(a, "class", "svelte-43sxxs"), C(s, "d", "M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z"), C(s, "fill", "#FF7C00"), C(s, "class", "svelte-43sxxs"), Xt(l, "transform", "translate(" + /*$top*/
      e[1][0] + "px, " + /*$top*/
      e[1][1] + "px)"), C(c, "d", "M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z"), C(c, "fill", "#FF7C00"), C(c, "fill-opacity", "0.4"), C(c, "class", "svelte-43sxxs"), C(d, "d", "M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z"), C(d, "fill", "#FF7C00"), C(d, "class", "svelte-43sxxs"), C(u, "d", "M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z"), C(u, "fill", "#FF7C00"), C(u, "fill-opacity", "0.4"), C(u, "class", "svelte-43sxxs"), C(h, "d", "M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z"), C(h, "fill", "#FF7C00"), C(h, "class", "svelte-43sxxs"), Xt(o, "transform", "translate(" + /*$bottom*/
      e[2][0] + "px, " + /*$bottom*/
      e[2][1] + "px)"), C(n, "viewBox", "-1200 -1200 3000 3000"), C(n, "fill", "none"), C(n, "xmlns", "http://www.w3.org/2000/svg"), C(n, "class", "svelte-43sxxs"), C(t, "class", "svelte-43sxxs"), si(
        t,
        "margin",
        /*margin*/
        e[0]
      );
    },
    m(f, V) {
      id(f, t, V), be(t, n), be(n, l), be(l, i), be(l, r), be(l, a), be(l, s), be(n, o), be(o, c), be(o, d), be(o, u), be(o, h);
    },
    p(f, [V]) {
      V & /*$top*/
      2 && Xt(l, "transform", "translate(" + /*$top*/
      f[1][0] + "px, " + /*$top*/
      f[1][1] + "px)"), V & /*$bottom*/
      4 && Xt(o, "transform", "translate(" + /*$bottom*/
      f[2][0] + "px, " + /*$bottom*/
      f[2][1] + "px)"), V & /*margin*/
      1 && si(
        t,
        "margin",
        /*margin*/
        f[0]
      );
    },
    i: ai,
    o: ai,
    d(f) {
      f && td(t);
    }
  };
}
function od(e, t, n) {
  let l, i, { margin: r = !0 } = t;
  const a = Sl([0, 0]);
  ri(e, a, (h) => n(1, l = h));
  const s = Sl([0, 0]);
  ri(e, s, (h) => n(2, i = h));
  let o;
  async function c() {
    await Promise.all([a.set([125, 140]), s.set([-125, -140])]), await Promise.all([a.set([-125, 140]), s.set([125, -140])]), await Promise.all([a.set([-125, 0]), s.set([125, -0])]), await Promise.all([a.set([125, 0]), s.set([-125, 0])]);
  }
  async function d() {
    await c(), o || d();
  }
  async function u() {
    await Promise.all([a.set([125, 0]), s.set([-125, 0])]), d();
  }
  return ad(() => (u(), () => o = !0)), e.$$set = (h) => {
    "margin" in h && n(0, r = h.margin);
  }, [r, l, i, a, s];
}
class cd extends ed {
  constructor(t) {
    super(), ld(this, t, od, sd, rd, { margin: 0 });
  }
}
const {
  SvelteComponent: dd,
  append: Pe,
  attr: We,
  binding_callbacks: oi,
  check_outros: Ur,
  create_component: ud,
  create_slot: hd,
  destroy_component: fd,
  destroy_each: Fr,
  detach: G,
  element: Ne,
  empty: Ut,
  ensure_array_like: xt,
  get_all_dirty_from_scope: md,
  get_slot_changes: Ud,
  group_outros: br,
  init: Fd,
  insert: X,
  mount_component: bd,
  noop: jn,
  safe_not_equal: Vd,
  set_data: he,
  set_style: Ie,
  space: _e,
  text: z,
  toggle_class: ue,
  transition_in: ct,
  transition_out: dt,
  update_slot_base: pd
} = window.__gradio__svelte__internal, { tick: Zd } = window.__gradio__svelte__internal, { onDestroy: Bd } = window.__gradio__svelte__internal, Qd = (e) => ({}), ci = (e) => ({});
function di(e, t, n) {
  const l = e.slice();
  return l[38] = t[n], l[40] = n, l;
}
function ui(e, t, n) {
  const l = e.slice();
  return l[38] = t[n], l;
}
function Rd(e) {
  let t, n = (
    /*i18n*/
    e[1]("common.error") + ""
  ), l, i, r;
  const a = (
    /*#slots*/
    e[29].error
  ), s = hd(
    a,
    e,
    /*$$scope*/
    e[28],
    ci
  );
  return {
    c() {
      t = Ne("span"), l = z(n), i = _e(), s && s.c(), We(t, "class", "error svelte-14miwb5");
    },
    m(o, c) {
      X(o, t, c), Pe(t, l), X(o, i, c), s && s.m(o, c), r = !0;
    },
    p(o, c) {
      (!r || c[0] & /*i18n*/
      2) && n !== (n = /*i18n*/
      o[1]("common.error") + "") && he(l, n), s && s.p && (!r || c[0] & /*$$scope*/
      268435456) && pd(
        s,
        a,
        o,
        /*$$scope*/
        o[28],
        r ? Ud(
          a,
          /*$$scope*/
          o[28],
          c,
          Qd
        ) : md(
          /*$$scope*/
          o[28]
        ),
        ci
      );
    },
    i(o) {
      r || (ct(s, o), r = !0);
    },
    o(o) {
      dt(s, o), r = !1;
    },
    d(o) {
      o && (G(t), G(i)), s && s.d(o);
    }
  };
}
function Wd(e) {
  let t, n, l, i, r, a, s, o, c, d = (
    /*variant*/
    e[8] === "default" && /*show_eta_bar*/
    e[18] && /*show_progress*/
    e[6] === "full" && hi(e)
  );
  function u(p, B) {
    if (
      /*progress*/
      p[7]
    )
      return yd;
    if (
      /*queue_position*/
      p[2] !== null && /*queue_size*/
      p[3] !== void 0 && /*queue_position*/
      p[2] >= 0
    )
      return gd;
    if (
      /*queue_position*/
      p[2] === 0
    )
      return _d;
  }
  let h = u(e), f = h && h(e), V = (
    /*timer*/
    e[5] && Ui(e)
  );
  const U = [Gd, Sd], m = [];
  function b(p, B) {
    return (
      /*last_progress_level*/
      p[15] != null ? 0 : (
        /*show_progress*/
        p[6] === "full" ? 1 : -1
      )
    );
  }
  ~(r = b(e)) && (a = m[r] = U[r](e));
  let _ = !/*timer*/
  e[5] && Qi(e);
  return {
    c() {
      d && d.c(), t = _e(), n = Ne("div"), f && f.c(), l = _e(), V && V.c(), i = _e(), a && a.c(), s = _e(), _ && _.c(), o = Ut(), We(n, "class", "progress-text svelte-14miwb5"), ue(
        n,
        "meta-text-center",
        /*variant*/
        e[8] === "center"
      ), ue(
        n,
        "meta-text",
        /*variant*/
        e[8] === "default"
      );
    },
    m(p, B) {
      d && d.m(p, B), X(p, t, B), X(p, n, B), f && f.m(n, null), Pe(n, l), V && V.m(n, null), X(p, i, B), ~r && m[r].m(p, B), X(p, s, B), _ && _.m(p, B), X(p, o, B), c = !0;
    },
    p(p, B) {
      /*variant*/
      p[8] === "default" && /*show_eta_bar*/
      p[18] && /*show_progress*/
      p[6] === "full" ? d ? d.p(p, B) : (d = hi(p), d.c(), d.m(t.parentNode, t)) : d && (d.d(1), d = null), h === (h = u(p)) && f ? f.p(p, B) : (f && f.d(1), f = h && h(p), f && (f.c(), f.m(n, l))), /*timer*/
      p[5] ? V ? V.p(p, B) : (V = Ui(p), V.c(), V.m(n, null)) : V && (V.d(1), V = null), (!c || B[0] & /*variant*/
      256) && ue(
        n,
        "meta-text-center",
        /*variant*/
        p[8] === "center"
      ), (!c || B[0] & /*variant*/
      256) && ue(
        n,
        "meta-text",
        /*variant*/
        p[8] === "default"
      );
      let Z = r;
      r = b(p), r === Z ? ~r && m[r].p(p, B) : (a && (br(), dt(m[Z], 1, 1, () => {
        m[Z] = null;
      }), Ur()), ~r ? (a = m[r], a ? a.p(p, B) : (a = m[r] = U[r](p), a.c()), ct(a, 1), a.m(s.parentNode, s)) : a = null), /*timer*/
      p[5] ? _ && (_.d(1), _ = null) : _ ? _.p(p, B) : (_ = Qi(p), _.c(), _.m(o.parentNode, o));
    },
    i(p) {
      c || (ct(a), c = !0);
    },
    o(p) {
      dt(a), c = !1;
    },
    d(p) {
      p && (G(t), G(n), G(i), G(s), G(o)), d && d.d(p), f && f.d(), V && V.d(), ~r && m[r].d(p), _ && _.d(p);
    }
  };
}
function hi(e) {
  let t, n = `translateX(${/*eta_level*/
  (e[17] || 0) * 100 - 100}%)`;
  return {
    c() {
      t = Ne("div"), We(t, "class", "eta-bar svelte-14miwb5"), Ie(t, "transform", n);
    },
    m(l, i) {
      X(l, t, i);
    },
    p(l, i) {
      i[0] & /*eta_level*/
      131072 && n !== (n = `translateX(${/*eta_level*/
      (l[17] || 0) * 100 - 100}%)`) && Ie(t, "transform", n);
    },
    d(l) {
      l && G(t);
    }
  };
}
function _d(e) {
  let t;
  return {
    c() {
      t = z("processing |");
    },
    m(n, l) {
      X(n, t, l);
    },
    p: jn,
    d(n) {
      n && G(t);
    }
  };
}
function gd(e) {
  let t, n = (
    /*queue_position*/
    e[2] + 1 + ""
  ), l, i, r, a;
  return {
    c() {
      t = z("queue: "), l = z(n), i = z("/"), r = z(
        /*queue_size*/
        e[3]
      ), a = z(" |");
    },
    m(s, o) {
      X(s, t, o), X(s, l, o), X(s, i, o), X(s, r, o), X(s, a, o);
    },
    p(s, o) {
      o[0] & /*queue_position*/
      4 && n !== (n = /*queue_position*/
      s[2] + 1 + "") && he(l, n), o[0] & /*queue_size*/
      8 && he(
        r,
        /*queue_size*/
        s[3]
      );
    },
    d(s) {
      s && (G(t), G(l), G(i), G(r), G(a));
    }
  };
}
function yd(e) {
  let t, n = xt(
    /*progress*/
    e[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = mi(ui(e, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      t = Ut();
    },
    m(i, r) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, r);
      X(i, t, r);
    },
    p(i, r) {
      if (r[0] & /*progress*/
      128) {
        n = xt(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const s = ui(i, n, a);
          l[a] ? l[a].p(s, r) : (l[a] = mi(s), l[a].c(), l[a].m(t.parentNode, t));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && G(t), Fr(l, i);
    }
  };
}
function fi(e) {
  let t, n = (
    /*p*/
    e[38].unit + ""
  ), l, i, r = " ", a;
  function s(d, u) {
    return (
      /*p*/
      d[38].length != null ? Nd : Jd
    );
  }
  let o = s(e), c = o(e);
  return {
    c() {
      c.c(), t = _e(), l = z(n), i = z(" | "), a = z(r);
    },
    m(d, u) {
      c.m(d, u), X(d, t, u), X(d, l, u), X(d, i, u), X(d, a, u);
    },
    p(d, u) {
      o === (o = s(d)) && c ? c.p(d, u) : (c.d(1), c = o(d), c && (c.c(), c.m(t.parentNode, t))), u[0] & /*progress*/
      128 && n !== (n = /*p*/
      d[38].unit + "") && he(l, n);
    },
    d(d) {
      d && (G(t), G(l), G(i), G(a)), c.d(d);
    }
  };
}
function Jd(e) {
  let t = et(
    /*p*/
    e[38].index || 0
  ) + "", n;
  return {
    c() {
      n = z(t);
    },
    m(l, i) {
      X(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && t !== (t = et(
        /*p*/
        l[38].index || 0
      ) + "") && he(n, t);
    },
    d(l) {
      l && G(n);
    }
  };
}
function Nd(e) {
  let t = et(
    /*p*/
    e[38].index || 0
  ) + "", n, l, i = et(
    /*p*/
    e[38].length
  ) + "", r;
  return {
    c() {
      n = z(t), l = z("/"), r = z(i);
    },
    m(a, s) {
      X(a, n, s), X(a, l, s), X(a, r, s);
    },
    p(a, s) {
      s[0] & /*progress*/
      128 && t !== (t = et(
        /*p*/
        a[38].index || 0
      ) + "") && he(n, t), s[0] & /*progress*/
      128 && i !== (i = et(
        /*p*/
        a[38].length
      ) + "") && he(r, i);
    },
    d(a) {
      a && (G(n), G(l), G(r));
    }
  };
}
function mi(e) {
  let t, n = (
    /*p*/
    e[38].index != null && fi(e)
  );
  return {
    c() {
      n && n.c(), t = Ut();
    },
    m(l, i) {
      n && n.m(l, i), X(l, t, i);
    },
    p(l, i) {
      /*p*/
      l[38].index != null ? n ? n.p(l, i) : (n = fi(l), n.c(), n.m(t.parentNode, t)) : n && (n.d(1), n = null);
    },
    d(l) {
      l && G(t), n && n.d(l);
    }
  };
}
function Ui(e) {
  let t, n = (
    /*eta*/
    e[0] ? `/${/*formatted_eta*/
    e[19]}` : ""
  ), l, i;
  return {
    c() {
      t = z(
        /*formatted_timer*/
        e[20]
      ), l = z(n), i = z("s");
    },
    m(r, a) {
      X(r, t, a), X(r, l, a), X(r, i, a);
    },
    p(r, a) {
      a[0] & /*formatted_timer*/
      1048576 && he(
        t,
        /*formatted_timer*/
        r[20]
      ), a[0] & /*eta, formatted_eta*/
      524289 && n !== (n = /*eta*/
      r[0] ? `/${/*formatted_eta*/
      r[19]}` : "") && he(l, n);
    },
    d(r) {
      r && (G(t), G(l), G(i));
    }
  };
}
function Sd(e) {
  let t, n;
  return t = new cd({
    props: { margin: (
      /*variant*/
      e[8] === "default"
    ) }
  }), {
    c() {
      ud(t.$$.fragment);
    },
    m(l, i) {
      bd(t, l, i), n = !0;
    },
    p(l, i) {
      const r = {};
      i[0] & /*variant*/
      256 && (r.margin = /*variant*/
      l[8] === "default"), t.$set(r);
    },
    i(l) {
      n || (ct(t.$$.fragment, l), n = !0);
    },
    o(l) {
      dt(t.$$.fragment, l), n = !1;
    },
    d(l) {
      fd(t, l);
    }
  };
}
function Gd(e) {
  let t, n, l, i, r, a = `${/*last_progress_level*/
  e[15] * 100}%`, s = (
    /*progress*/
    e[7] != null && Fi(e)
  );
  return {
    c() {
      t = Ne("div"), n = Ne("div"), s && s.c(), l = _e(), i = Ne("div"), r = Ne("div"), We(n, "class", "progress-level-inner svelte-14miwb5"), We(r, "class", "progress-bar svelte-14miwb5"), Ie(r, "width", a), We(i, "class", "progress-bar-wrap svelte-14miwb5"), We(t, "class", "progress-level svelte-14miwb5");
    },
    m(o, c) {
      X(o, t, c), Pe(t, n), s && s.m(n, null), Pe(t, l), Pe(t, i), Pe(i, r), e[30](r);
    },
    p(o, c) {
      /*progress*/
      o[7] != null ? s ? s.p(o, c) : (s = Fi(o), s.c(), s.m(n, null)) : s && (s.d(1), s = null), c[0] & /*last_progress_level*/
      32768 && a !== (a = `${/*last_progress_level*/
      o[15] * 100}%`) && Ie(r, "width", a);
    },
    i: jn,
    o: jn,
    d(o) {
      o && G(t), s && s.d(), e[30](null);
    }
  };
}
function Fi(e) {
  let t, n = xt(
    /*progress*/
    e[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = Bi(di(e, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      t = Ut();
    },
    m(i, r) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, r);
      X(i, t, r);
    },
    p(i, r) {
      if (r[0] & /*progress_level, progress*/
      16512) {
        n = xt(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const s = di(i, n, a);
          l[a] ? l[a].p(s, r) : (l[a] = Bi(s), l[a].c(), l[a].m(t.parentNode, t));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && G(t), Fr(l, i);
    }
  };
}
function bi(e) {
  let t, n, l, i, r = (
    /*i*/
    e[40] !== 0 && Xd()
  ), a = (
    /*p*/
    e[38].desc != null && Vi(e)
  ), s = (
    /*p*/
    e[38].desc != null && /*progress_level*/
    e[14] && /*progress_level*/
    e[14][
      /*i*/
      e[40]
    ] != null && pi()
  ), o = (
    /*progress_level*/
    e[14] != null && Zi(e)
  );
  return {
    c() {
      r && r.c(), t = _e(), a && a.c(), n = _e(), s && s.c(), l = _e(), o && o.c(), i = Ut();
    },
    m(c, d) {
      r && r.m(c, d), X(c, t, d), a && a.m(c, d), X(c, n, d), s && s.m(c, d), X(c, l, d), o && o.m(c, d), X(c, i, d);
    },
    p(c, d) {
      /*p*/
      c[38].desc != null ? a ? a.p(c, d) : (a = Vi(c), a.c(), a.m(n.parentNode, n)) : a && (a.d(1), a = null), /*p*/
      c[38].desc != null && /*progress_level*/
      c[14] && /*progress_level*/
      c[14][
        /*i*/
        c[40]
      ] != null ? s || (s = pi(), s.c(), s.m(l.parentNode, l)) : s && (s.d(1), s = null), /*progress_level*/
      c[14] != null ? o ? o.p(c, d) : (o = Zi(c), o.c(), o.m(i.parentNode, i)) : o && (o.d(1), o = null);
    },
    d(c) {
      c && (G(t), G(n), G(l), G(i)), r && r.d(c), a && a.d(c), s && s.d(c), o && o.d(c);
    }
  };
}
function Xd(e) {
  let t;
  return {
    c() {
      t = z(" /");
    },
    m(n, l) {
      X(n, t, l);
    },
    d(n) {
      n && G(t);
    }
  };
}
function Vi(e) {
  let t = (
    /*p*/
    e[38].desc + ""
  ), n;
  return {
    c() {
      n = z(t);
    },
    m(l, i) {
      X(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && t !== (t = /*p*/
      l[38].desc + "") && he(n, t);
    },
    d(l) {
      l && G(n);
    }
  };
}
function pi(e) {
  let t;
  return {
    c() {
      t = z("-");
    },
    m(n, l) {
      X(n, t, l);
    },
    d(n) {
      n && G(t);
    }
  };
}
function Zi(e) {
  let t = (100 * /*progress_level*/
  (e[14][
    /*i*/
    e[40]
  ] || 0)).toFixed(1) + "", n, l;
  return {
    c() {
      n = z(t), l = z("%");
    },
    m(i, r) {
      X(i, n, r), X(i, l, r);
    },
    p(i, r) {
      r[0] & /*progress_level*/
      16384 && t !== (t = (100 * /*progress_level*/
      (i[14][
        /*i*/
        i[40]
      ] || 0)).toFixed(1) + "") && he(n, t);
    },
    d(i) {
      i && (G(n), G(l));
    }
  };
}
function Bi(e) {
  let t, n = (
    /*p*/
    (e[38].desc != null || /*progress_level*/
    e[14] && /*progress_level*/
    e[14][
      /*i*/
      e[40]
    ] != null) && bi(e)
  );
  return {
    c() {
      n && n.c(), t = Ut();
    },
    m(l, i) {
      n && n.m(l, i), X(l, t, i);
    },
    p(l, i) {
      /*p*/
      l[38].desc != null || /*progress_level*/
      l[14] && /*progress_level*/
      l[14][
        /*i*/
        l[40]
      ] != null ? n ? n.p(l, i) : (n = bi(l), n.c(), n.m(t.parentNode, t)) : n && (n.d(1), n = null);
    },
    d(l) {
      l && G(t), n && n.d(l);
    }
  };
}
function Qi(e) {
  let t, n;
  return {
    c() {
      t = Ne("p"), n = z(
        /*loading_text*/
        e[9]
      ), We(t, "class", "loading svelte-14miwb5");
    },
    m(l, i) {
      X(l, t, i), Pe(t, n);
    },
    p(l, i) {
      i[0] & /*loading_text*/
      512 && he(
        n,
        /*loading_text*/
        l[9]
      );
    },
    d(l) {
      l && G(t);
    }
  };
}
function Ed(e) {
  let t, n, l, i, r;
  const a = [Wd, Rd], s = [];
  function o(c, d) {
    return (
      /*status*/
      c[4] === "pending" ? 0 : (
        /*status*/
        c[4] === "error" ? 1 : -1
      )
    );
  }
  return ~(n = o(e)) && (l = s[n] = a[n](e)), {
    c() {
      t = Ne("div"), l && l.c(), We(t, "class", i = "wrap " + /*variant*/
      e[8] + " " + /*show_progress*/
      e[6] + " svelte-14miwb5"), ue(t, "hide", !/*status*/
      e[4] || /*status*/
      e[4] === "complete" || /*show_progress*/
      e[6] === "hidden"), ue(
        t,
        "translucent",
        /*variant*/
        e[8] === "center" && /*status*/
        (e[4] === "pending" || /*status*/
        e[4] === "error") || /*translucent*/
        e[11] || /*show_progress*/
        e[6] === "minimal"
      ), ue(
        t,
        "generating",
        /*status*/
        e[4] === "generating"
      ), ue(
        t,
        "border",
        /*border*/
        e[12]
      ), Ie(
        t,
        "position",
        /*absolute*/
        e[10] ? "absolute" : "static"
      ), Ie(
        t,
        "padding",
        /*absolute*/
        e[10] ? "0" : "var(--size-8) 0"
      );
    },
    m(c, d) {
      X(c, t, d), ~n && s[n].m(t, null), e[31](t), r = !0;
    },
    p(c, d) {
      let u = n;
      n = o(c), n === u ? ~n && s[n].p(c, d) : (l && (br(), dt(s[u], 1, 1, () => {
        s[u] = null;
      }), Ur()), ~n ? (l = s[n], l ? l.p(c, d) : (l = s[n] = a[n](c), l.c()), ct(l, 1), l.m(t, null)) : l = null), (!r || d[0] & /*variant, show_progress*/
      320 && i !== (i = "wrap " + /*variant*/
      c[8] + " " + /*show_progress*/
      c[6] + " svelte-14miwb5")) && We(t, "class", i), (!r || d[0] & /*variant, show_progress, status, show_progress*/
      336) && ue(t, "hide", !/*status*/
      c[4] || /*status*/
      c[4] === "complete" || /*show_progress*/
      c[6] === "hidden"), (!r || d[0] & /*variant, show_progress, variant, status, translucent, show_progress*/
      2384) && ue(
        t,
        "translucent",
        /*variant*/
        c[8] === "center" && /*status*/
        (c[4] === "pending" || /*status*/
        c[4] === "error") || /*translucent*/
        c[11] || /*show_progress*/
        c[6] === "minimal"
      ), (!r || d[0] & /*variant, show_progress, status*/
      336) && ue(
        t,
        "generating",
        /*status*/
        c[4] === "generating"
      ), (!r || d[0] & /*variant, show_progress, border*/
      4416) && ue(
        t,
        "border",
        /*border*/
        c[12]
      ), d[0] & /*absolute*/
      1024 && Ie(
        t,
        "position",
        /*absolute*/
        c[10] ? "absolute" : "static"
      ), d[0] & /*absolute*/
      1024 && Ie(
        t,
        "padding",
        /*absolute*/
        c[10] ? "0" : "var(--size-8) 0"
      );
    },
    i(c) {
      r || (ct(l), r = !0);
    },
    o(c) {
      dt(l), r = !1;
    },
    d(c) {
      c && G(t), ~n && s[n].d(), e[31](null);
    }
  };
}
let Et = [], gn = !1;
async function kd(e, t = !0) {
  if (!(window.__gradio_mode__ === "website" || window.__gradio_mode__ !== "app" && t !== !0)) {
    if (Et.push(e), !gn)
      gn = !0;
    else
      return;
    await Zd(), requestAnimationFrame(() => {
      let n = [0, 0];
      for (let l = 0; l < Et.length; l++) {
        const r = Et[l].getBoundingClientRect();
        (l === 0 || r.top + window.scrollY <= n[0]) && (n[0] = r.top + window.scrollY, n[1] = l);
      }
      window.scrollTo({ top: n[0] - 20, behavior: "smooth" }), gn = !1, Et = [];
    });
  }
}
function vd(e, t, n) {
  let l, { $$slots: i = {}, $$scope: r } = t, { i18n: a } = t, { eta: s = null } = t, { queue: o = !1 } = t, { queue_position: c } = t, { queue_size: d } = t, { status: u } = t, { scroll_to_output: h = !1 } = t, { timer: f = !0 } = t, { show_progress: V = "full" } = t, { message: U = null } = t, { progress: m = null } = t, { variant: b = "default" } = t, { loading_text: _ = "Loading..." } = t, { absolute: p = !0 } = t, { translucent: B = !1 } = t, { border: Z = !1 } = t, { autoscroll: J } = t, w, x = !1, D = 0, g = 0, ie = null, E = 0, H = null, F, y = null, Q = !0;
  const R = () => {
    n(25, D = performance.now()), n(26, g = 0), x = !0, I();
  };
  function I() {
    requestAnimationFrame(() => {
      n(26, g = (performance.now() - D) / 1e3), x && I();
    });
  }
  function N() {
    n(26, g = 0), x && (x = !1);
  }
  Bd(() => {
    x && N();
  });
  let k = null;
  function j(W) {
    oi[W ? "unshift" : "push"](() => {
      y = W, n(16, y), n(7, m), n(14, H), n(15, F);
    });
  }
  function S(W) {
    oi[W ? "unshift" : "push"](() => {
      w = W, n(13, w);
    });
  }
  return e.$$set = (W) => {
    "i18n" in W && n(1, a = W.i18n), "eta" in W && n(0, s = W.eta), "queue" in W && n(21, o = W.queue), "queue_position" in W && n(2, c = W.queue_position), "queue_size" in W && n(3, d = W.queue_size), "status" in W && n(4, u = W.status), "scroll_to_output" in W && n(22, h = W.scroll_to_output), "timer" in W && n(5, f = W.timer), "show_progress" in W && n(6, V = W.show_progress), "message" in W && n(23, U = W.message), "progress" in W && n(7, m = W.progress), "variant" in W && n(8, b = W.variant), "loading_text" in W && n(9, _ = W.loading_text), "absolute" in W && n(10, p = W.absolute), "translucent" in W && n(11, B = W.translucent), "border" in W && n(12, Z = W.border), "autoscroll" in W && n(24, J = W.autoscroll), "$$scope" in W && n(28, r = W.$$scope);
  }, e.$$.update = () => {
    e.$$.dirty[0] & /*eta, old_eta, queue, timer_start*/
    169869313 && (s === null ? n(0, s = ie) : o && n(0, s = (performance.now() - D) / 1e3 + s), s != null && (n(19, k = s.toFixed(1)), n(27, ie = s))), e.$$.dirty[0] & /*eta, timer_diff*/
    67108865 && n(17, E = s === null || s <= 0 || !g ? null : Math.min(g / s, 1)), e.$$.dirty[0] & /*progress*/
    128 && m != null && n(18, Q = !1), e.$$.dirty[0] & /*progress, progress_level, progress_bar, last_progress_level*/
    114816 && (m != null ? n(14, H = m.map((W) => {
      if (W.index != null && W.length != null)
        return W.index / W.length;
      if (W.progress != null)
        return W.progress;
    })) : n(14, H = null), H ? (n(15, F = H[H.length - 1]), y && (F === 0 ? n(16, y.style.transition = "0", y) : n(16, y.style.transition = "150ms", y))) : n(15, F = void 0)), e.$$.dirty[0] & /*status*/
    16 && (u === "pending" ? R() : N()), e.$$.dirty[0] & /*el, scroll_to_output, status, autoscroll*/
    20979728 && w && h && (u === "pending" || u === "complete") && kd(w, J), e.$$.dirty[0] & /*status, message*/
    8388624, e.$$.dirty[0] & /*timer_diff*/
    67108864 && n(20, l = g.toFixed(1));
  }, [
    s,
    a,
    c,
    d,
    u,
    f,
    V,
    m,
    b,
    _,
    p,
    B,
    Z,
    w,
    H,
    F,
    y,
    E,
    Q,
    k,
    l,
    o,
    h,
    U,
    J,
    D,
    g,
    ie,
    r,
    i,
    j,
    S
  ];
}
class Vr extends dd {
  constructor(t) {
    super(), Fd(
      this,
      t,
      vd,
      Ed,
      Vd,
      {
        i18n: 1,
        eta: 0,
        queue: 21,
        queue_position: 2,
        queue_size: 3,
        status: 4,
        scroll_to_output: 22,
        timer: 5,
        show_progress: 6,
        message: 23,
        progress: 7,
        variant: 8,
        loading_text: 9,
        absolute: 10,
        translucent: 11,
        border: 12,
        autoscroll: 24
      },
      null,
      [-1, -1]
    );
  }
}
const {
  SvelteComponent: Td,
  append: wd,
  attr: Id,
  detach: Cd,
  element: Hd,
  init: Yd,
  insert: xd,
  noop: Ri,
  safe_not_equal: Md,
  set_data: Dd,
  text: zd,
  toggle_class: $e
} = window.__gradio__svelte__internal;
function Od(e) {
  let t, n;
  return {
    c() {
      t = Hd("div"), n = zd(
        /*value*/
        e[0]
      ), Id(t, "class", "svelte-1gecy8w"), $e(
        t,
        "table",
        /*type*/
        e[1] === "table"
      ), $e(
        t,
        "gallery",
        /*type*/
        e[1] === "gallery"
      ), $e(
        t,
        "selected",
        /*selected*/
        e[2]
      );
    },
    m(l, i) {
      xd(l, t, i), wd(t, n);
    },
    p(l, [i]) {
      i & /*value*/
      1 && Dd(
        n,
        /*value*/
        l[0]
      ), i & /*type*/
      2 && $e(
        t,
        "table",
        /*type*/
        l[1] === "table"
      ), i & /*type*/
      2 && $e(
        t,
        "gallery",
        /*type*/
        l[1] === "gallery"
      ), i & /*selected*/
      4 && $e(
        t,
        "selected",
        /*selected*/
        l[2]
      );
    },
    i: Ri,
    o: Ri,
    d(l) {
      l && Cd(t);
    }
  };
}
function Ad(e, t, n) {
  let { value: l } = t, { type: i } = t, { selected: r = !1 } = t;
  return e.$$set = (a) => {
    "value" in a && n(0, l = a.value), "type" in a && n(1, i = a.type), "selected" in a && n(2, r = a.selected);
  }, [l, i, r];
}
class fu extends Td {
  constructor(t) {
    super(), Yd(this, t, Ad, Od, Md, { value: 0, type: 1, selected: 2 });
  }
}
const {
  SvelteComponent: Pd,
  assign: pr,
  check_outros: Zr,
  create_component: pe,
  destroy_component: Ze,
  detach: ut,
  empty: Br,
  get_spread_object: Qr,
  get_spread_update: Rr,
  group_outros: Wr,
  init: jd,
  insert: ht,
  mount_component: Be,
  safe_not_equal: Ld,
  space: jt,
  transition_in: ne,
  transition_out: le
} = window.__gradio__svelte__internal;
function Kd(e) {
  let t, n;
  return t = new Ji({
    props: {
      visible: (
        /*visible*/
        e[3]
      ),
      variant: (
        /*value*/
        e[0] === null ? "dashed" : "solid"
      ),
      border_mode: (
        /*dragging*/
        e[17] ? "focus" : "base"
      ),
      padding: !1,
      elem_id: (
        /*elem_id*/
        e[1]
      ),
      elem_classes: (
        /*elem_classes*/
        e[2]
      ),
      container: (
        /*container*/
        e[8]
      ),
      scale: (
        /*scale*/
        e[9]
      ),
      min_width: (
        /*min_width*/
        e[10]
      ),
      height: (
        /*height*/
        e[12]
      ),
      $$slots: { default: [eu] },
      $$scope: { ctx: e }
    }
  }), {
    c() {
      pe(t.$$.fragment);
    },
    m(l, i) {
      Be(t, l, i), n = !0;
    },
    p(l, i) {
      const r = {};
      i & /*visible*/
      8 && (r.visible = /*visible*/
      l[3]), i & /*value*/
      1 && (r.variant = /*value*/
      l[0] === null ? "dashed" : "solid"), i & /*dragging*/
      131072 && (r.border_mode = /*dragging*/
      l[17] ? "focus" : "base"), i & /*elem_id*/
      2 && (r.elem_id = /*elem_id*/
      l[1]), i & /*elem_classes*/
      4 && (r.elem_classes = /*elem_classes*/
      l[2]), i & /*container*/
      256 && (r.container = /*container*/
      l[8]), i & /*scale*/
      512 && (r.scale = /*scale*/
      l[9]), i & /*min_width*/
      1024 && (r.min_width = /*min_width*/
      l[10]), i & /*height*/
      4096 && (r.height = /*height*/
      l[12]), i & /*$$scope, label, show_label, root, _value, zoom_speed, pan_speed, gradio, value, dragging, loading_status*/
      8612081 && (r.$$scope = { dirty: i, ctx: l }), t.$set(r);
    },
    i(l) {
      n || (ne(t.$$.fragment, l), n = !0);
    },
    o(l) {
      le(t.$$.fragment, l), n = !1;
    },
    d(l) {
      Ze(t, l);
    }
  };
}
function qd(e) {
  let t, n;
  return t = new Ji({
    props: {
      visible: (
        /*visible*/
        e[3]
      ),
      variant: (
        /*value*/
        e[0] === null ? "dashed" : "solid"
      ),
      border_mode: (
        /*dragging*/
        e[17] ? "focus" : "base"
      ),
      padding: !1,
      elem_id: (
        /*elem_id*/
        e[1]
      ),
      elem_classes: (
        /*elem_classes*/
        e[2]
      ),
      container: (
        /*container*/
        e[8]
      ),
      scale: (
        /*scale*/
        e[9]
      ),
      min_width: (
        /*min_width*/
        e[10]
      ),
      height: (
        /*height*/
        e[12]
      ),
      $$slots: { default: [iu] },
      $$scope: { ctx: e }
    }
  }), {
    c() {
      pe(t.$$.fragment);
    },
    m(l, i) {
      Be(t, l, i), n = !0;
    },
    p(l, i) {
      const r = {};
      i & /*visible*/
      8 && (r.visible = /*visible*/
      l[3]), i & /*value*/
      1 && (r.variant = /*value*/
      l[0] === null ? "dashed" : "solid"), i & /*dragging*/
      131072 && (r.border_mode = /*dragging*/
      l[17] ? "focus" : "base"), i & /*elem_id*/
      2 && (r.elem_id = /*elem_id*/
      l[1]), i & /*elem_classes*/
      4 && (r.elem_classes = /*elem_classes*/
      l[2]), i & /*container*/
      256 && (r.container = /*container*/
      l[8]), i & /*scale*/
      512 && (r.scale = /*scale*/
      l[9]), i & /*min_width*/
      1024 && (r.min_width = /*min_width*/
      l[10]), i & /*height*/
      4096 && (r.height = /*height*/
      l[12]), i & /*$$scope, _value, gradio, label, show_label, zoom_speed, pan_speed, value, loading_status*/
      8480993 && (r.$$scope = { dirty: i, ctx: l }), t.$set(r);
    },
    i(l) {
      n || (ne(t.$$.fragment, l), n = !0);
    },
    o(l) {
      le(t.$$.fragment, l), n = !1;
    },
    d(l) {
      Ze(t, l);
    }
  };
}
function $d(e) {
  let t, n;
  return t = new Ps({
    props: {
      i18n: (
        /*gradio*/
        e[11].i18n
      ),
      type: "file"
    }
  }), {
    c() {
      pe(t.$$.fragment);
    },
    m(l, i) {
      Be(t, l, i), n = !0;
    },
    p(l, i) {
      const r = {};
      i & /*gradio*/
      2048 && (r.i18n = /*gradio*/
      l[11].i18n), t.$set(r);
    },
    i(l) {
      n || (ne(t.$$.fragment, l), n = !0);
    },
    o(l) {
      le(t.$$.fragment, l), n = !1;
    },
    d(l) {
      Ze(t, l);
    }
  };
}
function eu(e) {
  let t, n, l, i;
  const r = [
    {
      autoscroll: (
        /*gradio*/
        e[11].autoscroll
      )
    },
    { i18n: (
      /*gradio*/
      e[11].i18n
    ) },
    /*loading_status*/
    e[5]
  ];
  let a = {};
  for (let s = 0; s < r.length; s += 1)
    a = pr(a, r[s]);
  return t = new Vr({ props: a }), l = new $c({
    props: {
      label: (
        /*label*/
        e[6]
      ),
      show_label: (
        /*show_label*/
        e[7]
      ),
      root: (
        /*root*/
        e[4]
      ),
      value: (
        /*_value*/
        e[16]
      ),
      zoom_speed: (
        /*zoom_speed*/
        e[13]
      ),
      pan_speed: (
        /*pan_speed*/
        e[14]
      ),
      i18n: (
        /*gradio*/
        e[11].i18n
      ),
      $$slots: { default: [$d] },
      $$scope: { ctx: e }
    }
  }), l.$on(
    "change",
    /*change_handler*/
    e[19]
  ), l.$on(
    "drag",
    /*drag_handler*/
    e[20]
  ), l.$on(
    "change",
    /*change_handler_1*/
    e[21]
  ), l.$on(
    "clear",
    /*clear_handler*/
    e[22]
  ), {
    c() {
      pe(t.$$.fragment), n = jt(), pe(l.$$.fragment);
    },
    m(s, o) {
      Be(t, s, o), ht(s, n, o), Be(l, s, o), i = !0;
    },
    p(s, o) {
      const c = o & /*gradio, loading_status*/
      2080 ? Rr(r, [
        o & /*gradio*/
        2048 && {
          autoscroll: (
            /*gradio*/
            s[11].autoscroll
          )
        },
        o & /*gradio*/
        2048 && { i18n: (
          /*gradio*/
          s[11].i18n
        ) },
        o & /*loading_status*/
        32 && Qr(
          /*loading_status*/
          s[5]
        )
      ]) : {};
      t.$set(c);
      const d = {};
      o & /*label*/
      64 && (d.label = /*label*/
      s[6]), o & /*show_label*/
      128 && (d.show_label = /*show_label*/
      s[7]), o & /*root*/
      16 && (d.root = /*root*/
      s[4]), o & /*_value*/
      65536 && (d.value = /*_value*/
      s[16]), o & /*zoom_speed*/
      8192 && (d.zoom_speed = /*zoom_speed*/
      s[13]), o & /*pan_speed*/
      16384 && (d.pan_speed = /*pan_speed*/
      s[14]), o & /*gradio*/
      2048 && (d.i18n = /*gradio*/
      s[11].i18n), o & /*$$scope, gradio*/
      8390656 && (d.$$scope = { dirty: o, ctx: s }), l.$set(d);
    },
    i(s) {
      i || (ne(t.$$.fragment, s), ne(l.$$.fragment, s), i = !0);
    },
    o(s) {
      le(t.$$.fragment, s), le(l.$$.fragment, s), i = !1;
    },
    d(s) {
      s && ut(n), Ze(t, s), Ze(l, s);
    }
  };
}
function tu(e) {
  let t, n, l, i;
  return t = new Mt({
    props: {
      show_label: (
        /*show_label*/
        e[7]
      ),
      Icon: Rt,
      label: (
        /*label*/
        e[6] || "Splat"
      )
    }
  }), l = new Aa({
    props: {
      unpadded_box: !0,
      size: "large",
      $$slots: { default: [lu] },
      $$scope: { ctx: e }
    }
  }), {
    c() {
      pe(t.$$.fragment), n = jt(), pe(l.$$.fragment);
    },
    m(r, a) {
      Be(t, r, a), ht(r, n, a), Be(l, r, a), i = !0;
    },
    p(r, a) {
      const s = {};
      a & /*show_label*/
      128 && (s.show_label = /*show_label*/
      r[7]), a & /*label*/
      64 && (s.label = /*label*/
      r[6] || "Splat"), t.$set(s);
      const o = {};
      a & /*$$scope*/
      8388608 && (o.$$scope = { dirty: a, ctx: r }), l.$set(o);
    },
    i(r) {
      i || (ne(t.$$.fragment, r), ne(l.$$.fragment, r), i = !0);
    },
    o(r) {
      le(t.$$.fragment, r), le(l.$$.fragment, r), i = !1;
    },
    d(r) {
      r && ut(n), Ze(t, r), Ze(l, r);
    }
  };
}
function nu(e) {
  let t, n, l, i;
  return t = new Mt({
    props: {
      show_label: (
        /*show_label*/
        e[7]
      ),
      Icon: Rt,
      label: (
        /*label*/
        e[6] || "Splat"
      )
    }
  }), l = new oo({
    props: {
      value: (
        /*_value*/
        e[16]
      ),
      i18n: (
        /*gradio*/
        e[11].i18n
      ),
      label: (
        /*label*/
        e[6]
      ),
      show_label: (
        /*show_label*/
        e[7]
      ),
      zoom_speed: (
        /*zoom_speed*/
        e[13]
      ),
      pan_speed: (
        /*pan_speed*/
        e[14]
      )
    }
  }), {
    c() {
      pe(t.$$.fragment), n = jt(), pe(l.$$.fragment);
    },
    m(r, a) {
      Be(t, r, a), ht(r, n, a), Be(l, r, a), i = !0;
    },
    p(r, a) {
      const s = {};
      a & /*show_label*/
      128 && (s.show_label = /*show_label*/
      r[7]), a & /*label*/
      64 && (s.label = /*label*/
      r[6] || "Splat"), t.$set(s);
      const o = {};
      a & /*_value*/
      65536 && (o.value = /*_value*/
      r[16]), a & /*gradio*/
      2048 && (o.i18n = /*gradio*/
      r[11].i18n), a & /*label*/
      64 && (o.label = /*label*/
      r[6]), a & /*show_label*/
      128 && (o.show_label = /*show_label*/
      r[7]), a & /*zoom_speed*/
      8192 && (o.zoom_speed = /*zoom_speed*/
      r[13]), a & /*pan_speed*/
      16384 && (o.pan_speed = /*pan_speed*/
      r[14]), l.$set(o);
    },
    i(r) {
      i || (ne(t.$$.fragment, r), ne(l.$$.fragment, r), i = !0);
    },
    o(r) {
      le(t.$$.fragment, r), le(l.$$.fragment, r), i = !1;
    },
    d(r) {
      r && ut(n), Ze(t, r), Ze(l, r);
    }
  };
}
function lu(e) {
  let t, n;
  return t = new Rt({}), {
    c() {
      pe(t.$$.fragment);
    },
    m(l, i) {
      Be(t, l, i), n = !0;
    },
    i(l) {
      n || (ne(t.$$.fragment, l), n = !0);
    },
    o(l) {
      le(t.$$.fragment, l), n = !1;
    },
    d(l) {
      Ze(t, l);
    }
  };
}
function iu(e) {
  let t, n, l, i, r, a;
  const s = [
    {
      autoscroll: (
        /*gradio*/
        e[11].autoscroll
      )
    },
    { i18n: (
      /*gradio*/
      e[11].i18n
    ) },
    /*loading_status*/
    e[5]
  ];
  let o = {};
  for (let h = 0; h < s.length; h += 1)
    o = pr(o, s[h]);
  t = new Vr({ props: o });
  const c = [nu, tu], d = [];
  function u(h, f) {
    return (
      /*value*/
      h[0] ? 0 : 1
    );
  }
  return l = u(e), i = d[l] = c[l](e), {
    c() {
      pe(t.$$.fragment), n = jt(), i.c(), r = Br();
    },
    m(h, f) {
      Be(t, h, f), ht(h, n, f), d[l].m(h, f), ht(h, r, f), a = !0;
    },
    p(h, f) {
      const V = f & /*gradio, loading_status*/
      2080 ? Rr(s, [
        f & /*gradio*/
        2048 && {
          autoscroll: (
            /*gradio*/
            h[11].autoscroll
          )
        },
        f & /*gradio*/
        2048 && { i18n: (
          /*gradio*/
          h[11].i18n
        ) },
        f & /*loading_status*/
        32 && Qr(
          /*loading_status*/
          h[5]
        )
      ]) : {};
      t.$set(V);
      let U = l;
      l = u(h), l === U ? d[l].p(h, f) : (Wr(), le(d[U], 1, 1, () => {
        d[U] = null;
      }), Zr(), i = d[l], i ? i.p(h, f) : (i = d[l] = c[l](h), i.c()), ne(i, 1), i.m(r.parentNode, r));
    },
    i(h) {
      a || (ne(t.$$.fragment, h), ne(i), a = !0);
    },
    o(h) {
      le(t.$$.fragment, h), le(i), a = !1;
    },
    d(h) {
      h && (ut(n), ut(r)), Ze(t, h), d[l].d(h);
    }
  };
}
function ru(e) {
  let t, n, l, i;
  const r = [qd, Kd], a = [];
  function s(o, c) {
    return (
      /*interactive*/
      o[15] ? 1 : 0
    );
  }
  return t = s(e), n = a[t] = r[t](e), {
    c() {
      n.c(), l = Br();
    },
    m(o, c) {
      a[t].m(o, c), ht(o, l, c), i = !0;
    },
    p(o, [c]) {
      let d = t;
      t = s(o), t === d ? a[t].p(o, c) : (Wr(), le(a[d], 1, 1, () => {
        a[d] = null;
      }), Zr(), n = a[t], n ? n.p(o, c) : (n = a[t] = r[t](o), n.c()), ne(n, 1), n.m(l.parentNode, l));
    },
    i(o) {
      i || (ne(n), i = !0);
    },
    o(o) {
      le(n), i = !1;
    },
    d(o) {
      o && ut(l), a[t].d(o);
    }
  };
}
function au(e, t, n) {
  let { elem_id: l = "" } = t, { elem_classes: i = [] } = t, { visible: r = !0 } = t, { value: a = null } = t, { root: s } = t, { proxy_url: o } = t, { loading_status: c } = t, { label: d } = t, { show_label: u } = t, { container: h = !0 } = t, { scale: f = null } = t, { min_width: V = void 0 } = t, { gradio: U } = t, { height: m = void 0 } = t, { zoom_speed: b = 1 } = t, { pan_speed: _ = 1 } = t, { interactive: p } = t, B, Z = !1;
  const J = ({ detail: g }) => n(0, a = g), w = ({ detail: g }) => n(17, Z = g), x = ({ detail: g }) => U.dispatch("change", g), D = () => U.dispatch("clear");
  return e.$$set = (g) => {
    "elem_id" in g && n(1, l = g.elem_id), "elem_classes" in g && n(2, i = g.elem_classes), "visible" in g && n(3, r = g.visible), "value" in g && n(0, a = g.value), "root" in g && n(4, s = g.root), "proxy_url" in g && n(18, o = g.proxy_url), "loading_status" in g && n(5, c = g.loading_status), "label" in g && n(6, d = g.label), "show_label" in g && n(7, u = g.show_label), "container" in g && n(8, h = g.container), "scale" in g && n(9, f = g.scale), "min_width" in g && n(10, V = g.min_width), "gradio" in g && n(11, U = g.gradio), "height" in g && n(12, m = g.height), "zoom_speed" in g && n(13, b = g.zoom_speed), "pan_speed" in g && n(14, _ = g.pan_speed), "interactive" in g && n(15, p = g.interactive);
  }, e.$$.update = () => {
    e.$$.dirty & /*value, root, proxy_url*/
    262161 && n(16, B = ze(a, s, o));
  }, [
    a,
    l,
    i,
    r,
    s,
    c,
    d,
    u,
    h,
    f,
    V,
    U,
    m,
    b,
    _,
    p,
    B,
    Z,
    o,
    J,
    w,
    x,
    D
  ];
}
class mu extends Pd {
  constructor(t) {
    super(), jd(this, t, au, ru, Ld, {
      elem_id: 1,
      elem_classes: 2,
      visible: 3,
      value: 0,
      root: 4,
      proxy_url: 18,
      loading_status: 5,
      label: 6,
      show_label: 7,
      container: 8,
      scale: 9,
      min_width: 10,
      gradio: 11,
      height: 12,
      zoom_speed: 13,
      pan_speed: 14,
      interactive: 15
    });
  }
}
export {
  fu as BaseExample,
  oo as BaseModel3DGS,
  $c as BaseModel3DGSUpload,
  mu as default
};
