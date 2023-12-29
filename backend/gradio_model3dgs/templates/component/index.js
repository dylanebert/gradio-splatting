var fn = new Intl.Collator(0, { numeric: 1 }).compare;
function Gl(t, e, n) {
  return t = t.split("."), e = e.split("."), fn(t[0], e[0]) || fn(t[1], e[1]) || (e[2] = e.slice(2).join("."), n = /[.-]/.test(t[2] = t.slice(2).join(".")), n == /[.-]/.test(e[2]) ? fn(t[2], e[2]) : n ? -1 : 1);
}
function at(t, e, n) {
  return e.startsWith("http://") || e.startsWith("https://") ? n ? t : e : t + e;
}
function In(t) {
  if (t.startsWith("http")) {
    const { protocol: e, host: n } = new URL(t);
    return n.endsWith("hf.space") ? {
      ws_protocol: "wss",
      host: n,
      http_protocol: e
    } : {
      ws_protocol: e === "https:" ? "wss" : "ws",
      http_protocol: e,
      host: n
    };
  } else if (t.startsWith("file:"))
    return {
      ws_protocol: "ws",
      http_protocol: "http:",
      host: "lite.local"
      // Special fake hostname only used for this case. This matches the hostname allowed in `is_self_host()` in `js/wasm/network/host.ts`.
    };
  return {
    ws_protocol: "wss",
    http_protocol: "https:",
    host: t
  };
}
const Ki = /^[^\/]*\/[^\/]*$/, ts = /.*hf\.space\/{0,1}$/;
async function ns(t, e) {
  const n = {};
  e && (n.Authorization = `Bearer ${e}`);
  const l = t.trim();
  if (Ki.test(l))
    try {
      const i = await fetch(
        `https://huggingface.co/api/spaces/${l}/host`,
        { headers: n }
      );
      if (i.status !== 200)
        throw new Error("Space metadata could not be loaded.");
      const s = (await i.json()).host;
      return {
        space_id: t,
        ...In(s)
      };
    } catch (i) {
      throw new Error("Space metadata could not be loaded." + i.message);
    }
  if (ts.test(l)) {
    const { ws_protocol: i, http_protocol: s, host: a } = In(l);
    return {
      space_id: a.replace(".hf.space", ""),
      ws_protocol: i,
      http_protocol: s,
      host: a
    };
  }
  return {
    space_id: !1,
    ...In(l)
  };
}
function ls(t) {
  let e = {};
  return t.forEach(({ api_name: n }, l) => {
    n && (e[n] = l);
  }), e;
}
const is = /^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function Sl(t) {
  try {
    const n = (await fetch(
      `https://huggingface.co/api/spaces/${t}/discussions`,
      {
        method: "HEAD"
      }
    )).headers.get("x-error-message");
    return !(n && is.test(n));
  } catch {
    return !1;
  }
}
function ut(t, e, n) {
  if (t == null)
    return null;
  if (Array.isArray(t)) {
    const l = [];
    for (const i of t)
      i == null ? l.push(null) : l.push(ut(i, e, n));
    return l;
  }
  return t.is_stream ? n == null ? new ft({
    ...t,
    url: e + "/stream/" + t.path
  }) : new ft({
    ...t,
    url: "/proxy=" + n + "stream/" + t.path
  }) : new ft({
    ...t,
    url: ss(t.path, e, n)
  });
}
function as(t) {
  try {
    const e = new URL(t);
    return e.protocol === "http:" || e.protocol === "https:";
  } catch {
    return !1;
  }
}
function ss(t, e, n) {
  return t == null ? n ? `/proxy=${n}file=` : `${e}/file=` : as(t) ? t : n ? `/proxy=${n}file=${t}` : `${e}/file=${t}`;
}
async function rs(t, e, n = Fs) {
  let l = (Array.isArray(t) ? t : [t]).map(
    (i) => i.blob
  );
  return await Promise.all(
    await n(e, l).then(
      async (i) => {
        if (i.error)
          throw new Error(i.error);
        return i.files ? i.files.map((s, a) => {
          const r = new ft({ ...t[a], path: s });
          return ut(r, e, null);
        }) : [];
      }
    )
  );
}
async function os(t, e) {
  return t.map(
    (n, l) => new ft({
      path: n.name,
      orig_name: n.name,
      blob: n,
      size: n.size,
      mime_type: n.type,
      is_stream: e
    })
  );
}
class ft {
  constructor({
    path: e,
    url: n,
    orig_name: l,
    size: i,
    blob: s,
    is_stream: a,
    mime_type: r,
    alt_text: d
  }) {
    this.path = e, this.url = n, this.orig_name = l, this.size = i, this.blob = n ? void 0 : s, this.is_stream = a, this.mime_type = r, this.alt_text = d;
  }
}
const ds = "This application is too busy. Keep trying!", Dt = "Connection errored out.";
let Oi;
function cs(t, e) {
  return { post_data: n, upload_files: l, client: i, handle_blob: s };
  async function n(a, r, d) {
    const o = { "Content-Type": "application/json" };
    d && (o.Authorization = `Bearer ${d}`);
    try {
      var c = await t(a, {
        method: "POST",
        body: JSON.stringify(r),
        headers: o
      });
    } catch {
      return [{ error: Dt }, 500];
    }
    return [await c.json(), c.status];
  }
  async function l(a, r, d) {
    const o = {};
    d && (o.Authorization = `Bearer ${d}`);
    const c = 1e3, U = [];
    for (let h = 0; h < r.length; h += c) {
      const u = r.slice(h, h + c), R = new FormData();
      u.forEach((I) => {
        R.append("files", I);
      });
      try {
        var F = await t(`${a}/upload`, {
          method: "POST",
          body: R,
          headers: o
        });
      } catch {
        return { error: Dt };
      }
      const V = await F.json();
      U.push(...V);
    }
    return { files: U };
  }
  async function i(a, r = { normalise_files: !0 }) {
    return new Promise(async (d) => {
      const { status_callback: o, hf_token: c, normalise_files: U } = r, F = {
        predict: J,
        submit: S,
        view_api: ae,
        component_server: me
      }, h = U ?? !0;
      if ((typeof window > "u" || !("WebSocket" in window)) && !global.Websocket) {
        const Y = await import("./wrapper-98f94c21-f7f71f53.js");
        Oi = (await import("./__vite-browser-external-2447137e.js")).Blob, global.WebSocket = Y.WebSocket;
      }
      const { ws_protocol: u, http_protocol: R, host: V, space_id: I } = await ns(a, c), W = Math.random().toString(36).substring(2), m = {};
      let A, p = {}, z = !1;
      c && I && (z = await hs(I, c));
      async function H(Y) {
        if (A = Y, p = ls((Y == null ? void 0 : Y.dependencies) || []), A.auth_required)
          return {
            config: A,
            ...F
          };
        try {
          k = await ae(A);
        } catch (v) {
          console.error(`Could not get api details: ${v.message}`);
        }
        return {
          config: A,
          ...F
        };
      }
      let k;
      async function N(Y) {
        if (o && o(Y), Y.status === "running")
          try {
            A = await Tl(
              t,
              `${R}//${V}`,
              c
            );
            const v = await H(A);
            d(v);
          } catch (v) {
            console.error(v), o && o({
              status: "error",
              message: "Could not load this space.",
              load_status: "error",
              detail: "NOT_FOUND"
            });
          }
      }
      try {
        A = await Tl(
          t,
          `${R}//${V}`,
          c
        );
        const Y = await H(A);
        d(Y);
      } catch (Y) {
        console.error(Y), I ? qn(
          I,
          Ki.test(I) ? "space_name" : "subdomain",
          N
        ) : o && o({
          status: "error",
          message: "Could not load this space.",
          load_status: "error",
          detail: "NOT_FOUND"
        });
      }
      function J(Y, v, Q) {
        let g = !1, X = !1, y;
        if (typeof Y == "number")
          y = A.dependencies[Y];
        else {
          const K = Y.replace(/^\//, "");
          y = A.dependencies[p[K]];
        }
        if (y.types.continuous)
          throw new Error(
            "Cannot call predict on this function as it may run forever. Use submit instead"
          );
        return new Promise((K, de) => {
          const T = S(Y, v, Q);
          let C;
          T.on("data", ($) => {
            X && (T.destroy(), K($)), g = !0, C = $;
          }).on("status", ($) => {
            $.stage === "error" && de($), $.stage === "complete" && (X = !0, g && (T.destroy(), K(C)));
          });
        });
      }
      function S(Y, v, Q) {
        let g, X;
        if (typeof Y == "number")
          g = Y, X = k.unnamed_endpoints[g];
        else {
          const he = Y.replace(/^\//, "");
          g = p[he], X = k.named_endpoints[Y.trim()];
        }
        if (typeof g != "number")
          throw new Error(
            "There is no endpoint matching that name of fn_index matching that number."
          );
        let y, K, de = A.protocol ?? "sse";
        const T = typeof Y == "number" ? "/predict" : Y;
        let C, $ = null, se = !1;
        const re = {};
        let Ye = "";
        typeof window < "u" && (Ye = new URLSearchParams(window.location.search).toString()), s(
          `${R}//${at(V, A.path, !0)}`,
          v,
          X,
          c
        ).then((he) => {
          if (C = { data: he || [], event_data: Q, fn_index: g }, Qs(g, A))
            oe({
              type: "status",
              endpoint: T,
              stage: "pending",
              queue: !1,
              fn_index: g,
              time: /* @__PURE__ */ new Date()
            }), n(
              `${R}//${at(V, A.path, !0)}/run${T.startsWith("/") ? T : `/${T}`}${Ye ? "?" + Ye : ""}`,
              {
                ...C,
                session_hash: W
              },
              c
            ).then(([le, ce]) => {
              const ze = h ? pn(
                le.data,
                X,
                A.root,
                A.root_url
              ) : le.data;
              ce == 200 ? (oe({
                type: "data",
                endpoint: T,
                fn_index: g,
                data: ze,
                time: /* @__PURE__ */ new Date()
              }), oe({
                type: "status",
                endpoint: T,
                fn_index: g,
                stage: "complete",
                eta: le.average_duration,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              })) : oe({
                type: "status",
                stage: "error",
                endpoint: T,
                fn_index: g,
                message: le.error,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            }).catch((le) => {
              oe({
                type: "status",
                stage: "error",
                message: le.message,
                endpoint: T,
                fn_index: g,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            });
          else if (de == "ws") {
            oe({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: T,
              fn_index: g,
              time: /* @__PURE__ */ new Date()
            });
            let le = new URL(`${u}://${at(
              V,
              A.path,
              !0
            )}
							/queue/join${Ye ? "?" + Ye : ""}`);
            z && le.searchParams.set("__sign", z), y = e(le), y.onclose = (ce) => {
              ce.wasClean || oe({
                type: "status",
                stage: "error",
                broken: !0,
                message: Dt,
                queue: !0,
                endpoint: T,
                fn_index: g,
                time: /* @__PURE__ */ new Date()
              });
            }, y.onmessage = function(ce) {
              const ze = JSON.parse(ce.data), { type: fe, status: Fe, data: Ie } = _l(
                ze,
                m[g]
              );
              if (fe === "update" && Fe && !se)
                oe({
                  type: "status",
                  endpoint: T,
                  fn_index: g,
                  time: /* @__PURE__ */ new Date(),
                  ...Fe
                }), Fe.stage === "error" && y.close();
              else if (fe === "hash") {
                y.send(JSON.stringify({ fn_index: g, session_hash: W }));
                return;
              } else
                fe === "data" ? y.send(JSON.stringify({ ...C, session_hash: W })) : fe === "complete" ? se = Fe : fe === "log" ? oe({
                  type: "log",
                  log: Ie.log,
                  level: Ie.level,
                  endpoint: T,
                  fn_index: g
                }) : fe === "generating" && oe({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...Fe,
                  stage: Fe == null ? void 0 : Fe.stage,
                  queue: !0,
                  endpoint: T,
                  fn_index: g
                });
              Ie && (oe({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: h ? pn(
                  Ie.data,
                  X,
                  A.root,
                  A.root_url
                ) : Ie.data,
                endpoint: T,
                fn_index: g
              }), se && (oe({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...se,
                stage: Fe == null ? void 0 : Fe.stage,
                queue: !0,
                endpoint: T,
                fn_index: g
              }), y.close()));
            }, Gl(A.version || "2.0.0", "3.6") < 0 && addEventListener(
              "open",
              () => y.send(JSON.stringify({ hash: W }))
            );
          } else {
            oe({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: T,
              fn_index: g,
              time: /* @__PURE__ */ new Date()
            });
            var Re = new URLSearchParams({
              fn_index: g.toString(),
              session_hash: W
            }).toString();
            let le = new URL(
              `${R}//${at(
                V,
                A.path,
                !0
              )}/queue/join?${Ye ? Ye + "&" : ""}${Re}`
            );
            K = new EventSource(le), K.onmessage = async function(ce) {
              const ze = JSON.parse(ce.data), { type: fe, status: Fe, data: Ie } = _l(
                ze,
                m[g]
              );
              if (fe === "update" && Fe && !se)
                oe({
                  type: "status",
                  endpoint: T,
                  fn_index: g,
                  time: /* @__PURE__ */ new Date(),
                  ...Fe
                }), Fe.stage === "error" && K.close();
              else if (fe === "data") {
                $ = ze.event_id;
                let [El, gn] = await n(
                  `${R}//${at(
                    V,
                    A.path,
                    !0
                  )}/queue/data`,
                  {
                    ...C,
                    session_hash: W,
                    event_id: $
                  },
                  c
                );
                gn !== 200 && (oe({
                  type: "status",
                  stage: "error",
                  message: Dt,
                  queue: !0,
                  endpoint: T,
                  fn_index: g,
                  time: /* @__PURE__ */ new Date()
                }), K.close());
              } else
                fe === "complete" ? se = Fe : fe === "log" ? oe({
                  type: "log",
                  log: Ie.log,
                  level: Ie.level,
                  endpoint: T,
                  fn_index: g
                }) : fe === "generating" && oe({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...Fe,
                  stage: Fe == null ? void 0 : Fe.stage,
                  queue: !0,
                  endpoint: T,
                  fn_index: g
                });
              Ie && (oe({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: h ? pn(
                  Ie.data,
                  X,
                  A.root,
                  A.root_url
                ) : Ie.data,
                endpoint: T,
                fn_index: g
              }), se && (oe({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...se,
                stage: Fe == null ? void 0 : Fe.stage,
                queue: !0,
                endpoint: T,
                fn_index: g
              }), K.close()));
            };
          }
        });
        function oe(he) {
          const le = re[he.type] || [];
          le == null || le.forEach((ce) => ce(he));
        }
        function wt(he, Re) {
          const le = re, ce = le[he] || [];
          return le[he] = ce, ce == null || ce.push(Re), { on: wt, off: ot, cancel: vt, destroy: Ht };
        }
        function ot(he, Re) {
          const le = re;
          let ce = le[he] || [];
          return ce = ce == null ? void 0 : ce.filter((ze) => ze !== Re), le[he] = ce, { on: wt, off: ot, cancel: vt, destroy: Ht };
        }
        async function vt() {
          const he = {
            stage: "complete",
            queue: !1,
            time: /* @__PURE__ */ new Date()
          };
          se = he, oe({
            ...he,
            type: "status",
            endpoint: T,
            fn_index: g
          });
          let Re = {};
          de === "ws" ? (y && y.readyState === 0 ? y.addEventListener("open", () => {
            y.close();
          }) : y.close(), Re = { fn_index: g, session_hash: W }) : (K.close(), Re = { event_id: $ });
          try {
            await t(
              `${R}//${at(
                V,
                A.path,
                !0
              )}/reset`,
              {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(Re)
              }
            );
          } catch {
            console.warn(
              "The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
            );
          }
        }
        function Ht() {
          for (const he in re)
            re[he].forEach((Re) => {
              ot(he, Re);
            });
        }
        return {
          on: wt,
          off: ot,
          cancel: vt,
          destroy: Ht
        };
      }
      async function me(Y, v, Q) {
        var g;
        const X = { "Content-Type": "application/json" };
        c && (X.Authorization = `Bearer ${c}`);
        let y, K = A.components.find(
          (C) => C.id === Y
        );
        (g = K == null ? void 0 : K.props) != null && g.root_url ? y = K.props.root_url : y = `${R}//${at(
          V,
          A.path,
          !0
        )}/`;
        const de = await t(
          `${y}component_server/`,
          {
            method: "POST",
            body: JSON.stringify({
              data: Q,
              component_id: Y,
              fn_name: v,
              session_hash: W
            }),
            headers: X
          }
        );
        if (!de.ok)
          throw new Error(
            "Could not connect to component server: " + de.statusText
          );
        return await de.json();
      }
      async function ae(Y) {
        if (k)
          return k;
        const v = { "Content-Type": "application/json" };
        c && (v.Authorization = `Bearer ${c}`);
        let Q;
        if (Gl(Y.version || "2.0.0", "3.30") < 0 ? Q = await t(
          "https://gradio-space-api-fetcher-v2.hf.space/api",
          {
            method: "POST",
            body: JSON.stringify({
              serialize: !1,
              config: JSON.stringify(Y)
            }),
            headers: v
          }
        ) : Q = await t(`${Y.root}/info`, {
          headers: v
        }), !Q.ok)
          throw new Error(Dt);
        let g = await Q.json();
        return "api" in g && (g = g.api), g.named_endpoints["/predict"] && !g.unnamed_endpoints[0] && (g.unnamed_endpoints[0] = g.named_endpoints["/predict"]), Us(g, Y, p);
      }
    });
  }
  async function s(a, r, d, o) {
    const c = await Pn(
      r,
      void 0,
      [],
      !0,
      d
    );
    return Promise.all(
      c.map(async ({ path: U, blob: F, type: h }) => {
        if (F) {
          const u = (await l(a, [F], o)).files[0];
          return { path: U, file_url: u, type: h, name: F == null ? void 0 : F.name };
        }
        return { path: U, type: h };
      })
    ).then((U) => (U.forEach(({ path: F, file_url: h, type: u, name: R }) => {
      if (u === "Gallery")
        Yl(r, h, F);
      else if (h) {
        const V = new ft({ path: h, orig_name: R });
        Yl(r, V, F);
      }
    }), r));
  }
}
const { post_data: xF, upload_files: Fs, client: MF, handle_blob: zF } = cs(
  fetch,
  (...t) => new WebSocket(...t)
);
function pn(t, e, n, l) {
  return t.map((i, s) => {
    var a, r, d, o;
    return ((r = (a = e == null ? void 0 : e.returns) == null ? void 0 : a[s]) == null ? void 0 : r.component) === "File" ? ut(i, n, l) : ((o = (d = e == null ? void 0 : e.returns) == null ? void 0 : d[s]) == null ? void 0 : o.component) === "Gallery" ? i.map((c) => Array.isArray(c) ? [ut(c[0], n, l), c[1]] : [ut(c, n, l), null]) : typeof i == "object" && i.path ? ut(i, n, l) : i;
  });
}
function Xl(t, e, n, l) {
  switch (t.type) {
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
  if (e === "Image")
    return l === "parameter" ? "Blob | File | Buffer" : "string";
  if (n === "FileSerializable")
    return (t == null ? void 0 : t.type) === "array" ? l === "parameter" ? "(Blob | File | Buffer)[]" : "{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}[]" : l === "parameter" ? "Blob | File | Buffer" : "{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}";
  if (n === "GallerySerializable")
    return l === "parameter" ? "[(Blob | File | Buffer), (string | null)][]" : "[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]";
}
function kl(t, e) {
  return e === "GallerySerializable" ? "array of [file, label] tuples" : e === "ListStringSerializable" ? "array of strings" : e === "FileSerializable" ? "array of files or single file" : t.description;
}
function Us(t, e, n) {
  const l = {
    named_endpoints: {},
    unnamed_endpoints: {}
  };
  for (const i in t) {
    const s = t[i];
    for (const a in s) {
      const r = e.dependencies[a] ? a : n[a.replace("/", "")], d = s[a];
      l[i][a] = {}, l[i][a].parameters = {}, l[i][a].returns = {}, l[i][a].type = e.dependencies[r].types, l[i][a].parameters = d.parameters.map(
        ({ label: o, component: c, type: U, serializer: F }) => ({
          label: o,
          component: c,
          type: Xl(U, c, F, "parameter"),
          description: kl(U, F)
        })
      ), l[i][a].returns = d.returns.map(
        ({ label: o, component: c, type: U, serializer: F }) => ({
          label: o,
          component: c,
          type: Xl(U, c, F, "return"),
          description: kl(U, F)
        })
      );
    }
  }
  return l;
}
async function hs(t, e) {
  try {
    return (await (await fetch(`https://huggingface.co/api/spaces/${t}/jwt`, {
      headers: {
        Authorization: `Bearer ${e}`
      }
    })).json()).token || !1;
  } catch (n) {
    return console.error(n), !1;
  }
}
function Yl(t, e, n) {
  for (; n.length > 1; )
    t = t[n.shift()];
  t[n.shift()] = e;
}
async function Pn(t, e = void 0, n = [], l = !1, i = void 0) {
  if (Array.isArray(t)) {
    let s = [];
    return await Promise.all(
      t.map(async (a, r) => {
        var d;
        let o = n.slice();
        o.push(r);
        const c = await Pn(
          t[r],
          l ? ((d = i == null ? void 0 : i.parameters[r]) == null ? void 0 : d.component) || void 0 : e,
          o,
          !1,
          i
        );
        s = s.concat(c);
      })
    ), s;
  } else {
    if (globalThis.Buffer && t instanceof globalThis.Buffer)
      return [
        {
          path: n,
          blob: e === "Image" ? !1 : new Oi([t]),
          type: e
        }
      ];
    if (typeof t == "object") {
      let s = [];
      for (let a in t)
        if (t.hasOwnProperty(a)) {
          let r = n.slice();
          r.push(a), s = s.concat(
            await Pn(
              t[a],
              void 0,
              r,
              !1,
              i
            )
          );
        }
      return s;
    }
  }
  return [];
}
function Qs(t, e) {
  var n, l, i, s;
  return !(((l = (n = e == null ? void 0 : e.dependencies) == null ? void 0 : n[t]) == null ? void 0 : l.queue) === null ? e.enable_queue : (s = (i = e == null ? void 0 : e.dependencies) == null ? void 0 : i[t]) != null && s.queue) || !1;
}
async function Tl(t, e, n) {
  const l = {};
  if (n && (l.Authorization = `Bearer ${n}`), typeof window < "u" && window.gradio_config && location.origin !== "http://localhost:9876" && !window.gradio_config.dev_mode) {
    const i = window.gradio_config.root, s = window.gradio_config;
    return s.root = at(e, s.root, !1), { ...s, path: i };
  } else if (e) {
    let i = await t(`${e}/config`, {
      headers: l
    });
    if (i.status === 200) {
      const s = await i.json();
      return s.path = s.path ?? "", s.root = e, s;
    }
    throw new Error("Could not get config.");
  }
  throw new Error("No config or app endpoint found");
}
async function qn(t, e, n) {
  let l = e === "subdomain" ? `https://huggingface.co/api/spaces/by-subdomain/${t}` : `https://huggingface.co/api/spaces/${t}`, i, s;
  try {
    if (i = await fetch(l), s = i.status, s !== 200)
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
  if (!i || s !== 200)
    return;
  const {
    runtime: { stage: a },
    id: r
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
        qn(t, e, n);
      }, 1e3);
      break;
    case "PAUSED":
      n({
        status: "paused",
        load_status: "error",
        message: "This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
        detail: a,
        discussions_enabled: await Sl(r)
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
        qn(t, e, n);
      }, 1e3);
      break;
    default:
      n({
        status: "space_error",
        load_status: "error",
        message: "This space is experiencing an issue.",
        detail: a,
        discussions_enabled: await Sl(r)
      });
      break;
  }
}
function _l(t, e) {
  switch (t.msg) {
    case "send_data":
      return { type: "data" };
    case "send_hash":
      return { type: "hash" };
    case "queue_full":
      return {
        type: "update",
        status: {
          queue: !0,
          message: ds,
          stage: "error",
          code: t.code,
          success: t.success
        }
      };
    case "estimation":
      return {
        type: "update",
        status: {
          queue: !0,
          stage: e || "pending",
          code: t.code,
          size: t.queue_size,
          position: t.rank,
          eta: t.rank_eta,
          success: t.success
        }
      };
    case "progress":
      return {
        type: "update",
        status: {
          queue: !0,
          stage: "pending",
          code: t.code,
          progress_data: t.progress_data,
          success: t.success
        }
      };
    case "log":
      return { type: "log", data: t };
    case "process_generating":
      return {
        type: "generating",
        status: {
          queue: !0,
          message: t.success ? null : t.output.error,
          stage: t.success ? "generating" : "error",
          code: t.code,
          progress_data: t.progress_data,
          eta: t.average_duration
        },
        data: t.success ? t.output : null
      };
    case "process_completed":
      return "error" in t.output ? {
        type: "update",
        status: {
          queue: !0,
          message: t.output.error,
          stage: "error",
          code: t.code,
          success: t.success
        }
      } : {
        type: "complete",
        status: {
          queue: !0,
          message: t.success ? void 0 : t.output.error,
          stage: t.success ? "complete" : "error",
          code: t.code,
          progress_data: t.progress_data,
          eta: t.output.average_duration
        },
        data: t.success ? t.output : null
      };
    case "process_starts":
      return {
        type: "update",
        status: {
          queue: !0,
          stage: "pending",
          code: t.code,
          size: t.rank,
          position: 0,
          success: t.success
        }
      };
  }
  return { type: "none", status: { stage: "error", queue: !0 } };
}
const {
  SvelteComponent: Bs,
  assign: us,
  create_slot: As,
  detach: Vs,
  element: Zs,
  get_all_dirty_from_scope: ms,
  get_slot_changes: Rs,
  get_spread_update: bs,
  init: gs,
  insert: Ws,
  safe_not_equal: fs,
  set_dynamic_element_data: wl,
  set_style: pe,
  toggle_class: et,
  transition_in: Li,
  transition_out: Pi,
  update_slot_base: Is
} = window.__gradio__svelte__internal;
function ps(t) {
  let e, n, l;
  const i = (
    /*#slots*/
    t[17].default
  ), s = As(
    i,
    t,
    /*$$scope*/
    t[16],
    null
  );
  let a = [
    { "data-testid": (
      /*test_id*/
      t[7]
    ) },
    { id: (
      /*elem_id*/
      t[2]
    ) },
    {
      class: n = "block " + /*elem_classes*/
      t[3].join(" ") + " svelte-1t38q2d"
    }
  ], r = {};
  for (let d = 0; d < a.length; d += 1)
    r = us(r, a[d]);
  return {
    c() {
      e = Zs(
        /*tag*/
        t[14]
      ), s && s.c(), wl(
        /*tag*/
        t[14]
      )(e, r), et(
        e,
        "hidden",
        /*visible*/
        t[10] === !1
      ), et(
        e,
        "padded",
        /*padding*/
        t[6]
      ), et(
        e,
        "border_focus",
        /*border_mode*/
        t[5] === "focus"
      ), et(e, "hide-container", !/*explicit_call*/
      t[8] && !/*container*/
      t[9]), pe(e, "height", typeof /*height*/
      t[0] == "number" ? (
        /*height*/
        t[0] + "px"
      ) : void 0), pe(e, "width", typeof /*width*/
      t[1] == "number" ? `calc(min(${/*width*/
      t[1]}px, 100%))` : void 0), pe(
        e,
        "border-style",
        /*variant*/
        t[4]
      ), pe(
        e,
        "overflow",
        /*allow_overflow*/
        t[11] ? "visible" : "hidden"
      ), pe(
        e,
        "flex-grow",
        /*scale*/
        t[12]
      ), pe(e, "min-width", `calc(min(${/*min_width*/
      t[13]}px, 100%))`), pe(e, "border-width", "var(--block-border-width)");
    },
    m(d, o) {
      Ws(d, e, o), s && s.m(e, null), l = !0;
    },
    p(d, o) {
      s && s.p && (!l || o & /*$$scope*/
      65536) && Is(
        s,
        i,
        d,
        /*$$scope*/
        d[16],
        l ? Rs(
          i,
          /*$$scope*/
          d[16],
          o,
          null
        ) : ms(
          /*$$scope*/
          d[16]
        ),
        null
      ), wl(
        /*tag*/
        d[14]
      )(e, r = bs(a, [
        (!l || o & /*test_id*/
        128) && { "data-testid": (
          /*test_id*/
          d[7]
        ) },
        (!l || o & /*elem_id*/
        4) && { id: (
          /*elem_id*/
          d[2]
        ) },
        (!l || o & /*elem_classes*/
        8 && n !== (n = "block " + /*elem_classes*/
        d[3].join(" ") + " svelte-1t38q2d")) && { class: n }
      ])), et(
        e,
        "hidden",
        /*visible*/
        d[10] === !1
      ), et(
        e,
        "padded",
        /*padding*/
        d[6]
      ), et(
        e,
        "border_focus",
        /*border_mode*/
        d[5] === "focus"
      ), et(e, "hide-container", !/*explicit_call*/
      d[8] && !/*container*/
      d[9]), o & /*height*/
      1 && pe(e, "height", typeof /*height*/
      d[0] == "number" ? (
        /*height*/
        d[0] + "px"
      ) : void 0), o & /*width*/
      2 && pe(e, "width", typeof /*width*/
      d[1] == "number" ? `calc(min(${/*width*/
      d[1]}px, 100%))` : void 0), o & /*variant*/
      16 && pe(
        e,
        "border-style",
        /*variant*/
        d[4]
      ), o & /*allow_overflow*/
      2048 && pe(
        e,
        "overflow",
        /*allow_overflow*/
        d[11] ? "visible" : "hidden"
      ), o & /*scale*/
      4096 && pe(
        e,
        "flex-grow",
        /*scale*/
        d[12]
      ), o & /*min_width*/
      8192 && pe(e, "min-width", `calc(min(${/*min_width*/
      d[13]}px, 100%))`);
    },
    i(d) {
      l || (Li(s, d), l = !0);
    },
    o(d) {
      Pi(s, d), l = !1;
    },
    d(d) {
      d && Vs(e), s && s.d(d);
    }
  };
}
function Js(t) {
  let e, n = (
    /*tag*/
    t[14] && ps(t)
  );
  return {
    c() {
      n && n.c();
    },
    m(l, i) {
      n && n.m(l, i), e = !0;
    },
    p(l, [i]) {
      /*tag*/
      l[14] && n.p(l, i);
    },
    i(l) {
      e || (Li(n, l), e = !0);
    },
    o(l) {
      Pi(n, l), e = !1;
    },
    d(l) {
      n && n.d(l);
    }
  };
}
function Cs(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e, { height: s = void 0 } = e, { width: a = void 0 } = e, { elem_id: r = "" } = e, { elem_classes: d = [] } = e, { variant: o = "solid" } = e, { border_mode: c = "base" } = e, { padding: U = !0 } = e, { type: F = "normal" } = e, { test_id: h = void 0 } = e, { explicit_call: u = !1 } = e, { container: R = !0 } = e, { visible: V = !0 } = e, { allow_overflow: I = !0 } = e, { scale: W = null } = e, { min_width: m = 0 } = e, A = F === "fieldset" ? "fieldset" : "div";
  return t.$$set = (p) => {
    "height" in p && n(0, s = p.height), "width" in p && n(1, a = p.width), "elem_id" in p && n(2, r = p.elem_id), "elem_classes" in p && n(3, d = p.elem_classes), "variant" in p && n(4, o = p.variant), "border_mode" in p && n(5, c = p.border_mode), "padding" in p && n(6, U = p.padding), "type" in p && n(15, F = p.type), "test_id" in p && n(7, h = p.test_id), "explicit_call" in p && n(8, u = p.explicit_call), "container" in p && n(9, R = p.container), "visible" in p && n(10, V = p.visible), "allow_overflow" in p && n(11, I = p.allow_overflow), "scale" in p && n(12, W = p.scale), "min_width" in p && n(13, m = p.min_width), "$$scope" in p && n(16, i = p.$$scope);
  }, [
    s,
    a,
    r,
    d,
    o,
    c,
    U,
    h,
    u,
    R,
    V,
    I,
    W,
    m,
    A,
    F,
    i,
    l
  ];
}
class qi extends Bs {
  constructor(e) {
    super(), gs(this, e, Cs, Js, fs, {
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
  SvelteComponent: Ns,
  append: Jn,
  attr: tn,
  create_component: Es,
  destroy_component: ys,
  detach: Gs,
  element: vl,
  init: Ss,
  insert: Xs,
  mount_component: ks,
  safe_not_equal: Ys,
  set_data: Ts,
  space: _s,
  text: ws,
  toggle_class: tt,
  transition_in: vs,
  transition_out: Hs
} = window.__gradio__svelte__internal;
function Ds(t) {
  let e, n, l, i, s, a;
  return l = new /*Icon*/
  t[1]({}), {
    c() {
      e = vl("label"), n = vl("span"), Es(l.$$.fragment), i = _s(), s = ws(
        /*label*/
        t[0]
      ), tn(n, "class", "svelte-9gxdi0"), tn(e, "for", ""), tn(e, "data-testid", "block-label"), tn(e, "class", "svelte-9gxdi0"), tt(e, "hide", !/*show_label*/
      t[2]), tt(e, "sr-only", !/*show_label*/
      t[2]), tt(
        e,
        "float",
        /*float*/
        t[4]
      ), tt(
        e,
        "hide-label",
        /*disable*/
        t[3]
      );
    },
    m(r, d) {
      Xs(r, e, d), Jn(e, n), ks(l, n, null), Jn(e, i), Jn(e, s), a = !0;
    },
    p(r, [d]) {
      (!a || d & /*label*/
      1) && Ts(
        s,
        /*label*/
        r[0]
      ), (!a || d & /*show_label*/
      4) && tt(e, "hide", !/*show_label*/
      r[2]), (!a || d & /*show_label*/
      4) && tt(e, "sr-only", !/*show_label*/
      r[2]), (!a || d & /*float*/
      16) && tt(
        e,
        "float",
        /*float*/
        r[4]
      ), (!a || d & /*disable*/
      8) && tt(
        e,
        "hide-label",
        /*disable*/
        r[3]
      );
    },
    i(r) {
      a || (vs(l.$$.fragment, r), a = !0);
    },
    o(r) {
      Hs(l.$$.fragment, r), a = !1;
    },
    d(r) {
      r && Gs(e), ys(l);
    }
  };
}
function xs(t, e, n) {
  let { label: l = null } = e, { Icon: i } = e, { show_label: s = !0 } = e, { disable: a = !1 } = e, { float: r = !0 } = e;
  return t.$$set = (d) => {
    "label" in d && n(0, l = d.label), "Icon" in d && n(1, i = d.Icon), "show_label" in d && n(2, s = d.show_label), "disable" in d && n(3, a = d.disable), "float" in d && n(4, r = d.float);
  }, [l, i, s, a, r];
}
class un extends Ns {
  constructor(e) {
    super(), Ss(this, e, xs, Ds, Ys, {
      label: 0,
      Icon: 1,
      show_label: 2,
      disable: 3,
      float: 4
    });
  }
}
const {
  SvelteComponent: Ms,
  append: $n,
  attr: Qt,
  bubble: zs,
  create_component: js,
  destroy_component: Ks,
  detach: $i,
  element: el,
  init: Os,
  insert: ea,
  listen: Ls,
  mount_component: Ps,
  safe_not_equal: qs,
  set_data: $s,
  space: er,
  text: tr,
  toggle_class: nt,
  transition_in: nr,
  transition_out: lr
} = window.__gradio__svelte__internal;
function Hl(t) {
  let e, n;
  return {
    c() {
      e = el("span"), n = tr(
        /*label*/
        t[1]
      ), Qt(e, "class", "svelte-xtz2g8");
    },
    m(l, i) {
      ea(l, e, i), $n(e, n);
    },
    p(l, i) {
      i & /*label*/
      2 && $s(
        n,
        /*label*/
        l[1]
      );
    },
    d(l) {
      l && $i(e);
    }
  };
}
function ir(t) {
  let e, n, l, i, s, a, r, d = (
    /*show_label*/
    t[2] && Hl(t)
  );
  return i = new /*Icon*/
  t[0]({}), {
    c() {
      e = el("button"), d && d.c(), n = er(), l = el("div"), js(i.$$.fragment), Qt(l, "class", "svelte-xtz2g8"), nt(
        l,
        "small",
        /*size*/
        t[4] === "small"
      ), nt(
        l,
        "large",
        /*size*/
        t[4] === "large"
      ), Qt(
        e,
        "aria-label",
        /*label*/
        t[1]
      ), Qt(
        e,
        "title",
        /*label*/
        t[1]
      ), Qt(e, "class", "svelte-xtz2g8"), nt(
        e,
        "pending",
        /*pending*/
        t[3]
      ), nt(
        e,
        "padded",
        /*padded*/
        t[5]
      );
    },
    m(o, c) {
      ea(o, e, c), d && d.m(e, null), $n(e, n), $n(e, l), Ps(i, l, null), s = !0, a || (r = Ls(
        e,
        "click",
        /*click_handler*/
        t[6]
      ), a = !0);
    },
    p(o, [c]) {
      /*show_label*/
      o[2] ? d ? d.p(o, c) : (d = Hl(o), d.c(), d.m(e, n)) : d && (d.d(1), d = null), (!s || c & /*size*/
      16) && nt(
        l,
        "small",
        /*size*/
        o[4] === "small"
      ), (!s || c & /*size*/
      16) && nt(
        l,
        "large",
        /*size*/
        o[4] === "large"
      ), (!s || c & /*label*/
      2) && Qt(
        e,
        "aria-label",
        /*label*/
        o[1]
      ), (!s || c & /*label*/
      2) && Qt(
        e,
        "title",
        /*label*/
        o[1]
      ), (!s || c & /*pending*/
      8) && nt(
        e,
        "pending",
        /*pending*/
        o[3]
      ), (!s || c & /*padded*/
      32) && nt(
        e,
        "padded",
        /*padded*/
        o[5]
      );
    },
    i(o) {
      s || (nr(i.$$.fragment, o), s = !0);
    },
    o(o) {
      lr(i.$$.fragment, o), s = !1;
    },
    d(o) {
      o && $i(e), d && d.d(), Ks(i), a = !1, r();
    }
  };
}
function ar(t, e, n) {
  let { Icon: l } = e, { label: i = "" } = e, { show_label: s = !1 } = e, { pending: a = !1 } = e, { size: r = "small" } = e, { padded: d = !0 } = e;
  function o(c) {
    zs.call(this, t, c);
  }
  return t.$$set = (c) => {
    "Icon" in c && n(0, l = c.Icon), "label" in c && n(1, i = c.label), "show_label" in c && n(2, s = c.show_label), "pending" in c && n(3, a = c.pending), "size" in c && n(4, r = c.size), "padded" in c && n(5, d = c.padded);
  }, [l, i, s, a, r, d, o];
}
class An extends Ms {
  constructor(e) {
    super(), Os(this, e, ar, ir, qs, {
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
  SvelteComponent: sr,
  append: rr,
  attr: Cn,
  binding_callbacks: or,
  create_slot: dr,
  detach: cr,
  element: Dl,
  get_all_dirty_from_scope: Fr,
  get_slot_changes: Ur,
  init: hr,
  insert: Qr,
  safe_not_equal: Br,
  toggle_class: lt,
  transition_in: ur,
  transition_out: Ar,
  update_slot_base: Vr
} = window.__gradio__svelte__internal;
function Zr(t) {
  let e, n, l;
  const i = (
    /*#slots*/
    t[5].default
  ), s = dr(
    i,
    t,
    /*$$scope*/
    t[4],
    null
  );
  return {
    c() {
      e = Dl("div"), n = Dl("div"), s && s.c(), Cn(n, "class", "icon svelte-3w3rth"), Cn(e, "class", "empty svelte-3w3rth"), Cn(e, "aria-label", "Empty value"), lt(
        e,
        "small",
        /*size*/
        t[0] === "small"
      ), lt(
        e,
        "large",
        /*size*/
        t[0] === "large"
      ), lt(
        e,
        "unpadded_box",
        /*unpadded_box*/
        t[1]
      ), lt(
        e,
        "small_parent",
        /*parent_height*/
        t[3]
      );
    },
    m(a, r) {
      Qr(a, e, r), rr(e, n), s && s.m(n, null), t[6](e), l = !0;
    },
    p(a, [r]) {
      s && s.p && (!l || r & /*$$scope*/
      16) && Vr(
        s,
        i,
        a,
        /*$$scope*/
        a[4],
        l ? Ur(
          i,
          /*$$scope*/
          a[4],
          r,
          null
        ) : Fr(
          /*$$scope*/
          a[4]
        ),
        null
      ), (!l || r & /*size*/
      1) && lt(
        e,
        "small",
        /*size*/
        a[0] === "small"
      ), (!l || r & /*size*/
      1) && lt(
        e,
        "large",
        /*size*/
        a[0] === "large"
      ), (!l || r & /*unpadded_box*/
      2) && lt(
        e,
        "unpadded_box",
        /*unpadded_box*/
        a[1]
      ), (!l || r & /*parent_height*/
      8) && lt(
        e,
        "small_parent",
        /*parent_height*/
        a[3]
      );
    },
    i(a) {
      l || (ur(s, a), l = !0);
    },
    o(a) {
      Ar(s, a), l = !1;
    },
    d(a) {
      a && cr(e), s && s.d(a), t[6](null);
    }
  };
}
function mr(t) {
  let e, n = t[0], l = 1;
  for (; l < t.length; ) {
    const i = t[l], s = t[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (e = n, n = s(n)) : (i === "call" || i === "optionalCall") && (n = s((...a) => n.call(e, ...a)), e = void 0);
  }
  return n;
}
function Rr(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { size: a = "small" } = e, { unpadded_box: r = !1 } = e, d;
  function o(U) {
    if (!U)
      return !1;
    const { height: F } = U.getBoundingClientRect(), { height: h } = mr([
      U,
      "access",
      (u) => u.parentElement,
      "optionalAccess",
      (u) => u.getBoundingClientRect,
      "call",
      (u) => u()
    ]) || { height: F };
    return F > h + 2;
  }
  function c(U) {
    or[U ? "unshift" : "push"](() => {
      d = U, n(2, d);
    });
  }
  return t.$$set = (U) => {
    "size" in U && n(0, a = U.size), "unpadded_box" in U && n(1, r = U.unpadded_box), "$$scope" in U && n(4, s = U.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty & /*el*/
    4 && n(3, l = o(d));
  }, [a, r, d, l, s, i, c];
}
class br extends sr {
  constructor(e) {
    super(), hr(this, e, Rr, Zr, Br, { size: 0, unpadded_box: 1 });
  }
}
const {
  SvelteComponent: gr,
  append: Nn,
  attr: _e,
  detach: Wr,
  init: fr,
  insert: Ir,
  noop: En,
  safe_not_equal: pr,
  set_style: je,
  svg_element: nn
} = window.__gradio__svelte__internal;
function Jr(t) {
  let e, n, l, i;
  return {
    c() {
      e = nn("svg"), n = nn("g"), l = nn("path"), i = nn("path"), _e(l, "d", "M18,6L6.087,17.913"), je(l, "fill", "none"), je(l, "fill-rule", "nonzero"), je(l, "stroke-width", "2px"), _e(n, "transform", "matrix(1.14096,-0.140958,-0.140958,1.14096,-0.0559523,0.0559523)"), _e(i, "d", "M4.364,4.364L19.636,19.636"), je(i, "fill", "none"), je(i, "fill-rule", "nonzero"), je(i, "stroke-width", "2px"), _e(e, "width", "100%"), _e(e, "height", "100%"), _e(e, "viewBox", "0 0 24 24"), _e(e, "version", "1.1"), _e(e, "xmlns", "http://www.w3.org/2000/svg"), _e(e, "xmlns:xlink", "http://www.w3.org/1999/xlink"), _e(e, "xml:space", "preserve"), _e(e, "stroke", "currentColor"), je(e, "fill-rule", "evenodd"), je(e, "clip-rule", "evenodd"), je(e, "stroke-linecap", "round"), je(e, "stroke-linejoin", "round");
    },
    m(s, a) {
      Ir(s, e, a), Nn(e, n), Nn(n, l), Nn(e, i);
    },
    p: En,
    i: En,
    o: En,
    d(s) {
      s && Wr(e);
    }
  };
}
class Cr extends gr {
  constructor(e) {
    super(), fr(this, e, null, Jr, pr, {});
  }
}
const {
  SvelteComponent: Nr,
  append: Er,
  attr: Rt,
  detach: yr,
  init: Gr,
  insert: Sr,
  noop: yn,
  safe_not_equal: Xr,
  svg_element: xl
} = window.__gradio__svelte__internal;
function kr(t) {
  let e, n;
  return {
    c() {
      e = xl("svg"), n = xl("path"), Rt(n, "fill", "currentColor"), Rt(n, "d", "M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z"), Rt(e, "xmlns", "http://www.w3.org/2000/svg"), Rt(e, "width", "100%"), Rt(e, "height", "100%"), Rt(e, "viewBox", "0 0 32 32");
    },
    m(l, i) {
      Sr(l, e, i), Er(e, n);
    },
    p: yn,
    i: yn,
    o: yn,
    d(l) {
      l && yr(e);
    }
  };
}
class Yr extends Nr {
  constructor(e) {
    super(), Gr(this, e, null, kr, Xr, {});
  }
}
const {
  SvelteComponent: Tr,
  append: _r,
  attr: we,
  detach: wr,
  init: vr,
  insert: Hr,
  noop: Gn,
  safe_not_equal: Dr,
  svg_element: Ml
} = window.__gradio__svelte__internal;
function xr(t) {
  let e, n;
  return {
    c() {
      e = Ml("svg"), n = Ml("path"), we(n, "d", "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"), we(e, "xmlns", "http://www.w3.org/2000/svg"), we(e, "width", "100%"), we(e, "height", "100%"), we(e, "viewBox", "0 0 24 24"), we(e, "fill", "none"), we(e, "stroke", "currentColor"), we(e, "stroke-width", "1.5"), we(e, "stroke-linecap", "round"), we(e, "stroke-linejoin", "round"), we(e, "class", "feather feather-edit-2");
    },
    m(l, i) {
      Hr(l, e, i), _r(e, n);
    },
    p: Gn,
    i: Gn,
    o: Gn,
    d(l) {
      l && wr(e);
    }
  };
}
class Mr extends Tr {
  constructor(e) {
    super(), vr(this, e, null, xr, Dr, {});
  }
}
const {
  SvelteComponent: zr,
  append: zl,
  attr: Ne,
  detach: jr,
  init: Kr,
  insert: Or,
  noop: Sn,
  safe_not_equal: Lr,
  svg_element: Xn
} = window.__gradio__svelte__internal;
function Pr(t) {
  let e, n, l;
  return {
    c() {
      e = Xn("svg"), n = Xn("path"), l = Xn("polyline"), Ne(n, "d", "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"), Ne(l, "points", "13 2 13 9 20 9"), Ne(e, "xmlns", "http://www.w3.org/2000/svg"), Ne(e, "width", "100%"), Ne(e, "height", "100%"), Ne(e, "viewBox", "0 0 24 24"), Ne(e, "fill", "none"), Ne(e, "stroke", "currentColor"), Ne(e, "stroke-width", "1.5"), Ne(e, "stroke-linecap", "round"), Ne(e, "stroke-linejoin", "round"), Ne(e, "class", "feather feather-file");
    },
    m(i, s) {
      Or(i, e, s), zl(e, n), zl(e, l);
    },
    p: Sn,
    i: Sn,
    o: Sn,
    d(i) {
      i && jr(e);
    }
  };
}
let Ot = class extends zr {
  constructor(e) {
    super(), Kr(this, e, null, Pr, Lr, {});
  }
};
const {
  SvelteComponent: qr,
  append: jl,
  attr: Ee,
  detach: $r,
  init: eo,
  insert: to,
  noop: kn,
  safe_not_equal: no,
  svg_element: Yn
} = window.__gradio__svelte__internal;
function lo(t) {
  let e, n, l;
  return {
    c() {
      e = Yn("svg"), n = Yn("polyline"), l = Yn("path"), Ee(n, "points", "1 4 1 10 7 10"), Ee(l, "d", "M3.51 15a9 9 0 1 0 2.13-9.36L1 10"), Ee(e, "xmlns", "http://www.w3.org/2000/svg"), Ee(e, "width", "100%"), Ee(e, "height", "100%"), Ee(e, "viewBox", "0 0 24 24"), Ee(e, "fill", "none"), Ee(e, "stroke", "currentColor"), Ee(e, "stroke-width", "2"), Ee(e, "stroke-linecap", "round"), Ee(e, "stroke-linejoin", "round"), Ee(e, "class", "feather feather-rotate-ccw");
    },
    m(i, s) {
      to(i, e, s), jl(e, n), jl(e, l);
    },
    p: kn,
    i: kn,
    o: kn,
    d(i) {
      i && $r(e);
    }
  };
}
class io extends qr {
  constructor(e) {
    super(), eo(this, e, null, lo, no, {});
  }
}
const {
  SvelteComponent: ao,
  append: Tn,
  attr: Ve,
  detach: so,
  init: ro,
  insert: oo,
  noop: _n,
  safe_not_equal: co,
  svg_element: ln
} = window.__gradio__svelte__internal;
function Fo(t) {
  let e, n, l, i;
  return {
    c() {
      e = ln("svg"), n = ln("path"), l = ln("polyline"), i = ln("line"), Ve(n, "d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), Ve(l, "points", "17 8 12 3 7 8"), Ve(i, "x1", "12"), Ve(i, "y1", "3"), Ve(i, "x2", "12"), Ve(i, "y2", "15"), Ve(e, "xmlns", "http://www.w3.org/2000/svg"), Ve(e, "width", "90%"), Ve(e, "height", "90%"), Ve(e, "viewBox", "0 0 24 24"), Ve(e, "fill", "none"), Ve(e, "stroke", "currentColor"), Ve(e, "stroke-width", "2"), Ve(e, "stroke-linecap", "round"), Ve(e, "stroke-linejoin", "round"), Ve(e, "class", "feather feather-upload");
    },
    m(s, a) {
      oo(s, e, a), Tn(e, n), Tn(e, l), Tn(e, i);
    },
    p: _n,
    i: _n,
    o: _n,
    d(s) {
      s && so(e);
    }
  };
}
let Uo = class extends ao {
  constructor(e) {
    super(), ro(this, e, null, Fo, co, {});
  }
};
const ho = [
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
], Kl = {
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
ho.reduce(
  (t, { color: e, primary: n, secondary: l }) => ({
    ...t,
    [e]: {
      primary: Kl[e][n],
      secondary: Kl[e][l]
    }
  }),
  {}
);
const {
  SvelteComponent: Qo,
  append: At,
  attr: tl,
  create_component: Bo,
  destroy_component: uo,
  detach: on,
  element: nl,
  init: Ao,
  insert: dn,
  mount_component: Vo,
  safe_not_equal: Zo,
  set_data: ll,
  space: il,
  text: Mt,
  toggle_class: Ol,
  transition_in: mo,
  transition_out: Ro
} = window.__gradio__svelte__internal;
function Ll(t) {
  let e, n, l = (
    /*i18n*/
    t[1]("common.or") + ""
  ), i, s, a, r = (
    /*message*/
    (t[2] || /*i18n*/
    t[1]("upload_text.click_to_upload")) + ""
  ), d;
  return {
    c() {
      e = nl("span"), n = Mt("- "), i = Mt(l), s = Mt(" -"), a = il(), d = Mt(r), tl(e, "class", "or svelte-kzcjhc");
    },
    m(o, c) {
      dn(o, e, c), At(e, n), At(e, i), At(e, s), dn(o, a, c), dn(o, d, c);
    },
    p(o, c) {
      c & /*i18n*/
      2 && l !== (l = /*i18n*/
      o[1]("common.or") + "") && ll(i, l), c & /*message, i18n*/
      6 && r !== (r = /*message*/
      (o[2] || /*i18n*/
      o[1]("upload_text.click_to_upload")) + "") && ll(d, r);
    },
    d(o) {
      o && (on(e), on(a), on(d));
    }
  };
}
function bo(t) {
  let e, n, l, i, s = (
    /*i18n*/
    t[1](
      /*defs*/
      t[5][
        /*type*/
        t[0]
      ] || /*defs*/
      t[5].file
    ) + ""
  ), a, r, d;
  l = new Uo({});
  let o = (
    /*mode*/
    t[3] !== "short" && Ll(t)
  );
  return {
    c() {
      e = nl("div"), n = nl("span"), Bo(l.$$.fragment), i = il(), a = Mt(s), r = il(), o && o.c(), tl(n, "class", "icon-wrap svelte-kzcjhc"), Ol(
        n,
        "hovered",
        /*hovered*/
        t[4]
      ), tl(e, "class", "wrap svelte-kzcjhc");
    },
    m(c, U) {
      dn(c, e, U), At(e, n), Vo(l, n, null), At(e, i), At(e, a), At(e, r), o && o.m(e, null), d = !0;
    },
    p(c, [U]) {
      (!d || U & /*hovered*/
      16) && Ol(
        n,
        "hovered",
        /*hovered*/
        c[4]
      ), (!d || U & /*i18n, type*/
      3) && s !== (s = /*i18n*/
      c[1](
        /*defs*/
        c[5][
          /*type*/
          c[0]
        ] || /*defs*/
        c[5].file
      ) + "") && ll(a, s), /*mode*/
      c[3] !== "short" ? o ? o.p(c, U) : (o = Ll(c), o.c(), o.m(e, null)) : o && (o.d(1), o = null);
    },
    i(c) {
      d || (mo(l.$$.fragment, c), d = !0);
    },
    o(c) {
      Ro(l.$$.fragment, c), d = !1;
    },
    d(c) {
      c && on(e), uo(l), o && o.d();
    }
  };
}
function go(t, e, n) {
  let { type: l = "file" } = e, { i18n: i } = e, { message: s = void 0 } = e, { mode: a = "full" } = e, { hovered: r = !1 } = e;
  const d = {
    image: "upload_text.drop_image",
    video: "upload_text.drop_video",
    audio: "upload_text.drop_audio",
    file: "upload_text.drop_file",
    csv: "upload_text.drop_csv"
  };
  return t.$$set = (o) => {
    "type" in o && n(0, l = o.type), "i18n" in o && n(1, i = o.i18n), "message" in o && n(2, s = o.message), "mode" in o && n(3, a = o.mode), "hovered" in o && n(4, r = o.hovered);
  }, [l, i, s, a, r, d];
}
class Wo extends Qo {
  constructor(e) {
    super(), Ao(this, e, go, bo, Zo, {
      type: 0,
      i18n: 1,
      message: 2,
      mode: 3,
      hovered: 4
    });
  }
}
class j {
  constructor(e = 0, n = 0, l = 0) {
    this.x = e, this.y = n, this.z = l;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z;
  }
  add(e) {
    return typeof e == "number" ? new j(this.x + e, this.y + e, this.z + e) : new j(this.x + e.x, this.y + e.y, this.z + e.z);
  }
  subtract(e) {
    return typeof e == "number" ? new j(this.x - e, this.y - e, this.z - e) : new j(this.x - e.x, this.y - e.y, this.z - e.z);
  }
  multiply(e) {
    return typeof e == "number" ? new j(this.x * e, this.y * e, this.z * e) : e instanceof j ? new j(this.x * e.x, this.y * e.y, this.z * e.z) : new j(this.x * e.buffer[0] + this.y * e.buffer[4] + this.z * e.buffer[8] + e.buffer[12], this.x * e.buffer[1] + this.y * e.buffer[5] + this.z * e.buffer[9] + e.buffer[13], this.x * e.buffer[2] + this.y * e.buffer[6] + this.z * e.buffer[10] + e.buffer[14]);
  }
  cross(e) {
    const n = this.y * e.z - this.z * e.y, l = this.z * e.x - this.x * e.z, i = this.x * e.y - this.y * e.x;
    return new j(n, l, i);
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  lerp(e, n) {
    return new j(this.x + (e.x - this.x) * n, this.y + (e.y - this.y) * n, this.z + (e.z - this.z) * n);
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  distanceTo(e) {
    return Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2 + (this.z - e.z) ** 2);
  }
  normalize() {
    const e = this.magnitude();
    return new j(this.x / e, this.y / e, this.z / e);
  }
  flat() {
    return [this.x, this.y, this.z];
  }
  clone() {
    return new j(this.x, this.y, this.z);
  }
  toString() {
    return `[${this.flat().join(", ")}]`;
  }
  static One(e = 1) {
    return new j(e, e, e);
  }
}
class Ae {
  constructor(e = 0, n = 0, l = 0, i = 1) {
    this.x = e, this.y = n, this.z = l, this.w = i;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z && this.w === e.w;
  }
  normalize() {
    const e = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    return new Ae(this.x / e, this.y / e, this.z / e, this.w / e);
  }
  multiply(e) {
    const n = this.w, l = this.x, i = this.y, s = this.z, a = e.w, r = e.x, d = e.y, o = e.z;
    return new Ae(n * r + l * a + i * o - s * d, n * d - l * o + i * a + s * r, n * o + l * d - i * r + s * a, n * a - l * r - i * d - s * o);
  }
  inverse() {
    const e = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    return new Ae(-this.x / e, -this.y / e, -this.z / e, this.w / e);
  }
  apply(e) {
    const n = new Ae(e.x, e.y, e.z, 0), l = new Ae(-this.x, -this.y, -this.z, this.w), i = this.multiply(n).multiply(l);
    return new j(i.x, i.y, i.z);
  }
  flat() {
    return [this.x, this.y, this.z, this.w];
  }
  clone() {
    return new Ae(this.x, this.y, this.z, this.w);
  }
  static FromEuler(e) {
    const n = e.x / 2, l = e.y / 2, i = e.z / 2, s = Math.cos(l), a = Math.sin(l), r = Math.cos(n), d = Math.sin(n), o = Math.cos(i), c = Math.sin(i);
    return new Ae(s * d * o + a * r * c, a * r * o - s * d * c, s * r * c - a * d * o, s * r * o + a * d * c);
  }
  toEuler() {
    const e = 2 * (this.w * this.x + this.y * this.z), n = 1 - 2 * (this.x * this.x + this.y * this.y), l = Math.atan2(e, n);
    let i;
    const s = 2 * (this.w * this.y - this.z * this.x);
    i = Math.abs(s) >= 1 ? Math.sign(s) * Math.PI / 2 : Math.asin(s);
    const a = 2 * (this.w * this.z + this.x * this.y), r = 1 - 2 * (this.y * this.y + this.z * this.z), d = Math.atan2(a, r);
    return new j(l, i, d);
  }
  static FromMatrix3(e) {
    const n = e.buffer, l = n[0] + n[4] + n[8];
    let i, s, a, r;
    if (l > 0) {
      const d = 0.5 / Math.sqrt(l + 1);
      r = 0.25 / d, i = (n[7] - n[5]) * d, s = (n[2] - n[6]) * d, a = (n[3] - n[1]) * d;
    } else if (n[0] > n[4] && n[0] > n[8]) {
      const d = 2 * Math.sqrt(1 + n[0] - n[4] - n[8]);
      r = (n[7] - n[5]) / d, i = 0.25 * d, s = (n[1] + n[3]) / d, a = (n[2] + n[6]) / d;
    } else if (n[4] > n[8]) {
      const d = 2 * Math.sqrt(1 + n[4] - n[0] - n[8]);
      r = (n[2] - n[6]) / d, i = (n[1] + n[3]) / d, s = 0.25 * d, a = (n[5] + n[7]) / d;
    } else {
      const d = 2 * Math.sqrt(1 + n[8] - n[0] - n[4]);
      r = (n[3] - n[1]) / d, i = (n[2] + n[6]) / d, s = (n[5] + n[7]) / d, a = 0.25 * d;
    }
    return new Ae(i, s, a, r);
  }
  static FromAxisAngle(e, n) {
    const l = n / 2, i = Math.sin(l), s = Math.cos(l);
    return new Ae(e.x * i, e.y * i, e.z * i, s);
  }
  toString() {
    return `[${this.flat().join(", ")}]`;
  }
}
class ta {
  constructor() {
    const e = /* @__PURE__ */ new Map();
    this.addEventListener = (n, l) => {
      e.has(n) || e.set(n, /* @__PURE__ */ new Set()), e.get(n).add(l);
    }, this.removeEventListener = (n, l) => {
      e.has(n) && e.get(n).delete(l);
    }, this.hasEventListener = (n, l) => !!e.has(n) && e.get(n).has(l), this.dispatchEvent = (n) => {
      if (e.has(n.type))
        for (const l of e.get(n.type))
          l(n);
    };
  }
}
class Xe {
  constructor(e = 1, n = 0, l = 0, i = 0, s = 0, a = 1, r = 0, d = 0, o = 0, c = 0, U = 1, F = 0, h = 0, u = 0, R = 0, V = 1) {
    this.buffer = [e, n, l, i, s, a, r, d, o, c, U, F, h, u, R, V];
  }
  equals(e) {
    if (this.buffer.length !== e.buffer.length)
      return !1;
    if (this.buffer === e.buffer)
      return !0;
    for (let n = 0; n < this.buffer.length; n++)
      if (this.buffer[n] !== e.buffer[n])
        return !1;
    return !0;
  }
  multiply(e) {
    const n = this.buffer, l = e.buffer;
    return new Xe(l[0] * n[0] + l[1] * n[4] + l[2] * n[8] + l[3] * n[12], l[0] * n[1] + l[1] * n[5] + l[2] * n[9] + l[3] * n[13], l[0] * n[2] + l[1] * n[6] + l[2] * n[10] + l[3] * n[14], l[0] * n[3] + l[1] * n[7] + l[2] * n[11] + l[3] * n[15], l[4] * n[0] + l[5] * n[4] + l[6] * n[8] + l[7] * n[12], l[4] * n[1] + l[5] * n[5] + l[6] * n[9] + l[7] * n[13], l[4] * n[2] + l[5] * n[6] + l[6] * n[10] + l[7] * n[14], l[4] * n[3] + l[5] * n[7] + l[6] * n[11] + l[7] * n[15], l[8] * n[0] + l[9] * n[4] + l[10] * n[8] + l[11] * n[12], l[8] * n[1] + l[9] * n[5] + l[10] * n[9] + l[11] * n[13], l[8] * n[2] + l[9] * n[6] + l[10] * n[10] + l[11] * n[14], l[8] * n[3] + l[9] * n[7] + l[10] * n[11] + l[11] * n[15], l[12] * n[0] + l[13] * n[4] + l[14] * n[8] + l[15] * n[12], l[12] * n[1] + l[13] * n[5] + l[14] * n[9] + l[15] * n[13], l[12] * n[2] + l[13] * n[6] + l[14] * n[10] + l[15] * n[14], l[12] * n[3] + l[13] * n[7] + l[14] * n[11] + l[15] * n[15]);
  }
  clone() {
    const e = this.buffer;
    return new Xe(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]);
  }
  determinant() {
    const e = this.buffer;
    return e[12] * e[9] * e[6] * e[3] - e[8] * e[13] * e[6] * e[3] - e[12] * e[5] * e[10] * e[3] + e[4] * e[13] * e[10] * e[3] + e[8] * e[5] * e[14] * e[3] - e[4] * e[9] * e[14] * e[3] - e[12] * e[9] * e[2] * e[7] + e[8] * e[13] * e[2] * e[7] + e[12] * e[1] * e[10] * e[7] - e[0] * e[13] * e[10] * e[7] - e[8] * e[1] * e[14] * e[7] + e[0] * e[9] * e[14] * e[7] + e[12] * e[5] * e[2] * e[11] - e[4] * e[13] * e[2] * e[11] - e[12] * e[1] * e[6] * e[11] + e[0] * e[13] * e[6] * e[11] + e[4] * e[1] * e[14] * e[11] - e[0] * e[5] * e[14] * e[11] - e[8] * e[5] * e[2] * e[15] + e[4] * e[9] * e[2] * e[15] + e[8] * e[1] * e[6] * e[15] - e[0] * e[9] * e[6] * e[15] - e[4] * e[1] * e[10] * e[15] + e[0] * e[5] * e[10] * e[15];
  }
  invert() {
    const e = this.buffer, n = this.determinant();
    if (n === 0)
      throw new Error("Matrix is not invertible.");
    const l = 1 / n;
    return new Xe(l * (e[5] * e[10] * e[15] - e[5] * e[11] * e[14] - e[9] * e[6] * e[15] + e[9] * e[7] * e[14] + e[13] * e[6] * e[11] - e[13] * e[7] * e[10]), l * (-e[1] * e[10] * e[15] + e[1] * e[11] * e[14] + e[9] * e[2] * e[15] - e[9] * e[3] * e[14] - e[13] * e[2] * e[11] + e[13] * e[3] * e[10]), l * (e[1] * e[6] * e[15] - e[1] * e[7] * e[14] - e[5] * e[2] * e[15] + e[5] * e[3] * e[14] + e[13] * e[2] * e[7] - e[13] * e[3] * e[6]), l * (-e[1] * e[6] * e[11] + e[1] * e[7] * e[10] + e[5] * e[2] * e[11] - e[5] * e[3] * e[10] - e[9] * e[2] * e[7] + e[9] * e[3] * e[6]), l * (-e[4] * e[10] * e[15] + e[4] * e[11] * e[14] + e[8] * e[6] * e[15] - e[8] * e[7] * e[14] - e[12] * e[6] * e[11] + e[12] * e[7] * e[10]), l * (e[0] * e[10] * e[15] - e[0] * e[11] * e[14] - e[8] * e[2] * e[15] + e[8] * e[3] * e[14] + e[12] * e[2] * e[11] - e[12] * e[3] * e[10]), l * (-e[0] * e[6] * e[15] + e[0] * e[7] * e[14] + e[4] * e[2] * e[15] - e[4] * e[3] * e[14] - e[12] * e[2] * e[7] + e[12] * e[3] * e[6]), l * (e[0] * e[6] * e[11] - e[0] * e[7] * e[10] - e[4] * e[2] * e[11] + e[4] * e[3] * e[10] + e[8] * e[2] * e[7] - e[8] * e[3] * e[6]), l * (e[4] * e[9] * e[15] - e[4] * e[11] * e[13] - e[8] * e[5] * e[15] + e[8] * e[7] * e[13] + e[12] * e[5] * e[11] - e[12] * e[7] * e[9]), l * (-e[0] * e[9] * e[15] + e[0] * e[11] * e[13] + e[8] * e[1] * e[15] - e[8] * e[3] * e[13] - e[12] * e[1] * e[11] + e[12] * e[3] * e[9]), l * (e[0] * e[5] * e[15] - e[0] * e[7] * e[13] - e[4] * e[1] * e[15] + e[4] * e[3] * e[13] + e[12] * e[1] * e[7] - e[12] * e[3] * e[5]), l * (-e[0] * e[5] * e[11] + e[0] * e[7] * e[9] + e[4] * e[1] * e[11] - e[4] * e[3] * e[9] - e[8] * e[1] * e[7] + e[8] * e[3] * e[5]), l * (-e[4] * e[9] * e[14] + e[4] * e[10] * e[13] + e[8] * e[5] * e[14] - e[8] * e[6] * e[13] - e[12] * e[5] * e[10] + e[12] * e[6] * e[9]), l * (e[0] * e[9] * e[14] - e[0] * e[10] * e[13] - e[8] * e[1] * e[14] + e[8] * e[2] * e[13] + e[12] * e[1] * e[10] - e[12] * e[2] * e[9]), l * (-e[0] * e[5] * e[14] + e[0] * e[6] * e[13] + e[4] * e[1] * e[14] - e[4] * e[2] * e[13] - e[12] * e[1] * e[6] + e[12] * e[2] * e[5]), l * (e[0] * e[5] * e[10] - e[0] * e[6] * e[9] - e[4] * e[1] * e[10] + e[4] * e[2] * e[9] + e[8] * e[1] * e[6] - e[8] * e[2] * e[5]));
  }
  static Compose(e, n, l) {
    const i = n.x, s = n.y, a = n.z, r = n.w, d = i + i, o = s + s, c = a + a, U = i * d, F = i * o, h = i * c, u = s * o, R = s * c, V = a * c, I = r * d, W = r * o, m = r * c, A = l.x, p = l.y, z = l.z;
    return new Xe((1 - (u + V)) * A, (F + m) * A, (h - W) * A, 0, (F - m) * p, (1 - (U + V)) * p, (R + I) * p, 0, (h + W) * z, (R - I) * z, (1 - (U + u)) * z, 0, e.x, e.y, e.z, 1);
  }
  toString() {
    return `[${this.buffer.join(", ")}]`;
  }
}
class fo extends Event {
  constructor(e) {
    super("objectAdded"), this.object = e;
  }
}
class Io extends Event {
  constructor(e) {
    super("objectRemoved"), this.object = e;
  }
}
class po extends Event {
  constructor(e) {
    super("objectChanged"), this.object = e;
  }
}
class na extends ta {
  constructor() {
    super(), this.positionChanged = !1, this.rotationChanged = !1, this.scaleChanged = !1, this._position = new j(), this._rotation = new Ae(), this._scale = new j(1, 1, 1), this._transform = new Xe(), this._changeEvent = new po(this), this.update = () => {
    }, this.applyPosition = () => {
      this.position = new j();
    }, this.applyRotation = () => {
      this.rotation = new Ae();
    }, this.applyScale = () => {
      this.scale = new j(1, 1, 1);
    };
  }
  _updateMatrix() {
    this._transform = Xe.Compose(this._position, this._rotation, this._scale);
  }
  get position() {
    return this._position;
  }
  set position(e) {
    this._position.equals(e) || (this._position = e, this.positionChanged = !0, this._updateMatrix(), this.dispatchEvent(this._changeEvent));
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(e) {
    this._rotation.equals(e) || (this._rotation = e, this.rotationChanged = !0, this._updateMatrix(), this.dispatchEvent(this._changeEvent));
  }
  get scale() {
    return this._scale;
  }
  set scale(e) {
    this._scale.equals(e) || (this._scale = e, this.scaleChanged = !0, this._updateMatrix(), this.dispatchEvent(this._changeEvent));
  }
  get forward() {
    let e = new j(0, 0, 1);
    return e = this.rotation.apply(e), e;
  }
  get transform() {
    return this._transform;
  }
}
class Se {
  constructor(e = 1, n = 0, l = 0, i = 0, s = 1, a = 0, r = 0, d = 0, o = 1) {
    this.buffer = [e, n, l, i, s, a, r, d, o];
  }
  equals(e) {
    if (this.buffer.length !== e.buffer.length)
      return !1;
    if (this.buffer === e.buffer)
      return !0;
    for (let n = 0; n < this.buffer.length; n++)
      if (this.buffer[n] !== e.buffer[n])
        return !1;
    return !0;
  }
  multiply(e) {
    const n = this.buffer, l = e.buffer;
    return new Se(l[0] * n[0] + l[3] * n[1] + l[6] * n[2], l[1] * n[0] + l[4] * n[1] + l[7] * n[2], l[2] * n[0] + l[5] * n[1] + l[8] * n[2], l[0] * n[3] + l[3] * n[4] + l[6] * n[5], l[1] * n[3] + l[4] * n[4] + l[7] * n[5], l[2] * n[3] + l[5] * n[4] + l[8] * n[5], l[0] * n[6] + l[3] * n[7] + l[6] * n[8], l[1] * n[6] + l[4] * n[7] + l[7] * n[8], l[2] * n[6] + l[5] * n[7] + l[8] * n[8]);
  }
  clone() {
    const e = this.buffer;
    return new Se(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8]);
  }
  static Eye(e = 1) {
    return new Se(e, 0, 0, 0, e, 0, 0, 0, e);
  }
  static Diagonal(e) {
    return new Se(e.x, 0, 0, 0, e.y, 0, 0, 0, e.z);
  }
  static RotationFromQuaternion(e) {
    return new Se(1 - 2 * e.y * e.y - 2 * e.z * e.z, 2 * e.x * e.y - 2 * e.z * e.w, 2 * e.x * e.z + 2 * e.y * e.w, 2 * e.x * e.y + 2 * e.z * e.w, 1 - 2 * e.x * e.x - 2 * e.z * e.z, 2 * e.y * e.z - 2 * e.x * e.w, 2 * e.x * e.z - 2 * e.y * e.w, 2 * e.y * e.z + 2 * e.x * e.w, 1 - 2 * e.x * e.x - 2 * e.y * e.y);
  }
  static RotationFromEuler(e) {
    const n = Math.cos(e.x), l = Math.sin(e.x), i = Math.cos(e.y), s = Math.sin(e.y), a = Math.cos(e.z), r = Math.sin(e.z);
    return new Se(i * a + s * l * r, -i * r + s * l * a, s * n, n * r, n * a, -l, -s * a + i * l * r, s * r + i * l * a, i * n);
  }
  toString() {
    return `[${this.buffer.join(", ")}]`;
  }
}
class Ze {
  constructor(e = 0, n = null, l = null, i = null, s = null) {
    this.changed = !1, this.detached = !1, this._vertexCount = e, this._positions = n || new Float32Array(0), this._rotations = l || new Float32Array(0), this._scales = i || new Float32Array(0), this._colors = s || new Uint8Array(0), this._selection = new Uint8Array(this.vertexCount), this.translate = (a) => {
      for (let r = 0; r < this.vertexCount; r++)
        this.positions[3 * r + 0] += a.x, this.positions[3 * r + 1] += a.y, this.positions[3 * r + 2] += a.z;
      this.changed = !0;
    }, this.rotate = (a) => {
      const r = Se.RotationFromQuaternion(a).buffer;
      for (let d = 0; d < this.vertexCount; d++) {
        const o = this.positions[3 * d + 0], c = this.positions[3 * d + 1], U = this.positions[3 * d + 2];
        this.positions[3 * d + 0] = r[0] * o + r[1] * c + r[2] * U, this.positions[3 * d + 1] = r[3] * o + r[4] * c + r[5] * U, this.positions[3 * d + 2] = r[6] * o + r[7] * c + r[8] * U;
        const F = new Ae(this.rotations[4 * d + 1], this.rotations[4 * d + 2], this.rotations[4 * d + 3], this.rotations[4 * d + 0]), h = a.multiply(F);
        this.rotations[4 * d + 1] = h.x, this.rotations[4 * d + 2] = h.y, this.rotations[4 * d + 3] = h.z, this.rotations[4 * d + 0] = h.w;
      }
      this.changed = !0;
    }, this.scale = (a) => {
      for (let r = 0; r < this.vertexCount; r++)
        this.positions[3 * r + 0] *= a.x, this.positions[3 * r + 1] *= a.y, this.positions[3 * r + 2] *= a.z, this.scales[3 * r + 0] *= a.x, this.scales[3 * r + 1] *= a.y, this.scales[3 * r + 2] *= a.z;
      this.changed = !0;
    }, this.serialize = () => {
      const a = new Uint8Array(this.vertexCount * Ze.RowLength), r = new Float32Array(a.buffer), d = new Uint8Array(a.buffer);
      for (let o = 0; o < this.vertexCount; o++)
        r[8 * o + 0] = this.positions[3 * o + 0], r[8 * o + 1] = this.positions[3 * o + 1], r[8 * o + 2] = this.positions[3 * o + 2], d[32 * o + 24 + 0] = this.colors[4 * o + 0], d[32 * o + 24 + 1] = this.colors[4 * o + 1], d[32 * o + 24 + 2] = this.colors[4 * o + 2], d[32 * o + 24 + 3] = this.colors[4 * o + 3], r[8 * o + 3 + 0] = this.scales[3 * o + 0], r[8 * o + 3 + 1] = this.scales[3 * o + 1], r[8 * o + 3 + 2] = this.scales[3 * o + 2], d[32 * o + 28 + 0] = 128 * this.rotations[4 * o + 0] + 128 & 255, d[32 * o + 28 + 1] = 128 * this.rotations[4 * o + 1] + 128 & 255, d[32 * o + 28 + 2] = 128 * this.rotations[4 * o + 2] + 128 & 255, d[32 * o + 28 + 3] = 128 * this.rotations[4 * o + 3] + 128 & 255;
      return a;
    }, this.reattach = (a, r, d, o, c) => {
      console.assert(a.byteLength === 3 * this.vertexCount * 4, `Expected ${3 * this.vertexCount * 4} bytes, got ${a.byteLength} bytes`), this._positions = new Float32Array(a), this._rotations = new Float32Array(r), this._scales = new Float32Array(d), this._colors = new Uint8Array(o), this._selection = new Uint8Array(c), this.detached = !1;
    };
  }
  static Deserialize(e) {
    const n = e.length / Ze.RowLength, l = new Float32Array(3 * n), i = new Float32Array(4 * n), s = new Float32Array(3 * n), a = new Uint8Array(4 * n), r = new Float32Array(e.buffer), d = new Uint8Array(e.buffer);
    for (let o = 0; o < n; o++)
      l[3 * o + 0] = r[8 * o + 0], l[3 * o + 1] = r[8 * o + 1], l[3 * o + 2] = r[8 * o + 2], i[4 * o + 0] = (d[32 * o + 28 + 0] - 128) / 128, i[4 * o + 1] = (d[32 * o + 28 + 1] - 128) / 128, i[4 * o + 2] = (d[32 * o + 28 + 2] - 128) / 128, i[4 * o + 3] = (d[32 * o + 28 + 3] - 128) / 128, s[3 * o + 0] = r[8 * o + 3 + 0], s[3 * o + 1] = r[8 * o + 3 + 1], s[3 * o + 2] = r[8 * o + 3 + 2], a[4 * o + 0] = d[32 * o + 24 + 0], a[4 * o + 1] = d[32 * o + 24 + 1], a[4 * o + 2] = d[32 * o + 24 + 2], a[4 * o + 3] = d[32 * o + 24 + 3];
    return new Ze(n, l, i, s, a);
  }
  get vertexCount() {
    return this._vertexCount;
  }
  get positions() {
    return this._positions;
  }
  get rotations() {
    return this._rotations;
  }
  get scales() {
    return this._scales;
  }
  get colors() {
    return this._colors;
  }
  get selection() {
    return this._selection;
  }
}
Ze.RowLength = 32;
class Ce extends na {
  constructor(e = void 0) {
    super(), this.selectedChanged = !1, this._selected = !1, this._data = e || new Ze(), this.applyPosition = () => {
      this.data.translate(this.position), this.position = new j();
    }, this.applyRotation = () => {
      this.data.rotate(this.rotation), this.rotation = new Ae();
    }, this.applyScale = () => {
      this.data.scale(this.scale), this.scale = new j(1, 1, 1);
    };
  }
  saveToFile(e = null) {
    if (!document)
      return;
    if (!e) {
      const s = /* @__PURE__ */ new Date();
      e = `splat-${s.getFullYear()}-${s.getMonth() + 1}-${s.getDate()}.splat`;
    }
    this.applyRotation(), this.applyScale(), this.applyPosition();
    const n = this.data.serialize(), l = new Blob([n], { type: "application/octet-stream" }), i = document.createElement("a");
    i.download = e, i.href = URL.createObjectURL(l), i.click();
  }
  get data() {
    return this._data;
  }
  get selected() {
    return this._selected;
  }
  set selected(e) {
    this._selected !== e && (this._selected = e, this.selectedChanged = !0, this.dispatchEvent(this._changeEvent));
  }
}
class Jo {
  constructor() {
    this._fx = 1132, this._fy = 1132, this._near = 0.1, this._far = 100, this._width = 512, this._height = 512, this._projectionMatrix = new Xe(), this._viewMatrix = new Xe(), this._viewProj = new Xe(), this._updateProjectionMatrix = () => {
      this._projectionMatrix = new Xe(2 * this.fx / this.width, 0, 0, 0, 0, -2 * this.fy / this.height, 0, 0, 0, 0, this.far / (this.far - this.near), 1, 0, 0, -this.far * this.near / (this.far - this.near), 0), this._viewProj = this.projectionMatrix.multiply(this.viewMatrix);
    }, this.update = (e, n) => {
      const l = Se.RotationFromQuaternion(n).buffer, i = e.flat();
      this._viewMatrix = new Xe(l[0], l[1], l[2], 0, l[3], l[4], l[5], 0, l[6], l[7], l[8], 0, -i[0] * l[0] - i[1] * l[3] - i[2] * l[6], -i[0] * l[1] - i[1] * l[4] - i[2] * l[7], -i[0] * l[2] - i[1] * l[5] - i[2] * l[8], 1), this._viewProj = this.projectionMatrix.multiply(this.viewMatrix);
    }, this.setSize = (e, n) => {
      this._width = e, this._height = n, this._updateProjectionMatrix();
    };
  }
  get fx() {
    return this._fx;
  }
  set fx(e) {
    this._fx !== e && (this._fx = e, this._updateProjectionMatrix());
  }
  get fy() {
    return this._fy;
  }
  set fy(e) {
    this._fy !== e && (this._fy = e, this._updateProjectionMatrix());
  }
  get near() {
    return this._near;
  }
  set near(e) {
    this._near !== e && (this._near = e, this._updateProjectionMatrix());
  }
  get far() {
    return this._far;
  }
  set far(e) {
    this._far !== e && (this._far = e, this._updateProjectionMatrix());
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get projectionMatrix() {
    return this._projectionMatrix;
  }
  get viewMatrix() {
    return this._viewMatrix;
  }
  get viewProj() {
    return this._viewProj;
  }
}
class Je {
  constructor(e = 0, n = 0, l = 0, i = 0) {
    this.x = e, this.y = n, this.z = l, this.w = i;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z && this.w === e.w;
  }
  add(e) {
    return typeof e == "number" ? new Je(this.x + e, this.y + e, this.z + e, this.w + e) : new Je(this.x + e.x, this.y + e.y, this.z + e.z, this.w + e.w);
  }
  subtract(e) {
    return typeof e == "number" ? new Je(this.x - e, this.y - e, this.z - e, this.w - e) : new Je(this.x - e.x, this.y - e.y, this.z - e.z, this.w - e.w);
  }
  multiply(e) {
    return typeof e == "number" ? new Je(this.x * e, this.y * e, this.z * e, this.w * e) : e instanceof Je ? new Je(this.x * e.x, this.y * e.y, this.z * e.z, this.w * e.w) : new Je(this.x * e.buffer[0] + this.y * e.buffer[4] + this.z * e.buffer[8] + this.w * e.buffer[12], this.x * e.buffer[1] + this.y * e.buffer[5] + this.z * e.buffer[9] + this.w * e.buffer[13], this.x * e.buffer[2] + this.y * e.buffer[6] + this.z * e.buffer[10] + this.w * e.buffer[14], this.x * e.buffer[3] + this.y * e.buffer[7] + this.z * e.buffer[11] + this.w * e.buffer[15]);
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lerp(e, n) {
    return new Je(this.x + (e.x - this.x) * n, this.y + (e.y - this.y) * n, this.z + (e.z - this.z) * n, this.w + (e.w - this.w) * n);
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  distanceTo(e) {
    return Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2 + (this.z - e.z) ** 2 + (this.w - e.w) ** 2);
  }
  normalize() {
    const e = this.magnitude();
    return new Je(this.x / e, this.y / e, this.z / e, this.w / e);
  }
  flat() {
    return [this.x, this.y, this.z, this.w];
  }
  clone() {
    return new Je(this.x, this.y, this.z, this.w);
  }
  toString() {
    return `[${this.flat().join(", ")}]`;
  }
}
class la extends na {
  constructor(e = void 0) {
    super(), this._data = e || new Jo(), this._position = new j(0, 0, -5), this.update = () => {
      this.data.update(this.position, this.rotation);
    }, this.screenPointToRay = (n, l) => {
      const i = new Je(n, l, -1, 1), s = this._data.projectionMatrix.invert(), a = i.multiply(s), r = this._data.viewMatrix.invert(), d = a.multiply(r);
      return new j(d.x / d.w, d.y / d.w, d.z / d.w).subtract(this.position).normalize();
    };
  }
  get data() {
    return this._data;
  }
}
class ia extends ta {
  constructor() {
    super(), this._objects = [], this.addObject = (e) => {
      this.objects.push(e), this.dispatchEvent(new fo(e));
    }, this.removeObject = (e) => {
      const n = this.objects.indexOf(e);
      if (n < 0)
        throw new Error("Object not found in scene");
      this.objects.splice(n, 1), this.dispatchEvent(new Io(e));
    }, this.findObject = (e) => {
      for (const n of this.objects)
        if (e(n))
          return n;
    }, this.findObjectOfType = (e) => {
      for (const n of this.objects)
        if (n instanceof e)
          return n;
    }, this.reset = () => {
      const e = this.objects.slice();
      for (const n of e)
        this.removeObject(n);
    }, this.reset();
  }
  saveToFile(e = null) {
    if (!document)
      return;
    if (!e) {
      const d = /* @__PURE__ */ new Date();
      e = `scene-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.splat`;
    }
    const n = [];
    let l = 0;
    for (const d of this.objects)
      if (d.applyRotation(), d.applyScale(), d.applyPosition(), d instanceof Ce) {
        const o = d.data.serialize();
        n.push(o), l += d.data.vertexCount;
      }
    const i = new Uint8Array(l * Ze.RowLength);
    let s = 0;
    for (const d of n)
      i.set(d, s), s += d.length;
    const a = new Blob([i.buffer], { type: "application/octet-stream" }), r = document.createElement("a");
    r.download = e, r.href = URL.createObjectURL(a), r.click();
  }
  get objects() {
    return this._objects;
  }
}
class aa {
  static async LoadAsync(e, n, l, i = !1) {
    const s = await fetch(e, { mode: "cors", credentials: "omit", cache: i ? "force-cache" : "default" });
    if (s.status != 200)
      throw new Error(s.status + " Unable to load " + s.url);
    const a = s.body.getReader(), r = parseInt(s.headers.get("content-length")), d = new Uint8Array(r);
    let o = 0;
    for (; ; ) {
      const { done: F, value: h } = await a.read();
      if (F)
        break;
      d.set(h, o), o += h.length, l == null || l(o / r);
    }
    const c = Ze.Deserialize(d), U = new Ce(c);
    return n.addObject(U), U;
  }
  static async LoadFromFileAsync(e, n, l) {
    const i = new FileReader();
    let s = new Ce();
    return i.onload = (a) => {
      const r = new Uint8Array(a.target.result), d = Ze.Deserialize(r);
      s = new Ce(d), n.addObject(s);
    }, i.onprogress = (a) => {
      l == null || l(a.loaded / a.total);
    }, i.readAsArrayBuffer(e), await new Promise((a) => {
      i.onloadend = () => {
        a();
      };
    }), s;
  }
}
class ml {
  static async LoadAsync(e, n, l, i = "", s = !1) {
    const a = await fetch(e, { mode: "cors", credentials: "omit", cache: s ? "force-cache" : "default" });
    if (a.status != 200)
      throw new Error(a.status + " Unable to load " + a.url);
    const r = a.body.getReader(), d = parseInt(a.headers.get("content-length")), o = new Uint8Array(d);
    let c = 0;
    for (; ; ) {
      const { done: u, value: R } = await r.read();
      if (u)
        break;
      o.set(R, c), c += R.length, l == null || l(c / d);
    }
    if (o[0] !== 112 || o[1] !== 108 || o[2] !== 121 || o[3] !== 10)
      throw new Error("Invalid PLY file");
    const U = new Uint8Array(this._ParsePLYBuffer(o.buffer, i)), F = Ze.Deserialize(U), h = new Ce(F);
    return n.addObject(h), h;
  }
  static async LoadFromFileAsync(e, n, l, i = "") {
    const s = new FileReader();
    let a = new Ce();
    return s.onload = (r) => {
      const d = new Uint8Array(this._ParsePLYBuffer(r.target.result, i)), o = Ze.Deserialize(d);
      a = new Ce(o), n.addObject(a);
    }, s.onprogress = (r) => {
      l == null || l(r.loaded / r.total);
    }, s.readAsArrayBuffer(e), await new Promise((r) => {
      s.onloadend = () => {
        r();
      };
    }), a;
  }
  static _ParsePLYBuffer(e, n) {
    const l = new Uint8Array(e), i = new TextDecoder().decode(l.slice(0, 10240)), s = `end_header
`, a = i.indexOf(s);
    if (a < 0)
      throw new Error("Unable to read .ply file header");
    const r = parseInt(/element vertex (\d+)\n/.exec(i)[1]);
    let d = 0;
    const o = { double: 8, int: 4, uint: 4, float: 4, short: 2, ushort: 2, uchar: 1 }, c = [];
    for (const u of i.slice(0, a).split(`
`).filter((R) => R.startsWith("property "))) {
      const [R, V, I] = u.split(" ");
      if (c.push({ name: I, type: V, offset: d }), !o[V])
        throw new Error(`Unsupported property type: ${V}`);
      d += o[V];
    }
    const U = new DataView(e, a + 11), F = new ArrayBuffer(Ze.RowLength * r), h = Ae.FromEuler(new j(Math.PI / 2, 0, 0));
    for (let u = 0; u < r; u++) {
      const R = new Float32Array(F, u * Ze.RowLength, 3), V = new Float32Array(F, u * Ze.RowLength + 12, 3), I = new Uint8ClampedArray(F, u * Ze.RowLength + 24, 4), W = new Uint8ClampedArray(F, u * Ze.RowLength + 28, 4);
      let m = 255, A = 0, p = 0, z = 0;
      c.forEach((k) => {
        let N;
        switch (k.type) {
          case "float":
            N = U.getFloat32(k.offset + u * d, !0);
            break;
          case "int":
            N = U.getInt32(k.offset + u * d, !0);
            break;
          default:
            throw new Error(`Unsupported property type: ${k.type}`);
        }
        switch (k.name) {
          case "x":
            R[0] = N;
            break;
          case "y":
            R[1] = N;
            break;
          case "z":
            R[2] = N;
            break;
          case "scale_0":
            V[0] = Math.exp(N);
            break;
          case "scale_1":
            V[1] = Math.exp(N);
            break;
          case "scale_2":
            V[2] = Math.exp(N);
            break;
          case "red":
            I[0] = N;
            break;
          case "green":
            I[1] = N;
            break;
          case "blue":
            I[2] = N;
            break;
          case "f_dc_0":
            I[0] = 255 * (0.5 + this.SH_C0 * N);
            break;
          case "f_dc_1":
            I[1] = 255 * (0.5 + this.SH_C0 * N);
            break;
          case "f_dc_2":
            I[2] = 255 * (0.5 + this.SH_C0 * N);
            break;
          case "f_dc_3":
            I[3] = 255 * (0.5 + this.SH_C0 * N);
            break;
          case "opacity":
            I[3] = 1 / (1 + Math.exp(-N)) * 255;
            break;
          case "rot_0":
            m = N;
            break;
          case "rot_1":
            A = N;
            break;
          case "rot_2":
            p = N;
            break;
          case "rot_3":
            z = N;
        }
      });
      let H = new Ae(A, p, z, m);
      switch (n) {
        case "polycam": {
          const k = R[1];
          R[1] = -R[2], R[2] = k, H = h.multiply(H);
          break;
        }
        case "":
          break;
        default:
          throw new Error(`Unsupported format: ${n}`);
      }
      H = H.normalize(), W[0] = 128 * H.w + 128, W[1] = 128 * H.x + 128, W[2] = 128 * H.y + 128, W[3] = 128 * H.z + 128;
    }
    return F;
  }
}
function Co(t, e, n) {
  var l = e === void 0 ? null : e, i = function(d, o) {
    var c = atob(d);
    if (o) {
      for (var U = new Uint8Array(c.length), F = 0, h = c.length; F < h; ++F)
        U[F] = c.charCodeAt(F);
      return String.fromCharCode.apply(null, new Uint16Array(U.buffer));
    }
    return c;
  }(t, n !== void 0 && n), s = i.indexOf(`
`, 10) + 1, a = i.substring(s) + (l ? "//# sourceMappingURL=" + l : ""), r = new Blob([a], { type: "application/javascript" });
  return URL.createObjectURL(r);
}
function sa(t, e, n) {
  var l;
  return function(i) {
    return l = l || Co(t, e, n), new Worker(l, i);
  };
}
ml.SH_C0 = 0.28209479177387814;
var No = sa("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgdmFyIGxvYWRXYXNtID0gKCgpID0+IHsKICAgIAogICAgcmV0dXJuICgKICBmdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkgewoKICB2YXIgTW9kdWxlPW1vZHVsZUFyZzt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdDt9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkQmluYXJ5O3t7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZjt9aWYoc2NyaXB0RGlyZWN0b3J5LmluZGV4T2YoImJsb2I6IikhPT0wKXtzY3JpcHREaXJlY3Rvcnk9c2NyaXB0RGlyZWN0b3J5LnN1YnN0cigwLHNjcmlwdERpcmVjdG9yeS5yZXBsYWNlKC9bPyNdLiovLCIiKS5sYXN0SW5kZXhPZigiLyIpKzEpO31lbHNlIHtzY3JpcHREaXJlY3Rvcnk9IiI7fXt7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX07fX19TW9kdWxlWyJwcmludCJdfHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO3ZhciBlcnI9TW9kdWxlWyJwcmludEVyciJdfHxjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlNb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIik7fWZ1bmN0aW9uIGludEFycmF5RnJvbUJhc2U2NChzKXt2YXIgZGVjb2RlZD1hdG9iKHMpO3ZhciBieXRlcz1uZXcgVWludDhBcnJheShkZWNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkZWNvZGVkLmxlbmd0aDsrK2kpe2J5dGVzW2ldPWRlY29kZWQuY2hhckNvZGVBdChpKTt9cmV0dXJuIGJ5dGVzfWZ1bmN0aW9uIHRyeVBhcnNlQXNEYXRhVVJJKGZpbGVuYW1lKXtpZighaXNEYXRhVVJJKGZpbGVuYW1lKSl7cmV0dXJufXJldHVybiBpbnRBcnJheUZyb21CYXNlNjQoZmlsZW5hbWUuc2xpY2UoZGF0YVVSSVByZWZpeC5sZW5ndGgpKX12YXIgd2FzbU1lbW9yeTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7ZnVuY3Rpb24gdXBkYXRlTWVtb3J5Vmlld3MoKXt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjtNb2R1bGVbIkhFQVA4Il09SEVBUDg9bmV3IEludDhBcnJheShiKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVBVOCJdPUhFQVBVOD1uZXcgVWludDhBcnJheShiKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBGMzIiXT1IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGIpO312YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO2Z1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpO319Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTt9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKTt9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKTt9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pO31mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpO31mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYik7fWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKTt9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXT8uKHJ1bkRlcGVuZGVuY2llcyk7fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdPy4ocnVuRGVwZW5kZW5jaWVzKTtpZihydW5EZXBlbmRlbmNpZXM9PTApe2lmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpO319fWZ1bmN0aW9uIGFib3J0KHdoYXQpe01vZHVsZVsib25BYm9ydCJdPy4od2hhdCk7d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO3doYXQrPSIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uIjt2YXIgZT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKHdoYXQpO3JlYWR5UHJvbWlzZVJlamVjdChlKTt0aHJvdyBlfXZhciBkYXRhVVJJUHJlZml4PSJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsIjt2YXIgaXNEYXRhVVJJPWZpbGVuYW1lPT5maWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpO3ZhciB3YXNtQmluYXJ5RmlsZTt3YXNtQmluYXJ5RmlsZT0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LEFHRnpiUUVBQUFBQld3MWdCSDkvZjM4QVlBTi9mMzhBWUFWL2YzOS9md0JnQm45L2YzOS9md0JnQVg4QmYyQUNmMzhBWUFOL2YzOEJmMkFCZndCZ0FBQmdBbjkvQVg5Z0IzOS9mMzkvZjM4QVlBUi9mMzUrQUdBS2YzOS9mMzkvZjM5L2Z3QUNQUW9CWVFGaEFBRUJZUUZpQUFJQllRRmpBQUVCWVFGa0FBVUJZUUZsQUFFQllRRm1BQW9CWVFGbkFBUUJZUUZvQUFVQllRRnBBQUFCWVFGcUFBVURHUmdHQkFjSUJ3Y0pDd2dCQUFFRUJBTURBZ0lBQUFrR0Jnd0VCUUZ3QVJBUUJRY0JBWUFDZ0lBQ0JnZ0Jmd0ZCd0o0RUN3Y1pCZ0ZyQWdBQmJBQU5BVzBBSVFGdUFRQUJid0FYQVhBQUR3a1ZBUUJCQVFzUEVoWU1EZzRnREI4WUdoME1HUnNjQ3ExT0dIRUJBWDhnQWtVRVFDQUFLQUlFSUFFb0FnUkdEd3NnQUNBQlJnUkFRUUVQQ3dKQUlBQW9BZ1FpQWkwQUFDSUFSU0FBSUFFb0FnUWlBUzBBQUNJRFIzSU5BQU5BSUFFdEFBRWhBeUFDTFFBQklnQkZEUUVnQVVFQmFpRUJJQUpCQVdvaEFpQUFJQU5HRFFBTEN5QUFJQU5HQzA4QkFuOUJ1Qm9vQWdBaUFTQUFRUWRxUVhoeElnSnFJUUFDUUNBQ1FRQWdBQ0FCVFJ0RkJFQWdBRDhBUVJCMFRRMEJJQUFRQmcwQkMwSElHa0V3TmdJQVFYOFBDMEc0R2lBQU5nSUFJQUVMQmdBZ0FCQVBDeWtBUWNBYVFRRTJBZ0JCeEJwQkFEWUNBQkFTUWNRYVFid2FLQUlBTmdJQVFid2FRY0FhTmdJQUN3SUFDOUlMQVFkL0FrQWdBRVVOQUNBQVFRaHJJZ0lnQUVFRWF5Z0NBQ0lCUVhoeElnQnFJUVVDUUNBQlFRRnhEUUFnQVVFQ2NVVU5BU0FDSUFJb0FnQWlBV3NpQWtIY0dpZ0NBRWtOQVNBQUlBRnFJUUFDUUFKQVFlQWFLQUlBSUFKSEJFQWdBVUgvQVUwRVFDQUJRUU4ySVFRZ0FpZ0NEQ0lCSUFJb0FnZ2lBMFlFUUVITUdrSE1HaWdDQUVGK0lBUjNjVFlDQUF3RkN5QURJQUUyQWd3Z0FTQUROZ0lJREFRTElBSW9BaGdoQmlBQ0lBSW9BZ3dpQVVjRVFDQUNLQUlJSWdNZ0FUWUNEQ0FCSUFNMkFnZ01Bd3NnQWtFVWFpSUVLQUlBSWdORkJFQWdBaWdDRUNJRFJRMENJQUpCRUdvaEJBc0RRQ0FFSVFjZ0F5SUJRUlJxSWdRb0FnQWlBdzBBSUFGQkVHb2hCQ0FCS0FJUUlnTU5BQXNnQjBFQU5nSUFEQUlMSUFVb0FnUWlBVUVEY1VFRFJ3MENRZFFhSUFBMkFnQWdCU0FCUVg1eE5nSUVJQUlnQUVFQmNqWUNCQ0FGSUFBMkFnQVBDMEVBSVFFTElBWkZEUUFDUUNBQ0tBSWNJZ05CQW5SQi9CeHFJZ1FvQWdBZ0FrWUVRQ0FFSUFFMkFnQWdBUTBCUWRBYVFkQWFLQUlBUVg0Z0EzZHhOZ0lBREFJTElBWkJFRUVVSUFZb0FoQWdBa1liYWlBQk5nSUFJQUZGRFFFTElBRWdCallDR0NBQ0tBSVFJZ01FUUNBQklBTTJBaEFnQXlBQk5nSVlDeUFDS0FJVUlnTkZEUUFnQVNBRE5nSVVJQU1nQVRZQ0dBc2dBaUFGVHcwQUlBVW9BZ1FpQVVFQmNVVU5BQUpBQWtBQ1FBSkFJQUZCQW5GRkJFQkI1Qm9vQWdBZ0JVWUVRRUhrR2lBQ05nSUFRZGdhUWRnYUtBSUFJQUJxSWdBMkFnQWdBaUFBUVFGeU5nSUVJQUpCNEJvb0FnQkhEUVpCMUJwQkFEWUNBRUhnR2tFQU5nSUFEd3RCNEJvb0FnQWdCVVlFUUVIZ0dpQUNOZ0lBUWRRYVFkUWFLQUlBSUFCcUlnQTJBZ0FnQWlBQVFRRnlOZ0lFSUFBZ0Ftb2dBRFlDQUE4TElBRkJlSEVnQUdvaEFDQUJRZjhCVFFSQUlBRkJBM1loQkNBRktBSU1JZ0VnQlNnQ0NDSURSZ1JBUWN3YVFjd2FLQUlBUVg0Z0JIZHhOZ0lBREFVTElBTWdBVFlDRENBQklBTTJBZ2dNQkFzZ0JTZ0NHQ0VHSUFVZ0JTZ0NEQ0lCUndSQVFkd2FLQUlBR2lBRktBSUlJZ01nQVRZQ0RDQUJJQU0yQWdnTUF3c2dCVUVVYWlJRUtBSUFJZ05GQkVBZ0JTZ0NFQ0lEUlEwQ0lBVkJFR29oQkFzRFFDQUVJUWNnQXlJQlFSUnFJZ1FvQWdBaUF3MEFJQUZCRUdvaEJDQUJLQUlRSWdNTkFBc2dCMEVBTmdJQURBSUxJQVVnQVVGK2NUWUNCQ0FDSUFCQkFYSTJBZ1FnQUNBQ2FpQUFOZ0lBREFNTFFRQWhBUXNnQmtVTkFBSkFJQVVvQWh3aUEwRUNkRUg4SEdvaUJDZ0NBQ0FGUmdSQUlBUWdBVFlDQUNBQkRRRkIwQnBCMEJvb0FnQkJmaUFEZDNFMkFnQU1BZ3NnQmtFUVFSUWdCaWdDRUNBRlJodHFJQUUyQWdBZ0FVVU5BUXNnQVNBR05nSVlJQVVvQWhBaUF3UkFJQUVnQXpZQ0VDQURJQUUyQWhnTElBVW9BaFFpQTBVTkFDQUJJQU0yQWhRZ0F5QUJOZ0lZQ3lBQ0lBQkJBWEkyQWdRZ0FDQUNhaUFBTmdJQUlBSkI0Qm9vQWdCSERRQkIxQm9nQURZQ0FBOExJQUJCL3dGTkJFQWdBRUY0Y1VIMEdtb2hBUUovUWN3YUtBSUFJZ05CQVNBQVFRTjJkQ0lBY1VVRVFFSE1HaUFBSUFOeU5nSUFJQUVNQVFzZ0FTZ0NDQXNoQUNBQklBSTJBZ2dnQUNBQ05nSU1JQUlnQVRZQ0RDQUNJQUEyQWdnUEMwRWZJUU1nQUVILy8vOEhUUVJBSUFCQkppQUFRUWgyWnlJQmEzWkJBWEVnQVVFQmRHdEJQbW9oQXdzZ0FpQUROZ0ljSUFKQ0FEY0NFQ0FEUVFKMFFmd2NhaUVCQWtBQ1FBSkFRZEFhS0FJQUlnUkJBU0FEZENJSGNVVUVRRUhRR2lBRUlBZHlOZ0lBSUFFZ0FqWUNBQ0FDSUFFMkFoZ01BUXNnQUVFWklBTkJBWFpyUVFBZ0EwRWZSeHQwSVFNZ0FTZ0NBQ0VCQTBBZ0FTSUVLQUlFUVhoeElBQkdEUUlnQTBFZGRpRUJJQU5CQVhRaEF5QUVJQUZCQkhGcUlnZEJFR29vQWdBaUFRMEFDeUFISUFJMkFoQWdBaUFFTmdJWUN5QUNJQUkyQWd3Z0FpQUNOZ0lJREFFTElBUW9BZ2dpQUNBQ05nSU1JQVFnQWpZQ0NDQUNRUUEyQWhnZ0FpQUVOZ0lNSUFJZ0FEWUNDQXRCN0JwQjdCb29BZ0JCQVdzaUFFRi9JQUFiTmdJQUN3c3BBUUYvSUFFRVFDQUFJUUlEUUNBQ1FRQTZBQUFnQWtFQmFpRUNJQUZCQVdzaUFRMEFDd3NnQUFzY0FDQUFJQUZCQ0NBQ3B5QUNRaUNJcHlBRHB5QURRaUNJcHhBRkMrRURBRUhzRjBHYUNSQUpRZmdYUWJrSVFRRkJBQkFJUVlRWVFiUUlRUUZCZ0g5Qi93QVFBVUdjR0VHdENFRUJRWUIvUWY4QUVBRkJrQmhCcXdoQkFVRUFRZjhCRUFGQnFCaEJpUWhCQWtHQWdINUIvLzhCRUFGQnRCaEJnQWhCQWtFQVFmLy9BeEFCUWNBWVFaZ0lRUVJCZ0lDQWdIaEIvLy8vL3djUUFVSE1HRUdQQ0VFRVFRQkJmeEFCUWRnWVFkY0lRUVJCZ0lDQWdIaEIvLy8vL3djUUFVSGtHRUhPQ0VFRVFRQkJmeEFCUWZBWVFhTUlRb0NBZ0lDQWdJQ0FnSDlDLy8vLy8vLy8vLy8vQUJBUlFmd1lRYUlJUWdCQ2Z4QVJRWWdaUVp3SVFRUVFCRUdVR1VHVENVRUlFQVJCaEE5QjZRZ1FBMEhNRDBHWERSQURRWlFRUVFSQjNBZ1FBa0hnRUVFQ1FmVUlFQUpCckJGQkJFR0VDUkFDUWNnUlFiNElFQWRCOEJGQkFFSFNEQkFBUVpnU1FRQkJ1QTBRQUVIQUVrRUJRZkFNRUFCQjZCSkJBa0dmQ1JBQVFaQVRRUU5CdmdrUUFFRzRFMEVFUWVZSkVBQkI0Qk5CQlVHRENoQUFRWWdVUVFSQjNRMFFBRUd3RkVFRlFmc05FQUJCbUJKQkFFSHBDaEFBUWNBU1FRRkJ5QW9RQUVIb0VrRUNRYXNMRUFCQmtCTkJBMEdKQ3hBQVFiZ1RRUVJCc1F3UUFFSGdFMEVGUVk4TUVBQkIyQlJCQ0VIdUN4QUFRWUFWUVFsQnpBc1FBRUdvRlVFR1Fha0tFQUJCMEJWQkIwR2lEaEFBQ3lBQUFrQWdBQ2dDQkNBQlJ3MEFJQUFvQWh4QkFVWU5BQ0FBSUFJMkFod0xDNW9CQUNBQVFRRTZBRFVDUUNBQUtBSUVJQUpIRFFBZ0FFRUJPZ0EwQWtBZ0FDZ0NFQ0lDUlFSQUlBQkJBVFlDSkNBQUlBTTJBaGdnQUNBQk5nSVFJQU5CQVVjTkFpQUFLQUl3UVFGR0RRRU1BZ3NnQVNBQ1JnUkFJQUFvQWhnaUFrRUNSZ1JBSUFBZ0F6WUNHQ0FESVFJTElBQW9BakJCQVVjTkFpQUNRUUZHRFFFTUFnc2dBQ0FBS0FJa1FRRnFOZ0lrQ3lBQVFRRTZBRFlMQzEwQkFYOGdBQ2dDRUNJRFJRUkFJQUJCQVRZQ0pDQUFJQUkyQWhnZ0FDQUJOZ0lRRHdzQ1FDQUJJQU5HQkVBZ0FDZ0NHRUVDUncwQklBQWdBallDR0E4TElBQkJBVG9BTmlBQVFRSTJBaGdnQUNBQUtBSWtRUUZxTmdJa0N3c0VBQ0FBQzhZbkFReC9Jd0JCRUdzaUNpUUFBa0FDUUFKQUFrQUNRQUpBQWtBQ1FBSkFJQUJCOUFGTkJFQkJ6Qm9vQWdBaUJrRVFJQUJCQzJwQitBTnhJQUJCQzBrYklnVkJBM1lpQUhZaUFVRURjUVJBQWtBZ0FVRi9jMEVCY1NBQWFpSUNRUU4wSWdGQjlCcHFJZ0FnQVVIOEdtb29BZ0FpQVNnQ0NDSURSZ1JBUWN3YUlBWkJmaUFDZDNFMkFnQU1BUXNnQXlBQU5nSU1JQUFnQXpZQ0NBc2dBVUVJYWlFQUlBRWdBa0VEZENJQ1FRTnlOZ0lFSUFFZ0Ftb2lBU0FCS0FJRVFRRnlOZ0lFREFvTElBVkIxQm9vQWdBaUIwME5BU0FCQkVBQ1FFRUNJQUIwSWdKQkFDQUNhM0lnQVNBQWRIRm9JZ0ZCQTNRaUFFSDBHbW9pQWlBQVFmd2FhaWdDQUNJQUtBSUlJZ05HQkVCQnpCb2dCa0YrSUFGM2NTSUdOZ0lBREFFTElBTWdBallDRENBQ0lBTTJBZ2dMSUFBZ0JVRURjallDQkNBQUlBVnFJZ1FnQVVFRGRDSUJJQVZySWdOQkFYSTJBZ1FnQUNBQmFpQUROZ0lBSUFjRVFDQUhRWGh4UWZRYWFpRUJRZUFhS0FJQUlRSUNmeUFHUVFFZ0IwRURkblFpQlhGRkJFQkJ6Qm9nQlNBR2NqWUNBQ0FCREFFTElBRW9BZ2dMSVFVZ0FTQUNOZ0lJSUFVZ0FqWUNEQ0FDSUFFMkFnd2dBaUFGTmdJSUN5QUFRUWhxSVFCQjRCb2dCRFlDQUVIVUdpQUROZ0lBREFvTFFkQWFLQUlBSWd0RkRRRWdDMmhCQW5SQi9CeHFLQUlBSWdJb0FnUkJlSEVnQldzaEJDQUNJUUVEUUFKQUlBRW9BaEFpQUVVRVFDQUJLQUlVSWdCRkRRRUxJQUFvQWdSQmVIRWdCV3NpQVNBRUlBRWdCRWtpQVJzaEJDQUFJQUlnQVJzaEFpQUFJUUVNQVFzTElBSW9BaGdoQ1NBQ0lBSW9BZ3dpQTBjRVFFSGNHaWdDQUJvZ0FpZ0NDQ0lBSUFNMkFnd2dBeUFBTmdJSURBa0xJQUpCRkdvaUFTZ0NBQ0lBUlFSQUlBSW9BaEFpQUVVTkF5QUNRUkJxSVFFTEEwQWdBU0VJSUFBaUEwRVVhaUlCS0FJQUlnQU5BQ0FEUVJCcUlRRWdBeWdDRUNJQURRQUxJQWhCQURZQ0FBd0lDMEYvSVFVZ0FFRy9mMHNOQUNBQVFRdHFJZ0JCZUhFaEJVSFFHaWdDQUNJSVJRMEFRUUFnQldzaEJBSkFBa0FDUUFKL1FRQWdCVUdBQWtrTkFCcEJIeUFGUWYvLy93ZExEUUFhSUFWQkppQUFRUWgyWnlJQWEzWkJBWEVnQUVFQmRHdEJQbW9MSWdkQkFuUkIvQnhxS0FJQUlnRkZCRUJCQUNFQURBRUxRUUFoQUNBRlFSa2dCMEVCZG10QkFDQUhRUjlIRzNRaEFnTkFBa0FnQVNnQ0JFRjRjU0FGYXlJR0lBUlBEUUFnQVNFRElBWWlCQTBBUVFBaEJDQUJJUUFNQXdzZ0FDQUJLQUlVSWdZZ0JpQUJJQUpCSFhaQkJIRnFLQUlRSWdGR0d5QUFJQVliSVFBZ0FrRUJkQ0VDSUFFTkFBc0xJQUFnQTNKRkJFQkJBQ0VEUVFJZ0IzUWlBRUVBSUFCcmNpQUljU0lBUlEwRElBQm9RUUowUWZ3Y2FpZ0NBQ0VBQ3lBQVJRMEJDd05BSUFBb0FnUkJlSEVnQldzaUFpQUVTU0VCSUFJZ0JDQUJHeUVFSUFBZ0F5QUJHeUVESUFBb0FoQWlBUVIvSUFFRklBQW9BaFFMSWdBTkFBc0xJQU5GRFFBZ0JFSFVHaWdDQUNBRmEwOE5BQ0FES0FJWUlRY2dBeUFES0FJTUlnSkhCRUJCM0Jvb0FnQWFJQU1vQWdnaUFDQUNOZ0lNSUFJZ0FEWUNDQXdIQ3lBRFFSUnFJZ0VvQWdBaUFFVUVRQ0FES0FJUUlnQkZEUU1nQTBFUWFpRUJDd05BSUFFaEJpQUFJZ0pCRkdvaUFTZ0NBQ0lBRFFBZ0FrRVFhaUVCSUFJb0FoQWlBQTBBQ3lBR1FRQTJBZ0FNQmdzZ0JVSFVHaWdDQUNJRFRRUkFRZUFhS0FJQUlRQUNRQ0FESUFWcklnRkJFRThFUUNBQUlBVnFJZ0lnQVVFQmNqWUNCQ0FBSUFOcUlBRTJBZ0FnQUNBRlFRTnlOZ0lFREFFTElBQWdBMEVEY2pZQ0JDQUFJQU5xSWdFZ0FTZ0NCRUVCY2pZQ0JFRUFJUUpCQUNFQkMwSFVHaUFCTmdJQVFlQWFJQUkyQWdBZ0FFRUlhaUVBREFnTElBVkIyQm9vQWdBaUFra0VRRUhZR2lBQ0lBVnJJZ0UyQWdCQjVCcEI1Qm9vQWdBaUFDQUZhaUlDTmdJQUlBSWdBVUVCY2pZQ0JDQUFJQVZCQTNJMkFnUWdBRUVJYWlFQURBZ0xRUUFoQUNBRlFTOXFJZ1FDZjBHa0hpZ0NBQVJBUWF3ZUtBSUFEQUVMUWJBZVFuODNBZ0JCcUI1Q2dLQ0FnSUNBQkRjQ0FFR2tIaUFLUVF4cVFYQnhRZGlxMWFvRmN6WUNBRUc0SGtFQU5nSUFRWWdlUVFBMkFnQkJnQ0FMSWdGcUlnWkJBQ0FCYXlJSWNTSUJJQVZORFFkQmhCNG9BZ0FpQXdSQVFmd2RLQUlBSWdjZ0FXb2lDU0FIVFNBRElBbEpjZzBJQ3dKQVFZZ2VMUUFBUVFSeFJRUkFBa0FDUUFKQUFrQkI1Qm9vQWdBaUF3UkFRWXdlSVFBRFFDQURJQUFvQWdBaUIwOEVRQ0FISUFBb0FnUnFJQU5MRFFNTElBQW9BZ2dpQUEwQUN3dEJBQkFMSWdKQmYwWU5BeUFCSVFaQnFCNG9BZ0FpQUVFQmF5SURJQUp4QkVBZ0FTQUNheUFDSUFOcVFRQWdBR3R4YWlFR0N5QUZJQVpQRFFOQmhCNG9BZ0FpQUFSQVFmd2RLQUlBSWdNZ0Jtb2lDQ0FEVFNBQUlBaEpjZzBFQ3lBR0VBc2lBQ0FDUncwQkRBVUxJQVlnQW1zZ0NIRWlCaEFMSWdJZ0FDZ0NBQ0FBS0FJRWFrWU5BU0FDSVFBTElBQkJmMFlOQVNBRlFUQnFJQVpOQkVBZ0FDRUNEQVFMUWF3ZUtBSUFJZ0lnQkNBR2EycEJBQ0FDYTNFaUFoQUxRWDlHRFFFZ0FpQUdhaUVHSUFBaEFnd0RDeUFDUVg5SERRSUxRWWdlUVlnZUtBSUFRUVJ5TmdJQUN5QUJFQXNpQWtGL1JrRUFFQXNpQUVGL1JuSWdBQ0FDVFhJTkJTQUFJQUpySWdZZ0JVRW9hazBOQlF0Qi9CMUIvQjBvQWdBZ0Jtb2lBRFlDQUVHQUhpZ0NBQ0FBU1FSQVFZQWVJQUEyQWdBTEFrQkI1Qm9vQWdBaUJBUkFRWXdlSVFBRFFDQUNJQUFvQWdBaUFTQUFLQUlFSWdOcVJnMENJQUFvQWdnaUFBMEFDd3dFQzBIY0dpZ0NBQ0lBUVFBZ0FDQUNUUnRGQkVCQjNCb2dBallDQUF0QkFDRUFRWkFlSUFZMkFnQkJqQjRnQWpZQ0FFSHNHa0YvTmdJQVFmQWFRYVFlS0FJQU5nSUFRWmdlUVFBMkFnQURRQ0FBUVFOMElnRkIvQnBxSUFGQjlCcHFJZ00yQWdBZ0FVR0FHMm9nQXpZQ0FDQUFRUUZxSWdCQklFY05BQXRCMkJvZ0JrRW9heUlBUVhnZ0FtdEJCM0VpQVdzaUF6WUNBRUhrR2lBQklBSnFJZ0UyQWdBZ0FTQURRUUZ5TmdJRUlBQWdBbXBCS0RZQ0JFSG9Ha0cwSGlnQ0FEWUNBQXdFQ3lBQ0lBUk5JQUVnQkV0eURRSWdBQ2dDREVFSWNRMENJQUFnQXlBR2FqWUNCRUhrR2lBRVFYZ2dCR3RCQjNFaUFHb2lBVFlDQUVIWUdrSFlHaWdDQUNBR2FpSUNJQUJySWdBMkFnQWdBU0FBUVFGeU5nSUVJQUlnQkdwQktEWUNCRUhvR2tHMEhpZ0NBRFlDQUF3REMwRUFJUU1NQlF0QkFDRUNEQU1MUWR3YUtBSUFJQUpMQkVCQjNCb2dBallDQUFzZ0FpQUdhaUVCUVl3ZUlRQUNRQUpBQWtBRFFDQUJJQUFvQWdCSEJFQWdBQ2dDQ0NJQURRRU1BZ3NMSUFBdEFBeEJDSEZGRFFFTFFZd2VJUUFEUUFKQUlBUWdBQ2dDQUNJQlR3UkFJQUVnQUNnQ0JHb2lBeUFFU3cwQkN5QUFLQUlJSVFBTUFRc0xRZGdhSUFaQktHc2lBRUY0SUFKclFRZHhJZ0ZySWdnMkFnQkI1Qm9nQVNBQ2FpSUJOZ0lBSUFFZ0NFRUJjallDQkNBQUlBSnFRU2cyQWdSQjZCcEJ0QjRvQWdBMkFnQWdCQ0FEUVNjZ0EydEJCM0ZxUVM5cklnQWdBQ0FFUVJCcVNSc2lBVUViTmdJRUlBRkJsQjRwQWdBM0FoQWdBVUdNSGlrQ0FEY0NDRUdVSGlBQlFRaHFOZ0lBUVpBZUlBWTJBZ0JCakI0Z0FqWUNBRUdZSGtFQU5nSUFJQUZCR0dvaEFBTkFJQUJCQnpZQ0JDQUFRUWhxSVF3Z0FFRUVhaUVBSUF3Z0Ewa05BQXNnQVNBRVJnMENJQUVnQVNnQ0JFRitjVFlDQkNBRUlBRWdCR3NpQWtFQmNqWUNCQ0FCSUFJMkFnQWdBa0gvQVUwRVFDQUNRWGh4UWZRYWFpRUFBbjlCekJvb0FnQWlBVUVCSUFKQkEzWjBJZ0p4UlFSQVFjd2FJQUVnQW5JMkFnQWdBQXdCQ3lBQUtBSUlDeUVCSUFBZ0JEWUNDQ0FCSUFRMkFnd2dCQ0FBTmdJTUlBUWdBVFlDQ0F3REMwRWZJUUFnQWtILy8vOEhUUVJBSUFKQkppQUNRUWgyWnlJQWEzWkJBWEVnQUVFQmRHdEJQbW9oQUFzZ0JDQUFOZ0ljSUFSQ0FEY0NFQ0FBUVFKMFFmd2NhaUVCQWtCQjBCb29BZ0FpQTBFQklBQjBJZ1p4UlFSQVFkQWFJQU1nQm5JMkFnQWdBU0FFTmdJQURBRUxJQUpCR1NBQVFRRjJhMEVBSUFCQkgwY2JkQ0VBSUFFb0FnQWhBd05BSUFNaUFTZ0NCRUY0Y1NBQ1JnMERJQUJCSFhZaEF5QUFRUUYwSVFBZ0FTQURRUVJ4YWlJR0tBSVFJZ01OQUFzZ0JpQUVOZ0lRQ3lBRUlBRTJBaGdnQkNBRU5nSU1JQVFnQkRZQ0NBd0NDeUFBSUFJMkFnQWdBQ0FBS0FJRUlBWnFOZ0lFSUFKQmVDQUNhMEVIY1dvaUJ5QUZRUU55TmdJRUlBRkJlQ0FCYTBFSGNXb2lCQ0FGSUFkcUlnVnJJUVlDUUVIa0dpZ0NBQ0FFUmdSQVFlUWFJQVUyQWdCQjJCcEIyQm9vQWdBZ0Jtb2lBRFlDQUNBRklBQkJBWEkyQWdRTUFRdEI0Qm9vQWdBZ0JFWUVRRUhnR2lBRk5nSUFRZFFhUWRRYUtBSUFJQVpxSWdBMkFnQWdCU0FBUVFGeU5nSUVJQUFnQldvZ0FEWUNBQXdCQ3lBRUtBSUVJZ0pCQTNGQkFVWUVRQ0FDUVhoeElRa0NRQ0FDUWY4QlRRUkFJQVFvQWd3aUFDQUVLQUlJSWdGR0JFQkJ6QnBCekJvb0FnQkJmaUFDUVFOMmQzRTJBZ0FNQWdzZ0FTQUFOZ0lNSUFBZ0FUWUNDQXdCQ3lBRUtBSVlJUWdDUUNBRUlBUW9BZ3dpQUVjRVFFSGNHaWdDQUJvZ0JDZ0NDQ0lCSUFBMkFnd2dBQ0FCTmdJSURBRUxBa0FnQkVFVWFpSUJLQUlBSWdKRkJFQWdCQ2dDRUNJQ1JRMEJJQVJCRUdvaEFRc0RRQ0FCSVFNZ0FpSUFRUlJxSWdFb0FnQWlBZzBBSUFCQkVHb2hBU0FBS0FJUUlnSU5BQXNnQTBFQU5nSUFEQUVMUVFBaEFBc2dDRVVOQUFKQUlBUW9BaHdpQVVFQ2RFSDhIR29pQWlnQ0FDQUVSZ1JBSUFJZ0FEWUNBQ0FBRFFGQjBCcEIwQm9vQWdCQmZpQUJkM0UyQWdBTUFnc2dDRUVRUVJRZ0NDZ0NFQ0FFUmh0cUlBQTJBZ0FnQUVVTkFRc2dBQ0FJTmdJWUlBUW9BaEFpQVFSQUlBQWdBVFlDRUNBQklBQTJBaGdMSUFRb0FoUWlBVVVOQUNBQUlBRTJBaFFnQVNBQU5nSVlDeUFHSUFscUlRWWdCQ0FKYWlJRUtBSUVJUUlMSUFRZ0FrRitjVFlDQkNBRklBWkJBWEkyQWdRZ0JTQUdhaUFHTmdJQUlBWkIvd0ZOQkVBZ0JrRjRjVUgwR21vaEFBSi9RY3dhS0FJQUlnRkJBU0FHUVFOMmRDSUNjVVVFUUVITUdpQUJJQUp5TmdJQUlBQU1BUXNnQUNnQ0NBc2hBU0FBSUFVMkFnZ2dBU0FGTmdJTUlBVWdBRFlDRENBRklBRTJBZ2dNQVF0Qkh5RUNJQVpCLy8vL0IwMEVRQ0FHUVNZZ0JrRUlkbWNpQUd0MlFRRnhJQUJCQVhSclFUNXFJUUlMSUFVZ0FqWUNIQ0FGUWdBM0FoQWdBa0VDZEVIOEhHb2hBUUpBQWtCQjBCb29BZ0FpQUVFQklBSjBJZ054UlFSQVFkQWFJQUFnQTNJMkFnQWdBU0FGTmdJQURBRUxJQVpCR1NBQ1FRRjJhMEVBSUFKQkgwY2JkQ0VDSUFFb0FnQWhBQU5BSUFBaUFTZ0NCRUY0Y1NBR1JnMENJQUpCSFhZaEFDQUNRUUYwSVFJZ0FTQUFRUVJ4YWlJREtBSVFJZ0FOQUFzZ0F5QUZOZ0lRQ3lBRklBRTJBaGdnQlNBRk5nSU1JQVVnQlRZQ0NBd0JDeUFCS0FJSUlnQWdCVFlDRENBQklBVTJBZ2dnQlVFQU5nSVlJQVVnQVRZQ0RDQUZJQUEyQWdnTElBZEJDR29oQUF3RkN5QUJLQUlJSWdBZ0JEWUNEQ0FCSUFRMkFnZ2dCRUVBTmdJWUlBUWdBVFlDRENBRUlBQTJBZ2dMUWRnYUtBSUFJZ0FnQlUwTkFFSFlHaUFBSUFWcklnRTJBZ0JCNUJwQjVCb29BZ0FpQUNBRmFpSUNOZ0lBSUFJZ0FVRUJjallDQkNBQUlBVkJBM0kyQWdRZ0FFRUlhaUVBREFNTFFjZ2FRVEEyQWdCQkFDRUFEQUlMQWtBZ0IwVU5BQUpBSUFNb0Fod2lBRUVDZEVIOEhHb2lBU2dDQUNBRFJnUkFJQUVnQWpZQ0FDQUNEUUZCMEJvZ0NFRitJQUIzY1NJSU5nSUFEQUlMSUFkQkVFRVVJQWNvQWhBZ0EwWWJhaUFDTmdJQUlBSkZEUUVMSUFJZ0J6WUNHQ0FES0FJUUlnQUVRQ0FDSUFBMkFoQWdBQ0FDTmdJWUN5QURLQUlVSWdCRkRRQWdBaUFBTmdJVUlBQWdBallDR0FzQ1FDQUVRUTlOQkVBZ0F5QUVJQVZxSWdCQkEzSTJBZ1FnQUNBRGFpSUFJQUFvQWdSQkFYSTJBZ1FNQVFzZ0F5QUZRUU55TmdJRUlBTWdCV29pQWlBRVFRRnlOZ0lFSUFJZ0JHb2dCRFlDQUNBRVFmOEJUUVJBSUFSQmVIRkI5QnBxSVFBQ2YwSE1HaWdDQUNJQlFRRWdCRUVEZG5RaUJYRkZCRUJCekJvZ0FTQUZjallDQUNBQURBRUxJQUFvQWdnTElRRWdBQ0FDTmdJSUlBRWdBallDRENBQ0lBQTJBZ3dnQWlBQk5nSUlEQUVMUVI4aEFDQUVRZi8vL3dkTkJFQWdCRUVtSUFSQkNIWm5JZ0JyZGtFQmNTQUFRUUYwYTBFK2FpRUFDeUFDSUFBMkFod2dBa0lBTndJUUlBQkJBblJCL0J4cUlRRUNRQUpBSUFoQkFTQUFkQ0lGY1VVRVFFSFFHaUFGSUFoeU5nSUFJQUVnQWpZQ0FBd0JDeUFFUVJrZ0FFRUJkbXRCQUNBQVFSOUhHM1FoQUNBQktBSUFJUVVEUUNBRklnRW9BZ1JCZUhFZ0JFWU5BaUFBUVIxMklRVWdBRUVCZENFQUlBRWdCVUVFY1dvaUJpZ0NFQ0lGRFFBTElBWWdBallDRUFzZ0FpQUJOZ0lZSUFJZ0FqWUNEQ0FDSUFJMkFnZ01BUXNnQVNnQ0NDSUFJQUkyQWd3Z0FTQUNOZ0lJSUFKQkFEWUNHQ0FDSUFFMkFnd2dBaUFBTmdJSUN5QURRUWhxSVFBTUFRc0NRQ0FKUlEwQUFrQWdBaWdDSENJQVFRSjBRZndjYWlJQktBSUFJQUpHQkVBZ0FTQUROZ0lBSUFNTkFVSFFHaUFMUVg0Z0FIZHhOZ0lBREFJTElBbEJFRUVVSUFrb0FoQWdBa1liYWlBRE5nSUFJQU5GRFFFTElBTWdDVFlDR0NBQ0tBSVFJZ0FFUUNBRElBQTJBaEFnQUNBRE5nSVlDeUFDS0FJVUlnQkZEUUFnQXlBQU5nSVVJQUFnQXpZQ0dBc0NRQ0FFUVE5TkJFQWdBaUFFSUFWcUlnQkJBM0kyQWdRZ0FDQUNhaUlBSUFBb0FnUkJBWEkyQWdRTUFRc2dBaUFGUVFOeU5nSUVJQUlnQldvaUF5QUVRUUZ5TmdJRUlBTWdCR29nQkRZQ0FDQUhCRUFnQjBGNGNVSDBHbW9oQUVIZ0dpZ0NBQ0VCQW45QkFTQUhRUU4yZENJRklBWnhSUVJBUWN3YUlBVWdCbkkyQWdBZ0FBd0JDeUFBS0FJSUN5RUZJQUFnQVRZQ0NDQUZJQUUyQWd3Z0FTQUFOZ0lNSUFFZ0JUWUNDQXRCNEJvZ0F6WUNBRUhVR2lBRU5nSUFDeUFDUVFocUlRQUxJQXBCRUdva0FDQUFDeG9BSUFBZ0FTZ0NDQ0FGRUFvRVFDQUJJQUlnQXlBRUVCUUxDemNBSUFBZ0FTZ0NDQ0FGRUFvRVFDQUJJQUlnQXlBRUVCUVBDeUFBS0FJSUlnQWdBU0FDSUFNZ0JDQUZJQUFvQWdBb0FoUVJBd0FMa1FFQUlBQWdBU2dDQ0NBRUVBb0VRQ0FCSUFJZ0F4QVREd3NDUUNBQUlBRW9BZ0FnQkJBS1JRMEFBa0FnQWlBQktBSVFSd1JBSUFFb0FoUWdBa2NOQVFzZ0EwRUJSdzBCSUFGQkFUWUNJQThMSUFFZ0FqWUNGQ0FCSUFNMkFpQWdBU0FCS0FJb1FRRnFOZ0lvQWtBZ0FTZ0NKRUVCUncwQUlBRW9BaGhCQWtjTkFDQUJRUUU2QURZTElBRkJCRFlDTEFzTDhnRUFJQUFnQVNnQ0NDQUVFQW9FUUNBQklBSWdBeEFURHdzQ1FDQUFJQUVvQWdBZ0JCQUtCRUFDUUNBQ0lBRW9BaEJIQkVBZ0FTZ0NGQ0FDUncwQkN5QURRUUZIRFFJZ0FVRUJOZ0lnRHdzZ0FTQUROZ0lnQWtBZ0FTZ0NMRUVFUmcwQUlBRkJBRHNCTkNBQUtBSUlJZ0FnQVNBQ0lBSkJBU0FFSUFBb0FnQW9BaFFSQXdBZ0FTMEFOUVJBSUFGQkF6WUNMQ0FCTFFBMFJRMEJEQU1MSUFGQkJEWUNMQXNnQVNBQ05nSVVJQUVnQVNnQ0tFRUJhallDS0NBQktBSWtRUUZIRFFFZ0FTZ0NHRUVDUncwQklBRkJBVG9BTmc4TElBQW9BZ2dpQUNBQklBSWdBeUFFSUFBb0FnQW9BaGdSQWdBTEN6RUFJQUFnQVNnQ0NFRUFFQW9FUUNBQklBSWdBeEFWRHdzZ0FDZ0NDQ0lBSUFFZ0FpQURJQUFvQWdBb0Fod1JBQUFMR0FBZ0FDQUJLQUlJUVFBUUNnUkFJQUVnQWlBREVCVUxDNEFEQVFSL0l3QkI4QUJySWdJa0FDQUFLQUlBSWdOQkJHc29BZ0FoQkNBRFFRaHJLQUlBSVFVZ0FrSUFOd0pRSUFKQ0FEY0NXQ0FDUWdBM0FtQWdBa0lBTndCbklBSkNBRGNDU0NBQ1FRQTJBa1FnQWtIOEZUWUNRQ0FDSUFBMkFqd2dBaUFCTmdJNElBQWdCV29oQXdKQUlBUWdBVUVBRUFvRVFFRUFJQU1nQlJzaEFBd0JDeUFBSUFOT0JFQWdBa0lBTndBdklBSkNBRGNDR0NBQ1FnQTNBaUFnQWtJQU53SW9JQUpDQURjQ0VDQUNRUUEyQWd3Z0FpQUJOZ0lJSUFJZ0FEWUNCQ0FDSUFRMkFnQWdBa0VCTmdJd0lBUWdBaUFESUFOQkFVRUFJQVFvQWdBb0FoUVJBd0FnQWlnQ0dBMEJDMEVBSVFBZ0JDQUNRVGhxSUFOQkFVRUFJQVFvQWdBb0FoZ1JBZ0FDUUFKQUlBSW9BbHdPQWdBQkFnc2dBaWdDVEVFQUlBSW9BbGhCQVVZYlFRQWdBaWdDVkVFQlJodEJBQ0FDS0FKZ1FRRkdHeUVBREFFTElBSW9BbEJCQVVjRVFDQUNLQUpnRFFFZ0FpZ0NWRUVCUncwQklBSW9BbGhCQVVjTkFRc2dBaWdDU0NFQUN5QUNRZkFBYWlRQUlBQUxtZ0VCQW44akFFRkFhaUlESkFBQ2YwRUJJQUFnQVVFQUVBb05BQnBCQUNBQlJRMEFHa0VBSUFGQnJCWVFIaUlCUlEwQUdpQURRUXhxUVRRUUVCb2dBMEVCTmdJNElBTkJmellDRkNBRElBQTJBaEFnQXlBQk5nSUlJQUVnQTBFSWFpQUNLQUlBUVFFZ0FTZ0NBQ2dDSEJFQUFDQURLQUlnSWdCQkFVWUVRQ0FDSUFNb0FoZzJBZ0FMSUFCQkFVWUxJUVFnQTBGQWF5UUFJQVFMQ2dBZ0FDQUJRUUFRQ2d1QUNnSUlmeUo5UWYvLy8vOEhJUTVCZ0lDQWdIZ2hEMEYvSVFvRFFDQURJQXhHQkVCQkFDRUFJQWxCZ0lBUUVCQWhBVU1BQUlCSElBOGdEbXV5bFNFZEEwQWdBQ0FEUmdSQVFRQWhBQ0FJUVFBMkFnQWdBVUVFYXlFQlFRQWhERUVCSVFzRFFDQUxRWUNBQkVaRkJFQWdDQ0FMUVFKMElnSnFJQUVnQW1vb0FnQWdER29pRERZQ0FDQUxRUUZxSVFzTUFRc0xBMEFnQUNBRFJrVUVRQ0FJSUFZZ0FFRUNkR29vQWdCQkFuUnFJZ0VnQVNnQ0FDSUJRUUZxTmdJQUlBY2dBVUVDZEdvZ0FEWUNBQ0FBUVFGcUlRQU1BUXNMQlFKL0lCMGdCaUFBUVFKMGFpSUNLQUlBSUE1cnM1UWlFa01BQUlCUFhTQVNRd0FBQUFCZ2NRUkFJQktwREFFTFFRQUxJUXNnQWlBTE5nSUFJQUVnQzBFQ2RHb2lBaUFDS0FJQVFRRnFOZ0lBSUFCQkFXb2hBQXdCQ3dzRklBUWdERUVNYkdvaUN5b0NBQ0VTSUFzcUFnZ2hIU0FMS2dJRUlTRWdDaUFDSUF4QkFuUWlEV29vQWdBaUMwY0VRQ0FCSUF0QjBBQnNhaUlLS2dJOEloUWdBQ29DUENJVmxDQUtLZ0k0SWhZZ0FDb0NMQ0lZbENBS0tnSXdJaGtnQUNvQ0RDSWFsQ0FBS2dJY0loNGdDaW9DTkNJVGxKS1NraUVwSUJRZ0FDb0NPQ0lmbENBV0lBQXFBaWdpSUpRZ0dTQUFLZ0lJSWlLVUlBQXFBaGdpSXlBVGxKS1NraUVxSUJRZ0FDb0NOQ0lrbENBV0lBQXFBaVFpSlpRZ0dTQUFLZ0lFSWlhVUlBQXFBaFFpSnlBVGxKS1NraUVySUJRZ0FDb0NNQ0lVbENBV0lBQXFBaUFpRnBRZ0dTQUFLZ0lBSWhtVUlBQXFBaEFpS0NBVGxKS1NraUVzSUFvcUFpd2lFeUFWbENBS0tnSW9JaGNnR0pRZ0Npb0NJQ0liSUJxVUlCNGdDaW9DSkNJY2xKS1NraUV0SUJNZ0g1UWdGeUFnbENBYklDS1VJQ01nSEpTU2twSWhMaUFUSUNTVUlCY2dKWlFnR3lBbWxDQW5JQnlVa3BLU0lTOGdFeUFVbENBWElCYVVJQnNnR1pRZ0tDQWNsSktTa2lFd0lBb3FBaHdpRXlBVmxDQUtLZ0lZSWhjZ0dKUWdDaW9DRUNJYklCcVVJQjRnQ2lvQ0ZDSWNsSktTa2lFeElCTWdINVFnRnlBZ2xDQWJJQ0tVSUNNZ0hKU1NrcEloTWlBVElDU1VJQmNnSlpRZ0d5QW1sQ0FuSUJ5VWtwS1NJVE1nRXlBVWxDQVhJQmFVSUJzZ0daUWdLQ0FjbEpLU2tpRVhJQW9xQWd3aUV5QVZsQ0FLS2dJSUloVWdHSlFnQ2lvQ0FDSVlJQnFVSUFvcUFnUWlHaUFlbEpLU2tpRWVJQk1nSDVRZ0ZTQWdsQ0FZSUNLVUlCb2dJNVNTa3BJaEh5QVRJQ1NVSUJVZ0paUWdHQ0FtbENBYUlDZVVrcEtTSVNBZ0V5QVVsQ0FWSUJhVUlCZ2dHWlFnR2lBb2xKS1NraUVXSUFzaENnc2dCaUFOYWdKL0lDNGdIWlFnSHlBU2xDQWhJREtVa3BJZ0twSkRBQUNBUlpRaUZJdERBQUFBVDEwRVFDQVVxQXdCQzBHQWdJQ0FlQXNpQ3pZQ0FDQUxJQTVLSVJBZ0N5QVBTQ0VSUWY4QklRMENRQ0F0SUIyVUlCNGdFcFFnSVNBeGxKS1NJQ21TSWhSREFBQUFBRnNOQUNBd0lCMlVJQllnRXBRZ0lTQVhsSktTSUN5U0lCU1ZRd0FBZ0QrU1F3QUFBRCtVSWhWREFBQUFBR0JGSUJWREFBQ0FQMTFGY2cwQUlDOGdIWlFnSUNBU2xDQWhJRE9Va3BJZ0s1SWdGSlZEQUFDQVA1SkRBQUFBUDVRaUVrTUFBQUFBWUVVZ0VrTUFBSUEvWFVWeURRQUNmeUFTUXdBQWNFR1VJaEpEQUFDQVQxMGdFa01BQUFBQVlIRUVRQ0FTcVF3QkMwRUFDMEVQYkNFTkFuOGdGVU1BQUhCQmxDSVNRd0FBZ0U5ZElCSkRBQUFBQUdCeEJFQWdFcWtNQVF0QkFBc2dEV29oRFFzZ0RpQUxJQkFiSVE0Z0R5QUxJQkViSVE4Z0JTQU1haUFOT2dBQUlBeEJBV29oREF3QkN3c0xDOGNTQWdCQmdBZ0x0aEoxYm5OcFoyNWxaQ0J6YUc5eWRBQjFibk5wWjI1bFpDQnBiblFBWm14dllYUUFkV2x1ZERZMFgzUUFkVzV6YVdkdVpXUWdZMmhoY2dCaWIyOXNBR1Z0YzJOeWFYQjBaVzQ2T25aaGJBQjFibk5wWjI1bFpDQnNiMjVuQUhOMFpEbzZkM04wY21sdVp3QnpkR1E2T25OMGNtbHVad0J6ZEdRNk9uVXhObk4wY21sdVp3QnpkR1E2T25Vek1uTjBjbWx1WndCa2IzVmliR1VBZG05cFpBQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4emFHOXlkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhkVzV6YVdkdVpXUWdjMmh2Y25RK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEdsdWRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXNXphV2R1WldRZ2FXNTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eG1iRzloZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4ZFdsdWREaGZkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhhVzUwT0Y5MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4MWFXNTBNVFpmZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4YVc1ME1UWmZkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhkV2x1ZERZMFgzUStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BHbHVkRFkwWDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEhWcGJuUXpNbDkwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenhwYm5Rek1sOTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eGphR0Z5UGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYm5OcFoyNWxaQ0JqYUdGeVBnQnpkR1E2T21KaGMybGpYM04wY21sdVp6eDFibk5wWjI1bFpDQmphR0Z5UGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenh6YVdkdVpXUWdZMmhoY2o0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4Ykc5dVp6NEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXNXphV2R1WldRZ2JHOXVaejRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhaRzkxWW14bFBnQk9VM1F6WDE4eU1USmlZWE5wWTE5emRISnBibWRKWTA1VFh6RXhZMmhoY2w5MGNtRnBkSE5KWTBWRlRsTmZPV0ZzYkc5allYUnZja2xqUlVWRlJRQUFBQUNrREFBQVFnY0FBRTVUZEROZlh6SXhNbUpoYzJsalgzTjBjbWx1WjBsb1RsTmZNVEZqYUdGeVgzUnlZV2wwYzBsb1JVVk9VMTg1WVd4c2IyTmhkRzl5U1doRlJVVkZBQUNrREFBQWpBY0FBRTVUZEROZlh6SXhNbUpoYzJsalgzTjBjbWx1WjBsM1RsTmZNVEZqYUdGeVgzUnlZV2wwYzBsM1JVVk9VMTg1WVd4c2IyTmhkRzl5U1hkRlJVVkZBQUNrREFBQTFBY0FBRTVUZEROZlh6SXhNbUpoYzJsalgzTjBjbWx1WjBsRWMwNVRYekV4WTJoaGNsOTBjbUZwZEhOSlJITkZSVTVUWHpsaGJHeHZZMkYwYjNKSlJITkZSVVZGQUFBQXBBd0FBQndJQUFCT1UzUXpYMTh5TVRKaVlYTnBZMTl6ZEhKcGJtZEpSR2xPVTE4eE1XTm9ZWEpmZEhKaGFYUnpTVVJwUlVWT1UxODVZV3hzYjJOaGRHOXlTVVJwUlVWRlJRQUFBS1FNQUFCb0NBQUFUakV3WlcxelkzSnBjSFJsYmpOMllXeEZBQUNrREFBQXRBZ0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTV05GUlFBQXBBd0FBTkFJQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsaFJVVUFBS1FNQUFENENBQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEphRVZGQUFDa0RBQUFJQWtBQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1hORlJRQUFwQXdBQUVnSkFBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbDBSVVVBQUtRTUFBQndDUUFBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKYVVWRkFBQ2tEQUFBbUFrQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NXcEZSUUFBcEF3QUFNQUpBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGxzUlVVQUFLUU1BQURvQ1FBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSmJVVkZBQUNrREFBQUVBb0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTWGhGUlFBQXBBd0FBRGdLQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsNVJVVUFBS1FNQUFCZ0NnQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEpaa1ZGQUFDa0RBQUFpQW9BQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1dSRlJRQUFwQXdBQUxBS0FBQk9NVEJmWDJONGVHRmlhWFl4TVRaZlgzTm9hVzFmZEhsd1pWOXBibVp2UlFBQUFBRE1EQUFBMkFvQUFEQU5BQUJPTVRCZlgyTjRlR0ZpYVhZeE1UZGZYMk5zWVhOelgzUjVjR1ZmYVc1bWIwVUFBQURNREFBQUNBc0FBUHdLQUFCT01UQmZYMk40ZUdGaWFYWXhNVGRmWDNCaVlYTmxYM1I1Y0dWZmFXNW1iMFVBQUFETURBQUFPQXNBQVB3S0FBQk9NVEJmWDJONGVHRmlhWFl4TVRsZlgzQnZhVzUwWlhKZmRIbHdaVjlwYm1adlJRRE1EQUFBYUFzQUFGd0xBQUFBQUFBQTNBc0FBQUlBQUFBREFBQUFCQUFBQUFVQUFBQUdBQUFBVGpFd1gxOWplSGhoWW1sMk1USXpYMTltZFc1a1lXMWxiblJoYkY5MGVYQmxYMmx1Wm05RkFNd01BQUMwQ3dBQS9Bb0FBSFlBQUFDZ0N3QUE2QXNBQUdJQUFBQ2dDd0FBOUFzQUFHTUFBQUNnQ3dBQUFBd0FBR2dBQUFDZ0N3QUFEQXdBQUdFQUFBQ2dDd0FBR0F3QUFITUFBQUNnQ3dBQUpBd0FBSFFBQUFDZ0N3QUFNQXdBQUdrQUFBQ2dDd0FBUEF3QUFHb0FBQUNnQ3dBQVNBd0FBR3dBQUFDZ0N3QUFWQXdBQUcwQUFBQ2dDd0FBWUF3QUFIZ0FBQUNnQ3dBQWJBd0FBSGtBQUFDZ0N3QUFlQXdBQUdZQUFBQ2dDd0FBaEF3QUFHUUFBQUNnQ3dBQWtBd0FBQUFBQUFBc0N3QUFBZ0FBQUFjQUFBQUVBQUFBQlFBQUFBZ0FBQUFKQUFBQUNnQUFBQXNBQUFBQUFBQUFGQTBBQUFJQUFBQU1BQUFBQkFBQUFBVUFBQUFJQUFBQURRQUFBQTRBQUFBUEFBQUFUakV3WDE5amVIaGhZbWwyTVRJd1gxOXphVjlqYkdGemMxOTBlWEJsWDJsdVptOUZBQUFBQU13TUFBRHNEQUFBTEFzQUFGTjBPWFI1Y0dWZmFXNW1id0FBQUFDa0RBQUFJQTBBUWJnYUN3TkFEd0U9IjtpZighaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSl7d2FzbUJpbmFyeUZpbGU9bG9jYXRlRmlsZSh3YXNtQmluYXJ5RmlsZSk7fWZ1bmN0aW9uIGdldEJpbmFyeVN5bmMoZmlsZSl7aWYoZmlsZT09d2FzbUJpbmFyeUZpbGUmJndhc21CaW5hcnkpe3JldHVybiBuZXcgVWludDhBcnJheSh3YXNtQmluYXJ5KX12YXIgYmluYXJ5PXRyeVBhcnNlQXNEYXRhVVJJKGZpbGUpO2lmKGJpbmFyeSl7cmV0dXJuIGJpbmFyeX1pZihyZWFkQmluYXJ5KXtyZXR1cm4gcmVhZEJpbmFyeShmaWxlKX10aHJvdyAiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWQifWZ1bmN0aW9uIGdldEJpbmFyeVByb21pc2UoYmluYXJ5RmlsZSl7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9PmdldEJpbmFyeVN5bmMoYmluYXJ5RmlsZSkpfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIoYmluYXJ5RmlsZSxpbXBvcnRzLHJlY2VpdmVyKXtyZXR1cm4gZ2V0QmluYXJ5UHJvbWlzZShiaW5hcnlGaWxlKS50aGVuKGJpbmFyeT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LGltcG9ydHMpKS50aGVuKGluc3RhbmNlPT5pbnN0YW5jZSkudGhlbihyZWNlaXZlcixyZWFzb249PntlcnIoYGZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICR7cmVhc29ufWApO2Fib3J0KHJlYXNvbik7fSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBc3luYyhiaW5hcnksYmluYXJ5RmlsZSxpbXBvcnRzLGNhbGxiYWNrKXtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spfWZ1bmN0aW9uIGNyZWF0ZVdhc20oKXt2YXIgaW5mbz17ImEiOndhc21JbXBvcnRzfTtmdW5jdGlvbiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UsbW9kdWxlKXt3YXNtRXhwb3J0cz1pbnN0YW5jZS5leHBvcnRzO3dhc21NZW1vcnk9d2FzbUV4cG9ydHNbImsiXTt1cGRhdGVNZW1vcnlWaWV3cygpO2FkZE9uSW5pdCh3YXNtRXhwb3J0c1sibCJdKTtyZW1vdmVSdW5EZXBlbmRlbmN5KCk7cmV0dXJuIHdhc21FeHBvcnRzfWFkZFJ1bkRlcGVuZGVuY3koKTtmdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpe3JlY2VpdmVJbnN0YW5jZShyZXN1bHRbImluc3RhbmNlIl0pO31pZihNb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKXt0cnl7cmV0dXJuIE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0oaW5mbyxyZWNlaXZlSW5zdGFuY2UpfWNhdGNoKGUpe2VycihgTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogJHtlfWApO3JlYWR5UHJvbWlzZVJlamVjdChlKTt9fWluc3RhbnRpYXRlQXN5bmMod2FzbUJpbmFyeSx3YXNtQmluYXJ5RmlsZSxpbmZvLHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KS5jYXRjaChyZWFkeVByb21pc2VSZWplY3QpO3JldHVybiB7fX12YXIgY2FsbFJ1bnRpbWVDYWxsYmFja3M9Y2FsbGJhY2tzPT57d2hpbGUoY2FsbGJhY2tzLmxlbmd0aD4wKXtjYWxsYmFja3Muc2hpZnQoKShNb2R1bGUpO319O01vZHVsZVsibm9FeGl0UnVudGltZSJdfHx0cnVlO3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQ9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e307dmFyIGVtYmluZF9pbml0X2NoYXJDb2Rlcz0oKT0+e3ZhciBjb2Rlcz1uZXcgQXJyYXkoMjU2KTtmb3IodmFyIGk9MDtpPDI1NjsrK2kpe2NvZGVzW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoaSk7fWVtYmluZF9jaGFyQ29kZXM9Y29kZXM7fTt2YXIgZW1iaW5kX2NoYXJDb2Rlczt2YXIgcmVhZExhdGluMVN0cmluZz1wdHI9Pnt2YXIgcmV0PSIiO3ZhciBjPXB0cjt3aGlsZShIRUFQVThbY10pe3JldCs9ZW1iaW5kX2NoYXJDb2Rlc1tIRUFQVThbYysrXV07fXJldHVybiByZXR9O3ZhciBhd2FpdGluZ0RlcGVuZGVuY2llcz17fTt2YXIgcmVnaXN0ZXJlZFR5cGVzPXt9O3ZhciBCaW5kaW5nRXJyb3I7dmFyIHRocm93QmluZGluZ0Vycm9yPW1lc3NhZ2U9Pnt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG1lc3NhZ2UpfTtmdW5jdGlvbiBzaGFyZWRSZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucz17fSl7dmFyIG5hbWU9cmVnaXN0ZXJlZEluc3RhbmNlLm5hbWU7aWYoIXJhd1R5cGUpe3Rocm93QmluZGluZ0Vycm9yKGB0eXBlICIke25hbWV9IiBtdXN0IGhhdmUgYSBwb3NpdGl2ZSBpbnRlZ2VyIHR5cGVpZCBwb2ludGVyYCk7fWlmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7aWYob3B0aW9ucy5pZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zKXtyZXR1cm59ZWxzZSB7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCByZWdpc3RlciB0eXBlICcke25hbWV9JyB0d2ljZWApO319cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdPXJlZ2lzdGVyZWRJbnN0YW5jZTtpZihhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7dmFyIGNhbGxiYWNrcz1hd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtkZWxldGUgYXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07Y2FsbGJhY2tzLmZvckVhY2goY2I9PmNiKCkpO319ZnVuY3Rpb24gcmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe2lmKCEoImFyZ1BhY2tBZHZhbmNlImluIHJlZ2lzdGVyZWRJbnN0YW5jZSkpe3Rocm93IG5ldyBUeXBlRXJyb3IoInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2UiKX1yZXR1cm4gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnMpfXZhciBHZW5lcmljV2lyZVR5cGVTaXplPTg7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2w9KHJhd1R5cGUsbmFtZSx0cnVlVmFsdWUsZmFsc2VWYWx1ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih3dCl7cmV0dXJuICEhd3R9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyxvKXtyZXR1cm4gbz90cnVlVmFsdWU6ZmFsc2VWYWx1ZX0sImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVOFtwb2ludGVyXSl9LGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTtmdW5jdGlvbiBoYW5kbGVBbGxvY2F0b3JJbml0KCl7T2JqZWN0LmFzc2lnbihIYW5kbGVBbGxvY2F0b3IucHJvdG90eXBlLHtnZXQoaWQpe3JldHVybiB0aGlzLmFsbG9jYXRlZFtpZF19LGhhcyhpZCl7cmV0dXJuIHRoaXMuYWxsb2NhdGVkW2lkXSE9PXVuZGVmaW5lZH0sYWxsb2NhdGUoaGFuZGxlKXt2YXIgaWQ9dGhpcy5mcmVlbGlzdC5wb3AoKXx8dGhpcy5hbGxvY2F0ZWQubGVuZ3RoO3RoaXMuYWxsb2NhdGVkW2lkXT1oYW5kbGU7cmV0dXJuIGlkfSxmcmVlKGlkKXt0aGlzLmFsbG9jYXRlZFtpZF09dW5kZWZpbmVkO3RoaXMuZnJlZWxpc3QucHVzaChpZCk7fX0pO31mdW5jdGlvbiBIYW5kbGVBbGxvY2F0b3IoKXt0aGlzLmFsbG9jYXRlZD1bdW5kZWZpbmVkXTt0aGlzLmZyZWVsaXN0PVtdO312YXIgZW12YWxfaGFuZGxlcz1uZXcgSGFuZGxlQWxsb2NhdG9yO3ZhciBfX2VtdmFsX2RlY3JlZj1oYW5kbGU9PntpZihoYW5kbGU+PWVtdmFsX2hhbmRsZXMucmVzZXJ2ZWQmJjA9PT0tLWVtdmFsX2hhbmRsZXMuZ2V0KGhhbmRsZSkucmVmY291bnQpe2VtdmFsX2hhbmRsZXMuZnJlZShoYW5kbGUpO319O3ZhciBjb3VudF9lbXZhbF9oYW5kbGVzPSgpPT57dmFyIGNvdW50PTA7Zm9yKHZhciBpPWVtdmFsX2hhbmRsZXMucmVzZXJ2ZWQ7aTxlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGg7KytpKXtpZihlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZFtpXSE9PXVuZGVmaW5lZCl7Kytjb3VudDt9fXJldHVybiBjb3VudH07dmFyIGluaXRfZW12YWw9KCk9PntlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5wdXNoKHt2YWx1ZTp1bmRlZmluZWR9LHt2YWx1ZTpudWxsfSx7dmFsdWU6dHJ1ZX0se3ZhbHVlOmZhbHNlfSk7ZW12YWxfaGFuZGxlcy5yZXNlcnZlZD1lbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGg7TW9kdWxlWyJjb3VudF9lbXZhbF9oYW5kbGVzIl09Y291bnRfZW12YWxfaGFuZGxlczt9O3ZhciBFbXZhbD17dG9WYWx1ZTpoYW5kbGU9PntpZighaGFuZGxlKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHVzZSBkZWxldGVkIHZhbC4gaGFuZGxlID0gIitoYW5kbGUpO31yZXR1cm4gZW12YWxfaGFuZGxlcy5nZXQoaGFuZGxlKS52YWx1ZX0sdG9IYW5kbGU6dmFsdWU9Pntzd2l0Y2godmFsdWUpe2Nhc2UgdW5kZWZpbmVkOnJldHVybiAxO2Nhc2UgbnVsbDpyZXR1cm4gMjtjYXNlIHRydWU6cmV0dXJuIDM7Y2FzZSBmYWxzZTpyZXR1cm4gNDtkZWZhdWx0OntyZXR1cm4gZW12YWxfaGFuZGxlcy5hbGxvY2F0ZSh7cmVmY291bnQ6MSx2YWx1ZTp2YWx1ZX0pfX19fTtmdW5jdGlvbiBzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUDMyW3BvaW50ZXI+PjJdKX12YXIgX19lbWJpbmRfcmVnaXN0ZXJfZW12YWw9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpoYW5kbGU9Pnt2YXIgcnY9RW12YWwudG9WYWx1ZShoYW5kbGUpO19fZW12YWxfZGVjcmVmKGhhbmRsZSk7cmV0dXJuIHJ2fSwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLHZhbHVlKT0+RW12YWwudG9IYW5kbGUodmFsdWUpLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTt2YXIgZmxvYXRSZWFkVmFsdWVGcm9tUG9pbnRlcj0obmFtZSx3aWR0aCk9Pntzd2l0Y2god2lkdGgpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGMzJbcG9pbnRlcj4+Ml0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQRjY0W3BvaW50ZXI+PjNdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke3dpZHRofSk6ICR7bmFtZX1gKX19O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdD0ocmF3VHlwZSxuYW1lLHNpemUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6dmFsdWU9PnZhbHVlLCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsdmFsdWUpPT52YWx1ZSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2l6ZSksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KTt9O3ZhciBpbnRlZ2VyUmVhZFZhbHVlRnJvbVBvaW50ZXI9KG5hbWUsd2lkdGgsc2lnbmVkKT0+e3N3aXRjaCh3aWR0aCl7Y2FzZSAxOnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDhbcG9pbnRlcj4+MF06cG9pbnRlcj0+SEVBUFU4W3BvaW50ZXI+PjBdO2Nhc2UgMjpyZXR1cm4gc2lnbmVkP3BvaW50ZXI9PkhFQVAxNltwb2ludGVyPj4xXTpwb2ludGVyPT5IRUFQVTE2W3BvaW50ZXI+PjFdO2Nhc2UgNDpyZXR1cm4gc2lnbmVkP3BvaW50ZXI9PkhFQVAzMltwb2ludGVyPj4yXTpwb2ludGVyPT5IRUFQVTMyW3BvaW50ZXI+PjJdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke3dpZHRofSk6ICR7bmFtZX1gKX19O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyPShwcmltaXRpdmVUeXBlLG5hbWUsc2l6ZSxtaW5SYW5nZSxtYXhSYW5nZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGZyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU7aWYobWluUmFuZ2U9PT0wKXt2YXIgYml0c2hpZnQ9MzItOCpzaXplO2Zyb21XaXJlVHlwZT12YWx1ZT0+dmFsdWU8PGJpdHNoaWZ0Pj4+Yml0c2hpZnQ7fXZhciBpc1Vuc2lnbmVkVHlwZT1uYW1lLmluY2x1ZGVzKCJ1bnNpZ25lZCIpO3ZhciBjaGVja0Fzc2VydGlvbnM9KHZhbHVlLHRvVHlwZU5hbWUpPT57fTt2YXIgdG9XaXJlVHlwZTtpZihpc1Vuc2lnbmVkVHlwZSl7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlPj4+MH07fWVsc2Uge3RvV2lyZVR5cGU9ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2NoZWNrQXNzZXJ0aW9ucyh2YWx1ZSx0aGlzLm5hbWUpO3JldHVybiB2YWx1ZX07fXJlZ2lzdGVyVHlwZShwcmltaXRpdmVUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnJvbVdpcmVUeXBlLCJ0b1dpcmVUeXBlIjp0b1dpcmVUeXBlLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNpemUsbWluUmFuZ2UhPT0wKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pO307dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3PShyYXdUeXBlLGRhdGFUeXBlSW5kZXgsbmFtZSk9Pnt2YXIgdHlwZU1hcHBpbmc9W0ludDhBcnJheSxVaW50OEFycmF5LEludDE2QXJyYXksVWludDE2QXJyYXksSW50MzJBcnJheSxVaW50MzJBcnJheSxGbG9hdDMyQXJyYXksRmxvYXQ2NEFycmF5XTt2YXIgVEE9dHlwZU1hcHBpbmdbZGF0YVR5cGVJbmRleF07ZnVuY3Rpb24gZGVjb2RlTWVtb3J5VmlldyhoYW5kbGUpe3ZhciBzaXplPUhFQVBVMzJbaGFuZGxlPj4yXTt2YXIgZGF0YT1IRUFQVTMyW2hhbmRsZSs0Pj4yXTtyZXR1cm4gbmV3IFRBKEhFQVA4LmJ1ZmZlcixkYXRhLHNpemUpfW5hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmRlY29kZU1lbW9yeVZpZXcsImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZGVjb2RlTWVtb3J5Vmlld30se2lnbm9yZUR1cGxpY2F0ZVJlZ2lzdHJhdGlvbnM6dHJ1ZX0pO307ZnVuY3Rpb24gcmVhZFBvaW50ZXIocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVMzJbcG9pbnRlcj4+Ml0pfXZhciBzdHJpbmdUb1VURjhBcnJheT0oc3RyLGhlYXAsb3V0SWR4LG1heEJ5dGVzVG9Xcml0ZSk9PntpZighKG1heEJ5dGVzVG9Xcml0ZT4wKSlyZXR1cm4gMDt2YXIgc3RhcnRJZHg9b3V0SWR4O3ZhciBlbmRJZHg9b3V0SWR4K21heEJ5dGVzVG9Xcml0ZS0xO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciB1PXN0ci5jaGFyQ29kZUF0KGkpO2lmKHU+PTU1Mjk2JiZ1PD01NzM0Myl7dmFyIHUxPXN0ci5jaGFyQ29kZUF0KCsraSk7dT02NTUzNisoKHUmMTAyMyk8PDEwKXx1MSYxMDIzO31pZih1PD0xMjcpe2lmKG91dElkeD49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPXU7fWVsc2UgaWYodTw9MjA0Nyl7aWYob3V0SWR4KzE+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0xOTJ8dT4+NjtoZWFwW291dElkeCsrXT0xMjh8dSY2Mzt9ZWxzZSBpZih1PD02NTUzNSl7aWYob3V0SWR4KzI+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yMjR8dT4+MTI7aGVhcFtvdXRJZHgrK109MTI4fHU+PjYmNjM7aGVhcFtvdXRJZHgrK109MTI4fHUmNjM7fWVsc2Uge2lmKG91dElkeCszPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjQwfHU+PjE4O2hlYXBbb3V0SWR4KytdPTEyOHx1Pj4xMiY2MztoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2Mzt9fWhlYXBbb3V0SWR4XT0wO3JldHVybiBvdXRJZHgtc3RhcnRJZHh9O3ZhciBzdHJpbmdUb1VURjg9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+c3RyaW5nVG9VVEY4QXJyYXkoc3RyLEhFQVBVOCxvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKTt2YXIgbGVuZ3RoQnl0ZXNVVEY4PXN0cj0+e3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgYz1zdHIuY2hhckNvZGVBdChpKTtpZihjPD0xMjcpe2xlbisrO31lbHNlIGlmKGM8PTIwNDcpe2xlbis9Mjt9ZWxzZSBpZihjPj01NTI5NiYmYzw9NTczNDMpe2xlbis9NDsrK2k7fWVsc2Uge2xlbis9Mzt9fXJldHVybiBsZW59O3ZhciBVVEY4RGVjb2Rlcj10eXBlb2YgVGV4dERlY29kZXIhPSJ1bmRlZmluZWQiP25ldyBUZXh0RGVjb2RlcigidXRmOCIpOnVuZGVmaW5lZDt2YXIgVVRGOEFycmF5VG9TdHJpbmc9KGhlYXBPckFycmF5LGlkeCxtYXhCeXRlc1RvUmVhZCk9Pnt2YXIgZW5kSWR4PWlkeCttYXhCeXRlc1RvUmVhZDt2YXIgZW5kUHRyPWlkeDt3aGlsZShoZWFwT3JBcnJheVtlbmRQdHJdJiYhKGVuZFB0cj49ZW5kSWR4KSkrK2VuZFB0cjtpZihlbmRQdHItaWR4PjE2JiZoZWFwT3JBcnJheS5idWZmZXImJlVURjhEZWNvZGVyKXtyZXR1cm4gVVRGOERlY29kZXIuZGVjb2RlKGhlYXBPckFycmF5LnN1YmFycmF5KGlkeCxlbmRQdHIpKX12YXIgc3RyPSIiO3doaWxlKGlkeDxlbmRQdHIpe3ZhciB1MD1oZWFwT3JBcnJheVtpZHgrK107aWYoISh1MCYxMjgpKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodTApO2NvbnRpbnVlfXZhciB1MT1oZWFwT3JBcnJheVtpZHgrK10mNjM7aWYoKHUwJjIyNCk9PTE5Mil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKCh1MCYzMSk8PDZ8dTEpO2NvbnRpbnVlfXZhciB1Mj1oZWFwT3JBcnJheVtpZHgrK10mNjM7aWYoKHUwJjI0MCk9PTIyNCl7dTA9KHUwJjE1KTw8MTJ8dTE8PDZ8dTI7fWVsc2Uge3UwPSh1MCY3KTw8MTh8dTE8PDEyfHUyPDw2fGhlYXBPckFycmF5W2lkeCsrXSY2Mzt9aWYodTA8NjU1MzYpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7fWVsc2Uge3ZhciBjaD11MC02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpO319cmV0dXJuIHN0cn07dmFyIFVURjhUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+cHRyP1VURjhBcnJheVRvU3RyaW5nKEhFQVBVOCxwdHIsbWF4Qnl0ZXNUb1JlYWQpOiIiO3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nPShyYXdUeXBlLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBzdGRTdHJpbmdJc1VURjg9bmFtZT09PSJzdGQ6OnN0cmluZyI7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIih2YWx1ZSl7dmFyIGxlbmd0aD1IRUFQVTMyW3ZhbHVlPj4yXTt2YXIgcGF5bG9hZD12YWx1ZSs0O3ZhciBzdHI7aWYoc3RkU3RyaW5nSXNVVEY4KXt2YXIgZGVjb2RlU3RhcnRQdHI9cGF5bG9hZDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9cGF5bG9hZCtpO2lmKGk9PWxlbmd0aHx8SEVBUFU4W2N1cnJlbnRCeXRlUHRyXT09MCl7dmFyIG1heFJlYWQ9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9VVRGOFRvU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWQpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnQ7fWVsc2Uge3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnQ7fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyKzE7fX19ZWxzZSB7dmFyIGE9bmV3IEFycmF5KGxlbmd0aCk7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXthW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoSEVBUFU4W3BheWxvYWQraV0pO31zdHI9YS5qb2luKCIiKTt9X2ZyZWUodmFsdWUpO3JldHVybiBzdHJ9LCJ0b1dpcmVUeXBlIihkZXN0cnVjdG9ycyx2YWx1ZSl7aWYodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7dmFsdWU9bmV3IFVpbnQ4QXJyYXkodmFsdWUpO312YXIgbGVuZ3RoO3ZhciB2YWx1ZUlzT2ZUeXBlU3RyaW5nPXR5cGVvZiB2YWx1ZT09InN0cmluZyI7aWYoISh2YWx1ZUlzT2ZUeXBlU3RyaW5nfHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fHZhbHVlIGluc3RhbmNlb2YgSW50OEFycmF5KSl7dGhyb3dCaW5kaW5nRXJyb3IoIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmciKTt9aWYoc3RkU3RyaW5nSXNVVEY4JiZ2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtsZW5ndGg9bGVuZ3RoQnl0ZXNVVEY4KHZhbHVlKTt9ZWxzZSB7bGVuZ3RoPXZhbHVlLmxlbmd0aDt9dmFyIGJhc2U9X21hbGxvYyg0K2xlbmd0aCsxKTt2YXIgcHRyPWJhc2UrNDtIRUFQVTMyW2Jhc2U+PjJdPWxlbmd0aDtpZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe3N0cmluZ1RvVVRGOCh2YWx1ZSxwdHIsbGVuZ3RoKzEpO31lbHNlIHtpZih2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe3ZhciBjaGFyQ29kZT12YWx1ZS5jaGFyQ29kZUF0KGkpO2lmKGNoYXJDb2RlPjI1NSl7X2ZyZWUocHRyKTt0aHJvd0JpbmRpbmdFcnJvcigiU3RyaW5nIGhhcyBVVEYtMTYgY29kZSB1bml0cyB0aGF0IGRvIG5vdCBmaXQgaW4gOCBiaXRzIik7fUhFQVBVOFtwdHIraV09Y2hhckNvZGU7fX1lbHNlIHtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe0hFQVBVOFtwdHIraV09dmFsdWVbaV07fX19aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLGJhc2UpO31yZXR1cm4gYmFzZX0sImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6cmVhZFBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uKHB0cil7X2ZyZWUocHRyKTt9fSk7fTt2YXIgVVRGMTZEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGYtMTZsZSIpOnVuZGVmaW5lZDt2YXIgVVRGMTZUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBlbmRQdHI9cHRyO3ZhciBpZHg9ZW5kUHRyPj4xO3ZhciBtYXhJZHg9aWR4K21heEJ5dGVzVG9SZWFkLzI7d2hpbGUoIShpZHg+PW1heElkeCkmJkhFQVBVMTZbaWR4XSkrK2lkeDtlbmRQdHI9aWR4PDwxO2lmKGVuZFB0ci1wdHI+MzImJlVURjE2RGVjb2RlcilyZXR1cm4gVVRGMTZEZWNvZGVyLmRlY29kZShIRUFQVTguc3ViYXJyYXkocHRyLGVuZFB0cikpO3ZhciBzdHI9IiI7Zm9yKHZhciBpPTA7IShpPj1tYXhCeXRlc1RvUmVhZC8yKTsrK2kpe3ZhciBjb2RlVW5pdD1IRUFQMTZbcHRyK2kqMj4+MV07aWYoY29kZVVuaXQ9PTApYnJlYWs7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGVVbml0KTt9cmV0dXJuIHN0cn07dmFyIHN0cmluZ1RvVVRGMTY9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+e21heEJ5dGVzVG9Xcml0ZT8/PTIxNDc0ODM2NDc7aWYobWF4Qnl0ZXNUb1dyaXRlPDIpcmV0dXJuIDA7bWF4Qnl0ZXNUb1dyaXRlLT0yO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIG51bUNoYXJzVG9Xcml0ZT1tYXhCeXRlc1RvV3JpdGU8c3RyLmxlbmd0aCoyP21heEJ5dGVzVG9Xcml0ZS8yOnN0ci5sZW5ndGg7Zm9yKHZhciBpPTA7aTxudW1DaGFyc1RvV3JpdGU7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7SEVBUDE2W291dFB0cj4+MV09Y29kZVVuaXQ7b3V0UHRyKz0yO31IRUFQMTZbb3V0UHRyPj4xXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9O3ZhciBsZW5ndGhCeXRlc1VURjE2PXN0cj0+c3RyLmxlbmd0aCoyO3ZhciBVVEYzMlRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGk9MDt2YXIgc3RyPSIiO3doaWxlKCEoaT49bWF4Qnl0ZXNUb1JlYWQvNCkpe3ZhciB1dGYzMj1IRUFQMzJbcHRyK2kqND4+Ml07aWYodXRmMzI9PTApYnJlYWs7KytpO2lmKHV0ZjMyPj02NTUzNil7dmFyIGNoPXV0ZjMyLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyk7fWVsc2Uge3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1dGYzMik7fX1yZXR1cm4gc3RyfTt2YXIgc3RyaW5nVG9VVEYzMj0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT57bWF4Qnl0ZXNUb1dyaXRlPz89MjE0NzQ4MzY0NztpZihtYXhCeXRlc1RvV3JpdGU8NClyZXR1cm4gMDt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBlbmRQdHI9c3RhcnRQdHIrbWF4Qnl0ZXNUb1dyaXRlLTQ7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO2lmKGNvZGVVbml0Pj01NTI5NiYmY29kZVVuaXQ8PTU3MzQzKXt2YXIgdHJhaWxTdXJyb2dhdGU9c3RyLmNoYXJDb2RlQXQoKytpKTtjb2RlVW5pdD02NTUzNisoKGNvZGVVbml0JjEwMjMpPDwxMCl8dHJhaWxTdXJyb2dhdGUmMTAyMzt9SEVBUDMyW291dFB0cj4+Ml09Y29kZVVuaXQ7b3V0UHRyKz00O2lmKG91dFB0cis0PmVuZFB0cilicmVha31IRUFQMzJbb3V0UHRyPj4yXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9O3ZhciBsZW5ndGhCeXRlc1VURjMyPXN0cj0+e3ZhciBsZW49MDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpKytpO2xlbis9NDt9cmV0dXJuIGxlbn07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nPShyYXdUeXBlLGNoYXJTaXplLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBkZWNvZGVTdHJpbmcsZW5jb2RlU3RyaW5nLGdldEhlYXAsbGVuZ3RoQnl0ZXNVVEYsc2hpZnQ7aWYoY2hhclNpemU9PT0yKXtkZWNvZGVTdHJpbmc9VVRGMTZUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYxNjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjE2O2dldEhlYXA9KCk9PkhFQVBVMTY7c2hpZnQ9MTt9ZWxzZSBpZihjaGFyU2l6ZT09PTQpe2RlY29kZVN0cmluZz1VVEYzMlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjMyO2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMzI7Z2V0SGVhcD0oKT0+SEVBUFUzMjtzaGlmdD0yO31yZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOnZhbHVlPT57dmFyIGxlbmd0aD1IRUFQVTMyW3ZhbHVlPj4yXTt2YXIgSEVBUD1nZXRIZWFwKCk7dmFyIHN0cjt2YXIgZGVjb2RlU3RhcnRQdHI9dmFsdWUrNDtmb3IodmFyIGk9MDtpPD1sZW5ndGg7KytpKXt2YXIgY3VycmVudEJ5dGVQdHI9dmFsdWUrNCtpKmNoYXJTaXplO2lmKGk9PWxlbmd0aHx8SEVBUFtjdXJyZW50Qnl0ZVB0cj4+c2hpZnRdPT0wKXt2YXIgbWF4UmVhZEJ5dGVzPWN1cnJlbnRCeXRlUHRyLWRlY29kZVN0YXJ0UHRyO3ZhciBzdHJpbmdTZWdtZW50PWRlY29kZVN0cmluZyhkZWNvZGVTdGFydFB0cixtYXhSZWFkQnl0ZXMpO2lmKHN0cj09PXVuZGVmaW5lZCl7c3RyPXN0cmluZ1NlZ21lbnQ7fWVsc2Uge3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKTtzdHIrPXN0cmluZ1NlZ21lbnQ7fWRlY29kZVN0YXJ0UHRyPWN1cnJlbnRCeXRlUHRyK2NoYXJTaXplO319X2ZyZWUodmFsdWUpO3JldHVybiBzdHJ9LCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsdmFsdWUpPT57aWYoISh0eXBlb2YgdmFsdWU9PSJzdHJpbmciKSl7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICR7bmFtZX1gKTt9dmFyIGxlbmd0aD1sZW5ndGhCeXRlc1VURih2YWx1ZSk7dmFyIHB0cj1fbWFsbG9jKDQrbGVuZ3RoK2NoYXJTaXplKTtIRUFQVTMyW3B0cj4+Ml09bGVuZ3RoPj5zaGlmdDtlbmNvZGVTdHJpbmcodmFsdWUscHRyKzQsbGVuZ3RoK2NoYXJTaXplKTtpZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUscHRyKTt9cmV0dXJuIHB0cn0sImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uKHB0cil7X2ZyZWUocHRyKTt9fSk7fTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfdm9pZD0ocmF3VHlwZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7aXNWb2lkOnRydWUsbmFtZTpuYW1lLCJhcmdQYWNrQWR2YW5jZSI6MCwiZnJvbVdpcmVUeXBlIjooKT0+dW5kZWZpbmVkLCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsbyk9PnVuZGVmaW5lZH0pO307dmFyIGdldEhlYXBNYXg9KCk9PjIxNDc0ODM2NDg7dmFyIGdyb3dNZW1vcnk9c2l6ZT0+e3ZhciBiPXdhc21NZW1vcnkuYnVmZmVyO3ZhciBwYWdlcz0oc2l6ZS1iLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXt3YXNtTWVtb3J5Lmdyb3cocGFnZXMpO3VwZGF0ZU1lbW9yeVZpZXdzKCk7cmV0dXJuIDF9Y2F0Y2goZSl7fX07dmFyIF9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwPXJlcXVlc3RlZFNpemU9Pnt2YXIgb2xkU2l6ZT1IRUFQVTgubGVuZ3RoO3JlcXVlc3RlZFNpemU+Pj49MDt2YXIgbWF4SGVhcFNpemU9Z2V0SGVhcE1heCgpO2lmKHJlcXVlc3RlZFNpemU+bWF4SGVhcFNpemUpe3JldHVybiBmYWxzZX12YXIgYWxpZ25VcD0oeCxtdWx0aXBsZSk9PngrKG11bHRpcGxlLXglbXVsdGlwbGUpJW11bHRpcGxlO2Zvcih2YXIgY3V0RG93bj0xO2N1dERvd248PTQ7Y3V0RG93bio9Mil7dmFyIG92ZXJHcm93bkhlYXBTaXplPW9sZFNpemUqKDErLjIvY3V0RG93bik7b3Zlckdyb3duSGVhcFNpemU9TWF0aC5taW4ob3Zlckdyb3duSGVhcFNpemUscmVxdWVzdGVkU2l6ZSsxMDA2NjMyOTYpO3ZhciBuZXdTaXplPU1hdGgubWluKG1heEhlYXBTaXplLGFsaWduVXAoTWF0aC5tYXgocmVxdWVzdGVkU2l6ZSxvdmVyR3Jvd25IZWFwU2l6ZSksNjU1MzYpKTt2YXIgcmVwbGFjZW1lbnQ9Z3Jvd01lbW9yeShuZXdTaXplKTtpZihyZXBsYWNlbWVudCl7cmV0dXJuIHRydWV9fXJldHVybiBmYWxzZX07ZW1iaW5kX2luaXRfY2hhckNvZGVzKCk7QmluZGluZ0Vycm9yPU1vZHVsZVsiQmluZGluZ0Vycm9yIl09Y2xhc3MgQmluZGluZ0Vycm9yIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IobWVzc2FnZSl7c3VwZXIobWVzc2FnZSk7dGhpcy5uYW1lPSJCaW5kaW5nRXJyb3IiO319O01vZHVsZVsiSW50ZXJuYWxFcnJvciJdPWNsYXNzIEludGVybmFsRXJyb3IgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihtZXNzYWdlKXtzdXBlcihtZXNzYWdlKTt0aGlzLm5hbWU9IkludGVybmFsRXJyb3IiO319O2hhbmRsZUFsbG9jYXRvckluaXQoKTtpbml0X2VtdmFsKCk7dmFyIHdhc21JbXBvcnRzPXtmOl9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludCxpOl9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wsaDpfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbCxlOl9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0LGI6X19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcixhOl9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3LGQ6X19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZyxjOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nLGo6X19lbWJpbmRfcmVnaXN0ZXJfdm9pZCxnOl9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwfTt2YXIgd2FzbUV4cG9ydHM9Y3JlYXRlV2FzbSgpO01vZHVsZVsiX3NvcnQiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpPT4oTW9kdWxlWyJfc29ydCJdPXdhc21FeHBvcnRzWyJtIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5KTt2YXIgX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1hMD0+KF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09d2FzbUV4cG9ydHNbIm8iXSkoYTApO3ZhciBfZnJlZT1Nb2R1bGVbIl9mcmVlIl09YTA9PihfZnJlZT1Nb2R1bGVbIl9mcmVlIl09d2FzbUV4cG9ydHNbInAiXSkoYTApO3ZhciBjYWxsZWRSdW47ZGVwZW5kZW5jaWVzRnVsZmlsbGVkPWZ1bmN0aW9uIHJ1bkNhbGxlcigpe2lmKCFjYWxsZWRSdW4pcnVuKCk7aWYoIWNhbGxlZFJ1bilkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9cnVuQ2FsbGVyO307ZnVuY3Rpb24gcnVuKCl7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1wcmVSdW4oKTtpZihydW5EZXBlbmRlbmNpZXM+MCl7cmV0dXJufWZ1bmN0aW9uIGRvUnVuKCl7aWYoY2FsbGVkUnVuKXJldHVybjtjYWxsZWRSdW49dHJ1ZTtNb2R1bGVbImNhbGxlZFJ1biJdPXRydWU7aWYoQUJPUlQpcmV0dXJuO2luaXRSdW50aW1lKCk7cmVhZHlQcm9taXNlUmVzb2x2ZShNb2R1bGUpO2lmKE1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSlNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0oKTtwb3N0UnVuKCk7fWlmKE1vZHVsZVsic2V0U3RhdHVzIl0pe01vZHVsZVsic2V0U3RhdHVzIl0oIlJ1bm5pbmcuLi4iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe01vZHVsZVsic2V0U3RhdHVzIl0oIiIpO30sMSk7ZG9SdW4oKTt9LDEpO31lbHNlIHtkb1J1bigpO319aWYoTW9kdWxlWyJwcmVJbml0Il0pe2lmKHR5cGVvZiBNb2R1bGVbInByZUluaXQiXT09ImZ1bmN0aW9uIilNb2R1bGVbInByZUluaXQiXT1bTW9kdWxlWyJwcmVJbml0Il1dO3doaWxlKE1vZHVsZVsicHJlSW5pdCJdLmxlbmd0aD4wKXtNb2R1bGVbInByZUluaXQiXS5wb3AoKSgpO319cnVuKCk7CgoKICAgIHJldHVybiBtb2R1bGVBcmcucmVhZHkKICB9CiAgKTsKICB9KSgpOwoKICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueQogIGxldCB3YXNtTW9kdWxlOwogIGFzeW5jIGZ1bmN0aW9uIGluaXRXYXNtKCkgewogICAgICB3YXNtTW9kdWxlID0gYXdhaXQgbG9hZFdhc20oKTsKICB9CiAgbGV0IHNvcnREYXRhOwogIGxldCB2aWV3UHJvalB0cjsKICBsZXQgdHJhbnNmb3Jtc1B0cjsKICBsZXQgdHJhbnNmb3JtSW5kaWNlc1B0cjsKICBsZXQgcG9zaXRpb25zUHRyOwogIGxldCBjaHVua3NQdHI7CiAgbGV0IGRlcHRoQnVmZmVyUHRyOwogIGxldCBkZXB0aEluZGV4UHRyOwogIGxldCBzdGFydHNQdHI7CiAgbGV0IGNvdW50c1B0cjsKICBsZXQgYWxsb2NhdGVkVmVydGV4Q291bnQgPSAwOwogIGxldCBhbGxvY2F0ZWRUcmFuc2Zvcm1Db3VudCA9IDA7CiAgbGV0IHZpZXdQcm9qOwogIGxldCBydW5uaW5nID0gZmFsc2U7CiAgbGV0IGFsbG9jYXRpbmcgPSBmYWxzZTsKICBjb25zdCBhbGxvY2F0ZUJ1ZmZlcnMgPSBhc3luYyAoKSA9PiB7CiAgICAgIGFsbG9jYXRpbmcgPSB0cnVlOwogICAgICBpZiAoIXdhc21Nb2R1bGUpCiAgICAgICAgICBhd2FpdCBpbml0V2FzbSgpOwogICAgICBjb25zdCB0YXJnZXRBbGxvY2F0ZWRWZXJ0ZXhDb3VudCA9IE1hdGgucG93KDIsIE1hdGguY2VpbChNYXRoLmxvZzIoc29ydERhdGEudmVydGV4Q291bnQpKSk7CiAgICAgIGlmIChhbGxvY2F0ZWRWZXJ0ZXhDb3VudCA8IHRhcmdldEFsbG9jYXRlZFZlcnRleENvdW50KSB7CiAgICAgICAgICB3aGlsZSAocnVubmluZykgewogICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDApKTsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChhbGxvY2F0ZWRWZXJ0ZXhDb3VudCA+IDApIHsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKHZpZXdQcm9qUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKHRyYW5zZm9ybUluZGljZXNQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUocG9zaXRpb25zUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKGNodW5rc1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShkZXB0aEJ1ZmZlclB0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShkZXB0aEluZGV4UHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKHN0YXJ0c1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShjb3VudHNQdHIpOwogICAgICAgICAgfQogICAgICAgICAgYWxsb2NhdGVkVmVydGV4Q291bnQgPSB0YXJnZXRBbGxvY2F0ZWRWZXJ0ZXhDb3VudDsKICAgICAgICAgIHZpZXdQcm9qUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKDE2ICogNCk7CiAgICAgICAgICB0cmFuc2Zvcm1JbmRpY2VzUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKGFsbG9jYXRlZFZlcnRleENvdW50ICogNCk7CiAgICAgICAgICBwb3NpdGlvbnNQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoMyAqIGFsbG9jYXRlZFZlcnRleENvdW50ICogNCk7CiAgICAgICAgICBjaHVua3NQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoYWxsb2NhdGVkVmVydGV4Q291bnQpOwogICAgICAgICAgZGVwdGhCdWZmZXJQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIGRlcHRoSW5kZXhQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIHN0YXJ0c1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgY291bnRzUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKGFsbG9jYXRlZFZlcnRleENvdW50ICogNCk7CiAgICAgIH0KICAgICAgaWYgKGFsbG9jYXRlZFRyYW5zZm9ybUNvdW50IDwgc29ydERhdGEudHJhbnNmb3Jtcy5sZW5ndGgpIHsKICAgICAgICAgIHdoaWxlIChydW5uaW5nKSB7CiAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMCkpOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGFsbG9jYXRlZFRyYW5zZm9ybUNvdW50ID4gMCkgewogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUodHJhbnNmb3Jtc1B0cik7CiAgICAgICAgICB9CiAgICAgICAgICBhbGxvY2F0ZWRUcmFuc2Zvcm1Db3VudCA9IHNvcnREYXRhLnRyYW5zZm9ybXMubGVuZ3RoOwogICAgICAgICAgdHJhbnNmb3Jtc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhhbGxvY2F0ZWRUcmFuc2Zvcm1Db3VudCAqIDQpOwogICAgICB9CiAgICAgIGFsbG9jYXRpbmcgPSBmYWxzZTsKICB9OwogIGNvbnN0IHJ1blNvcnQgPSAodmlld1Byb2opID0+IHsKICAgICAgd2FzbU1vZHVsZS5IRUFQRjMyLnNldChzb3J0RGF0YS5wb3NpdGlvbnMsIHBvc2l0aW9uc1B0ciAvIDQpOwogICAgICB3YXNtTW9kdWxlLkhFQVBGMzIuc2V0KHNvcnREYXRhLnRyYW5zZm9ybXMsIHRyYW5zZm9ybXNQdHIgLyA0KTsKICAgICAgd2FzbU1vZHVsZS5IRUFQVTMyLnNldChzb3J0RGF0YS50cmFuc2Zvcm1JbmRpY2VzLCB0cmFuc2Zvcm1JbmRpY2VzUHRyIC8gNCk7CiAgICAgIHdhc21Nb2R1bGUuSEVBUEYzMi5zZXQodmlld1Byb2ouYnVmZmVyLCB2aWV3UHJvalB0ciAvIDQpOwogICAgICB3YXNtTW9kdWxlLl9zb3J0KHZpZXdQcm9qUHRyLCB0cmFuc2Zvcm1zUHRyLCB0cmFuc2Zvcm1JbmRpY2VzUHRyLCBzb3J0RGF0YS52ZXJ0ZXhDb3VudCwgcG9zaXRpb25zUHRyLCBjaHVua3NQdHIsIGRlcHRoQnVmZmVyUHRyLCBkZXB0aEluZGV4UHRyLCBzdGFydHNQdHIsIGNvdW50c1B0cik7CiAgICAgIGNvbnN0IGRlcHRoSW5kZXggPSBuZXcgVWludDMyQXJyYXkod2FzbU1vZHVsZS5IRUFQVTMyLmJ1ZmZlciwgZGVwdGhJbmRleFB0ciwgc29ydERhdGEudmVydGV4Q291bnQpOwogICAgICBjb25zdCBkZXRhY2hlZERlcHRoSW5kZXggPSBuZXcgVWludDMyQXJyYXkoZGVwdGhJbmRleC5zbGljZSgpLmJ1ZmZlcik7CiAgICAgIGNvbnN0IGNodW5rcyA9IG5ldyBVaW50OEFycmF5KHdhc21Nb2R1bGUuSEVBUFU4LmJ1ZmZlciwgY2h1bmtzUHRyLCBzb3J0RGF0YS52ZXJ0ZXhDb3VudCk7CiAgICAgIGNvbnN0IGRldGFjaGVkQ2h1bmtzID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmtzLnNsaWNlKCkuYnVmZmVyKTsKICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGRlcHRoSW5kZXg6IGRldGFjaGVkRGVwdGhJbmRleCwgY2h1bmtzOiBkZXRhY2hlZENodW5rcyB9LCBbCiAgICAgICAgICBkZXRhY2hlZERlcHRoSW5kZXguYnVmZmVyLAogICAgICAgICAgZGV0YWNoZWRDaHVua3MuYnVmZmVyLAogICAgICBdKTsKICB9OwogIGNvbnN0IHRocm90dGxlZFNvcnQgPSAoKSA9PiB7CiAgICAgIGlmICghcnVubmluZykgewogICAgICAgICAgcnVubmluZyA9IHRydWU7CiAgICAgICAgICBjb25zdCBsYXN0VmlldyA9IHZpZXdQcm9qOwogICAgICAgICAgcnVuU29ydChsYXN0Vmlldyk7CiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7CiAgICAgICAgICAgICAgaWYgKGxhc3RWaWV3ICE9PSB2aWV3UHJvaikgewogICAgICAgICAgICAgICAgICB0aHJvdHRsZWRTb3J0KCk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgfSwgMCk7CiAgICAgIH0KICB9OwogIHNlbGYub25tZXNzYWdlID0gKGUpID0+IHsKICAgICAgaWYgKGUuZGF0YS5zb3J0RGF0YSkgewogICAgICAgICAgc29ydERhdGEgPSBlLmRhdGEuc29ydERhdGE7CiAgICAgICAgICBhbGxvY2F0ZUJ1ZmZlcnMoKTsKICAgICAgfQogICAgICBpZiAoYWxsb2NhdGluZyB8fCAhc29ydERhdGEpCiAgICAgICAgICByZXR1cm47CiAgICAgIGlmIChlLmRhdGEudmlld1Byb2opIHsKICAgICAgICAgIHZpZXdQcm9qID0gZS5kYXRhLnZpZXdQcm9qOwogICAgICAgICAgdGhyb3R0bGVkU29ydCgpOwogICAgICB9CiAgfTsKCn0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPVNvcnRXb3JrZXIuanMubWFwCgo=", null, !1);
class Eo {
  constructor(e, n) {
    this._scene = null, this._camera = null, this._started = !1, this._initialized = !1, this._renderer = e;
    const l = e.gl;
    this._program = l.createProgram(), this._passes = n || [];
    const i = l.createShader(l.VERTEX_SHADER);
    l.shaderSource(i, this._getVertexSource()), l.compileShader(i), l.getShaderParameter(i, l.COMPILE_STATUS) || console.error(l.getShaderInfoLog(i));
    const s = l.createShader(l.FRAGMENT_SHADER);
    l.shaderSource(s, this._getFragmentSource()), l.compileShader(s), l.getShaderParameter(s, l.COMPILE_STATUS) || console.error(l.getShaderInfoLog(s)), l.attachShader(this.program, i), l.attachShader(this.program, s), l.linkProgram(this.program), l.getProgramParameter(this.program, l.LINK_STATUS) || console.error(l.getProgramInfoLog(this.program)), this.resize = () => {
      l.useProgram(this._program), this._resize();
    }, this.initialize = () => {
      console.assert(!this._initialized, "ShaderProgram already initialized"), l.useProgram(this._program), this._initialize();
      for (const a of this.passes)
        a.initialize(this);
      this._initialized = !0, this._started = !0;
    }, this.render = (a, r) => {
      l.useProgram(this._program), this._scene === a && this._camera === r || (this.dispose(), this._scene = a, this._camera = r, this.initialize());
      for (const d of this.passes)
        d.render();
      this._render();
    }, this.dispose = () => {
      if (this._initialized) {
        l.useProgram(this._program);
        for (const a of this.passes)
          a.dispose();
        this._dispose(), this._scene = null, this._camera = null, this._initialized = !1;
      }
    };
  }
  get renderer() {
    return this._renderer;
  }
  get scene() {
    return this._scene;
  }
  get camera() {
    return this._camera;
  }
  get program() {
    return this._program;
  }
  get passes() {
    return this._passes;
  }
  get started() {
    return this._started;
  }
}
var yo = sa("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgdmFyIGxvYWRXYXNtID0gKCgpID0+IHsKICAgIAogICAgcmV0dXJuICgKICBmdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkgewoKICB2YXIgTW9kdWxlPW1vZHVsZUFyZzt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdDt9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkQmluYXJ5O3t7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZjt9aWYoc2NyaXB0RGlyZWN0b3J5LmluZGV4T2YoImJsb2I6IikhPT0wKXtzY3JpcHREaXJlY3Rvcnk9c2NyaXB0RGlyZWN0b3J5LnN1YnN0cigwLHNjcmlwdERpcmVjdG9yeS5yZXBsYWNlKC9bPyNdLiovLCIiKS5sYXN0SW5kZXhPZigiLyIpKzEpO31lbHNlIHtzY3JpcHREaXJlY3Rvcnk9IiI7fXt7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX07fX19TW9kdWxlWyJwcmludCJdfHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO3ZhciBlcnI9TW9kdWxlWyJwcmludEVyciJdfHxjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlNb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIik7fWZ1bmN0aW9uIGludEFycmF5RnJvbUJhc2U2NChzKXt2YXIgZGVjb2RlZD1hdG9iKHMpO3ZhciBieXRlcz1uZXcgVWludDhBcnJheShkZWNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkZWNvZGVkLmxlbmd0aDsrK2kpe2J5dGVzW2ldPWRlY29kZWQuY2hhckNvZGVBdChpKTt9cmV0dXJuIGJ5dGVzfWZ1bmN0aW9uIHRyeVBhcnNlQXNEYXRhVVJJKGZpbGVuYW1lKXtpZighaXNEYXRhVVJJKGZpbGVuYW1lKSl7cmV0dXJufXJldHVybiBpbnRBcnJheUZyb21CYXNlNjQoZmlsZW5hbWUuc2xpY2UoZGF0YVVSSVByZWZpeC5sZW5ndGgpKX12YXIgd2FzbU1lbW9yeTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7ZnVuY3Rpb24gdXBkYXRlTWVtb3J5Vmlld3MoKXt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjtNb2R1bGVbIkhFQVA4Il09SEVBUDg9bmV3IEludDhBcnJheShiKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVBVOCJdPUhFQVBVOD1uZXcgVWludDhBcnJheShiKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBGMzIiXT1IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGIpO312YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO2Z1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpO319Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTt9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKTt9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKTt9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pO31mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpO31mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYik7fWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKTt9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXT8uKHJ1bkRlcGVuZGVuY2llcyk7fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdPy4ocnVuRGVwZW5kZW5jaWVzKTtpZihydW5EZXBlbmRlbmNpZXM9PTApe2lmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpO319fWZ1bmN0aW9uIGFib3J0KHdoYXQpe01vZHVsZVsib25BYm9ydCJdPy4od2hhdCk7d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO3doYXQrPSIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uIjt2YXIgZT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKHdoYXQpO3JlYWR5UHJvbWlzZVJlamVjdChlKTt0aHJvdyBlfXZhciBkYXRhVVJJUHJlZml4PSJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsIjt2YXIgaXNEYXRhVVJJPWZpbGVuYW1lPT5maWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpO3ZhciB3YXNtQmluYXJ5RmlsZTt3YXNtQmluYXJ5RmlsZT0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LEFHRnpiUUVBQUFBQlp3OWdCSDkvZjM4QVlBTi9mMzhBWUFWL2YzOS9md0JnQm45L2YzOS9md0JnQW45L0FHQUJmd0YvWUFOL2YzOEJmMkFCZndCZ0FBQmdCMzkvZjM5L2YzOEFZQUo5ZlFGL1lBUi9mMzUrQUdBQmZRRi9ZQXQvZjM5L2YzOS9mMzkvZndCZ0FuOS9BWDhDUFFvQllRRmhBQUVCWVFGaUFBSUJZUUZqQUFFQllRRmtBQVFCWVFGbEFBRUJZUUZtQUFrQllRRm5BQVVCWVFGb0FBUUJZUUZwQUFBQllRRnFBQVFER3hvR0JRb0hDQWNFQ0FzQkFBRUhEQVVOQXdNQ0FnQUFEZ1lHQlFRRkFYQUJFQkFGQndFQmdBS0FnQUlHQ0FGL0FVSEFuZ1FMQnhrR0FXc0NBQUZzQUE0QmJRQVpBVzRCQUFGdkFCZ0JjQUFQQ1JVQkFFRUJDdzhSSXcwV0ZpSU5JUm9jSHcwYkhSNEs2VkFhY1FFQmZ5QUNSUVJBSUFBb0FnUWdBU2dDQkVZUEN5QUFJQUZHQkVCQkFROExBa0FnQUNnQ0JDSUNMUUFBSWdCRklBQWdBU2dDQkNJQkxRQUFJZ05IY2cwQUEwQWdBUzBBQVNFRElBSXRBQUVpQUVVTkFTQUJRUUZxSVFFZ0FrRUJhaUVDSUFBZ0EwWU5BQXNMSUFBZ0EwWUxUd0VDZjBHNEdpZ0NBQ0lCSUFCQkIycEJlSEVpQW1vaEFBSkFJQUpCQUNBQUlBRk5HMFVFUUNBQVB3QkJFSFJORFFFZ0FCQUdEUUVMUWNnYVFUQTJBZ0JCZnc4TFFiZ2FJQUEyQWdBZ0FRc09BQ0FBRUJjZ0FSQVhRUkIwY2dzR0FDQUFFQThMS1FCQndCcEJBVFlDQUVIRUdrRUFOZ0lBRUJGQnhCcEJ2Qm9vQWdBMkFnQkJ2QnBCd0JvMkFnQUwwZ3NCQjM4Q1FDQUFSUTBBSUFCQkNHc2lBaUFBUVFScktBSUFJZ0ZCZUhFaUFHb2hCUUpBSUFGQkFYRU5BQ0FCUVFKeFJRMEJJQUlnQWlnQ0FDSUJheUlDUWR3YUtBSUFTUTBCSUFBZ0FXb2hBQUpBQWtCQjRCb29BZ0FnQWtjRVFDQUJRZjhCVFFSQUlBRkJBM1loQkNBQ0tBSU1JZ0VnQWlnQ0NDSURSZ1JBUWN3YVFjd2FLQUlBUVg0Z0JIZHhOZ0lBREFVTElBTWdBVFlDRENBQklBTTJBZ2dNQkFzZ0FpZ0NHQ0VHSUFJZ0FpZ0NEQ0lCUndSQUlBSW9BZ2dpQXlBQk5nSU1JQUVnQXpZQ0NBd0RDeUFDUVJScUlnUW9BZ0FpQTBVRVFDQUNLQUlRSWdORkRRSWdBa0VRYWlFRUN3TkFJQVFoQnlBRElnRkJGR29pQkNnQ0FDSUREUUFnQVVFUWFpRUVJQUVvQWhBaUF3MEFDeUFIUVFBMkFnQU1BZ3NnQlNnQ0JDSUJRUU54UVFOSERRSkIxQm9nQURZQ0FDQUZJQUZCZm5FMkFnUWdBaUFBUVFGeU5nSUVJQVVnQURZQ0FBOExRUUFoQVFzZ0JrVU5BQUpBSUFJb0Fod2lBMEVDZEVIOEhHb2lCQ2dDQUNBQ1JnUkFJQVFnQVRZQ0FDQUJEUUZCMEJwQjBCb29BZ0JCZmlBRGQzRTJBZ0FNQWdzZ0JrRVFRUlFnQmlnQ0VDQUNSaHRxSUFFMkFnQWdBVVVOQVFzZ0FTQUdOZ0lZSUFJb0FoQWlBd1JBSUFFZ0F6WUNFQ0FESUFFMkFoZ0xJQUlvQWhRaUEwVU5BQ0FCSUFNMkFoUWdBeUFCTmdJWUN5QUNJQVZQRFFBZ0JTZ0NCQ0lCUVFGeFJRMEFBa0FDUUFKQUFrQWdBVUVDY1VVRVFFSGtHaWdDQUNBRlJnUkFRZVFhSUFJMkFnQkIyQnBCMkJvb0FnQWdBR29pQURZQ0FDQUNJQUJCQVhJMkFnUWdBa0hnR2lnQ0FFY05Ca0hVR2tFQU5nSUFRZUFhUVFBMkFnQVBDMEhnR2lnQ0FDQUZSZ1JBUWVBYUlBSTJBZ0JCMUJwQjFCb29BZ0FnQUdvaUFEWUNBQ0FDSUFCQkFYSTJBZ1FnQUNBQ2FpQUFOZ0lBRHdzZ0FVRjRjU0FBYWlFQUlBRkIvd0ZOQkVBZ0FVRURkaUVFSUFVb0Fnd2lBU0FGS0FJSUlnTkdCRUJCekJwQnpCb29BZ0JCZmlBRWQzRTJBZ0FNQlFzZ0F5QUJOZ0lNSUFFZ0F6WUNDQXdFQ3lBRktBSVlJUVlnQlNBRktBSU1JZ0ZIQkVCQjNCb29BZ0FhSUFVb0FnZ2lBeUFCTmdJTUlBRWdBellDQ0F3REN5QUZRUlJxSWdRb0FnQWlBMFVFUUNBRktBSVFJZ05GRFFJZ0JVRVFhaUVFQ3dOQUlBUWhCeUFESWdGQkZHb2lCQ2dDQUNJRERRQWdBVUVRYWlFRUlBRW9BaEFpQXcwQUN5QUhRUUEyQWdBTUFnc2dCU0FCUVg1eE5nSUVJQUlnQUVFQmNqWUNCQ0FBSUFKcUlBQTJBZ0FNQXd0QkFDRUJDeUFHUlEwQUFrQWdCU2dDSENJRFFRSjBRZndjYWlJRUtBSUFJQVZHQkVBZ0JDQUJOZ0lBSUFFTkFVSFFHa0hRR2lnQ0FFRitJQU4zY1RZQ0FBd0NDeUFHUVJCQkZDQUdLQUlRSUFWR0cyb2dBVFlDQUNBQlJRMEJDeUFCSUFZMkFoZ2dCU2dDRUNJREJFQWdBU0FETmdJUUlBTWdBVFlDR0FzZ0JTZ0NGQ0lEUlEwQUlBRWdBellDRkNBRElBRTJBaGdMSUFJZ0FFRUJjallDQkNBQUlBSnFJQUEyQWdBZ0FrSGdHaWdDQUVjTkFFSFVHaUFBTmdJQUR3c2dBRUgvQVUwRVFDQUFRWGh4UWZRYWFpRUJBbjlCekJvb0FnQWlBMEVCSUFCQkEzWjBJZ0J4UlFSQVFjd2FJQUFnQTNJMkFnQWdBUXdCQ3lBQktBSUlDeUVBSUFFZ0FqWUNDQ0FBSUFJMkFnd2dBaUFCTmdJTUlBSWdBRFlDQ0E4TFFSOGhBeUFBUWYvLy93ZE5CRUFnQUVFbUlBQkJDSFpuSWdGcmRrRUJjU0FCUVFGMGEwRSthaUVEQ3lBQ0lBTTJBaHdnQWtJQU53SVFJQU5CQW5SQi9CeHFJUUVDUUFKQUFrQkIwQm9vQWdBaUJFRUJJQU4wSWdkeFJRUkFRZEFhSUFRZ0IzSTJBZ0FnQVNBQ05nSUFJQUlnQVRZQ0dBd0JDeUFBUVJrZ0EwRUJkbXRCQUNBRFFSOUhHM1FoQXlBQktBSUFJUUVEUUNBQklnUW9BZ1JCZUhFZ0FFWU5BaUFEUVIxMklRRWdBMEVCZENFRElBUWdBVUVFY1dvaUIwRVFhaWdDQUNJQkRRQUxJQWNnQWpZQ0VDQUNJQVEyQWhnTElBSWdBallDRENBQ0lBSTJBZ2dNQVFzZ0JDZ0NDQ0lBSUFJMkFnd2dCQ0FDTmdJSUlBSkJBRFlDR0NBQ0lBUTJBZ3dnQWlBQU5nSUlDMEhzR2tIc0dpZ0NBRUVCYXlJQVFYOGdBQnMyQWdBTEN5RUFJQUVFUUFOQUlBQkJBRG9BQUNBQVFRRnFJUUFnQVVFQmF5SUJEUUFMQ3d2aEF3QkI3QmRCbWdrUUNVSDRGMEc1Q0VFQlFRQVFDRUdFR0VHMENFRUJRWUIvUWY4QUVBRkJuQmhCclFoQkFVR0FmMEgvQUJBQlFaQVlRYXNJUVFGQkFFSC9BUkFCUWFnWVFZa0lRUUpCZ0lCK1FmLy9BUkFCUWJRWVFZQUlRUUpCQUVILy93TVFBVUhBR0VHWUNFRUVRWUNBZ0lCNFFmLy8vLzhIRUFGQnpCaEJqd2hCQkVFQVFYOFFBVUhZR0VIWENFRUVRWUNBZ0lCNFFmLy8vLzhIRUFGQjVCaEJ6Z2hCQkVFQVFYOFFBVUh3R0VHakNFS0FnSUNBZ0lDQWdJQi9Rdi8vLy8vLy8vLy8vd0FRRWtIOEdFR2lDRUlBUW44UUVrR0lHVUdjQ0VFRUVBUkJsQmxCa3dsQkNCQUVRWVFQUWVrSUVBTkJ6QTlCbHcwUUEwR1VFRUVFUWR3SUVBSkI0QkJCQWtIMUNCQUNRYXdSUVFSQmhBa1FBa0hJRVVHK0NCQUhRZkFSUVFCQjBnd1FBRUdZRWtFQVFiZ05FQUJCd0JKQkFVSHdEQkFBUWVnU1FRSkJud2tRQUVHUUUwRURRYjRKRUFCQnVCTkJCRUhtQ1JBQVFlQVRRUVZCZ3dvUUFFR0lGRUVFUWQwTkVBQkJzQlJCQlVIN0RSQUFRWmdTUVFCQjZRb1FBRUhBRWtFQlFjZ0tFQUJCNkJKQkFrR3JDeEFBUVpBVFFRTkJpUXNRQUVHNEUwRUVRYkVNRUFCQjRCTkJCVUdQREJBQVFkZ1VRUWhCN2dzUUFFR0FGVUVKUWN3TEVBQkJxQlZCQmtHcENoQUFRZEFWUVFkQm9nNFFBQXNjQUNBQUlBRkJDQ0FDcHlBQ1FpQ0lweUFEcHlBRFFpQ0lweEFGQ3lBQUFrQWdBQ2dDQkNBQlJ3MEFJQUFvQWh4QkFVWU5BQ0FBSUFJMkFod0xDNW9CQUNBQVFRRTZBRFVDUUNBQUtBSUVJQUpIRFFBZ0FFRUJPZ0EwQWtBZ0FDZ0NFQ0lDUlFSQUlBQkJBVFlDSkNBQUlBTTJBaGdnQUNBQk5nSVFJQU5CQVVjTkFpQUFLQUl3UVFGR0RRRU1BZ3NnQVNBQ1JnUkFJQUFvQWhnaUFrRUNSZ1JBSUFBZ0F6WUNHQ0FESVFJTElBQW9BakJCQVVjTkFpQUNRUUZHRFFFTUFnc2dBQ0FBS0FJa1FRRnFOZ0lrQ3lBQVFRRTZBRFlMQzEwQkFYOGdBQ2dDRUNJRFJRUkFJQUJCQVRZQ0pDQUFJQUkyQWhnZ0FDQUJOZ0lRRHdzQ1FDQUJJQU5HQkVBZ0FDZ0NHRUVDUncwQklBQWdBallDR0E4TElBQkJBVG9BTmlBQVFRSTJBaGdnQUNBQUtBSWtRUUZxTmdJa0N3c0NBQXQzQVFSL0lBQzhJZ1JCLy8vL0EzRWhBUUpBSUFSQkYzWkIvd0Z4SWdKRkRRQWdBa0h3QUUwRVFDQUJRWUNBZ0FSeVFmRUFJQUpyZGlFQkRBRUxJQUpCalFGTEJFQkJnUGdCSVFOQkFDRUJEQUVMSUFKQkNuUkJnSUFIYXlFREN5QURJQVJCRUhaQmdJQUNjWElnQVVFTmRuSkIvLzhEY1F2R0p3RU1meU1BUVJCcklnb2tBQUpBQWtBQ1FBSkFBa0FDUUFKQUFrQUNRQ0FBUWZRQlRRUkFRY3dhS0FJQUlnWkJFQ0FBUVF0cVFmZ0RjU0FBUVF0Skd5SUZRUU4ySWdCMklnRkJBM0VFUUFKQUlBRkJmM05CQVhFZ0FHb2lBa0VEZENJQlFmUWFhaUlBSUFGQi9CcHFLQUlBSWdFb0FnZ2lBMFlFUUVITUdpQUdRWDRnQW5keE5nSUFEQUVMSUFNZ0FEWUNEQ0FBSUFNMkFnZ0xJQUZCQ0dvaEFDQUJJQUpCQTNRaUFrRURjallDQkNBQklBSnFJZ0VnQVNnQ0JFRUJjallDQkF3S0N5QUZRZFFhS0FJQUlnZE5EUUVnQVFSQUFrQkJBaUFBZENJQ1FRQWdBbXR5SUFFZ0FIUnhhQ0lCUVFOMElnQkI5QnBxSWdJZ0FFSDhHbW9vQWdBaUFDZ0NDQ0lEUmdSQVFjd2FJQVpCZmlBQmQzRWlCallDQUF3QkN5QURJQUkyQWd3Z0FpQUROZ0lJQ3lBQUlBVkJBM0kyQWdRZ0FDQUZhaUlFSUFGQkEzUWlBU0FGYXlJRFFRRnlOZ0lFSUFBZ0FXb2dBellDQUNBSEJFQWdCMEY0Y1VIMEdtb2hBVUhnR2lnQ0FDRUNBbjhnQmtFQklBZEJBM1owSWdWeFJRUkFRY3dhSUFVZ0JuSTJBZ0FnQVF3QkN5QUJLQUlJQ3lFRklBRWdBallDQ0NBRklBSTJBZ3dnQWlBQk5nSU1JQUlnQlRZQ0NBc2dBRUVJYWlFQVFlQWFJQVEyQWdCQjFCb2dBellDQUF3S0MwSFFHaWdDQUNJTFJRMEJJQXRvUVFKMFFmd2NhaWdDQUNJQ0tBSUVRWGh4SUFWcklRUWdBaUVCQTBBQ1FDQUJLQUlRSWdCRkJFQWdBU2dDRkNJQVJRMEJDeUFBS0FJRVFYaHhJQVZySWdFZ0JDQUJJQVJKSWdFYklRUWdBQ0FDSUFFYklRSWdBQ0VCREFFTEN5QUNLQUlZSVFrZ0FpQUNLQUlNSWdOSEJFQkIzQm9vQWdBYUlBSW9BZ2dpQUNBRE5nSU1JQU1nQURZQ0NBd0pDeUFDUVJScUlnRW9BZ0FpQUVVRVFDQUNLQUlRSWdCRkRRTWdBa0VRYWlFQkN3TkFJQUVoQ0NBQUlnTkJGR29pQVNnQ0FDSUFEUUFnQTBFUWFpRUJJQU1vQWhBaUFBMEFDeUFJUVFBMkFnQU1DQXRCZnlFRklBQkJ2MzlMRFFBZ0FFRUxhaUlBUVhoeElRVkIwQm9vQWdBaUNFVU5BRUVBSUFWcklRUUNRQUpBQWtBQ2YwRUFJQVZCZ0FKSkRRQWFRUjhnQlVILy8vOEhTdzBBR2lBRlFTWWdBRUVJZG1jaUFHdDJRUUZ4SUFCQkFYUnJRVDVxQ3lJSFFRSjBRZndjYWlnQ0FDSUJSUVJBUVFBaEFBd0JDMEVBSVFBZ0JVRVpJQWRCQVhaclFRQWdCMEVmUnh0MElRSURRQUpBSUFFb0FnUkJlSEVnQldzaUJpQUVUdzBBSUFFaEF5QUdJZ1FOQUVFQUlRUWdBU0VBREFNTElBQWdBU2dDRkNJR0lBWWdBU0FDUVIxMlFRUnhhaWdDRUNJQlJoc2dBQ0FHR3lFQUlBSkJBWFFoQWlBQkRRQUxDeUFBSUFOeVJRUkFRUUFoQTBFQ0lBZDBJZ0JCQUNBQWEzSWdDSEVpQUVVTkF5QUFhRUVDZEVIOEhHb29BZ0FoQUFzZ0FFVU5BUXNEUUNBQUtBSUVRWGh4SUFWcklnSWdCRWtoQVNBQ0lBUWdBUnNoQkNBQUlBTWdBUnNoQXlBQUtBSVFJZ0VFZnlBQkJTQUFLQUlVQ3lJQURRQUxDeUFEUlEwQUlBUkIxQm9vQWdBZ0JXdFBEUUFnQXlnQ0dDRUhJQU1nQXlnQ0RDSUNSd1JBUWR3YUtBSUFHaUFES0FJSUlnQWdBallDRENBQ0lBQTJBZ2dNQndzZ0EwRVVhaUlCS0FJQUlnQkZCRUFnQXlnQ0VDSUFSUTBESUFOQkVHb2hBUXNEUUNBQklRWWdBQ0lDUVJScUlnRW9BZ0FpQUEwQUlBSkJFR29oQVNBQ0tBSVFJZ0FOQUFzZ0JrRUFOZ0lBREFZTElBVkIxQm9vQWdBaUEwMEVRRUhnR2lnQ0FDRUFBa0FnQXlBRmF5SUJRUkJQQkVBZ0FDQUZhaUlDSUFGQkFYSTJBZ1FnQUNBRGFpQUJOZ0lBSUFBZ0JVRURjallDQkF3QkN5QUFJQU5CQTNJMkFnUWdBQ0FEYWlJQklBRW9BZ1JCQVhJMkFnUkJBQ0VDUVFBaEFRdEIxQm9nQVRZQ0FFSGdHaUFDTmdJQUlBQkJDR29oQUF3SUN5QUZRZGdhS0FJQUlnSkpCRUJCMkJvZ0FpQUZheUlCTmdJQVFlUWFRZVFhS0FJQUlnQWdCV29pQWpZQ0FDQUNJQUZCQVhJMkFnUWdBQ0FGUVFOeU5nSUVJQUJCQ0dvaEFBd0lDMEVBSVFBZ0JVRXZhaUlFQW45QnBCNG9BZ0FFUUVHc0hpZ0NBQXdCQzBHd0hrSi9Od0lBUWFnZVFvQ2dnSUNBZ0FRM0FnQkJwQjRnQ2tFTWFrRndjVUhZcXRXcUJYTTJBZ0JCdUI1QkFEWUNBRUdJSGtFQU5nSUFRWUFnQ3lJQmFpSUdRUUFnQVdzaUNIRWlBU0FGVFEwSFFZUWVLQUlBSWdNRVFFSDhIU2dDQUNJSElBRnFJZ2tnQjAwZ0F5QUpTWElOQ0FzQ1FFR0lIaTBBQUVFRWNVVUVRQUpBQWtBQ1FBSkFRZVFhS0FJQUlnTUVRRUdNSGlFQUEwQWdBeUFBS0FJQUlnZFBCRUFnQnlBQUtBSUVhaUFEU3cwREN5QUFLQUlJSWdBTkFBc0xRUUFRQ3lJQ1FYOUdEUU1nQVNFR1FhZ2VLQUlBSWdCQkFXc2lBeUFDY1FSQUlBRWdBbXNnQWlBRGFrRUFJQUJyY1dvaEJnc2dCU0FHVHcwRFFZUWVLQUlBSWdBRVFFSDhIU2dDQUNJRElBWnFJZ2dnQTAwZ0FDQUlTWElOQkFzZ0JoQUxJZ0FnQWtjTkFRd0ZDeUFHSUFKcklBaHhJZ1lRQ3lJQ0lBQW9BZ0FnQUNnQ0JHcEdEUUVnQWlFQUN5QUFRWDlHRFFFZ0JVRXdhaUFHVFFSQUlBQWhBZ3dFQzBHc0hpZ0NBQ0lDSUFRZ0JtdHFRUUFnQW10eElnSVFDMEYvUmcwQklBSWdCbW9oQmlBQUlRSU1Bd3NnQWtGL1J3MENDMEdJSGtHSUhpZ0NBRUVFY2pZQ0FBc2dBUkFMSWdKQmYwWkJBQkFMSWdCQmYwWnlJQUFnQWsxeURRVWdBQ0FDYXlJR0lBVkJLR3BORFFVTFFmd2RRZndkS0FJQUlBWnFJZ0EyQWdCQmdCNG9BZ0FnQUVrRVFFR0FIaUFBTmdJQUN3SkFRZVFhS0FJQUlnUUVRRUdNSGlFQUEwQWdBaUFBS0FJQUlnRWdBQ2dDQkNJRGFrWU5BaUFBS0FJSUlnQU5BQXNNQkF0QjNCb29BZ0FpQUVFQUlBQWdBazBiUlFSQVFkd2FJQUkyQWdBTFFRQWhBRUdRSGlBR05nSUFRWXdlSUFJMkFnQkI3QnBCZnpZQ0FFSHdHa0drSGlnQ0FEWUNBRUdZSGtFQU5nSUFBMEFnQUVFRGRDSUJRZndhYWlBQlFmUWFhaUlETmdJQUlBRkJnQnRxSUFNMkFnQWdBRUVCYWlJQVFTQkhEUUFMUWRnYUlBWkJLR3NpQUVGNElBSnJRUWR4SWdGcklnTTJBZ0JCNUJvZ0FTQUNhaUlCTmdJQUlBRWdBMEVCY2pZQ0JDQUFJQUpxUVNnMkFnUkI2QnBCdEI0b0FnQTJBZ0FNQkFzZ0FpQUVUU0FCSUFSTGNnMENJQUFvQWd4QkNIRU5BaUFBSUFNZ0JtbzJBZ1JCNUJvZ0JFRjRJQVJyUVFkeElnQnFJZ0UyQWdCQjJCcEIyQm9vQWdBZ0Jtb2lBaUFBYXlJQU5nSUFJQUVnQUVFQmNqWUNCQ0FDSUFScVFTZzJBZ1JCNkJwQnRCNG9BZ0EyQWdBTUF3dEJBQ0VEREFVTFFRQWhBZ3dEQzBIY0dpZ0NBQ0FDU3dSQVFkd2FJQUkyQWdBTElBSWdCbW9oQVVHTUhpRUFBa0FDUUFKQUEwQWdBU0FBS0FJQVJ3UkFJQUFvQWdnaUFBMEJEQUlMQ3lBQUxRQU1RUWh4UlEwQkMwR01IaUVBQTBBQ1FDQUVJQUFvQWdBaUFVOEVRQ0FCSUFBb0FnUnFJZ01nQkVzTkFRc2dBQ2dDQ0NFQURBRUxDMEhZR2lBR1FTaHJJZ0JCZUNBQ2EwRUhjU0lCYXlJSU5nSUFRZVFhSUFFZ0Ftb2lBVFlDQUNBQklBaEJBWEkyQWdRZ0FDQUNha0VvTmdJRVFlZ2FRYlFlS0FJQU5nSUFJQVFnQTBFbklBTnJRUWR4YWtFdmF5SUFJQUFnQkVFUWFra2JJZ0ZCR3pZQ0JDQUJRWlFlS1FJQU53SVFJQUZCakI0cEFnQTNBZ2hCbEI0Z0FVRUlhallDQUVHUUhpQUdOZ0lBUVl3ZUlBSTJBZ0JCbUI1QkFEWUNBQ0FCUVJocUlRQURRQ0FBUVFjMkFnUWdBRUVJYWlFTUlBQkJCR29oQUNBTUlBTkpEUUFMSUFFZ0JFWU5BaUFCSUFFb0FnUkJmbkUyQWdRZ0JDQUJJQVJySWdKQkFYSTJBZ1FnQVNBQ05nSUFJQUpCL3dGTkJFQWdBa0Y0Y1VIMEdtb2hBQUovUWN3YUtBSUFJZ0ZCQVNBQ1FRTjJkQ0lDY1VVRVFFSE1HaUFCSUFKeU5nSUFJQUFNQVFzZ0FDZ0NDQXNoQVNBQUlBUTJBZ2dnQVNBRU5nSU1JQVFnQURZQ0RDQUVJQUUyQWdnTUF3dEJIeUVBSUFKQi8vLy9CMDBFUUNBQ1FTWWdBa0VJZG1jaUFHdDJRUUZ4SUFCQkFYUnJRVDVxSVFBTElBUWdBRFlDSENBRVFnQTNBaEFnQUVFQ2RFSDhIR29oQVFKQVFkQWFLQUlBSWdOQkFTQUFkQ0lHY1VVRVFFSFFHaUFESUFaeU5nSUFJQUVnQkRZQ0FBd0JDeUFDUVJrZ0FFRUJkbXRCQUNBQVFSOUhHM1FoQUNBQktBSUFJUU1EUUNBRElnRW9BZ1JCZUhFZ0FrWU5BeUFBUVIxMklRTWdBRUVCZENFQUlBRWdBMEVFY1dvaUJpZ0NFQ0lERFFBTElBWWdCRFlDRUFzZ0JDQUJOZ0lZSUFRZ0JEWUNEQ0FFSUFRMkFnZ01BZ3NnQUNBQ05nSUFJQUFnQUNnQ0JDQUdhallDQkNBQ1FYZ2dBbXRCQjNGcUlnY2dCVUVEY2pZQ0JDQUJRWGdnQVd0QkIzRnFJZ1FnQlNBSGFpSUZheUVHQWtCQjVCb29BZ0FnQkVZRVFFSGtHaUFGTmdJQVFkZ2FRZGdhS0FJQUlBWnFJZ0EyQWdBZ0JTQUFRUUZ5TmdJRURBRUxRZUFhS0FJQUlBUkdCRUJCNEJvZ0JUWUNBRUhVR2tIVUdpZ0NBQ0FHYWlJQU5nSUFJQVVnQUVFQmNqWUNCQ0FBSUFWcUlBQTJBZ0FNQVFzZ0JDZ0NCQ0lDUVFOeFFRRkdCRUFnQWtGNGNTRUpBa0FnQWtIL0FVMEVRQ0FFS0FJTUlnQWdCQ2dDQ0NJQlJnUkFRY3dhUWN3YUtBSUFRWDRnQWtFRGRuZHhOZ0lBREFJTElBRWdBRFlDRENBQUlBRTJBZ2dNQVFzZ0JDZ0NHQ0VJQWtBZ0JDQUVLQUlNSWdCSEJFQkIzQm9vQWdBYUlBUW9BZ2dpQVNBQU5nSU1JQUFnQVRZQ0NBd0JDd0pBSUFSQkZHb2lBU2dDQUNJQ1JRUkFJQVFvQWhBaUFrVU5BU0FFUVJCcUlRRUxBMEFnQVNFRElBSWlBRUVVYWlJQktBSUFJZ0lOQUNBQVFSQnFJUUVnQUNnQ0VDSUNEUUFMSUFOQkFEWUNBQXdCQzBFQUlRQUxJQWhGRFFBQ1FDQUVLQUljSWdGQkFuUkIvQnhxSWdJb0FnQWdCRVlFUUNBQ0lBQTJBZ0FnQUEwQlFkQWFRZEFhS0FJQVFYNGdBWGR4TmdJQURBSUxJQWhCRUVFVUlBZ29BaEFnQkVZYmFpQUFOZ0lBSUFCRkRRRUxJQUFnQ0RZQ0dDQUVLQUlRSWdFRVFDQUFJQUUyQWhBZ0FTQUFOZ0lZQ3lBRUtBSVVJZ0ZGRFFBZ0FDQUJOZ0lVSUFFZ0FEWUNHQXNnQmlBSmFpRUdJQVFnQ1dvaUJDZ0NCQ0VDQ3lBRUlBSkJmbkUyQWdRZ0JTQUdRUUZ5TmdJRUlBVWdCbW9nQmpZQ0FDQUdRZjhCVFFSQUlBWkJlSEZCOUJwcUlRQUNmMEhNR2lnQ0FDSUJRUUVnQmtFRGRuUWlBbkZGQkVCQnpCb2dBU0FDY2pZQ0FDQUFEQUVMSUFBb0FnZ0xJUUVnQUNBRk5nSUlJQUVnQlRZQ0RDQUZJQUEyQWd3Z0JTQUJOZ0lJREFFTFFSOGhBaUFHUWYvLy93ZE5CRUFnQmtFbUlBWkJDSFpuSWdCcmRrRUJjU0FBUVFGMGEwRSthaUVDQ3lBRklBSTJBaHdnQlVJQU53SVFJQUpCQW5SQi9CeHFJUUVDUUFKQVFkQWFLQUlBSWdCQkFTQUNkQ0lEY1VVRVFFSFFHaUFBSUFOeU5nSUFJQUVnQlRZQ0FBd0JDeUFHUVJrZ0FrRUJkbXRCQUNBQ1FSOUhHM1FoQWlBQktBSUFJUUFEUUNBQUlnRW9BZ1JCZUhFZ0JrWU5BaUFDUVIxMklRQWdBa0VCZENFQ0lBRWdBRUVFY1dvaUF5Z0NFQ0lBRFFBTElBTWdCVFlDRUFzZ0JTQUJOZ0lZSUFVZ0JUWUNEQ0FGSUFVMkFnZ01BUXNnQVNnQ0NDSUFJQVUyQWd3Z0FTQUZOZ0lJSUFWQkFEWUNHQ0FGSUFFMkFnd2dCU0FBTmdJSUN5QUhRUWhxSVFBTUJRc2dBU2dDQ0NJQUlBUTJBZ3dnQVNBRU5nSUlJQVJCQURZQ0dDQUVJQUUyQWd3Z0JDQUFOZ0lJQzBIWUdpZ0NBQ0lBSUFWTkRRQkIyQm9nQUNBRmF5SUJOZ0lBUWVRYVFlUWFLQUlBSWdBZ0JXb2lBallDQUNBQ0lBRkJBWEkyQWdRZ0FDQUZRUU55TmdJRUlBQkJDR29oQUF3REMwSElHa0V3TmdJQVFRQWhBQXdDQ3dKQUlBZEZEUUFDUUNBREtBSWNJZ0JCQW5SQi9CeHFJZ0VvQWdBZ0EwWUVRQ0FCSUFJMkFnQWdBZzBCUWRBYUlBaEJmaUFBZDNFaUNEWUNBQXdDQ3lBSFFSQkJGQ0FIS0FJUUlBTkdHMm9nQWpZQ0FDQUNSUTBCQ3lBQ0lBYzJBaGdnQXlnQ0VDSUFCRUFnQWlBQU5nSVFJQUFnQWpZQ0dBc2dBeWdDRkNJQVJRMEFJQUlnQURZQ0ZDQUFJQUkyQWhnTEFrQWdCRUVQVFFSQUlBTWdCQ0FGYWlJQVFRTnlOZ0lFSUFBZ0Eyb2lBQ0FBS0FJRVFRRnlOZ0lFREFFTElBTWdCVUVEY2pZQ0JDQURJQVZxSWdJZ0JFRUJjallDQkNBQ0lBUnFJQVEyQWdBZ0JFSC9BVTBFUUNBRVFYaHhRZlFhYWlFQUFuOUJ6Qm9vQWdBaUFVRUJJQVJCQTNaMElnVnhSUVJBUWN3YUlBRWdCWEkyQWdBZ0FBd0JDeUFBS0FJSUN5RUJJQUFnQWpZQ0NDQUJJQUkyQWd3Z0FpQUFOZ0lNSUFJZ0FUWUNDQXdCQzBFZklRQWdCRUgvLy84SFRRUkFJQVJCSmlBRVFRaDJaeUlBYTNaQkFYRWdBRUVCZEd0QlBtb2hBQXNnQWlBQU5nSWNJQUpDQURjQ0VDQUFRUUowUWZ3Y2FpRUJBa0FDUUNBSVFRRWdBSFFpQlhGRkJFQkIwQm9nQlNBSWNqWUNBQ0FCSUFJMkFnQU1BUXNnQkVFWklBQkJBWFpyUVFBZ0FFRWZSeHQwSVFBZ0FTZ0NBQ0VGQTBBZ0JTSUJLQUlFUVhoeElBUkdEUUlnQUVFZGRpRUZJQUJCQVhRaEFDQUJJQVZCQkhGcUlnWW9BaEFpQlEwQUN5QUdJQUkyQWhBTElBSWdBVFlDR0NBQ0lBSTJBZ3dnQWlBQ05nSUlEQUVMSUFFb0FnZ2lBQ0FDTmdJTUlBRWdBallDQ0NBQ1FRQTJBaGdnQWlBQk5nSU1JQUlnQURZQ0NBc2dBMEVJYWlFQURBRUxBa0FnQ1VVTkFBSkFJQUlvQWh3aUFFRUNkRUg4SEdvaUFTZ0NBQ0FDUmdSQUlBRWdBellDQUNBRERRRkIwQm9nQzBGK0lBQjNjVFlDQUF3Q0N5QUpRUkJCRkNBSktBSVFJQUpHRzJvZ0F6WUNBQ0FEUlEwQkN5QURJQWsyQWhnZ0FpZ0NFQ0lBQkVBZ0F5QUFOZ0lRSUFBZ0F6WUNHQXNnQWlnQ0ZDSUFSUTBBSUFNZ0FEWUNGQ0FBSUFNMkFoZ0xBa0FnQkVFUFRRUkFJQUlnQkNBRmFpSUFRUU55TmdJRUlBQWdBbW9pQUNBQUtBSUVRUUZ5TmdJRURBRUxJQUlnQlVFRGNqWUNCQ0FDSUFWcUlnTWdCRUVCY2pZQ0JDQURJQVJxSUFRMkFnQWdCd1JBSUFkQmVIRkI5QnBxSVFCQjRCb29BZ0FoQVFKL1FRRWdCMEVEZG5RaUJTQUdjVVVFUUVITUdpQUZJQVp5TmdJQUlBQU1BUXNnQUNnQ0NBc2hCU0FBSUFFMkFnZ2dCU0FCTmdJTUlBRWdBRFlDRENBQklBVTJBZ2dMUWVBYUlBTTJBZ0JCMUJvZ0JEWUNBQXNnQWtFSWFpRUFDeUFLUVJCcUpBQWdBQXUrQ3dJTGZ3bDlJd0JCb0FGcklnc2tBQ0FMUVRCcVFTUVFFQU5BSUFFZ0RVY0VRQ0FDSUExQkEyd2lERUVDYWtFQ2RDSU9haW9DQUNFWElBSWdERUVCYWtFQ2RDSVBhaW9DQUNFWUlBZ2dERUVDZENJUWFpQUNJQkJxS2dJQUloazRBZ0FnQ0NBUGFpQVlPQUlBSUFnZ0Rtb2dGemdDQUNBSElBMUJCWFJxSWd3Z0dEZ0NCQ0FNSUJrNEFnQWdEQ0FYT0FJSUlBeEJBRFlDREFKQUlBQkZCRUFnQmlBTmFpMEFBRVVOQVFzZ0RFR0FnSUFJTmdJTUN5QUhJQTFCQlhRaUVVRWNjbW9nQlNBTlFRSjBJZ3hCQVhJaUVtb3RBQUJCQ0hRZ0JTQU1haTBBQUhJZ0JTQU1RUUp5SWhOcUxRQUFRUkIwY2lBRklBeEJBM0lpREdvdEFBQkJHSFJ5TmdJQUlBc2dBeUFTUVFKMEloSnFLZ0lBSWhjNEFwQUJJQXNnQXlBVFFRSjBJaE5xS2dJQUloZzRBcFFCSUFzZ0F5QU1RUUowSWhScUtnSUFJaGs0QXBnQklBc2dBeUFOUVFSMEloVnFLZ0lBakNJYU9BS2NBU0FMUWVBQWFpSU1JQXNxQXBnQkloWkRBQUFBd0pRZ0ZwUWdDeW9DbEFFaUZrTUFBQURBbENBV2xFTUFBSUEva3BJNEFnQWdEQ0FMS2dLUUFTSVdJQmFTSUFzcUFwUUJsQ0FMS2dLWUFVTUFBQURBbENBTEtnS2NBWlNTT0FJRUlBd2dDeW9Da0FFaUZpQVdraUFMS2dLWUFaUWdDeW9DbEFFaUZpQVdraUFMS2dLY0FaU1NPQUlJSUF3Z0N5b0NrQUVpRmlBV2tpQUxLZ0tVQVpRZ0N5b0NtQUVpRmlBV2tpQUxLZ0tjQVpTU09BSU1JQXdnQ3lvQ21BRWlGa01BQUFEQWxDQVdsQ0FMS2dLUUFTSVdRd0FBQU1DVUlCYVVRd0FBZ0QrU2tqZ0NFQ0FNSUFzcUFwUUJJaFlnRnBJZ0N5b0NtQUdVSUFzcUFwQUJRd0FBQU1DVUlBc3FBcHdCbEpJNEFoUWdEQ0FMS2dLUUFTSVdJQmFTSUFzcUFwZ0JsQ0FMS2dLVUFVTUFBQURBbENBTEtnS2NBWlNTT0FJWUlBd2dDeW9DbEFFaUZpQVdraUFMS2dLWUFaUWdDeW9Da0FFaUZpQVdraUFMS2dLY0FaU1NPQUljSUF3Z0N5b0NsQUVpRmtNQUFBREFsQ0FXbENBTEtnS1FBU0lXUXdBQUFNQ1VJQmFVUXdBQWdEK1NramdDSUNBSklCVnFJQmM0QWdBZ0NTQVNhaUFZT0FJQUlBa2dFMm9nR1RnQ0FDQUpJQlJxSUJvNEFnQWdDeUFFSUJCcUtnSUFJaGM0QWpBZ0N5QUVJQTlxS2dJQUloZzRBa0FnQ3lBRUlBNXFLZ0lBSWhrNEFsQWdDaUFRYWlBWE9BSUFJQW9nRDJvZ0dEZ0NBQ0FLSUE1cUlCazRBZ0FnQ3lBTUtnSVlJQXNxQWppVUlBd3FBZ0FnQ3lvQ01KUWdEQ29DRENBTEtnSTBsSktTT0FJQUlBc2dEQ29DSENBTEtnSTRsQ0FNS2dJRUlBc3FBakNVSUF3cUFoQWdDeW9DTkpTU2tqZ0NCQ0FMSUF3cUFpQWdDeW9DT0pRZ0RDb0NDQ0FMS2dJd2xDQU1LZ0lVSUFzcUFqU1VrcEk0QWdnZ0N5QU1LZ0lZSUFzcUFrU1VJQXdxQWdBZ0N5b0NQSlFnRENvQ0RDQUxLZ0pBbEpLU09BSU1JQXNnRENvQ0hDQUxLZ0pFbENBTUtnSUVJQXNxQWp5VUlBd3FBaEFnQ3lvQ1FKU1NramdDRUNBTElBd3FBaUFnQ3lvQ1JKUWdEQ29DQ0NBTEtnSThsQ0FNS2dJVUlBc3FBa0NVa3BJNEFoUWdDeUFNS2dJWUlBc3FBbENVSUF3cUFnQWdDeW9DU0pRZ0RDb0NEQ0FMS2dKTWxKS1NPQUlZSUFzZ0RDb0NIQ0FMS2dKUWxDQU1LZ0lFSUFzcUFraVVJQXdxQWhBZ0N5b0NUSlNTa2pnQ0hDQUxJQXdxQWlBZ0N5b0NVSlFnRENvQ0NDQUxLZ0pJbENBTUtnSVVJQXNxQWt5VWtwSTRBaUFnQ3lvQ0lDRVhJQXNxQWdnaEdDQUxLZ0lVSVJrZ0J5QVJRUkJ5YWlBTEtnSVlJaG9nR3BRZ0N5b0NBQ0lXSUJhVUlBc3FBZ3dpR3lBYmxKS1NRd0FBZ0VDVUlCb2dDeW9DSENJY2xDQVdJQXNxQWdRaUhaUWdHeUFMS2dJUUloNlVrcEpEQUFDQVFKUVFERFlDQUNBSElCRkJGSEpxSUJvZ0Y1UWdGaUFZbENBYklCbVVrcEpEQUFDQVFKUWdIQ0FjbENBZElCMlVJQjRnSHBTU2trTUFBSUJBbEJBTU5nSUFJQWNnRVVFWWNtb2dIQ0FYbENBZElCaVVJQjRnR1pTU2trTUFBSUJBbENBWElCZVVJQmdnR0pRZ0dTQVpsSktTUXdBQWdFQ1VFQXcyQWdBZ0RVRUJhaUVOREFFTEN5QUxRYUFCYWlRQUN4b0FJQUFnQVNnQ0NDQUZFQW9FUUNBQklBSWdBeUFFRUJRTEN6Y0FJQUFnQVNnQ0NDQUZFQW9FUUNBQklBSWdBeUFFRUJRUEN5QUFLQUlJSWdBZ0FTQUNJQU1nQkNBRklBQW9BZ0FvQWhRUkF3QUxrUUVBSUFBZ0FTZ0NDQ0FFRUFvRVFDQUJJQUlnQXhBVER3c0NRQ0FBSUFFb0FnQWdCQkFLUlEwQUFrQWdBaUFCS0FJUVJ3UkFJQUVvQWhRZ0FrY05BUXNnQTBFQlJ3MEJJQUZCQVRZQ0lBOExJQUVnQWpZQ0ZDQUJJQU0yQWlBZ0FTQUJLQUlvUVFGcU5nSW9Ba0FnQVNnQ0pFRUJSdzBBSUFFb0FoaEJBa2NOQUNBQlFRRTZBRFlMSUFGQkJEWUNMQXNMOGdFQUlBQWdBU2dDQ0NBRUVBb0VRQ0FCSUFJZ0F4QVREd3NDUUNBQUlBRW9BZ0FnQkJBS0JFQUNRQ0FDSUFFb0FoQkhCRUFnQVNnQ0ZDQUNSdzBCQ3lBRFFRRkhEUUlnQVVFQk5nSWdEd3NnQVNBRE5nSWdBa0FnQVNnQ0xFRUVSZzBBSUFGQkFEc0JOQ0FBS0FJSUlnQWdBU0FDSUFKQkFTQUVJQUFvQWdBb0FoUVJBd0FnQVMwQU5RUkFJQUZCQXpZQ0xDQUJMUUEwUlEwQkRBTUxJQUZCQkRZQ0xBc2dBU0FDTmdJVUlBRWdBU2dDS0VFQmFqWUNLQ0FCS0FJa1FRRkhEUUVnQVNnQ0dFRUNSdzBCSUFGQkFUb0FOZzhMSUFBb0FnZ2lBQ0FCSUFJZ0F5QUVJQUFvQWdBb0FoZ1JBZ0FMQ3pFQUlBQWdBU2dDQ0VFQUVBb0VRQ0FCSUFJZ0F4QVZEd3NnQUNnQ0NDSUFJQUVnQWlBRElBQW9BZ0FvQWh3UkFBQUxHQUFnQUNBQktBSUlRUUFRQ2dSQUlBRWdBaUFERUJVTEM0QURBUVIvSXdCQjhBQnJJZ0lrQUNBQUtBSUFJZ05CQkdzb0FnQWhCQ0FEUVFocktBSUFJUVVnQWtJQU53SlFJQUpDQURjQ1dDQUNRZ0EzQW1BZ0FrSUFOd0JuSUFKQ0FEY0NTQ0FDUVFBMkFrUWdBa0g4RlRZQ1FDQUNJQUEyQWp3Z0FpQUJOZ0k0SUFBZ0JXb2hBd0pBSUFRZ0FVRUFFQW9FUUVFQUlBTWdCUnNoQUF3QkN5QUFJQU5PQkVBZ0FrSUFOd0F2SUFKQ0FEY0NHQ0FDUWdBM0FpQWdBa0lBTndJb0lBSkNBRGNDRUNBQ1FRQTJBZ3dnQWlBQk5nSUlJQUlnQURZQ0JDQUNJQVEyQWdBZ0FrRUJOZ0l3SUFRZ0FpQURJQU5CQVVFQUlBUW9BZ0FvQWhRUkF3QWdBaWdDR0EwQkMwRUFJUUFnQkNBQ1FUaHFJQU5CQVVFQUlBUW9BZ0FvQWhnUkFnQUNRQUpBSUFJb0Fsd09BZ0FCQWdzZ0FpZ0NURUVBSUFJb0FsaEJBVVliUVFBZ0FpZ0NWRUVCUmh0QkFDQUNLQUpnUVFGR0d5RUFEQUVMSUFJb0FsQkJBVWNFUUNBQ0tBSmdEUUVnQWlnQ1ZFRUJSdzBCSUFJb0FsaEJBVWNOQVFzZ0FpZ0NTQ0VBQ3lBQ1FmQUFhaVFBSUFBTG1RRUJBbjhqQUVGQWFpSURKQUFDZjBFQklBQWdBVUVBRUFvTkFCcEJBQ0FCUlEwQUdrRUFJQUZCckJZUUlDSUJSUTBBR2lBRFFReHFRVFFRRUNBRFFRRTJBamdnQTBGL05nSVVJQU1nQURZQ0VDQURJQUUyQWdnZ0FTQURRUWhxSUFJb0FnQkJBU0FCS0FJQUtBSWNFUUFBSUFNb0FpQWlBRUVCUmdSQUlBSWdBeWdDR0RZQ0FBc2dBRUVCUmdzaEJDQURRVUJySkFBZ0JBc0tBQ0FBSUFGQkFCQUtDd1FBSUFBTEM4Y1NBZ0JCZ0FnTHRoSjFibk5wWjI1bFpDQnphRzl5ZEFCMWJuTnBaMjVsWkNCcGJuUUFabXh2WVhRQWRXbHVkRFkwWDNRQWRXNXphV2R1WldRZ1kyaGhjZ0JpYjI5c0FHVnRjMk55YVhCMFpXNDZPblpoYkFCMWJuTnBaMjVsWkNCc2IyNW5BSE4wWkRvNmQzTjBjbWx1WndCemRHUTZPbk4wY21sdVp3QnpkR1E2T25VeE5uTjBjbWx1WndCemRHUTZPblV6TW5OMGNtbHVad0JrYjNWaWJHVUFkbTlwWkFCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenh6YUc5eWRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXNXphV2R1WldRZ2MyaHZjblErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQR2x1ZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4ZFc1emFXZHVaV1FnYVc1MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4bWJHOWhkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhkV2x1ZERoZmRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGFXNTBPRjkwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYVc1ME1UWmZkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhhVzUwTVRaZmRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXbHVkRFkwWDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEdsdWREWTBYM1ErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQSFZwYm5Rek1sOTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHBiblF6TWw5MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4amFHRnlQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eDFibk5wWjI1bFpDQmphR0Z5UGdCemRHUTZPbUpoYzJsalgzTjBjbWx1Wnp4MWJuTnBaMjVsWkNCamFHRnlQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHphV2R1WldRZ1kyaGhjajRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhiRzl1Wno0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4ZFc1emFXZHVaV1FnYkc5dVp6NEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOFpHOTFZbXhsUGdCT1UzUXpYMTh5TVRKaVlYTnBZMTl6ZEhKcGJtZEpZMDVUWHpFeFkyaGhjbDkwY21GcGRITkpZMFZGVGxOZk9XRnNiRzlqWVhSdmNrbGpSVVZGUlFBQUFBQ2tEQUFBUWdjQUFFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGxvVGxOZk1URmphR0Z5WDNSeVlXbDBjMGxvUlVWT1UxODVZV3hzYjJOaGRHOXlTV2hGUlVWRkFBQ2tEQUFBakFjQUFFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGwzVGxOZk1URmphR0Z5WDNSeVlXbDBjMGwzUlVWT1UxODVZV3hzYjJOaGRHOXlTWGRGUlVWRkFBQ2tEQUFBMUFjQUFFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGxFYzA1VFh6RXhZMmhoY2w5MGNtRnBkSE5KUkhORlJVNVRYemxoYkd4dlkyRjBiM0pKUkhORlJVVkZBQUFBcEF3QUFCd0lBQUJPVTNRelgxOHlNVEppWVhOcFkxOXpkSEpwYm1kSlJHbE9VMTh4TVdOb1lYSmZkSEpoYVhSelNVUnBSVVZPVTE4NVlXeHNiMk5oZEc5eVNVUnBSVVZGUlFBQUFLUU1BQUJvQ0FBQVRqRXdaVzF6WTNKcGNIUmxiak4yWVd4RkFBQ2tEQUFBdEFnQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NXTkZSUUFBcEF3QUFOQUlBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGxoUlVVQUFLUU1BQUQ0Q0FBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSmFFVkZBQUNrREFBQUlBa0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTWE5GUlFBQXBBd0FBRWdKQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsMFJVVUFBS1FNQUFCd0NRQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEphVVZGQUFDa0RBQUFtQWtBQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1dwRlJRQUFwQXdBQU1BSkFBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbHNSVVVBQUtRTUFBRG9DUUFBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKYlVWRkFBQ2tEQUFBRUFvQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NYaEZSUUFBcEF3QUFEZ0tBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGw1UlVVQUFLUU1BQUJnQ2dBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSlprVkZBQUNrREFBQWlBb0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTV1JGUlFBQXBBd0FBTEFLQUFCT01UQmZYMk40ZUdGaWFYWXhNVFpmWDNOb2FXMWZkSGx3WlY5cGJtWnZSUUFBQUFETURBQUEyQW9BQURBTkFBQk9NVEJmWDJONGVHRmlhWFl4TVRkZlgyTnNZWE56WDNSNWNHVmZhVzVtYjBVQUFBRE1EQUFBQ0FzQUFQd0tBQUJPTVRCZlgyTjRlR0ZpYVhZeE1UZGZYM0JpWVhObFgzUjVjR1ZmYVc1bWIwVUFBQURNREFBQU9Bc0FBUHdLQUFCT01UQmZYMk40ZUdGaWFYWXhNVGxmWDNCdmFXNTBaWEpmZEhsd1pWOXBibVp2UlFETURBQUFhQXNBQUZ3TEFBQUFBQUFBM0FzQUFBSUFBQUFEQUFBQUJBQUFBQVVBQUFBR0FBQUFUakV3WDE5amVIaGhZbWwyTVRJelgxOW1kVzVrWVcxbGJuUmhiRjkwZVhCbFgybHVabTlGQU13TUFBQzBDd0FBL0FvQUFIWUFBQUNnQ3dBQTZBc0FBR0lBQUFDZ0N3QUE5QXNBQUdNQUFBQ2dDd0FBQUF3QUFHZ0FBQUNnQ3dBQURBd0FBR0VBQUFDZ0N3QUFHQXdBQUhNQUFBQ2dDd0FBSkF3QUFIUUFBQUNnQ3dBQU1Bd0FBR2tBQUFDZ0N3QUFQQXdBQUdvQUFBQ2dDd0FBU0F3QUFHd0FBQUNnQ3dBQVZBd0FBRzBBQUFDZ0N3QUFZQXdBQUhnQUFBQ2dDd0FBYkF3QUFIa0FBQUNnQ3dBQWVBd0FBR1lBQUFDZ0N3QUFoQXdBQUdRQUFBQ2dDd0FBa0F3QUFBQUFBQUFzQ3dBQUFnQUFBQWNBQUFBRUFBQUFCUUFBQUFnQUFBQUpBQUFBQ2dBQUFBc0FBQUFBQUFBQUZBMEFBQUlBQUFBTUFBQUFCQUFBQUFVQUFBQUlBQUFBRFFBQUFBNEFBQUFQQUFBQVRqRXdYMTlqZUhoaFltbDJNVEl3WDE5emFWOWpiR0Z6YzE5MGVYQmxYMmx1Wm05RkFBQUFBTXdNQUFEc0RBQUFMQXNBQUZOME9YUjVjR1ZmYVc1bWJ3QUFBQUNrREFBQUlBMEFRYmdhQ3dOQUR3RT0iO2lmKCFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpKXt3YXNtQmluYXJ5RmlsZT1sb2NhdGVGaWxlKHdhc21CaW5hcnlGaWxlKTt9ZnVuY3Rpb24gZ2V0QmluYXJ5U3luYyhmaWxlKXtpZihmaWxlPT13YXNtQmluYXJ5RmlsZSYmd2FzbUJpbmFyeSl7cmV0dXJuIG5ldyBVaW50OEFycmF5KHdhc21CaW5hcnkpfXZhciBiaW5hcnk9dHJ5UGFyc2VBc0RhdGFVUkkoZmlsZSk7aWYoYmluYXJ5KXtyZXR1cm4gYmluYXJ5fWlmKHJlYWRCaW5hcnkpe3JldHVybiByZWFkQmluYXJ5KGZpbGUpfXRocm93ICJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZCJ9ZnVuY3Rpb24gZ2V0QmluYXJ5UHJvbWlzZShiaW5hcnlGaWxlKXtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKT0+Z2V0QmluYXJ5U3luYyhiaW5hcnlGaWxlKSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMscmVjZWl2ZXIpe3JldHVybiBnZXRCaW5hcnlQcm9taXNlKGJpbmFyeUZpbGUpLnRoZW4oYmluYXJ5PT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZShiaW5hcnksaW1wb3J0cykpLnRoZW4oaW5zdGFuY2U9Pmluc3RhbmNlKS50aGVuKHJlY2VpdmVyLHJlYXNvbj0+e2VycihgZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogJHtyZWFzb259YCk7YWJvcnQocmVhc29uKTt9KX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKGJpbmFyeSxiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spe3JldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKGJpbmFyeUZpbGUsaW1wb3J0cyxjYWxsYmFjayl9ZnVuY3Rpb24gY3JlYXRlV2FzbSgpe3ZhciBpbmZvPXsiYSI6d2FzbUltcG9ydHN9O2Z1bmN0aW9uIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSxtb2R1bGUpe3dhc21FeHBvcnRzPWluc3RhbmNlLmV4cG9ydHM7d2FzbU1lbW9yeT13YXNtRXhwb3J0c1siayJdO3VwZGF0ZU1lbW9yeVZpZXdzKCk7YWRkT25Jbml0KHdhc21FeHBvcnRzWyJsIl0pO3JlbW92ZVJ1bkRlcGVuZGVuY3koKTtyZXR1cm4gd2FzbUV4cG9ydHN9YWRkUnVuRGVwZW5kZW5jeSgpO2Z1bmN0aW9uIHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KHJlc3VsdCl7cmVjZWl2ZUluc3RhbmNlKHJlc3VsdFsiaW5zdGFuY2UiXSk7fWlmKE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0pe3RyeXtyZXR1cm4gTW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXShpbmZvLHJlY2VpdmVJbnN0YW5jZSl9Y2F0Y2goZSl7ZXJyKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2V9YCk7cmVhZHlQcm9taXNlUmVqZWN0KGUpO319aW5zdGFudGlhdGVBc3luYyh3YXNtQmluYXJ5LHdhc21CaW5hcnlGaWxlLGluZm8scmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQpLmNhdGNoKHJlYWR5UHJvbWlzZVJlamVjdCk7cmV0dXJuIHt9fXZhciBjYWxsUnVudGltZUNhbGxiYWNrcz1jYWxsYmFja3M9Pnt3aGlsZShjYWxsYmFja3MubGVuZ3RoPjApe2NhbGxiYWNrcy5zaGlmdCgpKE1vZHVsZSk7fX07TW9kdWxlWyJub0V4aXRSdW50aW1lIl18fHRydWU7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludD0ocHJpbWl0aXZlVHlwZSxuYW1lLHNpemUsbWluUmFuZ2UsbWF4UmFuZ2UpPT57fTt2YXIgZW1iaW5kX2luaXRfY2hhckNvZGVzPSgpPT57dmFyIGNvZGVzPW5ldyBBcnJheSgyNTYpO2Zvcih2YXIgaT0wO2k8MjU2OysraSl7Y29kZXNbaV09U3RyaW5nLmZyb21DaGFyQ29kZShpKTt9ZW1iaW5kX2NoYXJDb2Rlcz1jb2Rlczt9O3ZhciBlbWJpbmRfY2hhckNvZGVzO3ZhciByZWFkTGF0aW4xU3RyaW5nPXB0cj0+e3ZhciByZXQ9IiI7dmFyIGM9cHRyO3doaWxlKEhFQVBVOFtjXSl7cmV0Kz1lbWJpbmRfY2hhckNvZGVzW0hFQVBVOFtjKytdXTt9cmV0dXJuIHJldH07dmFyIGF3YWl0aW5nRGVwZW5kZW5jaWVzPXt9O3ZhciByZWdpc3RlcmVkVHlwZXM9e307dmFyIEJpbmRpbmdFcnJvcjt2YXIgdGhyb3dCaW5kaW5nRXJyb3I9bWVzc2FnZT0+e3Rocm93IG5ldyBCaW5kaW5nRXJyb3IobWVzc2FnZSl9O2Z1bmN0aW9uIHNoYXJlZFJlZ2lzdGVyVHlwZShyYXdUeXBlLHJlZ2lzdGVyZWRJbnN0YW5jZSxvcHRpb25zPXt9KXt2YXIgbmFtZT1yZWdpc3RlcmVkSW5zdGFuY2UubmFtZTtpZighcmF3VHlwZSl7dGhyb3dCaW5kaW5nRXJyb3IoYHR5cGUgIiR7bmFtZX0iIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXJgKTt9aWYocmVnaXN0ZXJlZFR5cGVzLmhhc093blByb3BlcnR5KHJhd1R5cGUpKXtpZihvcHRpb25zLmlnbm9yZUR1cGxpY2F0ZVJlZ2lzdHJhdGlvbnMpe3JldHVybn1lbHNlIHt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyR7bmFtZX0nIHR3aWNlYCk7fX1yZWdpc3RlcmVkVHlwZXNbcmF3VHlwZV09cmVnaXN0ZXJlZEluc3RhbmNlO2lmKGF3YWl0aW5nRGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KHJhd1R5cGUpKXt2YXIgY2FsbGJhY2tzPWF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2RlbGV0ZSBhd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtjYWxsYmFja3MuZm9yRWFjaChjYj0+Y2IoKSk7fX1mdW5jdGlvbiByZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucz17fSl7aWYoISgiYXJnUGFja0FkdmFuY2UiaW4gcmVnaXN0ZXJlZEluc3RhbmNlKSl7dGhyb3cgbmV3IFR5cGVFcnJvcigicmVnaXN0ZXJUeXBlIHJlZ2lzdGVyZWRJbnN0YW5jZSByZXF1aXJlcyBhcmdQYWNrQWR2YW5jZSIpfXJldHVybiBzaGFyZWRSZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucyl9dmFyIEdlbmVyaWNXaXJlVHlwZVNpemU9ODt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfYm9vbD0ocmF3VHlwZSxuYW1lLHRydWVWYWx1ZSxmYWxzZVZhbHVlKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHd0KXtyZXR1cm4gISF3dH0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLG8pe3JldHVybiBvP3RydWVWYWx1ZTpmYWxzZVZhbHVlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUFU4W3BvaW50ZXJdKX0sZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KTt9O2Z1bmN0aW9uIGhhbmRsZUFsbG9jYXRvckluaXQoKXtPYmplY3QuYXNzaWduKEhhbmRsZUFsbG9jYXRvci5wcm90b3R5cGUse2dldChpZCl7cmV0dXJuIHRoaXMuYWxsb2NhdGVkW2lkXX0saGFzKGlkKXtyZXR1cm4gdGhpcy5hbGxvY2F0ZWRbaWRdIT09dW5kZWZpbmVkfSxhbGxvY2F0ZShoYW5kbGUpe3ZhciBpZD10aGlzLmZyZWVsaXN0LnBvcCgpfHx0aGlzLmFsbG9jYXRlZC5sZW5ndGg7dGhpcy5hbGxvY2F0ZWRbaWRdPWhhbmRsZTtyZXR1cm4gaWR9LGZyZWUoaWQpe3RoaXMuYWxsb2NhdGVkW2lkXT11bmRlZmluZWQ7dGhpcy5mcmVlbGlzdC5wdXNoKGlkKTt9fSk7fWZ1bmN0aW9uIEhhbmRsZUFsbG9jYXRvcigpe3RoaXMuYWxsb2NhdGVkPVt1bmRlZmluZWRdO3RoaXMuZnJlZWxpc3Q9W107fXZhciBlbXZhbF9oYW5kbGVzPW5ldyBIYW5kbGVBbGxvY2F0b3I7dmFyIF9fZW12YWxfZGVjcmVmPWhhbmRsZT0+e2lmKGhhbmRsZT49ZW12YWxfaGFuZGxlcy5yZXNlcnZlZCYmMD09PS0tZW12YWxfaGFuZGxlcy5nZXQoaGFuZGxlKS5yZWZjb3VudCl7ZW12YWxfaGFuZGxlcy5mcmVlKGhhbmRsZSk7fX07dmFyIGNvdW50X2VtdmFsX2hhbmRsZXM9KCk9Pnt2YXIgY291bnQ9MDtmb3IodmFyIGk9ZW12YWxfaGFuZGxlcy5yZXNlcnZlZDtpPGVtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZXMuYWxsb2NhdGVkW2ldIT09dW5kZWZpbmVkKXsrK2NvdW50O319cmV0dXJuIGNvdW50fTt2YXIgaW5pdF9lbXZhbD0oKT0+e2VtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLnB1c2goe3ZhbHVlOnVuZGVmaW5lZH0se3ZhbHVlOm51bGx9LHt2YWx1ZTp0cnVlfSx7dmFsdWU6ZmFsc2V9KTtlbXZhbF9oYW5kbGVzLnJlc2VydmVkPWVtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLmxlbmd0aDtNb2R1bGVbImNvdW50X2VtdmFsX2hhbmRsZXMiXT1jb3VudF9lbXZhbF9oYW5kbGVzO307dmFyIEVtdmFsPXt0b1ZhbHVlOmhhbmRsZT0+e2lmKCFoYW5kbGUpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSAiK2hhbmRsZSk7fXJldHVybiBlbXZhbF9oYW5kbGVzLmdldChoYW5kbGUpLnZhbHVlfSx0b0hhbmRsZTp2YWx1ZT0+e3N3aXRjaCh2YWx1ZSl7Y2FzZSB1bmRlZmluZWQ6cmV0dXJuIDE7Y2FzZSBudWxsOnJldHVybiAyO2Nhc2UgdHJ1ZTpyZXR1cm4gMztjYXNlIGZhbHNlOnJldHVybiA0O2RlZmF1bHQ6e3JldHVybiBlbXZhbF9oYW5kbGVzLmFsbG9jYXRlKHtyZWZjb3VudDoxLHZhbHVlOnZhbHVlfSl9fX19O2Z1bmN0aW9uIHNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQMzJbcG9pbnRlcj4+Ml0pfXZhciBfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbD0ocmF3VHlwZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmhhbmRsZT0+e3ZhciBydj1FbXZhbC50b1ZhbHVlKGhhbmRsZSk7X19lbXZhbF9kZWNyZWYoaGFuZGxlKTtyZXR1cm4gcnZ9LCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsdmFsdWUpPT5FbXZhbC50b0hhbmRsZSh2YWx1ZSksImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KTt9O3ZhciBmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyPShuYW1lLHdpZHRoKT0+e3N3aXRjaCh3aWR0aCl7Y2FzZSA0OnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEYzMltwb2ludGVyPj4yXSl9O2Nhc2UgODpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGNjRbcG9pbnRlcj4+M10pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgZmxvYXQgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0PShyYXdUeXBlLG5hbWUsc2l6ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjp2YWx1ZT0+dmFsdWUsInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PnZhbHVlLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaXplKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pO307dmFyIGludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcj0obmFtZSx3aWR0aCxzaWduZWQpPT57c3dpdGNoKHdpZHRoKXtjYXNlIDE6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQOFtwb2ludGVyPj4wXTpwb2ludGVyPT5IRUFQVThbcG9pbnRlcj4+MF07Y2FzZSAyOnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDE2W3BvaW50ZXI+PjFdOnBvaW50ZXI9PkhFQVBVMTZbcG9pbnRlcj4+MV07Y2FzZSA0OnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDMyW3BvaW50ZXI+PjJdOnBvaW50ZXI9PkhFQVBVMzJbcG9pbnRlcj4+Ml07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGludGVnZXIgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXI9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTtpZihtaW5SYW5nZT09PTApe3ZhciBiaXRzaGlmdD0zMi04KnNpemU7ZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTw8Yml0c2hpZnQ+Pj5iaXRzaGlmdDt9dmFyIGlzVW5zaWduZWRUeXBlPW5hbWUuaW5jbHVkZXMoInVuc2lnbmVkIik7dmFyIGNoZWNrQXNzZXJ0aW9ucz0odmFsdWUsdG9UeXBlTmFtZSk9Pnt9O3ZhciB0b1dpcmVUeXBlO2lmKGlzVW5zaWduZWRUeXBlKXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWU+Pj4wfTt9ZWxzZSB7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlfTt9cmVnaXN0ZXJUeXBlKHByaW1pdGl2ZVR5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmcm9tV2lyZVR5cGUsInRvV2lyZVR5cGUiOnRvV2lyZVR5cGUsImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6aW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2l6ZSxtaW5SYW5nZSE9PTApLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXc9KHJhd1R5cGUsZGF0YVR5cGVJbmRleCxuYW1lKT0+e3ZhciB0eXBlTWFwcGluZz1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXldO3ZhciBUQT10eXBlTWFwcGluZ1tkYXRhVHlwZUluZGV4XTtmdW5jdGlvbiBkZWNvZGVNZW1vcnlWaWV3KGhhbmRsZSl7dmFyIHNpemU9SEVBUFUzMltoYW5kbGU+PjJdO3ZhciBkYXRhPUhFQVBVMzJbaGFuZGxlKzQ+PjJdO3JldHVybiBuZXcgVEEoSEVBUDguYnVmZmVyLGRhdGEsc2l6ZSl9bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZGVjb2RlTWVtb3J5VmlldywiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpkZWNvZGVNZW1vcnlWaWV3fSx7aWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9uczp0cnVlfSk7fTtmdW5jdGlvbiByZWFkUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUFUzMltwb2ludGVyPj4yXSl9dmFyIHN0cmluZ1RvVVRGOEFycmF5PShzdHIsaGVhcCxvdXRJZHgsbWF4Qnl0ZXNUb1dyaXRlKT0+e2lmKCEobWF4Qnl0ZXNUb1dyaXRlPjApKXJldHVybiAwO3ZhciBzdGFydElkeD1vdXRJZHg7dmFyIGVuZElkeD1vdXRJZHgrbWF4Qnl0ZXNUb1dyaXRlLTE7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIHU9c3RyLmNoYXJDb2RlQXQoaSk7aWYodT49NTUyOTYmJnU8PTU3MzQzKXt2YXIgdTE9c3RyLmNoYXJDb2RlQXQoKytpKTt1PTY1NTM2KygodSYxMDIzKTw8MTApfHUxJjEwMjM7fWlmKHU8PTEyNyl7aWYob3V0SWR4Pj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109dTt9ZWxzZSBpZih1PD0yMDQ3KXtpZihvdXRJZHgrMT49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTE5Mnx1Pj42O2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzO31lbHNlIGlmKHU8PTY1NTM1KXtpZihvdXRJZHgrMj49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTIyNHx1Pj4xMjtoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2Mzt9ZWxzZSB7aWYob3V0SWR4KzM+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yNDB8dT4+MTg7aGVhcFtvdXRJZHgrK109MTI4fHU+PjEyJjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzO319aGVhcFtvdXRJZHhdPTA7cmV0dXJuIG91dElkeC1zdGFydElkeH07dmFyIHN0cmluZ1RvVVRGOD0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT5zdHJpbmdUb1VURjhBcnJheShzdHIsSEVBUFU4LG91dFB0cixtYXhCeXRlc1RvV3JpdGUpO3ZhciBsZW5ndGhCeXRlc1VURjg9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjPXN0ci5jaGFyQ29kZUF0KGkpO2lmKGM8PTEyNyl7bGVuKys7fWVsc2UgaWYoYzw9MjA0Nyl7bGVuKz0yO31lbHNlIGlmKGM+PTU1Mjk2JiZjPD01NzM0Myl7bGVuKz00OysraTt9ZWxzZSB7bGVuKz0zO319cmV0dXJuIGxlbn07dmFyIFVURjhEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGY4Iik6dW5kZWZpbmVkO3ZhciBVVEY4QXJyYXlUb1N0cmluZz0oaGVhcE9yQXJyYXksaWR4LG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBlbmRJZHg9aWR4K21heEJ5dGVzVG9SZWFkO3ZhciBlbmRQdHI9aWR4O3doaWxlKGhlYXBPckFycmF5W2VuZFB0cl0mJiEoZW5kUHRyPj1lbmRJZHgpKSsrZW5kUHRyO2lmKGVuZFB0ci1pZHg+MTYmJmhlYXBPckFycmF5LmJ1ZmZlciYmVVRGOERlY29kZXIpe3JldHVybiBVVEY4RGVjb2Rlci5kZWNvZGUoaGVhcE9yQXJyYXkuc3ViYXJyYXkoaWR4LGVuZFB0cikpfXZhciBzdHI9IiI7d2hpbGUoaWR4PGVuZFB0cil7dmFyIHUwPWhlYXBPckFycmF5W2lkeCsrXTtpZighKHUwJjEyOCkpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7Y29udGludWV9dmFyIHUxPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjI0KT09MTkyKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoKHUwJjMxKTw8Nnx1MSk7Y29udGludWV9dmFyIHUyPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjQwKT09MjI0KXt1MD0odTAmMTUpPDwxMnx1MTw8Nnx1Mjt9ZWxzZSB7dTA9KHUwJjcpPDwxOHx1MTw8MTJ8dTI8PDZ8aGVhcE9yQXJyYXlbaWR4KytdJjYzO31pZih1MDw2NTUzNil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTt9ZWxzZSB7dmFyIGNoPXUwLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyk7fX1yZXR1cm4gc3RyfTt2YXIgVVRGOFRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT5wdHI/VVRGOEFycmF5VG9TdHJpbmcoSEVBUFU4LHB0cixtYXhCeXRlc1RvUmVhZCk6IiI7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmc9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIHN0ZFN0cmluZ0lzVVRGOD1uYW1lPT09InN0ZDo6c3RyaW5nIjtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiKHZhbHVlKXt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBwYXlsb2FkPXZhbHVlKzQ7dmFyIHN0cjtpZihzdGRTdHJpbmdJc1VURjgpe3ZhciBkZWNvZGVTdGFydFB0cj1wYXlsb2FkO2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj1wYXlsb2FkK2k7aWYoaT09bGVuZ3RofHxIRUFQVThbY3VycmVudEJ5dGVQdHJdPT0wKXt2YXIgbWF4UmVhZD1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1VVEY4VG9TdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZCk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudDt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudDt9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrMTt9fX1lbHNlIHt2YXIgYT1uZXcgQXJyYXkobGVuZ3RoKTtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe2FbaV09U3RyaW5nLmZyb21DaGFyQ29kZShIRUFQVThbcGF5bG9hZCtpXSk7fXN0cj1hLmpvaW4oIiIpO31fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiKGRlc3RydWN0b3JzLHZhbHVlKXtpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXt2YWx1ZT1uZXcgVWludDhBcnJheSh2YWx1ZSk7fXZhciBsZW5ndGg7dmFyIHZhbHVlSXNPZlR5cGVTdHJpbmc9dHlwZW9mIHZhbHVlPT0ic3RyaW5nIjtpZighKHZhbHVlSXNPZlR5cGVTdHJpbmd8fHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZyIpO31pZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe2xlbmd0aD1sZW5ndGhCeXRlc1VURjgodmFsdWUpO31lbHNlIHtsZW5ndGg9dmFsdWUubGVuZ3RoO312YXIgYmFzZT1fbWFsbG9jKDQrbGVuZ3RoKzEpO3ZhciBwdHI9YmFzZSs0O0hFQVBVMzJbYmFzZT4+Ml09bGVuZ3RoO2lmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7c3RyaW5nVG9VVEY4KHZhbHVlLHB0cixsZW5ndGgrMSk7fWVsc2Uge2lmKHZhbHVlSXNPZlR5cGVTdHJpbmcpe2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7dmFyIGNoYXJDb2RlPXZhbHVlLmNoYXJDb2RlQXQoaSk7aWYoY2hhckNvZGU+MjU1KXtfZnJlZShwdHIpO3Rocm93QmluZGluZ0Vycm9yKCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHMiKTt9SEVBUFU4W3B0citpXT1jaGFyQ29kZTt9fWVsc2Uge2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7SEVBUFU4W3B0citpXT12YWx1ZVtpXTt9fX1pZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUsYmFzZSk7fXJldHVybiBiYXNlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpyZWFkUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpO319KTt9O3ZhciBVVEYxNkRlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0Zi0xNmxlIik6dW5kZWZpbmVkO3ZhciBVVEYxNlRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGVuZFB0cj1wdHI7dmFyIGlkeD1lbmRQdHI+PjE7dmFyIG1heElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQvMjt3aGlsZSghKGlkeD49bWF4SWR4KSYmSEVBUFUxNltpZHhdKSsraWR4O2VuZFB0cj1pZHg8PDE7aWYoZW5kUHRyLXB0cj4zMiYmVVRGMTZEZWNvZGVyKXJldHVybiBVVEYxNkRlY29kZXIuZGVjb2RlKEhFQVBVOC5zdWJhcnJheShwdHIsZW5kUHRyKSk7dmFyIHN0cj0iIjtmb3IodmFyIGk9MDshKGk+PW1heEJ5dGVzVG9SZWFkLzIpOysraSl7dmFyIGNvZGVVbml0PUhFQVAxNltwdHIraSoyPj4xXTtpZihjb2RlVW5pdD09MClicmVhaztzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVVuaXQpO31yZXR1cm4gc3RyfTt2YXIgc3RyaW5nVG9VVEYxNj0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT57bWF4Qnl0ZXNUb1dyaXRlPz89MjE0NzQ4MzY0NztpZihtYXhCeXRlc1RvV3JpdGU8MilyZXR1cm4gMDttYXhCeXRlc1RvV3JpdGUtPTI7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgbnVtQ2hhcnNUb1dyaXRlPW1heEJ5dGVzVG9Xcml0ZTxzdHIubGVuZ3RoKjI/bWF4Qnl0ZXNUb1dyaXRlLzI6c3RyLmxlbmd0aDtmb3IodmFyIGk9MDtpPG51bUNoYXJzVG9Xcml0ZTsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtIRUFQMTZbb3V0UHRyPj4xXT1jb2RlVW5pdDtvdXRQdHIrPTI7fUhFQVAxNltvdXRQdHI+PjFdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn07dmFyIGxlbmd0aEJ5dGVzVVRGMTY9c3RyPT5zdHIubGVuZ3RoKjI7dmFyIFVURjMyVG9TdHJpbmc9KHB0cixtYXhCeXRlc1RvUmVhZCk9Pnt2YXIgaT0wO3ZhciBzdHI9IiI7d2hpbGUoIShpPj1tYXhCeXRlc1RvUmVhZC80KSl7dmFyIHV0ZjMyPUhFQVAzMltwdHIraSo0Pj4yXTtpZih1dGYzMj09MClicmVhazsrK2k7aWYodXRmMzI+PTY1NTM2KXt2YXIgY2g9dXRmMzItNjU1MzY7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGNoPj4xMCw1NjMyMHxjaCYxMDIzKTt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHV0ZjMyKTt9fXJldHVybiBzdHJ9O3ZhciBzdHJpbmdUb1VURjMyPShzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk9PnttYXhCeXRlc1RvV3JpdGU/Pz0yMTQ3NDgzNjQ3O2lmKG1heEJ5dGVzVG9Xcml0ZTw0KXJldHVybiAwO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIGVuZFB0cj1zdGFydFB0cittYXhCeXRlc1RvV3JpdGUtNDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpe3ZhciB0cmFpbFN1cnJvZ2F0ZT1zdHIuY2hhckNvZGVBdCgrK2kpO2NvZGVVbml0PTY1NTM2KygoY29kZVVuaXQmMTAyMyk8PDEwKXx0cmFpbFN1cnJvZ2F0ZSYxMDIzO31IRUFQMzJbb3V0UHRyPj4yXT1jb2RlVW5pdDtvdXRQdHIrPTQ7aWYob3V0UHRyKzQ+ZW5kUHRyKWJyZWFrfUhFQVAzMltvdXRQdHI+PjJdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn07dmFyIGxlbmd0aEJ5dGVzVVRGMzI9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0MykrK2k7bGVuKz00O31yZXR1cm4gbGVufTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmc9KHJhd1R5cGUsY2hhclNpemUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGRlY29kZVN0cmluZyxlbmNvZGVTdHJpbmcsZ2V0SGVhcCxsZW5ndGhCeXRlc1VURixzaGlmdDtpZihjaGFyU2l6ZT09PTIpe2RlY29kZVN0cmluZz1VVEYxNlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjE2O2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMTY7Z2V0SGVhcD0oKT0+SEVBUFUxNjtzaGlmdD0xO31lbHNlIGlmKGNoYXJTaXplPT09NCl7ZGVjb2RlU3RyaW5nPVVURjMyVG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMzI7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYzMjtnZXRIZWFwPSgpPT5IRUFQVTMyO3NoaWZ0PTI7fXJlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6dmFsdWU9Pnt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBIRUFQPWdldEhlYXAoKTt2YXIgc3RyO3ZhciBkZWNvZGVTdGFydFB0cj12YWx1ZSs0O2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj12YWx1ZSs0K2kqY2hhclNpemU7aWYoaT09bGVuZ3RofHxIRUFQW2N1cnJlbnRCeXRlUHRyPj5zaGlmdF09PTApe3ZhciBtYXhSZWFkQnl0ZXM9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9ZGVjb2RlU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWRCeXRlcyk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudDt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudDt9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrY2hhclNpemU7fX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PntpZighKHR5cGVvZiB2YWx1ZT09InN0cmluZyIpKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHtuYW1lfWApO312YXIgbGVuZ3RoPWxlbmd0aEJ5dGVzVVRGKHZhbHVlKTt2YXIgcHRyPV9tYWxsb2MoNCtsZW5ndGgrY2hhclNpemUpO0hFQVBVMzJbcHRyPj4yXT1sZW5ndGg+PnNoaWZ0O2VuY29kZVN0cmluZyh2YWx1ZSxwdHIrNCxsZW5ndGgrY2hhclNpemUpO2lmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaChfZnJlZSxwdHIpO31yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpO319KTt9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl92b2lkPShyYXdUeXBlLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtpc1ZvaWQ6dHJ1ZSxuYW1lOm5hbWUsImFyZ1BhY2tBZHZhbmNlIjowLCJmcm9tV2lyZVR5cGUiOigpPT51bmRlZmluZWQsInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyxvKT0+dW5kZWZpbmVkfSk7fTt2YXIgZ2V0SGVhcE1heD0oKT0+MjE0NzQ4MzY0ODt2YXIgZ3Jvd01lbW9yeT1zaXplPT57dmFyIGI9d2FzbU1lbW9yeS5idWZmZXI7dmFyIHBhZ2VzPShzaXplLWIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e3dhc21NZW1vcnkuZ3JvdyhwYWdlcyk7dXBkYXRlTWVtb3J5Vmlld3MoKTtyZXR1cm4gMX1jYXRjaChlKXt9fTt2YXIgX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXA9cmVxdWVzdGVkU2l6ZT0+e3ZhciBvbGRTaXplPUhFQVBVOC5sZW5ndGg7cmVxdWVzdGVkU2l6ZT4+Pj0wO3ZhciBtYXhIZWFwU2l6ZT1nZXRIZWFwTWF4KCk7aWYocmVxdWVzdGVkU2l6ZT5tYXhIZWFwU2l6ZSl7cmV0dXJuIGZhbHNlfXZhciBhbGlnblVwPSh4LG11bHRpcGxlKT0+eCsobXVsdGlwbGUteCVtdWx0aXBsZSklbXVsdGlwbGU7Zm9yKHZhciBjdXREb3duPTE7Y3V0RG93bjw9NDtjdXREb3duKj0yKXt2YXIgb3Zlckdyb3duSGVhcFNpemU9b2xkU2l6ZSooMSsuMi9jdXREb3duKTtvdmVyR3Jvd25IZWFwU2l6ZT1NYXRoLm1pbihvdmVyR3Jvd25IZWFwU2l6ZSxyZXF1ZXN0ZWRTaXplKzEwMDY2MzI5Nik7dmFyIG5ld1NpemU9TWF0aC5taW4obWF4SGVhcFNpemUsYWxpZ25VcChNYXRoLm1heChyZXF1ZXN0ZWRTaXplLG92ZXJHcm93bkhlYXBTaXplKSw2NTUzNikpO3ZhciByZXBsYWNlbWVudD1ncm93TWVtb3J5KG5ld1NpemUpO2lmKHJlcGxhY2VtZW50KXtyZXR1cm4gdHJ1ZX19cmV0dXJuIGZhbHNlfTtlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKTtCaW5kaW5nRXJyb3I9TW9kdWxlWyJCaW5kaW5nRXJyb3IiXT1jbGFzcyBCaW5kaW5nRXJyb3IgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihtZXNzYWdlKXtzdXBlcihtZXNzYWdlKTt0aGlzLm5hbWU9IkJpbmRpbmdFcnJvciI7fX07TW9kdWxlWyJJbnRlcm5hbEVycm9yIl09Y2xhc3MgSW50ZXJuYWxFcnJvciBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKG1lc3NhZ2Upe3N1cGVyKG1lc3NhZ2UpO3RoaXMubmFtZT0iSW50ZXJuYWxFcnJvciI7fX07aGFuZGxlQWxsb2NhdG9ySW5pdCgpO2luaXRfZW12YWwoKTt2YXIgd2FzbUltcG9ydHM9e2Y6X19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50LGk6X19lbWJpbmRfcmVnaXN0ZXJfYm9vbCxoOl9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsLGU6X19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQsYjpfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyLGE6X19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcsZDpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nLGM6X19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcsajpfX2VtYmluZF9yZWdpc3Rlcl92b2lkLGc6X2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXB9O3ZhciB3YXNtRXhwb3J0cz1jcmVhdGVXYXNtKCk7TW9kdWxlWyJfcGFjayJdPShhMCxhMSxhMixhMyxhNCxhNSxhNixhNyxhOCxhOSxhMTApPT4oTW9kdWxlWyJfcGFjayJdPXdhc21FeHBvcnRzWyJtIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCk7dmFyIF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09YTA9PihfbWFsbG9jPU1vZHVsZVsiX21hbGxvYyJdPXdhc21FeHBvcnRzWyJvIl0pKGEwKTt2YXIgX2ZyZWU9TW9kdWxlWyJfZnJlZSJdPWEwPT4oX2ZyZWU9TW9kdWxlWyJfZnJlZSJdPXdhc21FeHBvcnRzWyJwIl0pKGEwKTt2YXIgY2FsbGVkUnVuO2RlcGVuZGVuY2llc0Z1bGZpbGxlZD1mdW5jdGlvbiBydW5DYWxsZXIoKXtpZighY2FsbGVkUnVuKXJ1bigpO2lmKCFjYWxsZWRSdW4pZGVwZW5kZW5jaWVzRnVsZmlsbGVkPXJ1bkNhbGxlcjt9O2Z1bmN0aW9uIHJ1bigpe2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59cHJlUnVuKCk7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1mdW5jdGlvbiBkb1J1bigpe2lmKGNhbGxlZFJ1bilyZXR1cm47Y2FsbGVkUnVuPXRydWU7TW9kdWxlWyJjYWxsZWRSdW4iXT10cnVlO2lmKEFCT1JUKXJldHVybjtpbml0UnVudGltZSgpO3JlYWR5UHJvbWlzZVJlc29sdmUoTW9kdWxlKTtpZihNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0pTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKCk7cG9zdFJ1bigpO31pZihNb2R1bGVbInNldFN0YXR1cyJdKXtNb2R1bGVbInNldFN0YXR1cyJdKCJSdW5uaW5nLi4uIik7c2V0VGltZW91dChmdW5jdGlvbigpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtNb2R1bGVbInNldFN0YXR1cyJdKCIiKTt9LDEpO2RvUnVuKCk7fSwxKTt9ZWxzZSB7ZG9SdW4oKTt9fWlmKE1vZHVsZVsicHJlSW5pdCJdKXtpZih0eXBlb2YgTW9kdWxlWyJwcmVJbml0Il09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVJbml0Il09W01vZHVsZVsicHJlSW5pdCJdXTt3aGlsZShNb2R1bGVbInByZUluaXQiXS5sZW5ndGg+MCl7TW9kdWxlWyJwcmVJbml0Il0ucG9wKCkoKTt9fXJ1bigpOwoKCiAgICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5CiAgfQogICk7CiAgfSkoKTsKCiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkKICBsZXQgd2FzbU1vZHVsZTsKICBhc3luYyBmdW5jdGlvbiBpbml0V2FzbSgpIHsKICAgICAgd2FzbU1vZHVsZSA9IGF3YWl0IGxvYWRXYXNtKCk7CiAgfQogIGxldCBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCA9IDA7CiAgY29uc3QgdXBkYXRlUXVldWUgPSBuZXcgQXJyYXkoKTsKICBsZXQgcnVubmluZyA9IGZhbHNlOwogIGxldCBsb2FkaW5nID0gZmFsc2U7CiAgbGV0IHBvc2l0aW9uc1B0cjsKICBsZXQgcm90YXRpb25zUHRyOwogIGxldCBzY2FsZXNQdHI7CiAgbGV0IGNvbG9yc1B0cjsKICBsZXQgc2VsZWN0aW9uUHRyOwogIGxldCBkYXRhUHRyOwogIGxldCB3b3JsZFBvc2l0aW9uc1B0cjsKICBsZXQgd29ybGRSb3RhdGlvbnNQdHI7CiAgbGV0IHdvcmxkU2NhbGVzUHRyOwogIGNvbnN0IHBhY2sgPSBhc3luYyAoc3BsYXQpID0+IHsKICAgICAgd2hpbGUgKGxvYWRpbmcpIHsKICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDApKTsKICAgICAgfQogICAgICBpZiAoIXdhc21Nb2R1bGUpIHsKICAgICAgICAgIGxvYWRpbmcgPSB0cnVlOwogICAgICAgICAgYXdhaXQgaW5pdFdhc20oKTsKICAgICAgICAgIGxvYWRpbmcgPSBmYWxzZTsKICAgICAgfQogICAgICBjb25zdCB0YXJnZXRBbGxvY2F0ZWRWZXJ0ZXhDb3VudCA9IE1hdGgucG93KDIsIE1hdGguY2VpbChNYXRoLmxvZzIoc3BsYXQudmVydGV4Q291bnQpKSk7CiAgICAgIGlmICh0YXJnZXRBbGxvY2F0ZWRWZXJ0ZXhDb3VudCA+IGFsbG9jYXRlZFZlcnRleENvdW50KSB7CiAgICAgICAgICBpZiAoYWxsb2NhdGVkVmVydGV4Q291bnQgPiAwKSB7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShwb3NpdGlvbnNQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUocm90YXRpb25zUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKHNjYWxlc1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShjb2xvcnNQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUoc2VsZWN0aW9uUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKGRhdGFQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUod29ybGRQb3NpdGlvbnNQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUod29ybGRSb3RhdGlvbnNQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUod29ybGRTY2FsZXNQdHIpOwogICAgICAgICAgfQogICAgICAgICAgYWxsb2NhdGVkVmVydGV4Q291bnQgPSB0YXJnZXRBbGxvY2F0ZWRWZXJ0ZXhDb3VudDsKICAgICAgICAgIHBvc2l0aW9uc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYygzICogYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIHJvdGF0aW9uc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyg0ICogYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIHNjYWxlc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYygzICogYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIGNvbG9yc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyg0ICogYWxsb2NhdGVkVmVydGV4Q291bnQpOwogICAgICAgICAgc2VsZWN0aW9uUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKGFsbG9jYXRlZFZlcnRleENvdW50KTsKICAgICAgICAgIGRhdGFQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoOCAqIGFsbG9jYXRlZFZlcnRleENvdW50ICogNCk7CiAgICAgICAgICB3b3JsZFBvc2l0aW9uc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYygzICogYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIHdvcmxkUm90YXRpb25zUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKDQgKiBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgd29ybGRTY2FsZXNQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoMyAqIGFsbG9jYXRlZFZlcnRleENvdW50ICogNCk7CiAgICAgIH0KICAgICAgd2FzbU1vZHVsZS5IRUFQRjMyLnNldChzcGxhdC5wb3NpdGlvbnMsIHBvc2l0aW9uc1B0ciAvIDQpOwogICAgICB3YXNtTW9kdWxlLkhFQVBGMzIuc2V0KHNwbGF0LnJvdGF0aW9ucywgcm90YXRpb25zUHRyIC8gNCk7CiAgICAgIHdhc21Nb2R1bGUuSEVBUEYzMi5zZXQoc3BsYXQuc2NhbGVzLCBzY2FsZXNQdHIgLyA0KTsKICAgICAgd2FzbU1vZHVsZS5IRUFQVTguc2V0KHNwbGF0LmNvbG9ycywgY29sb3JzUHRyKTsKICAgICAgd2FzbU1vZHVsZS5IRUFQVTguc2V0KHNwbGF0LnNlbGVjdGlvbiwgc2VsZWN0aW9uUHRyKTsKICAgICAgd2FzbU1vZHVsZS5fcGFjayhzcGxhdC5zZWxlY3RlZCwgc3BsYXQudmVydGV4Q291bnQsIHBvc2l0aW9uc1B0ciwgcm90YXRpb25zUHRyLCBzY2FsZXNQdHIsIGNvbG9yc1B0ciwgc2VsZWN0aW9uUHRyLCBkYXRhUHRyLCB3b3JsZFBvc2l0aW9uc1B0ciwgd29ybGRSb3RhdGlvbnNQdHIsIHdvcmxkU2NhbGVzUHRyKTsKICAgICAgY29uc3Qgb3V0RGF0YSA9IG5ldyBVaW50MzJBcnJheSh3YXNtTW9kdWxlLkhFQVBVMzIuYnVmZmVyLCBkYXRhUHRyLCBzcGxhdC52ZXJ0ZXhDb3VudCAqIDgpOwogICAgICBjb25zdCBkZXRhY2hlZERhdGEgPSBuZXcgVWludDMyQXJyYXkob3V0RGF0YS5zbGljZSgpLmJ1ZmZlcik7CiAgICAgIGNvbnN0IHdvcmxkUG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSh3YXNtTW9kdWxlLkhFQVBGMzIuYnVmZmVyLCB3b3JsZFBvc2l0aW9uc1B0ciwgc3BsYXQudmVydGV4Q291bnQgKiAzKTsKICAgICAgY29uc3QgZGV0YWNoZWRXb3JsZFBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkod29ybGRQb3NpdGlvbnMuc2xpY2UoKS5idWZmZXIpOwogICAgICBjb25zdCB3b3JsZFJvdGF0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkod2FzbU1vZHVsZS5IRUFQRjMyLmJ1ZmZlciwgd29ybGRSb3RhdGlvbnNQdHIsIHNwbGF0LnZlcnRleENvdW50ICogNCk7CiAgICAgIGNvbnN0IGRldGFjaGVkV29ybGRSb3RhdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHdvcmxkUm90YXRpb25zLnNsaWNlKCkuYnVmZmVyKTsKICAgICAgY29uc3Qgd29ybGRTY2FsZXMgPSBuZXcgRmxvYXQzMkFycmF5KHdhc21Nb2R1bGUuSEVBUEYzMi5idWZmZXIsIHdvcmxkU2NhbGVzUHRyLCBzcGxhdC52ZXJ0ZXhDb3VudCAqIDMpOwogICAgICBjb25zdCBkZXRhY2hlZFdvcmxkU2NhbGVzID0gbmV3IEZsb2F0MzJBcnJheSh3b3JsZFNjYWxlcy5zbGljZSgpLmJ1ZmZlcik7CiAgICAgIGNvbnN0IHJlc3BvbnNlID0gewogICAgICAgICAgZGF0YTogZGV0YWNoZWREYXRhLAogICAgICAgICAgd29ybGRQb3NpdGlvbnM6IGRldGFjaGVkV29ybGRQb3NpdGlvbnMsCiAgICAgICAgICB3b3JsZFJvdGF0aW9uczogZGV0YWNoZWRXb3JsZFJvdGF0aW9ucywKICAgICAgICAgIHdvcmxkU2NhbGVzOiBkZXRhY2hlZFdvcmxkU2NhbGVzLAogICAgICAgICAgb2Zmc2V0OiBzcGxhdC5vZmZzZXQsCiAgICAgICAgICB2ZXJ0ZXhDb3VudDogc3BsYXQudmVydGV4Q291bnQsCiAgICAgICAgICBwb3NpdGlvbnM6IHNwbGF0LnBvc2l0aW9ucy5idWZmZXIsCiAgICAgICAgICByb3RhdGlvbnM6IHNwbGF0LnJvdGF0aW9ucy5idWZmZXIsCiAgICAgICAgICBzY2FsZXM6IHNwbGF0LnNjYWxlcy5idWZmZXIsCiAgICAgICAgICBjb2xvcnM6IHNwbGF0LmNvbG9ycy5idWZmZXIsCiAgICAgICAgICBzZWxlY3Rpb246IHNwbGF0LnNlbGVjdGlvbi5idWZmZXIsCiAgICAgIH07CiAgICAgIHNlbGYucG9zdE1lc3NhZ2UoeyByZXNwb25zZTogcmVzcG9uc2UgfSwgWwogICAgICAgICAgcmVzcG9uc2UuZGF0YS5idWZmZXIsCiAgICAgICAgICByZXNwb25zZS53b3JsZFBvc2l0aW9ucy5idWZmZXIsCiAgICAgICAgICByZXNwb25zZS53b3JsZFJvdGF0aW9ucy5idWZmZXIsCiAgICAgICAgICByZXNwb25zZS53b3JsZFNjYWxlcy5idWZmZXIsCiAgICAgICAgICByZXNwb25zZS5wb3NpdGlvbnMsCiAgICAgICAgICByZXNwb25zZS5yb3RhdGlvbnMsCiAgICAgICAgICByZXNwb25zZS5zY2FsZXMsCiAgICAgICAgICByZXNwb25zZS5jb2xvcnMsCiAgICAgICAgICByZXNwb25zZS5zZWxlY3Rpb24sCiAgICAgIF0pOwogICAgICBydW5uaW5nID0gZmFsc2U7CiAgfTsKICBjb25zdCBwYWNrVGhyb3R0bGVkID0gKCkgPT4gewogICAgICBpZiAodXBkYXRlUXVldWUubGVuZ3RoID09PSAwKQogICAgICAgICAgcmV0dXJuOwogICAgICBpZiAoIXJ1bm5pbmcpIHsKICAgICAgICAgIHJ1bm5pbmcgPSB0cnVlOwogICAgICAgICAgY29uc3Qgc3BsYXQgPSB1cGRhdGVRdWV1ZS5zaGlmdCgpOwogICAgICAgICAgcGFjayhzcGxhdCk7CiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7CiAgICAgICAgICAgICAgcGFja1Rocm90dGxlZCgpOwogICAgICAgICAgfSwgMCk7CiAgICAgIH0KICB9OwogIHNlbGYub25tZXNzYWdlID0gKGUpID0+IHsKICAgICAgaWYgKGUuZGF0YS5zcGxhdCkgewogICAgICAgICAgY29uc3Qgc3BsYXQgPSBlLmRhdGEuc3BsYXQ7CiAgICAgICAgICBmb3IgKGNvbnN0IFtpbmRleCwgZXhpc3RpbmddIG9mIHVwZGF0ZVF1ZXVlLmVudHJpZXMoKSkgewogICAgICAgICAgICAgIGlmIChleGlzdGluZy5vZmZzZXQgPT09IHNwbGF0Lm9mZnNldCkgewogICAgICAgICAgICAgICAgICB1cGRhdGVRdWV1ZVtpbmRleF0gPSBzcGxhdDsKICAgICAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICAgIH0KICAgICAgICAgIH0KICAgICAgICAgIHVwZGF0ZVF1ZXVlLnB1c2goc3BsYXQpOwogICAgICAgICAgcGFja1Rocm90dGxlZCgpOwogICAgICB9CiAgfTsKCn0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPURhdGFXb3JrZXIuanMubWFwCgo=", null, !1), Go = function(t = {}) {
  var e, n, l = t;
  l.ready = new Promise((B, Z) => {
    e = B, n = Z;
  });
  var i, s = Object.assign({}, l), a = "";
  a = (a = self.location.href).indexOf("blob:") !== 0 ? a.substr(0, a.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "", i = (B) => {
    var Z = new XMLHttpRequest();
    return Z.open("GET", B, !1), Z.responseType = "arraybuffer", Z.send(null), new Uint8Array(Z.response);
  }, l.print || console.log.bind(console);
  var r, d, o = l.printErr || console.error.bind(console);
  function c(B) {
    if (Y(B))
      return function(Z) {
        for (var f = atob(Z), b = new Uint8Array(f.length), E = 0; E < f.length; ++E)
          b[E] = f.charCodeAt(E);
        return b;
      }(B.slice(ae.length));
  }
  Object.assign(l, s), s = null, l.arguments && l.arguments, l.thisProgram && l.thisProgram, l.quit && l.quit, l.wasmBinary && (r = l.wasmBinary), typeof WebAssembly != "object" && J("no native wasm support detected");
  var U, F, h, u, R, V, I, W, m = !1;
  function A() {
    var B = d.buffer;
    l.HEAP8 = U = new Int8Array(B), l.HEAP16 = h = new Int16Array(B), l.HEAPU8 = F = new Uint8Array(B), l.HEAPU16 = u = new Uint16Array(B), l.HEAP32 = R = new Int32Array(B), l.HEAPU32 = V = new Uint32Array(B), l.HEAPF32 = I = new Float32Array(B), l.HEAPF64 = W = new Float64Array(B);
  }
  var p = [], z = [], H = [], k = 0, N = null;
  function J(B) {
    var f;
    (f = l.onAbort) == null || f.call(l, B), o(B = "Aborted(" + B + ")"), m = !0, B += ". Build with -sASSERTIONS for more info.";
    var Z = new WebAssembly.RuntimeError(B);
    throw n(Z), Z;
  }
  var S, me, ae = "data:application/octet-stream;base64,", Y = (B) => B.startsWith(ae);
  function v(B) {
    return Promise.resolve().then(() => function(Z) {
      if (Z == S && r)
        return new Uint8Array(r);
      var f = c(Z);
      if (f)
        return f;
      if (i)
        return i(Z);
      throw "both async and sync fetching of the wasm failed";
    }(B));
  }
  function Q(B, Z, f, b) {
    return function(E, G, _) {
      return v(E).then((D) => WebAssembly.instantiate(D, G)).then((D) => D).then(_, (D) => {
        o(`failed to asynchronously prepare wasm: ${D}`), J(D);
      });
    }(Z, f, b);
  }
  Y(S = "data:application/octet-stream;base64,AGFzbQEAAAABZw9gBH9/f38AYAN/f38AYAV/f39/fwBgBn9/f39/fwBgAn9/AGABfwF/YAN/f38Bf2ABfwBgAABgB39/f39/f38AYAJ9fQF/YAR/f35+AGABfQF/YAt/f39/f39/f39/fwBgAn9/AX8CPQoBYQFhAAEBYQFiAAIBYQFjAAEBYQFkAAQBYQFlAAEBYQFmAAkBYQFnAAUBYQFoAAQBYQFpAAABYQFqAAQDGxoGBQoHCAcECAsBAAEHDAUNAwMCAgAADgYGBQQFAXABEBAFBwEBgAKAgAIGCAF/AUHAngQLBxkGAWsCAAFsAA4BbQAZAW4BAAFvABgBcAAPCRUBAEEBCw8RIw0WFiINIRocHw0bHR4K6VAacQEBfyACRQRAIAAoAgQgASgCBEYPCyAAIAFGBEBBAQ8LAkAgACgCBCICLQAAIgBFIAAgASgCBCIBLQAAIgNHcg0AA0AgAS0AASEDIAItAAEiAEUNASABQQFqIQEgAkEBaiECIAAgA0YNAAsLIAAgA0YLTwECf0G4GigCACIBIABBB2pBeHEiAmohAAJAIAJBACAAIAFNG0UEQCAAPwBBEHRNDQEgABAGDQELQcgaQTA2AgBBfw8LQbgaIAA2AgAgAQsOACAAEBcgARAXQRB0cgsGACAAEA8LKQBBwBpBATYCAEHEGkEANgIAEBFBxBpBvBooAgA2AgBBvBpBwBo2AgAL0gsBB38CQCAARQ0AIABBCGsiAiAAQQRrKAIAIgFBeHEiAGohBQJAIAFBAXENACABQQJxRQ0BIAIgAigCACIBayICQdwaKAIASQ0BIAAgAWohAAJAAkBB4BooAgAgAkcEQCABQf8BTQRAIAFBA3YhBCACKAIMIgEgAigCCCIDRgRAQcwaQcwaKAIAQX4gBHdxNgIADAULIAMgATYCDCABIAM2AggMBAsgAigCGCEGIAIgAigCDCIBRwRAIAIoAggiAyABNgIMIAEgAzYCCAwDCyACQRRqIgQoAgAiA0UEQCACKAIQIgNFDQIgAkEQaiEECwNAIAQhByADIgFBFGoiBCgCACIDDQAgAUEQaiEEIAEoAhAiAw0ACyAHQQA2AgAMAgsgBSgCBCIBQQNxQQNHDQJB1BogADYCACAFIAFBfnE2AgQgAiAAQQFyNgIEIAUgADYCAA8LQQAhAQsgBkUNAAJAIAIoAhwiA0ECdEH8HGoiBCgCACACRgRAIAQgATYCACABDQFB0BpB0BooAgBBfiADd3E2AgAMAgsgBkEQQRQgBigCECACRhtqIAE2AgAgAUUNAQsgASAGNgIYIAIoAhAiAwRAIAEgAzYCECADIAE2AhgLIAIoAhQiA0UNACABIAM2AhQgAyABNgIYCyACIAVPDQAgBSgCBCIBQQFxRQ0AAkACQAJAAkAgAUECcUUEQEHkGigCACAFRgRAQeQaIAI2AgBB2BpB2BooAgAgAGoiADYCACACIABBAXI2AgQgAkHgGigCAEcNBkHUGkEANgIAQeAaQQA2AgAPC0HgGigCACAFRgRAQeAaIAI2AgBB1BpB1BooAgAgAGoiADYCACACIABBAXI2AgQgACACaiAANgIADwsgAUF4cSAAaiEAIAFB/wFNBEAgAUEDdiEEIAUoAgwiASAFKAIIIgNGBEBBzBpBzBooAgBBfiAEd3E2AgAMBQsgAyABNgIMIAEgAzYCCAwECyAFKAIYIQYgBSAFKAIMIgFHBEBB3BooAgAaIAUoAggiAyABNgIMIAEgAzYCCAwDCyAFQRRqIgQoAgAiA0UEQCAFKAIQIgNFDQIgBUEQaiEECwNAIAQhByADIgFBFGoiBCgCACIDDQAgAUEQaiEEIAEoAhAiAw0ACyAHQQA2AgAMAgsgBSABQX5xNgIEIAIgAEEBcjYCBCAAIAJqIAA2AgAMAwtBACEBCyAGRQ0AAkAgBSgCHCIDQQJ0QfwcaiIEKAIAIAVGBEAgBCABNgIAIAENAUHQGkHQGigCAEF+IAN3cTYCAAwCCyAGQRBBFCAGKAIQIAVGG2ogATYCACABRQ0BCyABIAY2AhggBSgCECIDBEAgASADNgIQIAMgATYCGAsgBSgCFCIDRQ0AIAEgAzYCFCADIAE2AhgLIAIgAEEBcjYCBCAAIAJqIAA2AgAgAkHgGigCAEcNAEHUGiAANgIADwsgAEH/AU0EQCAAQXhxQfQaaiEBAn9BzBooAgAiA0EBIABBA3Z0IgBxRQRAQcwaIAAgA3I2AgAgAQwBCyABKAIICyEAIAEgAjYCCCAAIAI2AgwgAiABNgIMIAIgADYCCA8LQR8hAyAAQf///wdNBEAgAEEmIABBCHZnIgFrdkEBcSABQQF0a0E+aiEDCyACIAM2AhwgAkIANwIQIANBAnRB/BxqIQECQAJAAkBB0BooAgAiBEEBIAN0IgdxRQRAQdAaIAQgB3I2AgAgASACNgIAIAIgATYCGAwBCyAAQRkgA0EBdmtBACADQR9HG3QhAyABKAIAIQEDQCABIgQoAgRBeHEgAEYNAiADQR12IQEgA0EBdCEDIAQgAUEEcWoiB0EQaigCACIBDQALIAcgAjYCECACIAQ2AhgLIAIgAjYCDCACIAI2AggMAQsgBCgCCCIAIAI2AgwgBCACNgIIIAJBADYCGCACIAQ2AgwgAiAANgIIC0HsGkHsGigCAEEBayIAQX8gABs2AgALCyEAIAEEQANAIABBADoAACAAQQFqIQAgAUEBayIBDQALCwvhAwBB7BdBmgkQCUH4F0G5CEEBQQAQCEGEGEG0CEEBQYB/Qf8AEAFBnBhBrQhBAUGAf0H/ABABQZAYQasIQQFBAEH/ARABQagYQYkIQQJBgIB+Qf//ARABQbQYQYAIQQJBAEH//wMQAUHAGEGYCEEEQYCAgIB4Qf////8HEAFBzBhBjwhBBEEAQX8QAUHYGEHXCEEEQYCAgIB4Qf////8HEAFB5BhBzghBBEEAQX8QAUHwGEGjCEKAgICAgICAgIB/Qv///////////wAQEkH8GEGiCEIAQn8QEkGIGUGcCEEEEARBlBlBkwlBCBAEQYQPQekIEANBzA9Blw0QA0GUEEEEQdwIEAJB4BBBAkH1CBACQawRQQRBhAkQAkHIEUG+CBAHQfARQQBB0gwQAEGYEkEAQbgNEABBwBJBAUHwDBAAQegSQQJBnwkQAEGQE0EDQb4JEABBuBNBBEHmCRAAQeATQQVBgwoQAEGIFEEEQd0NEABBsBRBBUH7DRAAQZgSQQBB6QoQAEHAEkEBQcgKEABB6BJBAkGrCxAAQZATQQNBiQsQAEG4E0EEQbEMEABB4BNBBUGPDBAAQdgUQQhB7gsQAEGAFUEJQcwLEABBqBVBBkGpChAAQdAVQQdBog4QAAscACAAIAFBCCACpyACQiCIpyADpyADQiCIpxAFCyAAAkAgACgCBCABRw0AIAAoAhxBAUYNACAAIAI2AhwLC5oBACAAQQE6ADUCQCAAKAIEIAJHDQAgAEEBOgA0AkAgACgCECICRQRAIABBATYCJCAAIAM2AhggACABNgIQIANBAUcNAiAAKAIwQQFGDQEMAgsgASACRgRAIAAoAhgiAkECRgRAIAAgAzYCGCADIQILIAAoAjBBAUcNAiACQQFGDQEMAgsgACAAKAIkQQFqNgIkCyAAQQE6ADYLC10BAX8gACgCECIDRQRAIABBATYCJCAAIAI2AhggACABNgIQDwsCQCABIANGBEAgACgCGEECRw0BIAAgAjYCGA8LIABBAToANiAAQQI2AhggACAAKAIkQQFqNgIkCwsCAAt3AQR/IAC8IgRB////A3EhAQJAIARBF3ZB/wFxIgJFDQAgAkHwAE0EQCABQYCAgARyQfEAIAJrdiEBDAELIAJBjQFLBEBBgPgBIQNBACEBDAELIAJBCnRBgIAHayEDCyADIARBEHZBgIACcXIgAUENdnJB//8DcQvGJwEMfyMAQRBrIgokAAJAAkACQAJAAkACQAJAAkACQCAAQfQBTQRAQcwaKAIAIgZBECAAQQtqQfgDcSAAQQtJGyIFQQN2IgB2IgFBA3EEQAJAIAFBf3NBAXEgAGoiAkEDdCIBQfQaaiIAIAFB/BpqKAIAIgEoAggiA0YEQEHMGiAGQX4gAndxNgIADAELIAMgADYCDCAAIAM2AggLIAFBCGohACABIAJBA3QiAkEDcjYCBCABIAJqIgEgASgCBEEBcjYCBAwKCyAFQdQaKAIAIgdNDQEgAQRAAkBBAiAAdCICQQAgAmtyIAEgAHRxaCIBQQN0IgBB9BpqIgIgAEH8GmooAgAiACgCCCIDRgRAQcwaIAZBfiABd3EiBjYCAAwBCyADIAI2AgwgAiADNgIICyAAIAVBA3I2AgQgACAFaiIEIAFBA3QiASAFayIDQQFyNgIEIAAgAWogAzYCACAHBEAgB0F4cUH0GmohAUHgGigCACECAn8gBkEBIAdBA3Z0IgVxRQRAQcwaIAUgBnI2AgAgAQwBCyABKAIICyEFIAEgAjYCCCAFIAI2AgwgAiABNgIMIAIgBTYCCAsgAEEIaiEAQeAaIAQ2AgBB1BogAzYCAAwKC0HQGigCACILRQ0BIAtoQQJ0QfwcaigCACICKAIEQXhxIAVrIQQgAiEBA0ACQCABKAIQIgBFBEAgASgCFCIARQ0BCyAAKAIEQXhxIAVrIgEgBCABIARJIgEbIQQgACACIAEbIQIgACEBDAELCyACKAIYIQkgAiACKAIMIgNHBEBB3BooAgAaIAIoAggiACADNgIMIAMgADYCCAwJCyACQRRqIgEoAgAiAEUEQCACKAIQIgBFDQMgAkEQaiEBCwNAIAEhCCAAIgNBFGoiASgCACIADQAgA0EQaiEBIAMoAhAiAA0ACyAIQQA2AgAMCAtBfyEFIABBv39LDQAgAEELaiIAQXhxIQVB0BooAgAiCEUNAEEAIAVrIQQCQAJAAkACf0EAIAVBgAJJDQAaQR8gBUH///8HSw0AGiAFQSYgAEEIdmciAGt2QQFxIABBAXRrQT5qCyIHQQJ0QfwcaigCACIBRQRAQQAhAAwBC0EAIQAgBUEZIAdBAXZrQQAgB0EfRxt0IQIDQAJAIAEoAgRBeHEgBWsiBiAETw0AIAEhAyAGIgQNAEEAIQQgASEADAMLIAAgASgCFCIGIAYgASACQR12QQRxaigCECIBRhsgACAGGyEAIAJBAXQhAiABDQALCyAAIANyRQRAQQAhA0ECIAd0IgBBACAAa3IgCHEiAEUNAyAAaEECdEH8HGooAgAhAAsgAEUNAQsDQCAAKAIEQXhxIAVrIgIgBEkhASACIAQgARshBCAAIAMgARshAyAAKAIQIgEEfyABBSAAKAIUCyIADQALCyADRQ0AIARB1BooAgAgBWtPDQAgAygCGCEHIAMgAygCDCICRwRAQdwaKAIAGiADKAIIIgAgAjYCDCACIAA2AggMBwsgA0EUaiIBKAIAIgBFBEAgAygCECIARQ0DIANBEGohAQsDQCABIQYgACICQRRqIgEoAgAiAA0AIAJBEGohASACKAIQIgANAAsgBkEANgIADAYLIAVB1BooAgAiA00EQEHgGigCACEAAkAgAyAFayIBQRBPBEAgACAFaiICIAFBAXI2AgQgACADaiABNgIAIAAgBUEDcjYCBAwBCyAAIANBA3I2AgQgACADaiIBIAEoAgRBAXI2AgRBACECQQAhAQtB1BogATYCAEHgGiACNgIAIABBCGohAAwICyAFQdgaKAIAIgJJBEBB2BogAiAFayIBNgIAQeQaQeQaKAIAIgAgBWoiAjYCACACIAFBAXI2AgQgACAFQQNyNgIEIABBCGohAAwIC0EAIQAgBUEvaiIEAn9BpB4oAgAEQEGsHigCAAwBC0GwHkJ/NwIAQageQoCggICAgAQ3AgBBpB4gCkEMakFwcUHYqtWqBXM2AgBBuB5BADYCAEGIHkEANgIAQYAgCyIBaiIGQQAgAWsiCHEiASAFTQ0HQYQeKAIAIgMEQEH8HSgCACIHIAFqIgkgB00gAyAJSXINCAsCQEGIHi0AAEEEcUUEQAJAAkACQAJAQeQaKAIAIgMEQEGMHiEAA0AgAyAAKAIAIgdPBEAgByAAKAIEaiADSw0DCyAAKAIIIgANAAsLQQAQCyICQX9GDQMgASEGQageKAIAIgBBAWsiAyACcQRAIAEgAmsgAiADakEAIABrcWohBgsgBSAGTw0DQYQeKAIAIgAEQEH8HSgCACIDIAZqIgggA00gACAISXINBAsgBhALIgAgAkcNAQwFCyAGIAJrIAhxIgYQCyICIAAoAgAgACgCBGpGDQEgAiEACyAAQX9GDQEgBUEwaiAGTQRAIAAhAgwEC0GsHigCACICIAQgBmtqQQAgAmtxIgIQC0F/Rg0BIAIgBmohBiAAIQIMAwsgAkF/Rw0CC0GIHkGIHigCAEEEcjYCAAsgARALIgJBf0ZBABALIgBBf0ZyIAAgAk1yDQUgACACayIGIAVBKGpNDQULQfwdQfwdKAIAIAZqIgA2AgBBgB4oAgAgAEkEQEGAHiAANgIACwJAQeQaKAIAIgQEQEGMHiEAA0AgAiAAKAIAIgEgACgCBCIDakYNAiAAKAIIIgANAAsMBAtB3BooAgAiAEEAIAAgAk0bRQRAQdwaIAI2AgALQQAhAEGQHiAGNgIAQYweIAI2AgBB7BpBfzYCAEHwGkGkHigCADYCAEGYHkEANgIAA0AgAEEDdCIBQfwaaiABQfQaaiIDNgIAIAFBgBtqIAM2AgAgAEEBaiIAQSBHDQALQdgaIAZBKGsiAEF4IAJrQQdxIgFrIgM2AgBB5BogASACaiIBNgIAIAEgA0EBcjYCBCAAIAJqQSg2AgRB6BpBtB4oAgA2AgAMBAsgAiAETSABIARLcg0CIAAoAgxBCHENAiAAIAMgBmo2AgRB5BogBEF4IARrQQdxIgBqIgE2AgBB2BpB2BooAgAgBmoiAiAAayIANgIAIAEgAEEBcjYCBCACIARqQSg2AgRB6BpBtB4oAgA2AgAMAwtBACEDDAULQQAhAgwDC0HcGigCACACSwRAQdwaIAI2AgALIAIgBmohAUGMHiEAAkACQAJAA0AgASAAKAIARwRAIAAoAggiAA0BDAILCyAALQAMQQhxRQ0BC0GMHiEAA0ACQCAEIAAoAgAiAU8EQCABIAAoAgRqIgMgBEsNAQsgACgCCCEADAELC0HYGiAGQShrIgBBeCACa0EHcSIBayIINgIAQeQaIAEgAmoiATYCACABIAhBAXI2AgQgACACakEoNgIEQegaQbQeKAIANgIAIAQgA0EnIANrQQdxakEvayIAIAAgBEEQakkbIgFBGzYCBCABQZQeKQIANwIQIAFBjB4pAgA3AghBlB4gAUEIajYCAEGQHiAGNgIAQYweIAI2AgBBmB5BADYCACABQRhqIQADQCAAQQc2AgQgAEEIaiEMIABBBGohACAMIANJDQALIAEgBEYNAiABIAEoAgRBfnE2AgQgBCABIARrIgJBAXI2AgQgASACNgIAIAJB/wFNBEAgAkF4cUH0GmohAAJ/QcwaKAIAIgFBASACQQN2dCICcUUEQEHMGiABIAJyNgIAIAAMAQsgACgCCAshASAAIAQ2AgggASAENgIMIAQgADYCDCAEIAE2AggMAwtBHyEAIAJB////B00EQCACQSYgAkEIdmciAGt2QQFxIABBAXRrQT5qIQALIAQgADYCHCAEQgA3AhAgAEECdEH8HGohAQJAQdAaKAIAIgNBASAAdCIGcUUEQEHQGiADIAZyNgIAIAEgBDYCAAwBCyACQRkgAEEBdmtBACAAQR9HG3QhACABKAIAIQMDQCADIgEoAgRBeHEgAkYNAyAAQR12IQMgAEEBdCEAIAEgA0EEcWoiBigCECIDDQALIAYgBDYCEAsgBCABNgIYIAQgBDYCDCAEIAQ2AggMAgsgACACNgIAIAAgACgCBCAGajYCBCACQXggAmtBB3FqIgcgBUEDcjYCBCABQXggAWtBB3FqIgQgBSAHaiIFayEGAkBB5BooAgAgBEYEQEHkGiAFNgIAQdgaQdgaKAIAIAZqIgA2AgAgBSAAQQFyNgIEDAELQeAaKAIAIARGBEBB4BogBTYCAEHUGkHUGigCACAGaiIANgIAIAUgAEEBcjYCBCAAIAVqIAA2AgAMAQsgBCgCBCICQQNxQQFGBEAgAkF4cSEJAkAgAkH/AU0EQCAEKAIMIgAgBCgCCCIBRgRAQcwaQcwaKAIAQX4gAkEDdndxNgIADAILIAEgADYCDCAAIAE2AggMAQsgBCgCGCEIAkAgBCAEKAIMIgBHBEBB3BooAgAaIAQoAggiASAANgIMIAAgATYCCAwBCwJAIARBFGoiASgCACICRQRAIAQoAhAiAkUNASAEQRBqIQELA0AgASEDIAIiAEEUaiIBKAIAIgINACAAQRBqIQEgACgCECICDQALIANBADYCAAwBC0EAIQALIAhFDQACQCAEKAIcIgFBAnRB/BxqIgIoAgAgBEYEQCACIAA2AgAgAA0BQdAaQdAaKAIAQX4gAXdxNgIADAILIAhBEEEUIAgoAhAgBEYbaiAANgIAIABFDQELIAAgCDYCGCAEKAIQIgEEQCAAIAE2AhAgASAANgIYCyAEKAIUIgFFDQAgACABNgIUIAEgADYCGAsgBiAJaiEGIAQgCWoiBCgCBCECCyAEIAJBfnE2AgQgBSAGQQFyNgIEIAUgBmogBjYCACAGQf8BTQRAIAZBeHFB9BpqIQACf0HMGigCACIBQQEgBkEDdnQiAnFFBEBBzBogASACcjYCACAADAELIAAoAggLIQEgACAFNgIIIAEgBTYCDCAFIAA2AgwgBSABNgIIDAELQR8hAiAGQf///wdNBEAgBkEmIAZBCHZnIgBrdkEBcSAAQQF0a0E+aiECCyAFIAI2AhwgBUIANwIQIAJBAnRB/BxqIQECQAJAQdAaKAIAIgBBASACdCIDcUUEQEHQGiAAIANyNgIAIAEgBTYCAAwBCyAGQRkgAkEBdmtBACACQR9HG3QhAiABKAIAIQADQCAAIgEoAgRBeHEgBkYNAiACQR12IQAgAkEBdCECIAEgAEEEcWoiAygCECIADQALIAMgBTYCEAsgBSABNgIYIAUgBTYCDCAFIAU2AggMAQsgASgCCCIAIAU2AgwgASAFNgIIIAVBADYCGCAFIAE2AgwgBSAANgIICyAHQQhqIQAMBQsgASgCCCIAIAQ2AgwgASAENgIIIARBADYCGCAEIAE2AgwgBCAANgIIC0HYGigCACIAIAVNDQBB2BogACAFayIBNgIAQeQaQeQaKAIAIgAgBWoiAjYCACACIAFBAXI2AgQgACAFQQNyNgIEIABBCGohAAwDC0HIGkEwNgIAQQAhAAwCCwJAIAdFDQACQCADKAIcIgBBAnRB/BxqIgEoAgAgA0YEQCABIAI2AgAgAg0BQdAaIAhBfiAAd3EiCDYCAAwCCyAHQRBBFCAHKAIQIANGG2ogAjYCACACRQ0BCyACIAc2AhggAygCECIABEAgAiAANgIQIAAgAjYCGAsgAygCFCIARQ0AIAIgADYCFCAAIAI2AhgLAkAgBEEPTQRAIAMgBCAFaiIAQQNyNgIEIAAgA2oiACAAKAIEQQFyNgIEDAELIAMgBUEDcjYCBCADIAVqIgIgBEEBcjYCBCACIARqIAQ2AgAgBEH/AU0EQCAEQXhxQfQaaiEAAn9BzBooAgAiAUEBIARBA3Z0IgVxRQRAQcwaIAEgBXI2AgAgAAwBCyAAKAIICyEBIAAgAjYCCCABIAI2AgwgAiAANgIMIAIgATYCCAwBC0EfIQAgBEH///8HTQRAIARBJiAEQQh2ZyIAa3ZBAXEgAEEBdGtBPmohAAsgAiAANgIcIAJCADcCECAAQQJ0QfwcaiEBAkACQCAIQQEgAHQiBXFFBEBB0BogBSAIcjYCACABIAI2AgAMAQsgBEEZIABBAXZrQQAgAEEfRxt0IQAgASgCACEFA0AgBSIBKAIEQXhxIARGDQIgAEEddiEFIABBAXQhACABIAVBBHFqIgYoAhAiBQ0ACyAGIAI2AhALIAIgATYCGCACIAI2AgwgAiACNgIIDAELIAEoAggiACACNgIMIAEgAjYCCCACQQA2AhggAiABNgIMIAIgADYCCAsgA0EIaiEADAELAkAgCUUNAAJAIAIoAhwiAEECdEH8HGoiASgCACACRgRAIAEgAzYCACADDQFB0BogC0F+IAB3cTYCAAwCCyAJQRBBFCAJKAIQIAJGG2ogAzYCACADRQ0BCyADIAk2AhggAigCECIABEAgAyAANgIQIAAgAzYCGAsgAigCFCIARQ0AIAMgADYCFCAAIAM2AhgLAkAgBEEPTQRAIAIgBCAFaiIAQQNyNgIEIAAgAmoiACAAKAIEQQFyNgIEDAELIAIgBUEDcjYCBCACIAVqIgMgBEEBcjYCBCADIARqIAQ2AgAgBwRAIAdBeHFB9BpqIQBB4BooAgAhAQJ/QQEgB0EDdnQiBSAGcUUEQEHMGiAFIAZyNgIAIAAMAQsgACgCCAshBSAAIAE2AgggBSABNgIMIAEgADYCDCABIAU2AggLQeAaIAM2AgBB1BogBDYCAAsgAkEIaiEACyAKQRBqJAAgAAu+CwILfwl9IwBBoAFrIgskACALQTBqQSQQEANAIAEgDUcEQCACIA1BA2wiDEECakECdCIOaioCACEXIAIgDEEBakECdCIPaioCACEYIAggDEECdCIQaiACIBBqKgIAIhk4AgAgCCAPaiAYOAIAIAggDmogFzgCACAHIA1BBXRqIgwgGDgCBCAMIBk4AgAgDCAXOAIIIAxBADYCDAJAIABFBEAgBiANai0AAEUNAQsgDEGAgIAINgIMCyAHIA1BBXQiEUEccmogBSANQQJ0IgxBAXIiEmotAABBCHQgBSAMai0AAHIgBSAMQQJyIhNqLQAAQRB0ciAFIAxBA3IiDGotAABBGHRyNgIAIAsgAyASQQJ0IhJqKgIAIhc4ApABIAsgAyATQQJ0IhNqKgIAIhg4ApQBIAsgAyAMQQJ0IhRqKgIAIhk4ApgBIAsgAyANQQR0IhVqKgIAjCIaOAKcASALQeAAaiIMIAsqApgBIhZDAAAAwJQgFpQgCyoClAEiFkMAAADAlCAWlEMAAIA/kpI4AgAgDCALKgKQASIWIBaSIAsqApQBlCALKgKYAUMAAADAlCALKgKcAZSSOAIEIAwgCyoCkAEiFiAWkiALKgKYAZQgCyoClAEiFiAWkiALKgKcAZSSOAIIIAwgCyoCkAEiFiAWkiALKgKUAZQgCyoCmAEiFiAWkiALKgKcAZSSOAIMIAwgCyoCmAEiFkMAAADAlCAWlCALKgKQASIWQwAAAMCUIBaUQwAAgD+SkjgCECAMIAsqApQBIhYgFpIgCyoCmAGUIAsqApABQwAAAMCUIAsqApwBlJI4AhQgDCALKgKQASIWIBaSIAsqApgBlCALKgKUAUMAAADAlCALKgKcAZSSOAIYIAwgCyoClAEiFiAWkiALKgKYAZQgCyoCkAEiFiAWkiALKgKcAZSSOAIcIAwgCyoClAEiFkMAAADAlCAWlCALKgKQASIWQwAAAMCUIBaUQwAAgD+SkjgCICAJIBVqIBc4AgAgCSASaiAYOAIAIAkgE2ogGTgCACAJIBRqIBo4AgAgCyAEIBBqKgIAIhc4AjAgCyAEIA9qKgIAIhg4AkAgCyAEIA5qKgIAIhk4AlAgCiAQaiAXOAIAIAogD2ogGDgCACAKIA5qIBk4AgAgCyAMKgIYIAsqAjiUIAwqAgAgCyoCMJQgDCoCDCALKgI0lJKSOAIAIAsgDCoCHCALKgI4lCAMKgIEIAsqAjCUIAwqAhAgCyoCNJSSkjgCBCALIAwqAiAgCyoCOJQgDCoCCCALKgIwlCAMKgIUIAsqAjSUkpI4AgggCyAMKgIYIAsqAkSUIAwqAgAgCyoCPJQgDCoCDCALKgJAlJKSOAIMIAsgDCoCHCALKgJElCAMKgIEIAsqAjyUIAwqAhAgCyoCQJSSkjgCECALIAwqAiAgCyoCRJQgDCoCCCALKgI8lCAMKgIUIAsqAkCUkpI4AhQgCyAMKgIYIAsqAlCUIAwqAgAgCyoCSJQgDCoCDCALKgJMlJKSOAIYIAsgDCoCHCALKgJQlCAMKgIEIAsqAkiUIAwqAhAgCyoCTJSSkjgCHCALIAwqAiAgCyoCUJQgDCoCCCALKgJIlCAMKgIUIAsqAkyUkpI4AiAgCyoCICEXIAsqAgghGCALKgIUIRkgByARQRByaiALKgIYIhogGpQgCyoCACIWIBaUIAsqAgwiGyAblJKSQwAAgECUIBogCyoCHCIclCAWIAsqAgQiHZQgGyALKgIQIh6UkpJDAACAQJQQDDYCACAHIBFBFHJqIBogF5QgFiAYlCAbIBmUkpJDAACAQJQgHCAclCAdIB2UIB4gHpSSkkMAAIBAlBAMNgIAIAcgEUEYcmogHCAXlCAdIBiUIB4gGZSSkkMAAIBAlCAXIBeUIBggGJQgGSAZlJKSQwAAgECUEAw2AgAgDUEBaiENDAELCyALQaABaiQACxoAIAAgASgCCCAFEAoEQCABIAIgAyAEEBQLCzcAIAAgASgCCCAFEAoEQCABIAIgAyAEEBQPCyAAKAIIIgAgASACIAMgBCAFIAAoAgAoAhQRAwALkQEAIAAgASgCCCAEEAoEQCABIAIgAxATDwsCQCAAIAEoAgAgBBAKRQ0AAkAgAiABKAIQRwRAIAEoAhQgAkcNAQsgA0EBRw0BIAFBATYCIA8LIAEgAjYCFCABIAM2AiAgASABKAIoQQFqNgIoAkAgASgCJEEBRw0AIAEoAhhBAkcNACABQQE6ADYLIAFBBDYCLAsL8gEAIAAgASgCCCAEEAoEQCABIAIgAxATDwsCQCAAIAEoAgAgBBAKBEACQCACIAEoAhBHBEAgASgCFCACRw0BCyADQQFHDQIgAUEBNgIgDwsgASADNgIgAkAgASgCLEEERg0AIAFBADsBNCAAKAIIIgAgASACIAJBASAEIAAoAgAoAhQRAwAgAS0ANQRAIAFBAzYCLCABLQA0RQ0BDAMLIAFBBDYCLAsgASACNgIUIAEgASgCKEEBajYCKCABKAIkQQFHDQEgASgCGEECRw0BIAFBAToANg8LIAAoAggiACABIAIgAyAEIAAoAgAoAhgRAgALCzEAIAAgASgCCEEAEAoEQCABIAIgAxAVDwsgACgCCCIAIAEgAiADIAAoAgAoAhwRAAALGAAgACABKAIIQQAQCgRAIAEgAiADEBULC4ADAQR/IwBB8ABrIgIkACAAKAIAIgNBBGsoAgAhBCADQQhrKAIAIQUgAkIANwJQIAJCADcCWCACQgA3AmAgAkIANwBnIAJCADcCSCACQQA2AkQgAkH8FTYCQCACIAA2AjwgAiABNgI4IAAgBWohAwJAIAQgAUEAEAoEQEEAIAMgBRshAAwBCyAAIANOBEAgAkIANwAvIAJCADcCGCACQgA3AiAgAkIANwIoIAJCADcCECACQQA2AgwgAiABNgIIIAIgADYCBCACIAQ2AgAgAkEBNgIwIAQgAiADIANBAUEAIAQoAgAoAhQRAwAgAigCGA0BC0EAIQAgBCACQThqIANBAUEAIAQoAgAoAhgRAgACQAJAIAIoAlwOAgABAgsgAigCTEEAIAIoAlhBAUYbQQAgAigCVEEBRhtBACACKAJgQQFGGyEADAELIAIoAlBBAUcEQCACKAJgDQEgAigCVEEBRw0BIAIoAlhBAUcNAQsgAigCSCEACyACQfAAaiQAIAALmQEBAn8jAEFAaiIDJAACf0EBIAAgAUEAEAoNABpBACABRQ0AGkEAIAFBrBYQICIBRQ0AGiADQQxqQTQQECADQQE2AjggA0F/NgIUIAMgADYCECADIAE2AgggASADQQhqIAIoAgBBASABKAIAKAIcEQAAIAMoAiAiAEEBRgRAIAIgAygCGDYCAAsgAEEBRgshBCADQUBrJAAgBAsKACAAIAFBABAKCwQAIAALC8cSAgBBgAgLthJ1bnNpZ25lZCBzaG9ydAB1bnNpZ25lZCBpbnQAZmxvYXQAdWludDY0X3QAdW5zaWduZWQgY2hhcgBib29sAGVtc2NyaXB0ZW46OnZhbAB1bnNpZ25lZCBsb25nAHN0ZDo6d3N0cmluZwBzdGQ6OnN0cmluZwBzdGQ6OnUxNnN0cmluZwBzdGQ6OnUzMnN0cmluZwBkb3VibGUAdm9pZABlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRQAAAACkDAAAQgcAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0loTlNfMTFjaGFyX3RyYWl0c0loRUVOU185YWxsb2NhdG9ySWhFRUVFAACkDAAAjAcAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAACkDAAA1AcAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEc05TXzExY2hhcl90cmFpdHNJRHNFRU5TXzlhbGxvY2F0b3JJRHNFRUVFAAAApAwAABwIAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRGlOU18xMWNoYXJfdHJhaXRzSURpRUVOU185YWxsb2NhdG9ySURpRUVFRQAAAKQMAABoCAAATjEwZW1zY3JpcHRlbjN2YWxFAACkDAAAtAgAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWNFRQAApAwAANAIAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lhRUUAAKQMAAD4CAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaEVFAACkDAAAIAkAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXNFRQAApAwAAEgJAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l0RUUAAKQMAABwCQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaUVFAACkDAAAmAkAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWpFRQAApAwAAMAJAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lsRUUAAKQMAADoCQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbUVFAACkDAAAEAoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXhFRQAApAwAADgKAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l5RUUAAKQMAABgCgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZkVFAACkDAAAiAoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWRFRQAApAwAALAKAABOMTBfX2N4eGFiaXYxMTZfX3NoaW1fdHlwZV9pbmZvRQAAAADMDAAA2AoAADANAABOMTBfX2N4eGFiaXYxMTdfX2NsYXNzX3R5cGVfaW5mb0UAAADMDAAACAsAAPwKAABOMTBfX2N4eGFiaXYxMTdfX3BiYXNlX3R5cGVfaW5mb0UAAADMDAAAOAsAAPwKAABOMTBfX2N4eGFiaXYxMTlfX3BvaW50ZXJfdHlwZV9pbmZvRQDMDAAAaAsAAFwLAAAAAAAA3AsAAAIAAAADAAAABAAAAAUAAAAGAAAATjEwX19jeHhhYml2MTIzX19mdW5kYW1lbnRhbF90eXBlX2luZm9FAMwMAAC0CwAA/AoAAHYAAACgCwAA6AsAAGIAAACgCwAA9AsAAGMAAACgCwAAAAwAAGgAAACgCwAADAwAAGEAAACgCwAAGAwAAHMAAACgCwAAJAwAAHQAAACgCwAAMAwAAGkAAACgCwAAPAwAAGoAAACgCwAASAwAAGwAAACgCwAAVAwAAG0AAACgCwAAYAwAAHgAAACgCwAAbAwAAHkAAACgCwAAeAwAAGYAAACgCwAAhAwAAGQAAACgCwAAkAwAAAAAAAAsCwAAAgAAAAcAAAAEAAAABQAAAAgAAAAJAAAACgAAAAsAAAAAAAAAFA0AAAIAAAAMAAAABAAAAAUAAAAIAAAADQAAAA4AAAAPAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAMwMAADsDAAALAsAAFN0OXR5cGVfaW5mbwAAAACkDAAAIA0AQbgaCwNADwE=") || (me = S, S = l.locateFile ? l.locateFile(me, a) : a + me);
  var g = (B) => {
    for (; B.length > 0; )
      B.shift()(l);
  };
  l.noExitRuntime;
  var X, y, K = (B) => {
    for (var Z = "", f = B; F[f]; )
      Z += X[F[f++]];
    return Z;
  }, de = {}, T = {}, C = (B) => {
    throw new y(B);
  };
  function $(B, Z, f = {}) {
    if (!("argPackAdvance" in Z))
      throw new TypeError("registerType registeredInstance requires argPackAdvance");
    return function(b, E, G = {}) {
      var _ = E.name;
      if (b || C(`type "${_}" must have a positive integer typeid pointer`), T.hasOwnProperty(b)) {
        if (G.ignoreDuplicateRegistrations)
          return;
        C(`Cannot register type '${_}' twice`);
      }
      if (T[b] = E, de.hasOwnProperty(b)) {
        var D = de[b];
        delete de[b], D.forEach((w) => w());
      }
    }(B, Z, f);
  }
  function se() {
    this.allocated = [void 0], this.freelist = [];
  }
  var re = new se(), Ye = () => {
    for (var B = 0, Z = re.reserved; Z < re.allocated.length; ++Z)
      re.allocated[Z] !== void 0 && ++B;
    return B;
  }, oe = (B) => (B || C("Cannot use deleted val. handle = " + B), re.get(B).value), wt = (B) => {
    switch (B) {
      case void 0:
        return 1;
      case null:
        return 2;
      case !0:
        return 3;
      case !1:
        return 4;
      default:
        return re.allocate({ refcount: 1, value: B });
    }
  };
  function ot(B) {
    return this.fromWireType(R[B >> 2]);
  }
  var vt = (B, Z) => {
    switch (Z) {
      case 4:
        return function(f) {
          return this.fromWireType(I[f >> 2]);
        };
      case 8:
        return function(f) {
          return this.fromWireType(W[f >> 3]);
        };
      default:
        throw new TypeError(`invalid float width (${Z}): ${B}`);
    }
  }, Ht = (B, Z, f) => {
    switch (Z) {
      case 1:
        return f ? (b) => U[b >> 0] : (b) => F[b >> 0];
      case 2:
        return f ? (b) => h[b >> 1] : (b) => u[b >> 1];
      case 4:
        return f ? (b) => R[b >> 2] : (b) => V[b >> 2];
      default:
        throw new TypeError(`invalid integer width (${Z}): ${B}`);
    }
  };
  function he(B) {
    return this.fromWireType(V[B >> 2]);
  }
  var Re = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, le = (B, Z) => B ? ((f, b, E) => {
    for (var G = b + E, _ = b; f[_] && !(_ >= G); )
      ++_;
    if (_ - b > 16 && f.buffer && Re)
      return Re.decode(f.subarray(b, _));
    for (var D = ""; b < _; ) {
      var w = f[b++];
      if (128 & w) {
        var P = 63 & f[b++];
        if ((224 & w) != 192) {
          var Be = 63 & f[b++];
          if ((w = (240 & w) == 224 ? (15 & w) << 12 | P << 6 | Be : (7 & w) << 18 | P << 12 | Be << 6 | 63 & f[b++]) < 65536)
            D += String.fromCharCode(w);
          else {
            var Qe = w - 65536;
            D += String.fromCharCode(55296 | Qe >> 10, 56320 | 1023 & Qe);
          }
        } else
          D += String.fromCharCode((31 & w) << 6 | P);
      } else
        D += String.fromCharCode(w);
    }
    return D;
  })(F, B, Z) : "", ce = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, ze = (B, Z) => {
    for (var f = B, b = f >> 1, E = b + Z / 2; !(b >= E) && u[b]; )
      ++b;
    if ((f = b << 1) - B > 32 && ce)
      return ce.decode(F.subarray(B, f));
    for (var G = "", _ = 0; !(_ >= Z / 2); ++_) {
      var D = h[B + 2 * _ >> 1];
      if (D == 0)
        break;
      G += String.fromCharCode(D);
    }
    return G;
  }, fe = (B, Z, f) => {
    if (f ?? (f = 2147483647), f < 2)
      return 0;
    for (var b = Z, E = (f -= 2) < 2 * B.length ? f / 2 : B.length, G = 0; G < E; ++G) {
      var _ = B.charCodeAt(G);
      h[Z >> 1] = _, Z += 2;
    }
    return h[Z >> 1] = 0, Z - b;
  }, Fe = (B) => 2 * B.length, Ie = (B, Z) => {
    for (var f = 0, b = ""; !(f >= Z / 4); ) {
      var E = R[B + 4 * f >> 2];
      if (E == 0)
        break;
      if (++f, E >= 65536) {
        var G = E - 65536;
        b += String.fromCharCode(55296 | G >> 10, 56320 | 1023 & G);
      } else
        b += String.fromCharCode(E);
    }
    return b;
  }, El = (B, Z, f) => {
    if (f ?? (f = 2147483647), f < 4)
      return 0;
    for (var b = Z, E = b + f - 4, G = 0; G < B.length; ++G) {
      var _ = B.charCodeAt(G);
      if (_ >= 55296 && _ <= 57343 && (_ = 65536 + ((1023 & _) << 10) | 1023 & B.charCodeAt(++G)), R[Z >> 2] = _, (Z += 4) + 4 > E)
        break;
    }
    return R[Z >> 2] = 0, Z - b;
  }, gn = (B) => {
    for (var Z = 0, f = 0; f < B.length; ++f) {
      var b = B.charCodeAt(f);
      b >= 55296 && b <= 57343 && ++f, Z += 4;
    }
    return Z;
  }, $a = (B) => {
    var Z = (B - d.buffer.byteLength + 65535) / 65536;
    try {
      return d.grow(Z), A(), 1;
    } catch {
    }
  };
  (() => {
    for (var B = new Array(256), Z = 0; Z < 256; ++Z)
      B[Z] = String.fromCharCode(Z);
    X = B;
  })(), y = l.BindingError = class extends Error {
    constructor(B) {
      super(B), this.name = "BindingError";
    }
  }, l.InternalError = class extends Error {
    constructor(B) {
      super(B), this.name = "InternalError";
    }
  }, Object.assign(se.prototype, { get(B) {
    return this.allocated[B];
  }, has(B) {
    return this.allocated[B] !== void 0;
  }, allocate(B) {
    var Z = this.freelist.pop() || this.allocated.length;
    return this.allocated[Z] = B, Z;
  }, free(B) {
    this.allocated[B] = void 0, this.freelist.push(B);
  } }), re.allocated.push({ value: void 0 }, { value: null }, { value: !0 }, { value: !1 }), re.reserved = re.allocated.length, l.count_emval_handles = Ye;
  var es = { f: (B, Z, f, b, E) => {
  }, i: (B, Z, f, b) => {
    $(B, { name: Z = K(Z), fromWireType: function(E) {
      return !!E;
    }, toWireType: function(E, G) {
      return G ? f : b;
    }, argPackAdvance: 8, readValueFromPointer: function(E) {
      return this.fromWireType(F[E]);
    }, destructorFunction: null });
  }, h: (B, Z) => {
    $(B, { name: Z = K(Z), fromWireType: (f) => {
      var b = oe(f);
      return ((E) => {
        E >= re.reserved && --re.get(E).refcount == 0 && re.free(E);
      })(f), b;
    }, toWireType: (f, b) => wt(b), argPackAdvance: 8, readValueFromPointer: ot, destructorFunction: null });
  }, e: (B, Z, f) => {
    $(B, { name: Z = K(Z), fromWireType: (b) => b, toWireType: (b, E) => E, argPackAdvance: 8, readValueFromPointer: vt(Z, f), destructorFunction: null });
  }, b: (B, Z, f, b, E) => {
    Z = K(Z);
    var G = (w) => w;
    if (b === 0) {
      var _ = 32 - 8 * f;
      G = (w) => w << _ >>> _;
    }
    var D = Z.includes("unsigned");
    $(B, { name: Z, fromWireType: G, toWireType: D ? function(w, P) {
      return this.name, P >>> 0;
    } : function(w, P) {
      return this.name, P;
    }, argPackAdvance: 8, readValueFromPointer: Ht(Z, f, b !== 0), destructorFunction: null });
  }, a: (B, Z, f) => {
    var b = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][Z];
    function E(G) {
      var _ = V[G >> 2], D = V[G + 4 >> 2];
      return new b(U.buffer, D, _);
    }
    $(B, { name: f = K(f), fromWireType: E, argPackAdvance: 8, readValueFromPointer: E }, { ignoreDuplicateRegistrations: !0 });
  }, d: (B, Z) => {
    var f = (Z = K(Z)) === "std::string";
    $(B, { name: Z, fromWireType(b) {
      var E, G = V[b >> 2], _ = b + 4;
      if (f)
        for (var D = _, w = 0; w <= G; ++w) {
          var P = _ + w;
          if (w == G || F[P] == 0) {
            var Be = le(D, P - D);
            E === void 0 ? E = Be : (E += String.fromCharCode(0), E += Be), D = P + 1;
          }
        }
      else {
        var Qe = new Array(G);
        for (w = 0; w < G; ++w)
          Qe[w] = String.fromCharCode(F[_ + w]);
        E = Qe.join("");
      }
      return $e(b), E;
    }, toWireType(b, E) {
      var G;
      E instanceof ArrayBuffer && (E = new Uint8Array(E));
      var _ = typeof E == "string";
      _ || E instanceof Uint8Array || E instanceof Uint8ClampedArray || E instanceof Int8Array || C("Cannot pass non-string to std::string"), G = f && _ ? ((Qe) => {
        for (var Ue = 0, te = 0; te < Qe.length; ++te) {
          var Te = Qe.charCodeAt(te);
          Te <= 127 ? Ue++ : Te <= 2047 ? Ue += 2 : Te >= 55296 && Te <= 57343 ? (Ue += 4, ++te) : Ue += 3;
        }
        return Ue;
      })(E) : E.length;
      var D = Wn(4 + G + 1), w = D + 4;
      if (V[D >> 2] = G, f && _)
        ((Qe, Ue, te, Te) => {
          if (!(Te > 0))
            return 0;
          for (var ct = te + Te - 1, en = 0; en < Qe.length; ++en) {
            var ue = Qe.charCodeAt(en);
            if (ue >= 55296 && ue <= 57343 && (ue = 65536 + ((1023 & ue) << 10) | 1023 & Qe.charCodeAt(++en)), ue <= 127) {
              if (te >= ct)
                break;
              Ue[te++] = ue;
            } else if (ue <= 2047) {
              if (te + 1 >= ct)
                break;
              Ue[te++] = 192 | ue >> 6, Ue[te++] = 128 | 63 & ue;
            } else if (ue <= 65535) {
              if (te + 2 >= ct)
                break;
              Ue[te++] = 224 | ue >> 12, Ue[te++] = 128 | ue >> 6 & 63, Ue[te++] = 128 | 63 & ue;
            } else {
              if (te + 3 >= ct)
                break;
              Ue[te++] = 240 | ue >> 18, Ue[te++] = 128 | ue >> 12 & 63, Ue[te++] = 128 | ue >> 6 & 63, Ue[te++] = 128 | 63 & ue;
            }
          }
          Ue[te] = 0;
        })(E, F, w, G + 1);
      else if (_)
        for (var P = 0; P < G; ++P) {
          var Be = E.charCodeAt(P);
          Be > 255 && ($e(w), C("String has UTF-16 code units that do not fit in 8 bits")), F[w + P] = Be;
        }
      else
        for (P = 0; P < G; ++P)
          F[w + P] = E[P];
      return b !== null && b.push($e, D), D;
    }, argPackAdvance: 8, readValueFromPointer: he, destructorFunction(b) {
      $e(b);
    } });
  }, c: (B, Z, f) => {
    var b, E, G, _, D;
    f = K(f), Z === 2 ? (b = ze, E = fe, _ = Fe, G = () => u, D = 1) : Z === 4 && (b = Ie, E = El, _ = gn, G = () => V, D = 2), $(B, { name: f, fromWireType: (w) => {
      for (var P, Be = V[w >> 2], Qe = G(), Ue = w + 4, te = 0; te <= Be; ++te) {
        var Te = w + 4 + te * Z;
        if (te == Be || Qe[Te >> D] == 0) {
          var ct = b(Ue, Te - Ue);
          P === void 0 ? P = ct : (P += String.fromCharCode(0), P += ct), Ue = Te + Z;
        }
      }
      return $e(w), P;
    }, toWireType: (w, P) => {
      typeof P != "string" && C(`Cannot pass non-string to C++ string type ${f}`);
      var Be = _(P), Qe = Wn(4 + Be + Z);
      return V[Qe >> 2] = Be >> D, E(P, Qe + 4, Be + Z), w !== null && w.push($e, Qe), Qe;
    }, argPackAdvance: 8, readValueFromPointer: ot, destructorFunction(w) {
      $e(w);
    } });
  }, j: (B, Z) => {
    $(B, { isVoid: !0, name: Z = K(Z), argPackAdvance: 0, fromWireType: () => {
    }, toWireType: (f, b) => {
    } });
  }, g: (B) => {
    var Z = F.length, f = 2147483648;
    if ((B >>>= 0) > f)
      return !1;
    for (var b, E, G = 1; G <= 4; G *= 2) {
      var _ = Z * (1 + 0.2 / G);
      _ = Math.min(_, B + 100663296);
      var D = Math.min(f, (b = Math.max(B, _)) + ((E = 65536) - b % E) % E);
      if ($a(D))
        return !0;
    }
    return !1;
  } }, dt = function() {
    var f;
    var B = { a: es };
    function Z(b, E) {
      var G;
      return dt = b.exports, d = dt.k, A(), G = dt.l, z.unshift(G), function(_) {
        var w;
        if (k--, (w = l.monitorRunDependencies) == null || w.call(l, k), k == 0 && N) {
          var D = N;
          N = null, D();
        }
      }(), dt;
    }
    if (k++, (f = l.monitorRunDependencies) == null || f.call(l, k), l.instantiateWasm)
      try {
        return l.instantiateWasm(B, Z);
      } catch (b) {
        o(`Module.instantiateWasm callback failed with error: ${b}`), n(b);
      }
    return Q(0, S, B, function(b) {
      Z(b.instance);
    }).catch(n), {};
  }();
  l._pack = (B, Z, f, b, E, G, _, D, w, P, Be) => (l._pack = dt.m)(B, Z, f, b, E, G, _, D, w, P, Be);
  var $t, Wn = l._malloc = (B) => (Wn = l._malloc = dt.o)(B), $e = l._free = (B) => ($e = l._free = dt.p)(B);
  function yl() {
    function B() {
      $t || ($t = !0, l.calledRun = !0, m || (g(z), e(l), l.onRuntimeInitialized && l.onRuntimeInitialized(), function() {
        if (l.postRun)
          for (typeof l.postRun == "function" && (l.postRun = [l.postRun]); l.postRun.length; )
            Z = l.postRun.shift(), H.unshift(Z);
        var Z;
        g(H);
      }()));
    }
    k > 0 || (function() {
      if (l.preRun)
        for (typeof l.preRun == "function" && (l.preRun = [l.preRun]); l.preRun.length; )
          Z = l.preRun.shift(), p.unshift(Z);
      var Z;
      g(p);
    }(), k > 0 || (l.setStatus ? (l.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        l.setStatus("");
      }, 1), B();
    }, 1)) : B()));
  }
  if (N = function B() {
    $t || yl(), $t || (N = B);
  }, l.preInit)
    for (typeof l.preInit == "function" && (l.preInit = [l.preInit]); l.preInit.length > 0; )
      l.preInit.pop()();
  return yl(), t.ready;
};
class So {
  constructor(e) {
    this.dataChanged = !1, this.transformsChanged = !1, this._updating = /* @__PURE__ */ new Set(), this._dirty = /* @__PURE__ */ new Set();
    let n = 0, l = 0;
    this._splatIndices = /* @__PURE__ */ new Map(), this._offsets = /* @__PURE__ */ new Map();
    const i = /* @__PURE__ */ new Map();
    for (const o of e.objects)
      o instanceof Ce && (this._splatIndices.set(o, l), this._offsets.set(o, n), i.set(n, o), n += o.data.vertexCount, l++);
    this._vertexCount = n, this._width = 2048, this._height = Math.ceil(2 * this.vertexCount / this.width), this._data = new Uint32Array(this.width * this.height * 4), this._transformsWidth = 5, this._transformsHeight = i.size, this._transforms = new Float32Array(this._transformsWidth * this._transformsHeight * 4), this._transformIndicesWidth = 1024, this._transformIndicesHeight = Math.ceil(this.vertexCount / this._transformIndicesWidth), this._transformIndices = new Uint32Array(this._transformIndicesWidth * this._transformIndicesHeight), this._positions = new Float32Array(3 * this.vertexCount), this._rotations = new Float32Array(4 * this.vertexCount), this._scales = new Float32Array(3 * this.vertexCount), this._worker = new yo();
    const s = (o) => {
      const c = this._splatIndices.get(o);
      this._transforms.set(o.transform.buffer, 20 * c), this._transforms[20 * c + 16] = o.selected ? 1 : 0, o.positionChanged = !1, o.rotationChanged = !1, o.scaleChanged = !1, o.selectedChanged = !1, this.transformsChanged = !0;
    };
    let a;
    this._worker.onmessage = (o) => {
      if (o.data.response) {
        const c = o.data.response, U = i.get(c.offset);
        s(U);
        const F = this._splatIndices.get(U);
        for (let h = 0; h < U.data.vertexCount; h++)
          this._transformIndices[c.offset + h] = F;
        this._data.set(c.data, 8 * c.offset), U.data.reattach(c.positions, c.rotations, c.scales, c.colors, c.selection), this._positions.set(c.worldPositions, 3 * c.offset), this._rotations.set(c.worldRotations, 4 * c.offset), this._scales.set(c.worldScales, 3 * c.offset), this._updating.delete(U), U.selectedChanged = !1, this.dataChanged = !0;
      }
    }, async function() {
      a = await Go();
    }();
    const r = (o) => {
      if (!a)
        return void async function() {
          for (; !a; )
            await new Promise((N) => setTimeout(N, 0));
        }().then(() => {
          r(o);
        });
      s(o);
      const c = a._malloc(3 * o.data.vertexCount * 4), U = a._malloc(4 * o.data.vertexCount * 4), F = a._malloc(3 * o.data.vertexCount * 4), h = a._malloc(4 * o.data.vertexCount), u = a._malloc(o.data.vertexCount), R = a._malloc(8 * o.data.vertexCount * 4), V = a._malloc(3 * o.data.vertexCount * 4), I = a._malloc(4 * o.data.vertexCount * 4), W = a._malloc(3 * o.data.vertexCount * 4);
      a.HEAPF32.set(o.data.positions, c / 4), a.HEAPF32.set(o.data.rotations, U / 4), a.HEAPF32.set(o.data.scales, F / 4), a.HEAPU8.set(o.data.colors, h), a.HEAPU8.set(o.data.selection, u), a._pack(o.selected, o.data.vertexCount, c, U, F, h, u, R, V, I, W);
      const m = new Uint32Array(a.HEAPU32.buffer, R, 8 * o.data.vertexCount), A = new Float32Array(a.HEAPF32.buffer, V, 3 * o.data.vertexCount), p = new Float32Array(a.HEAPF32.buffer, I, 4 * o.data.vertexCount), z = new Float32Array(a.HEAPF32.buffer, W, 3 * o.data.vertexCount), H = this._splatIndices.get(o), k = this._offsets.get(o);
      for (let N = 0; N < o.data.vertexCount; N++)
        this._transformIndices[k + N] = H;
      this._data.set(m, 8 * k), this._positions.set(A, 3 * k), this._rotations.set(p, 4 * k), this._scales.set(z, 3 * k), a._free(c), a._free(U), a._free(F), a._free(h), a._free(u), a._free(R), a._free(V), a._free(I), a._free(W), this.dataChanged = !0;
    }, d = (o) => {
      if ((o.positionChanged || o.rotationChanged || o.scaleChanged || o.selectedChanged) && s(o), !o.data.changed || o.data.detached)
        return;
      const c = { position: new Float32Array(o.position.flat()), rotation: new Float32Array(o.rotation.flat()), scale: new Float32Array(o.scale.flat()), selected: o.selected, vertexCount: o.data.vertexCount, positions: o.data.positions, rotations: o.data.rotations, scales: o.data.scales, colors: o.data.colors, selection: o.data.selection, offset: this._offsets.get(o) };
      this._worker.postMessage({ splat: c }, [c.position.buffer, c.rotation.buffer, c.scale.buffer, c.positions.buffer, c.rotations.buffer, c.scales.buffer, c.colors.buffer, c.selection.buffer]), this._updating.add(o), o.data.detached = !0;
    };
    this.getSplat = (o) => {
      let c = null;
      for (const [U, F] of this._offsets) {
        if (!(o >= F))
          break;
        c = U;
      }
      return c;
    }, this.getLocalIndex = (o, c) => c - this._offsets.get(o), this.markDirty = (o) => {
      this._dirty.add(o);
    }, this.rebuild = () => {
      for (const o of this._dirty)
        d(o);
      this._dirty.clear();
    }, this.dispose = () => {
      this._worker.terminate();
    };
    for (const o of this._splatIndices.keys())
      r(o);
  }
  get offsets() {
    return this._offsets;
  }
  get data() {
    return this._data;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get transforms() {
    return this._transforms;
  }
  get transformsWidth() {
    return this._transformsWidth;
  }
  get transformsHeight() {
    return this._transformsHeight;
  }
  get transformIndices() {
    return this._transformIndices;
  }
  get transformIndicesWidth() {
    return this._transformIndicesWidth;
  }
  get transformIndicesHeight() {
    return this._transformIndicesHeight;
  }
  get positions() {
    return this._positions;
  }
  get rotations() {
    return this._rotations;
  }
  get scales() {
    return this._scales;
  }
  get vertexCount() {
    return this._vertexCount;
  }
  get needsRebuild() {
    return this._dirty.size > 0;
  }
  get updating() {
    return this._updating.size > 0;
  }
}
class ra {
  constructor(e = 0, n = 0, l = 0, i = 255) {
    this.r = e, this.g = n, this.b = l, this.a = i;
  }
  flat() {
    return [this.r, this.g, this.b, this.a];
  }
  flatNorm() {
    return [this.r / 255, this.g / 255, this.b / 255, this.a / 255];
  }
  toHexString() {
    return "#" + this.flat().map((e) => e.toString(16).padStart(2, "0")).join("");
  }
  toString() {
    return `[${this.flat().join(", ")}]`;
  }
}
class oa extends Eo {
  constructor(e, n) {
    super(e, n), this._outlineThickness = 10, this._outlineColor = new ra(255, 165, 0, 255), this._renderData = null, this._depthIndex = null, this._chunks = null, this._splatTexture = null;
    const l = e.canvas, i = e.gl;
    let s, a, r, d, o, c, U, F, h, u, R, V, I, W, m, A;
    this._resize = () => {
      this._camera && (this._camera.data.setSize(l.width, l.height), this._camera.update(), a = i.getUniformLocation(this.program, "projection"), i.uniformMatrix4fv(a, !1, this._camera.data.projectionMatrix.buffer), r = i.getUniformLocation(this.program, "viewport"), i.uniform2fv(r, new Float32Array([l.width, l.height])));
    };
    const p = () => {
      s = new No(), s.onmessage = (N) => {
        if (N.data.depthIndex) {
          const { depthIndex: J, chunks: S } = N.data;
          this._depthIndex = J, this._chunks = S, i.bindBuffer(i.ARRAY_BUFFER, A), i.bufferData(i.ARRAY_BUFFER, J, i.STATIC_DRAW);
        }
      };
    };
    this._initialize = () => {
      if (this._scene && this._camera) {
        this._resize(), this._scene.addEventListener("objectAdded", z), this._scene.addEventListener("objectRemoved", H);
        for (const N of this._scene.objects)
          N instanceof Ce && N.addEventListener("objectChanged", k);
        this._renderData = new So(this._scene), d = i.getUniformLocation(this.program, "focal"), i.uniform2fv(d, new Float32Array([this._camera.data.fx, this._camera.data.fy])), o = i.getUniformLocation(this.program, "view"), i.uniformMatrix4fv(o, !1, this._camera.data.viewMatrix.buffer), h = i.getUniformLocation(this.program, "outlineThickness"), i.uniform1f(h, this.outlineThickness), u = i.getUniformLocation(this.program, "outlineColor"), i.uniform4fv(u, new Float32Array(this.outlineColor.flatNorm())), this._splatTexture = i.createTexture(), c = i.getUniformLocation(this.program, "u_texture"), i.uniform1i(c, 0), I = i.createTexture(), U = i.getUniformLocation(this.program, "u_transforms"), i.uniform1i(U, 1), W = i.createTexture(), F = i.getUniformLocation(this.program, "u_transformIndices"), i.uniform1i(F, 2), m = i.createBuffer(), i.bindBuffer(i.ARRAY_BUFFER, m), i.bufferData(i.ARRAY_BUFFER, new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]), i.STATIC_DRAW), R = i.getAttribLocation(this.program, "position"), i.enableVertexAttribArray(R), i.vertexAttribPointer(R, 2, i.FLOAT, !1, 0, 0), A = i.createBuffer(), V = i.getAttribLocation(this.program, "index"), i.enableVertexAttribArray(V), i.bindBuffer(i.ARRAY_BUFFER, A), p();
      } else
        console.error("Cannot render without scene and camera");
    };
    const z = (N) => {
      const J = N;
      J.object instanceof Ce && J.object.addEventListener("objectChanged", k), this.dispose();
    }, H = (N) => {
      const J = N;
      J.object instanceof Ce && J.object.removeEventListener("objectChanged", k), this.dispose();
    }, k = (N) => {
      const J = N;
      J.object instanceof Ce && this._renderData && this._renderData.markDirty(J.object);
    };
    this._render = () => {
      if (this._scene && this._camera && this.renderData) {
        if (this._camera.update(), s.postMessage({ viewProj: this._camera.data.viewProj }), this.renderData.needsRebuild && this.renderData.rebuild(), this.renderData.dataChanged || this.renderData.transformsChanged) {
          this.renderData.dataChanged && (i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, this.splatTexture), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA32UI, this.renderData.width, this.renderData.height, 0, i.RGBA_INTEGER, i.UNSIGNED_INT, this.renderData.data)), this.renderData.transformsChanged && (i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, I), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA32F, this.renderData.transformsWidth, this.renderData.transformsHeight, 0, i.RGBA, i.FLOAT, this.renderData.transforms), i.activeTexture(i.TEXTURE2), i.bindTexture(i.TEXTURE_2D, W), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.R32UI, this.renderData.transformIndicesWidth, this.renderData.transformIndicesHeight, 0, i.RED_INTEGER, i.UNSIGNED_INT, this.renderData.transformIndices));
          const N = new Float32Array(this.renderData.positions.slice().buffer), J = new Float32Array(this.renderData.transforms.slice().buffer), S = new Uint32Array(this.renderData.transformIndices.slice().buffer);
          s.postMessage({ sortData: { positions: N, transforms: J, transformIndices: S, vertexCount: this.renderData.vertexCount } }, [N.buffer, J.buffer, S.buffer]), this.renderData.dataChanged = !1, this.renderData.transformsChanged = !1;
        }
        i.viewport(0, 0, l.width, l.height), i.clearColor(0, 0, 0, 0), i.clear(i.COLOR_BUFFER_BIT), i.disable(i.DEPTH_TEST), i.enable(i.BLEND), i.blendFuncSeparate(i.ONE_MINUS_DST_ALPHA, i.ONE, i.ONE_MINUS_DST_ALPHA, i.ONE), i.blendEquationSeparate(i.FUNC_ADD, i.FUNC_ADD), i.uniformMatrix4fv(a, !1, this._camera.data.projectionMatrix.buffer), i.uniformMatrix4fv(o, !1, this._camera.data.viewMatrix.buffer), i.bindBuffer(i.ARRAY_BUFFER, m), i.vertexAttribPointer(R, 2, i.FLOAT, !1, 0, 0), i.bindBuffer(i.ARRAY_BUFFER, A), i.vertexAttribIPointer(V, 1, i.INT, 0, 0), i.vertexAttribDivisor(V, 1), i.drawArraysInstanced(i.TRIANGLE_FAN, 0, 4, this.renderData.vertexCount);
      } else
        console.error("Cannot render without scene and camera");
    }, this._dispose = () => {
      if (this._scene && this._camera && this.renderData) {
        this._scene.removeEventListener("objectAdded", z), this._scene.removeEventListener("objectRemoved", H);
        for (const N of this._scene.objects)
          N instanceof Ce && N.removeEventListener("objectChanged", k);
        s.terminate(), this.renderData.dispose(), i.deleteTexture(this.splatTexture), i.deleteTexture(I), i.deleteTexture(W), i.deleteBuffer(A), i.deleteBuffer(m);
      } else
        console.error("Cannot dispose without scene and camera");
    }, this._setOutlineThickness = (N) => {
      this._outlineThickness = N, this._initialized && i.uniform1f(h, N);
    }, this._setOutlineColor = (N) => {
      this._outlineColor = N, this._initialized && i.uniform4fv(u, new Float32Array(N.flatNorm()));
    };
  }
  get renderData() {
    return this._renderData;
  }
  get depthIndex() {
    return this._depthIndex;
  }
  get chunks() {
    return this._chunks;
  }
  get splatTexture() {
    return this._splatTexture;
  }
  get outlineThickness() {
    return this._outlineThickness;
  }
  set outlineThickness(e) {
    this._setOutlineThickness(e);
  }
  get outlineColor() {
    return this._outlineColor;
  }
  set outlineColor(e) {
    this._setOutlineColor(e);
  }
  _getVertexSource() {
    return `#version 300 es
precision highp float;
precision highp int;

uniform highp usampler2D u_texture;
uniform highp sampler2D u_transforms;
uniform highp usampler2D u_transformIndices;
uniform mat4 projection, view;
uniform vec2 focal;
uniform vec2 viewport;

uniform bool useDepthFade;
uniform float depthFade;

in vec2 position;
in int index;

out vec4 vColor;
out vec2 vPosition;
out float vSize;
out float vSelected;

void main () {
    uvec4 cen = texelFetch(u_texture, ivec2((uint(index) & 0x3ffu) << 1, uint(index) >> 10), 0);
    float selected = float((cen.w >> 24) & 0xffu);

    uint transformIndex = texelFetch(u_transformIndices, ivec2(uint(index) & 0x3ffu, uint(index) >> 10), 0).x;
    mat4 transform = mat4(
        texelFetch(u_transforms, ivec2(0, transformIndex), 0),
        texelFetch(u_transforms, ivec2(1, transformIndex), 0),
        texelFetch(u_transforms, ivec2(2, transformIndex), 0),
        texelFetch(u_transforms, ivec2(3, transformIndex), 0)
    );

    if (selected < 0.5) {
        selected = texelFetch(u_transforms, ivec2(4, transformIndex), 0).x;
    }

    mat4 viewTransform = view * transform;

    vec4 cam = viewTransform * vec4(uintBitsToFloat(cen.xyz), 1);
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

    mat3 T = transpose(mat3(viewTransform)) * J;
    mat3 cov2d = transpose(T) * Vrk * T;

    float mid = (cov2d[0][0] + cov2d[1][1]) / 2.0;
    float radius = length(vec2((cov2d[0][0] - cov2d[1][1]) / 2.0, cov2d[0][1]));
    float lambda1 = mid + radius, lambda2 = mid - radius;

    if (lambda2 < 0.0) return;
    vec2 diagonalVector = normalize(vec2(cov2d[0][1], lambda1 - cov2d[0][0]));
    vec2 majorAxis = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector;
    vec2 minorAxis = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);

    vColor = vec4((cov.w) & 0xffu, (cov.w >> 8) & 0xffu, (cov.w >> 16) & 0xffu, (cov.w >> 24) & 0xffu) / 255.0;
    vPosition = position;
    vSize = length(majorAxis);
    vSelected = selected;

    float scalingFactor = 1.0;

    if (useDepthFade) {
        float depthNorm = (pos2d.z / pos2d.w + 1.0) / 2.0;
        float near = 0.1; float far = 100.0;
        float normalizedDepth = (2.0 * near) / (far + near - depthNorm * (far - near));
        float start = max(normalizedDepth - 0.1, 0.0);
        float end = min(normalizedDepth + 0.1, 1.0);
        scalingFactor = clamp((depthFade - start) / (end - start), 0.0, 1.0);
    }

    vec2 vCenter = vec2(pos2d) / pos2d.w;
    gl_Position = vec4(
        vCenter 
        + position.x * majorAxis * scalingFactor / viewport
        + position.y * minorAxis * scalingFactor / viewport, 0.0, 1.0);
}
`;
  }
  _getFragmentSource() {
    return `#version 300 es
precision highp float;

uniform float outlineThickness;
uniform vec4 outlineColor;

in vec4 vColor;
in vec2 vPosition;
in float vSize;
in float vSelected;

out vec4 fragColor;

void main () {
    float A = -dot(vPosition, vPosition);

    if (A < -4.0) discard;

    if (vSelected < 0.5) {
        float B = exp(A) * vColor.a;
        fragColor = vec4(B * vColor.rgb, B);
        return;
    }

    float outlineThreshold = -4.0 + (outlineThickness / vSize);

    if (A < outlineThreshold) {
        fragColor = outlineColor;
    } 
    else {
        float B = exp(A) * vColor.a;
        fragColor = vec4(B * vColor.rgb, B);
    }
}
`;
  }
}
class Xo {
  constructor(e = 1) {
    let n, l, i, s, a = 0, r = !1;
    this.initialize = (d) => {
      if (!(d instanceof oa))
        throw new Error("FadeInPass requires a RenderProgram");
      a = d.started ? 1 : 0, r = !0, n = d, l = d.renderer.gl, i = l.getUniformLocation(n.program, "useDepthFade"), l.uniform1i(i, 1), s = l.getUniformLocation(n.program, "depthFade"), l.uniform1f(s, a);
    }, this.render = () => {
      var d;
      r && !(!((d = n.renderData) === null || d === void 0) && d.updating) && (l.useProgram(n.program), a = Math.min(a + 0.01 * e, 1), a >= 1 && (r = !1, l.uniform1i(i, 0)), l.uniform1f(s, a));
    };
  }
  dispose() {
  }
}
class da {
  constructor(e = null, n = null) {
    this._backgroundColor = new ra();
    const l = e || document.createElement("canvas");
    e || (l.style.display = "block", l.style.boxSizing = "border-box", l.style.width = "100%", l.style.height = "100%", l.style.margin = "0", l.style.padding = "0", document.body.appendChild(l)), l.style.background = this._backgroundColor.toHexString(), this._canvas = l, this._gl = l.getContext("webgl2", { antialias: !1 });
    const i = n || [];
    n || i.push(new Xo()), this._renderProgram = new oa(this, i);
    const s = [this._renderProgram];
    this.resize = () => {
      const a = l.clientWidth, r = l.clientHeight;
      l.width === a && l.height === r || this.setSize(a, r);
    }, this.setSize = (a, r) => {
      l.width = a, l.height = r, this._gl.viewport(0, 0, l.width, l.height);
      for (const d of s)
        d.resize();
    }, this.render = (a, r) => {
      for (const d of s)
        d.render(a, r);
    }, this.dispose = () => {
      for (const a of s)
        a.dispose();
    }, this.addProgram = (a) => {
      s.push(a);
    }, this.removeProgram = (a) => {
      const r = s.indexOf(a);
      if (r < 0)
        throw new Error("Program not found");
      s.splice(r, 1);
    }, this.resize();
  }
  get canvas() {
    return this._canvas;
  }
  get gl() {
    return this._gl;
  }
  get renderProgram() {
    return this._renderProgram;
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(e) {
    this._backgroundColor = e, this._canvas.style.background = e.toHexString();
  }
}
class ca {
  constructor(e, n, l = 0.5, i = 0.5, s = 5, a = !0, r = new j()) {
    this.minAngle = -90, this.maxAngle = 90, this.minZoom = 0.1, this.maxZoom = 30, this.orbitSpeed = 1, this.panSpeed = 1, this.zoomSpeed = 1, this.dampening = 0.12, this.setCameraTarget = () => {
    };
    let d = r.clone(), o = d.clone(), c = l, U = i, F = s, h = !1, u = !1, R = 0, V = 0, I = 0;
    const W = {};
    let m = !1;
    e.addEventListener("objectChanged", () => {
      if (m)
        return;
      const Q = e.rotation.toEuler();
      c = -Q.y, U = -Q.x;
      const g = e.position.x - F * Math.sin(c) * Math.cos(U), X = e.position.y + F * Math.sin(U), y = e.position.z + F * Math.cos(c) * Math.cos(U);
      o = new j(g, X, y);
    }), this.setCameraTarget = (Q) => {
      const g = Q.x - e.position.x, X = Q.y - e.position.y, y = Q.z - e.position.z;
      F = Math.sqrt(g * g + X * X + y * y), U = Math.atan2(X, Math.sqrt(g * g + y * y)), c = -Math.atan2(g, y), o = new j(Q.x, Q.y, Q.z);
    };
    const A = () => 0.1 + 0.9 * (F - this.minZoom) / (this.maxZoom - this.minZoom), p = (Q) => {
      W[Q.code] = !0, Q.code === "ArrowUp" && (W.KeyW = !0), Q.code === "ArrowDown" && (W.KeyS = !0), Q.code === "ArrowLeft" && (W.KeyA = !0), Q.code === "ArrowRight" && (W.KeyD = !0);
    }, z = (Q) => {
      W[Q.code] = !1, Q.code === "ArrowUp" && (W.KeyW = !1), Q.code === "ArrowDown" && (W.KeyS = !1), Q.code === "ArrowLeft" && (W.KeyA = !1), Q.code === "ArrowRight" && (W.KeyD = !1);
    }, H = (Q) => {
      v(Q), h = !0, u = Q.button === 2, V = Q.clientX, I = Q.clientY, window.addEventListener("mouseup", k);
    }, k = (Q) => {
      v(Q), h = !1, u = !1, window.removeEventListener("mouseup", k);
    }, N = (Q) => {
      if (v(Q), !h || !e)
        return;
      const g = Q.clientX - V, X = Q.clientY - I;
      if (u) {
        const y = A(), K = -g * this.panSpeed * 0.01 * y, de = -X * this.panSpeed * 0.01 * y, T = Se.RotationFromQuaternion(e.rotation).buffer, C = new j(T[0], T[3], T[6]), $ = new j(T[1], T[4], T[7]);
        o = o.add(C.multiply(K)), o = o.add($.multiply(de));
      } else
        c -= g * this.orbitSpeed * 3e-3, U += X * this.orbitSpeed * 3e-3, U = Math.min(Math.max(U, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180);
      V = Q.clientX, I = Q.clientY;
    }, J = (Q) => {
      v(Q);
      const g = A();
      F += Q.deltaY * this.zoomSpeed * 0.025 * g, F = Math.min(Math.max(F, this.minZoom), this.maxZoom);
    }, S = (Q) => {
      if (v(Q), Q.touches.length === 1)
        h = !0, u = !1, V = Q.touches[0].clientX, I = Q.touches[0].clientY, R = 0;
      else if (Q.touches.length === 2) {
        h = !0, u = !0, V = (Q.touches[0].clientX + Q.touches[1].clientX) / 2, I = (Q.touches[0].clientY + Q.touches[1].clientY) / 2;
        const g = Q.touches[0].clientX - Q.touches[1].clientX, X = Q.touches[0].clientY - Q.touches[1].clientY;
        R = Math.sqrt(g * g + X * X);
      }
    }, me = (Q) => {
      v(Q), h = !1, u = !1;
    }, ae = (Q) => {
      if (v(Q), h && e)
        if (u) {
          const g = A(), X = Q.touches[0].clientX - Q.touches[1].clientX, y = Q.touches[0].clientY - Q.touches[1].clientY, K = Math.sqrt(X * X + y * y);
          F += (R - K) * this.zoomSpeed * 0.1 * g, F = Math.min(Math.max(F, this.minZoom), this.maxZoom), R = K;
          const de = (Q.touches[0].clientX + Q.touches[1].clientX) / 2, T = (Q.touches[0].clientY + Q.touches[1].clientY) / 2, C = de - V, $ = T - I, se = Se.RotationFromQuaternion(e.rotation).buffer, re = new j(se[0], se[3], se[6]), Ye = new j(se[1], se[4], se[7]);
          o = o.add(re.multiply(-C * this.panSpeed * 0.025 * g)), o = o.add(Ye.multiply(-$ * this.panSpeed * 0.025 * g)), V = de, I = T;
        } else {
          const g = Q.touches[0].clientX - V, X = Q.touches[0].clientY - I;
          c -= g * this.orbitSpeed * 3e-3, U += X * this.orbitSpeed * 3e-3, U = Math.min(Math.max(U, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180), V = Q.touches[0].clientX, I = Q.touches[0].clientY;
        }
    }, Y = (Q, g, X) => (1 - X) * Q + X * g;
    this.update = () => {
      m = !0, l = Y(l, c, this.dampening), i = Y(i, U, this.dampening), s = Y(s, F, this.dampening), d = d.lerp(o, this.dampening);
      const Q = d.x + s * Math.sin(l) * Math.cos(i), g = d.y - s * Math.sin(i), X = d.z - s * Math.cos(l) * Math.cos(i);
      e.position = new j(Q, g, X);
      const y = d.subtract(e.position).normalize(), K = Math.asin(-y.y), de = Math.atan2(y.x, y.z);
      e.rotation = Ae.FromEuler(new j(K, de, 0));
      const T = 0.025, C = 0.01, $ = Se.RotationFromQuaternion(e.rotation).buffer, se = new j(-$[2], -$[5], -$[8]), re = new j($[0], $[3], $[6]);
      W.KeyS && (o = o.add(se.multiply(T))), W.KeyW && (o = o.subtract(se.multiply(T))), W.KeyA && (o = o.subtract(re.multiply(T))), W.KeyD && (o = o.add(re.multiply(T))), W.KeyE && (c += C), W.KeyQ && (c -= C), W.KeyR && (U += C), W.KeyF && (U -= C), m = !1;
    };
    const v = (Q) => {
      Q.preventDefault(), Q.stopPropagation();
    };
    this.dispose = () => {
      n.removeEventListener("dragenter", v), n.removeEventListener("dragover", v), n.removeEventListener("dragleave", v), n.removeEventListener("contextmenu", v), n.removeEventListener("mousedown", H), n.removeEventListener("mousemove", N), n.removeEventListener("wheel", J), n.removeEventListener("touchstart", S), n.removeEventListener("touchend", me), n.removeEventListener("touchmove", ae), a && (window.removeEventListener("keydown", p), window.removeEventListener("keyup", z));
    }, a && (window.addEventListener("keydown", p), window.addEventListener("keyup", z)), n.addEventListener("dragenter", v), n.addEventListener("dragover", v), n.addEventListener("dragleave", v), n.addEventListener("contextmenu", v), n.addEventListener("mousedown", H), n.addEventListener("mousemove", N), n.addEventListener("wheel", J), n.addEventListener("touchstart", S), n.addEventListener("touchend", me), n.addEventListener("touchmove", ae), this.update();
  }
}
const {
  SvelteComponent: ko,
  append: wn,
  attr: vn,
  binding_callbacks: Yo,
  check_outros: To,
  create_component: Fa,
  destroy_component: Ua,
  detach: al,
  element: Hn,
  empty: _o,
  group_outros: wo,
  init: vo,
  insert: sl,
  mount_component: ha,
  safe_not_equal: Ho,
  space: Qa,
  transition_in: zt,
  transition_out: cn
} = window.__gradio__svelte__internal, { onMount: Do } = window.__gradio__svelte__internal;
function Pl(t) {
  let e, n, l, i, s, a;
  return l = new An({
    props: {
      Icon: Yr,
      label: (
        /*i18n*/
        t[3]("common.download")
      )
    }
  }), l.$on(
    "click",
    /*download*/
    t[5]
  ), {
    c() {
      e = Hn("div"), n = Hn("div"), Fa(l.$$.fragment), i = Qa(), s = Hn("canvas"), vn(n, "class", "buttons svelte-1jnxgzx"), vn(s, "class", "svelte-1jnxgzx"), vn(e, "class", "model3DGS svelte-1jnxgzx");
    },
    m(r, d) {
      sl(r, e, d), wn(e, n), ha(l, n, null), wn(e, i), wn(e, s), t[10](s), a = !0;
    },
    p(r, d) {
      const o = {};
      d & /*i18n*/
      8 && (o.label = /*i18n*/
      r[3]("common.download")), l.$set(o);
    },
    i(r) {
      a || (zt(l.$$.fragment, r), a = !0);
    },
    o(r) {
      cn(l.$$.fragment, r), a = !1;
    },
    d(r) {
      r && al(e), Ua(l), t[10](null);
    }
  };
}
function xo(t) {
  let e, n, l, i;
  e = new un({
    props: {
      show_label: (
        /*show_label*/
        t[2]
      ),
      Icon: Ot,
      label: (
        /*label*/
        t[1] || /*i18n*/
        t[3]("3DGS_model.splat")
      )
    }
  });
  let s = (
    /*value*/
    t[0] && Pl(t)
  );
  return {
    c() {
      Fa(e.$$.fragment), n = Qa(), s && s.c(), l = _o();
    },
    m(a, r) {
      ha(e, a, r), sl(a, n, r), s && s.m(a, r), sl(a, l, r), i = !0;
    },
    p(a, [r]) {
      const d = {};
      r & /*show_label*/
      4 && (d.show_label = /*show_label*/
      a[2]), r & /*label, i18n*/
      10 && (d.label = /*label*/
      a[1] || /*i18n*/
      a[3]("3DGS_model.splat")), e.$set(d), /*value*/
      a[0] ? s ? (s.p(a, r), r & /*value*/
      1 && zt(s, 1)) : (s = Pl(a), s.c(), zt(s, 1), s.m(l.parentNode, l)) : s && (wo(), cn(s, 1, 1, () => {
        s = null;
      }), To());
    },
    i(a) {
      i || (zt(e.$$.fragment, a), zt(s), i = !0);
    },
    o(a) {
      cn(e.$$.fragment, a), cn(s), i = !1;
    },
    d(a) {
      a && (al(n), al(l)), Ua(e, a), s && s.d(a);
    }
  };
}
function Mo(t, e, n) {
  let l, { value: i } = e, { label: s = "" } = e, { show_label: a } = e, { i18n: r } = e, { zoom_speed: d = 1 } = e, { pan_speed: o = 1 } = e, c, U, F, h = null, u, R = !1, V = null;
  function I() {
    if (V !== null && (cancelAnimationFrame(V), V = null), h !== null && (h.dispose(), h = null), U = new ia(), F = new la(), h = new da(c), u = new ca(F, c), u.zoomSpeed = d, u.panSpeed = o, !i)
      return;
    let A = !1;
    const p = async () => {
      if (A) {
        console.error("Already loading");
        return;
      }
      if (A = !0, i.url.endsWith(".ply"))
        await ml.LoadAsync(i.url, U, (H) => {
        });
      else if (i.url.endsWith(".splat"))
        await aa.LoadAsync(i.url, U, (H) => {
        });
      else
        throw new Error("Unsupported file type");
      A = !1;
    }, z = () => {
      if (h) {
        if (A) {
          V = requestAnimationFrame(z);
          return;
        }
        u.update(), h.render(U, F), V = requestAnimationFrame(z);
      }
    };
    p(), V = requestAnimationFrame(z);
  }
  Do(() => {
    i != null && I(), n(8, R = !0);
  });
  function W() {
    if (!i)
      return;
    let A = i.orig_name || i.path.split("/").pop() || "model.splat";
    A = A.replace(/\.ply$/, ".splat"), U.saveToFile(A);
  }
  function m(A) {
    Yo[A ? "unshift" : "push"](() => {
      c = A, n(4, c);
    });
  }
  return t.$$set = (A) => {
    "value" in A && n(0, i = A.value), "label" in A && n(1, s = A.label), "show_label" in A && n(2, a = A.show_label), "i18n" in A && n(3, r = A.i18n), "zoom_speed" in A && n(6, d = A.zoom_speed), "pan_speed" in A && n(7, o = A.pan_speed);
  }, t.$$.update = () => {
    t.$$.dirty & /*value*/
    1 && n(9, { path: l } = i || { path: void 0 }, l), t.$$.dirty & /*canvas, mounted, path*/
    784 && c && R && l && I();
  }, [
    i,
    s,
    a,
    r,
    c,
    W,
    d,
    o,
    R,
    l,
    m
  ];
}
class zo extends ko {
  constructor(e) {
    super(), vo(this, e, Mo, xo, Ho, {
      value: 0,
      label: 1,
      show_label: 2,
      i18n: 3,
      zoom_speed: 6,
      pan_speed: 7
    });
  }
}
function Zt() {
}
function jo(t) {
  return t();
}
function Ko(t) {
  t.forEach(jo);
}
function Oo(t) {
  return typeof t == "function";
}
function Lo(t, e) {
  return t != t ? e == e : t !== e || t && typeof t == "object" || typeof t == "function";
}
function Po(t, ...e) {
  if (t == null) {
    for (const l of e)
      l(void 0);
    return Zt;
  }
  const n = t.subscribe(...e);
  return n.unsubscribe ? () => n.unsubscribe() : n;
}
const Ba = typeof window < "u";
let ql = Ba ? () => window.performance.now() : () => Date.now(), ua = Ba ? (t) => requestAnimationFrame(t) : Zt;
const It = /* @__PURE__ */ new Set();
function Aa(t) {
  It.forEach((e) => {
    e.c(t) || (It.delete(e), e.f());
  }), It.size !== 0 && ua(Aa);
}
function qo(t) {
  let e;
  return It.size === 0 && ua(Aa), {
    promise: new Promise((n) => {
      It.add(e = { c: t, f: n });
    }),
    abort() {
      It.delete(e);
    }
  };
}
const bt = [];
function $o(t, e) {
  return {
    subscribe: Lt(t, e).subscribe
  };
}
function Lt(t, e = Zt) {
  let n;
  const l = /* @__PURE__ */ new Set();
  function i(r) {
    if (Lo(t, r) && (t = r, n)) {
      const d = !bt.length;
      for (const o of l)
        o[1](), bt.push(o, t);
      if (d) {
        for (let o = 0; o < bt.length; o += 2)
          bt[o][0](bt[o + 1]);
        bt.length = 0;
      }
    }
  }
  function s(r) {
    i(r(t));
  }
  function a(r, d = Zt) {
    const o = [r, d];
    return l.add(o), l.size === 1 && (n = e(i, s) || Zt), r(t), () => {
      l.delete(o), l.size === 0 && n && (n(), n = null);
    };
  }
  return { set: i, update: s, subscribe: a };
}
function Yt(t, e, n) {
  const l = !Array.isArray(t), i = l ? [t] : t;
  if (!i.every(Boolean))
    throw new Error("derived() expects stores as input, got a falsy value");
  const s = e.length < 2;
  return $o(n, (a, r) => {
    let d = !1;
    const o = [];
    let c = 0, U = Zt;
    const F = () => {
      if (c)
        return;
      U();
      const u = e(l ? o[0] : o, a, r);
      s ? a(u) : U = Oo(u) ? u : Zt;
    }, h = i.map(
      (u, R) => Po(
        u,
        (V) => {
          o[R] = V, c &= ~(1 << R), d && F();
        },
        () => {
          c |= 1 << R;
        }
      )
    );
    return d = !0, F(), function() {
      Ko(h), U(), d = !1;
    };
  });
}
function $l(t) {
  return Object.prototype.toString.call(t) === "[object Date]";
}
function rl(t, e, n, l) {
  if (typeof n == "number" || $l(n)) {
    const i = l - n, s = (n - e) / (t.dt || 1 / 60), a = t.opts.stiffness * i, r = t.opts.damping * s, d = (a - r) * t.inv_mass, o = (s + d) * t.dt;
    return Math.abs(o) < t.opts.precision && Math.abs(i) < t.opts.precision ? l : (t.settled = !1, $l(n) ? new Date(n.getTime() + o) : n + o);
  } else {
    if (Array.isArray(n))
      return n.map(
        (i, s) => rl(t, e[s], n[s], l[s])
      );
    if (typeof n == "object") {
      const i = {};
      for (const s in n)
        i[s] = rl(t, e[s], n[s], l[s]);
      return i;
    } else
      throw new Error(`Cannot spring ${typeof n} values`);
  }
}
function ei(t, e = {}) {
  const n = Lt(t), { stiffness: l = 0.15, damping: i = 0.8, precision: s = 0.01 } = e;
  let a, r, d, o = t, c = t, U = 1, F = 0, h = !1;
  function u(V, I = {}) {
    c = V;
    const W = d = {};
    return t == null || I.hard || R.stiffness >= 1 && R.damping >= 1 ? (h = !0, a = ql(), o = V, n.set(t = c), Promise.resolve()) : (I.soft && (F = 1 / ((I.soft === !0 ? 0.5 : +I.soft) * 60), U = 0), r || (a = ql(), h = !1, r = qo((m) => {
      if (h)
        return h = !1, r = null, !1;
      U = Math.min(U + F, 1);
      const A = {
        inv_mass: U,
        opts: R,
        settled: !0,
        dt: (m - a) * 60 / 1e3
      }, p = rl(A, o, t, c);
      return a = m, o = t, n.set(t = p), A.settled && (r = null), !A.settled;
    })), new Promise((m) => {
      r.promise.then(() => {
        W === d && m();
      });
    }));
  }
  const R = {
    set: u,
    update: (V, I) => u(V(c, t), I),
    subscribe: n.subscribe,
    stiffness: l,
    damping: i,
    precision: s
  };
  return R;
}
function ed(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var td = function(e) {
  return nd(e) && !ld(e);
};
function nd(t) {
  return !!t && typeof t == "object";
}
function ld(t) {
  var e = Object.prototype.toString.call(t);
  return e === "[object RegExp]" || e === "[object Date]" || sd(t);
}
var id = typeof Symbol == "function" && Symbol.for, ad = id ? Symbol.for("react.element") : 60103;
function sd(t) {
  return t.$$typeof === ad;
}
function rd(t) {
  return Array.isArray(t) ? [] : {};
}
function jt(t, e) {
  return e.clone !== !1 && e.isMergeableObject(t) ? Ct(rd(t), t, e) : t;
}
function od(t, e, n) {
  return t.concat(e).map(function(l) {
    return jt(l, n);
  });
}
function dd(t, e) {
  if (!e.customMerge)
    return Ct;
  var n = e.customMerge(t);
  return typeof n == "function" ? n : Ct;
}
function cd(t) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(e) {
    return Object.propertyIsEnumerable.call(t, e);
  }) : [];
}
function ti(t) {
  return Object.keys(t).concat(cd(t));
}
function Va(t, e) {
  try {
    return e in t;
  } catch {
    return !1;
  }
}
function Fd(t, e) {
  return Va(t, e) && !(Object.hasOwnProperty.call(t, e) && Object.propertyIsEnumerable.call(t, e));
}
function Ud(t, e, n) {
  var l = {};
  return n.isMergeableObject(t) && ti(t).forEach(function(i) {
    l[i] = jt(t[i], n);
  }), ti(e).forEach(function(i) {
    Fd(t, i) || (Va(t, i) && n.isMergeableObject(e[i]) ? l[i] = dd(i, n)(t[i], e[i], n) : l[i] = jt(e[i], n));
  }), l;
}
function Ct(t, e, n) {
  n = n || {}, n.arrayMerge = n.arrayMerge || od, n.isMergeableObject = n.isMergeableObject || td, n.cloneUnlessOtherwiseSpecified = jt;
  var l = Array.isArray(e), i = Array.isArray(t), s = l === i;
  return s ? l ? n.arrayMerge(t, e, n) : Ud(t, e, n) : jt(e, n);
}
Ct.all = function(e, n) {
  if (!Array.isArray(e))
    throw new Error("first argument should be an array");
  return e.reduce(function(l, i) {
    return Ct(l, i, n);
  }, {});
};
var hd = Ct, Qd = hd;
const Bd = /* @__PURE__ */ ed(Qd);
var ol = function(t, e) {
  return ol = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, l) {
    n.__proto__ = l;
  } || function(n, l) {
    for (var i in l)
      Object.prototype.hasOwnProperty.call(l, i) && (n[i] = l[i]);
  }, ol(t, e);
};
function Vn(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  ol(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
var ee = function() {
  return ee = Object.assign || function(e) {
    for (var n, l = 1, i = arguments.length; l < i; l++) {
      n = arguments[l];
      for (var s in n)
        Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
    }
    return e;
  }, ee.apply(this, arguments);
};
function Dn(t, e, n) {
  if (n || arguments.length === 2)
    for (var l = 0, i = e.length, s; l < i; l++)
      (s || !(l in e)) && (s || (s = Array.prototype.slice.call(e, 0, l)), s[l] = e[l]);
  return t.concat(s || Array.prototype.slice.call(e));
}
var O;
(function(t) {
  t[t.EXPECT_ARGUMENT_CLOSING_BRACE = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE", t[t.EMPTY_ARGUMENT = 2] = "EMPTY_ARGUMENT", t[t.MALFORMED_ARGUMENT = 3] = "MALFORMED_ARGUMENT", t[t.EXPECT_ARGUMENT_TYPE = 4] = "EXPECT_ARGUMENT_TYPE", t[t.INVALID_ARGUMENT_TYPE = 5] = "INVALID_ARGUMENT_TYPE", t[t.EXPECT_ARGUMENT_STYLE = 6] = "EXPECT_ARGUMENT_STYLE", t[t.INVALID_NUMBER_SKELETON = 7] = "INVALID_NUMBER_SKELETON", t[t.INVALID_DATE_TIME_SKELETON = 8] = "INVALID_DATE_TIME_SKELETON", t[t.EXPECT_NUMBER_SKELETON = 9] = "EXPECT_NUMBER_SKELETON", t[t.EXPECT_DATE_TIME_SKELETON = 10] = "EXPECT_DATE_TIME_SKELETON", t[t.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE", t[t.EXPECT_SELECT_ARGUMENT_OPTIONS = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS", t[t.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE", t[t.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE", t[t.EXPECT_SELECT_ARGUMENT_SELECTOR = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR", t[t.EXPECT_PLURAL_ARGUMENT_SELECTOR = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR", t[t.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT", t[t.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT", t[t.INVALID_PLURAL_ARGUMENT_SELECTOR = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR", t[t.DUPLICATE_PLURAL_ARGUMENT_SELECTOR = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR", t[t.DUPLICATE_SELECT_ARGUMENT_SELECTOR = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR", t[t.MISSING_OTHER_CLAUSE = 22] = "MISSING_OTHER_CLAUSE", t[t.INVALID_TAG = 23] = "INVALID_TAG", t[t.INVALID_TAG_NAME = 25] = "INVALID_TAG_NAME", t[t.UNMATCHED_CLOSING_TAG = 26] = "UNMATCHED_CLOSING_TAG", t[t.UNCLOSED_TAG = 27] = "UNCLOSED_TAG";
})(O || (O = {}));
var ne;
(function(t) {
  t[t.literal = 0] = "literal", t[t.argument = 1] = "argument", t[t.number = 2] = "number", t[t.date = 3] = "date", t[t.time = 4] = "time", t[t.select = 5] = "select", t[t.plural = 6] = "plural", t[t.pound = 7] = "pound", t[t.tag = 8] = "tag";
})(ne || (ne = {}));
var Nt;
(function(t) {
  t[t.number = 0] = "number", t[t.dateTime = 1] = "dateTime";
})(Nt || (Nt = {}));
function ni(t) {
  return t.type === ne.literal;
}
function ud(t) {
  return t.type === ne.argument;
}
function Za(t) {
  return t.type === ne.number;
}
function ma(t) {
  return t.type === ne.date;
}
function Ra(t) {
  return t.type === ne.time;
}
function ba(t) {
  return t.type === ne.select;
}
function ga(t) {
  return t.type === ne.plural;
}
function Ad(t) {
  return t.type === ne.pound;
}
function Wa(t) {
  return t.type === ne.tag;
}
function fa(t) {
  return !!(t && typeof t == "object" && t.type === Nt.number);
}
function dl(t) {
  return !!(t && typeof t == "object" && t.type === Nt.dateTime);
}
var Ia = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/, Vd = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
function Zd(t) {
  var e = {};
  return t.replace(Vd, function(n) {
    var l = n.length;
    switch (n[0]) {
      case "G":
        e.era = l === 4 ? "long" : l === 5 ? "narrow" : "short";
        break;
      case "y":
        e.year = l === 2 ? "2-digit" : "numeric";
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
        e.month = ["numeric", "2-digit", "short", "long", "narrow"][l - 1];
        break;
      case "w":
      case "W":
        throw new RangeError("`w/W` (week) patterns are not supported");
      case "d":
        e.day = ["numeric", "2-digit"][l - 1];
        break;
      case "D":
      case "F":
      case "g":
        throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");
      case "E":
        e.weekday = l === 4 ? "short" : l === 5 ? "narrow" : "short";
        break;
      case "e":
        if (l < 4)
          throw new RangeError("`e..eee` (weekday) patterns are not supported");
        e.weekday = ["short", "long", "narrow", "short"][l - 4];
        break;
      case "c":
        if (l < 4)
          throw new RangeError("`c..ccc` (weekday) patterns are not supported");
        e.weekday = ["short", "long", "narrow", "short"][l - 4];
        break;
      case "a":
        e.hour12 = !0;
        break;
      case "b":
      case "B":
        throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");
      case "h":
        e.hourCycle = "h12", e.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "H":
        e.hourCycle = "h23", e.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "K":
        e.hourCycle = "h11", e.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "k":
        e.hourCycle = "h24", e.hour = ["numeric", "2-digit"][l - 1];
        break;
      case "j":
      case "J":
      case "C":
        throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");
      case "m":
        e.minute = ["numeric", "2-digit"][l - 1];
        break;
      case "s":
        e.second = ["numeric", "2-digit"][l - 1];
        break;
      case "S":
      case "A":
        throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");
      case "z":
        e.timeZoneName = l < 4 ? "short" : "long";
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
  }), e;
}
var md = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
function Rd(t) {
  if (t.length === 0)
    throw new Error("Number skeleton cannot be empty");
  for (var e = t.split(md).filter(function(F) {
    return F.length > 0;
  }), n = [], l = 0, i = e; l < i.length; l++) {
    var s = i[l], a = s.split("/");
    if (a.length === 0)
      throw new Error("Invalid number skeleton");
    for (var r = a[0], d = a.slice(1), o = 0, c = d; o < c.length; o++) {
      var U = c[o];
      if (U.length === 0)
        throw new Error("Invalid number skeleton");
    }
    n.push({ stem: r, options: d });
  }
  return n;
}
function bd(t) {
  return t.replace(/^(.*?)-/, "");
}
var li = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g, pa = /^(@+)?(\+|#+)?[rs]?$/g, gd = /(\*)(0+)|(#+)(0+)|(0+)/g, Ja = /^(0+)$/;
function ii(t) {
  var e = {};
  return t[t.length - 1] === "r" ? e.roundingPriority = "morePrecision" : t[t.length - 1] === "s" && (e.roundingPriority = "lessPrecision"), t.replace(pa, function(n, l, i) {
    return typeof i != "string" ? (e.minimumSignificantDigits = l.length, e.maximumSignificantDigits = l.length) : i === "+" ? e.minimumSignificantDigits = l.length : l[0] === "#" ? e.maximumSignificantDigits = l.length : (e.minimumSignificantDigits = l.length, e.maximumSignificantDigits = l.length + (typeof i == "string" ? i.length : 0)), "";
  }), e;
}
function Ca(t) {
  switch (t) {
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
function Wd(t) {
  var e;
  if (t[0] === "E" && t[1] === "E" ? (e = {
    notation: "engineering"
  }, t = t.slice(2)) : t[0] === "E" && (e = {
    notation: "scientific"
  }, t = t.slice(1)), e) {
    var n = t.slice(0, 2);
    if (n === "+!" ? (e.signDisplay = "always", t = t.slice(2)) : n === "+?" && (e.signDisplay = "exceptZero", t = t.slice(2)), !Ja.test(t))
      throw new Error("Malformed concise eng/scientific notation");
    e.minimumIntegerDigits = t.length;
  }
  return e;
}
function ai(t) {
  var e = {}, n = Ca(t);
  return n || e;
}
function fd(t) {
  for (var e = {}, n = 0, l = t; n < l.length; n++) {
    var i = l[n];
    switch (i.stem) {
      case "percent":
      case "%":
        e.style = "percent";
        continue;
      case "%x100":
        e.style = "percent", e.scale = 100;
        continue;
      case "currency":
        e.style = "currency", e.currency = i.options[0];
        continue;
      case "group-off":
      case ",_":
        e.useGrouping = !1;
        continue;
      case "precision-integer":
      case ".":
        e.maximumFractionDigits = 0;
        continue;
      case "measure-unit":
      case "unit":
        e.style = "unit", e.unit = bd(i.options[0]);
        continue;
      case "compact-short":
      case "K":
        e.notation = "compact", e.compactDisplay = "short";
        continue;
      case "compact-long":
      case "KK":
        e.notation = "compact", e.compactDisplay = "long";
        continue;
      case "scientific":
        e = ee(ee(ee({}, e), { notation: "scientific" }), i.options.reduce(function(d, o) {
          return ee(ee({}, d), ai(o));
        }, {}));
        continue;
      case "engineering":
        e = ee(ee(ee({}, e), { notation: "engineering" }), i.options.reduce(function(d, o) {
          return ee(ee({}, d), ai(o));
        }, {}));
        continue;
      case "notation-simple":
        e.notation = "standard";
        continue;
      case "unit-width-narrow":
        e.currencyDisplay = "narrowSymbol", e.unitDisplay = "narrow";
        continue;
      case "unit-width-short":
        e.currencyDisplay = "code", e.unitDisplay = "short";
        continue;
      case "unit-width-full-name":
        e.currencyDisplay = "name", e.unitDisplay = "long";
        continue;
      case "unit-width-iso-code":
        e.currencyDisplay = "symbol";
        continue;
      case "scale":
        e.scale = parseFloat(i.options[0]);
        continue;
      case "integer-width":
        if (i.options.length > 1)
          throw new RangeError("integer-width stems only accept a single optional option");
        i.options[0].replace(gd, function(d, o, c, U, F, h) {
          if (o)
            e.minimumIntegerDigits = c.length;
          else {
            if (U && F)
              throw new Error("We currently do not support maximum integer digits");
            if (h)
              throw new Error("We currently do not support exact integer digits");
          }
          return "";
        });
        continue;
    }
    if (Ja.test(i.stem)) {
      e.minimumIntegerDigits = i.stem.length;
      continue;
    }
    if (li.test(i.stem)) {
      if (i.options.length > 1)
        throw new RangeError("Fraction-precision stems only accept a single optional option");
      i.stem.replace(li, function(d, o, c, U, F, h) {
        return c === "*" ? e.minimumFractionDigits = o.length : U && U[0] === "#" ? e.maximumFractionDigits = U.length : F && h ? (e.minimumFractionDigits = F.length, e.maximumFractionDigits = F.length + h.length) : (e.minimumFractionDigits = o.length, e.maximumFractionDigits = o.length), "";
      });
      var s = i.options[0];
      s === "w" ? e = ee(ee({}, e), { trailingZeroDisplay: "stripIfInteger" }) : s && (e = ee(ee({}, e), ii(s)));
      continue;
    }
    if (pa.test(i.stem)) {
      e = ee(ee({}, e), ii(i.stem));
      continue;
    }
    var a = Ca(i.stem);
    a && (e = ee(ee({}, e), a));
    var r = Wd(i.stem);
    r && (e = ee(ee({}, e), r));
  }
  return e;
}
var an = {
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
function Id(t, e) {
  for (var n = "", l = 0; l < t.length; l++) {
    var i = t.charAt(l);
    if (i === "j") {
      for (var s = 0; l + 1 < t.length && t.charAt(l + 1) === i; )
        s++, l++;
      var a = 1 + (s & 1), r = s < 2 ? 1 : 3 + (s >> 1), d = "a", o = pd(e);
      for ((o == "H" || o == "k") && (r = 0); r-- > 0; )
        n += d;
      for (; a-- > 0; )
        n = o + n;
    } else
      i === "J" ? n += "H" : n += i;
  }
  return n;
}
function pd(t) {
  var e = t.hourCycle;
  if (e === void 0 && // @ts-ignore hourCycle(s) is not identified yet
  t.hourCycles && // @ts-ignore
  t.hourCycles.length && (e = t.hourCycles[0]), e)
    switch (e) {
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
  var n = t.language, l;
  n !== "root" && (l = t.maximize().region);
  var i = an[l || ""] || an[n || ""] || an["".concat(n, "-001")] || an["001"];
  return i[0];
}
var xn, Jd = new RegExp("^".concat(Ia.source, "*")), Cd = new RegExp("".concat(Ia.source, "*$"));
function L(t, e) {
  return { start: t, end: e };
}
var Nd = !!String.prototype.startsWith, Ed = !!String.fromCodePoint, yd = !!Object.fromEntries, Gd = !!String.prototype.codePointAt, Sd = !!String.prototype.trimStart, Xd = !!String.prototype.trimEnd, kd = !!Number.isSafeInteger, Yd = kd ? Number.isSafeInteger : function(t) {
  return typeof t == "number" && isFinite(t) && Math.floor(t) === t && Math.abs(t) <= 9007199254740991;
}, cl = !0;
try {
  var Td = Ea("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  cl = ((xn = Td.exec("a")) === null || xn === void 0 ? void 0 : xn[0]) === "a";
} catch {
  cl = !1;
}
var si = Nd ? (
  // Native
  function(e, n, l) {
    return e.startsWith(n, l);
  }
) : (
  // For IE11
  function(e, n, l) {
    return e.slice(l, l + n.length) === n;
  }
), Fl = Ed ? String.fromCodePoint : (
  // IE11
  function() {
    for (var e = [], n = 0; n < arguments.length; n++)
      e[n] = arguments[n];
    for (var l = "", i = e.length, s = 0, a; i > s; ) {
      if (a = e[s++], a > 1114111)
        throw RangeError(a + " is not a valid code point");
      l += a < 65536 ? String.fromCharCode(a) : String.fromCharCode(((a -= 65536) >> 10) + 55296, a % 1024 + 56320);
    }
    return l;
  }
), ri = (
  // native
  yd ? Object.fromEntries : (
    // Ponyfill
    function(e) {
      for (var n = {}, l = 0, i = e; l < i.length; l++) {
        var s = i[l], a = s[0], r = s[1];
        n[a] = r;
      }
      return n;
    }
  )
), Na = Gd ? (
  // Native
  function(e, n) {
    return e.codePointAt(n);
  }
) : (
  // IE 11
  function(e, n) {
    var l = e.length;
    if (!(n < 0 || n >= l)) {
      var i = e.charCodeAt(n), s;
      return i < 55296 || i > 56319 || n + 1 === l || (s = e.charCodeAt(n + 1)) < 56320 || s > 57343 ? i : (i - 55296 << 10) + (s - 56320) + 65536;
    }
  }
), _d = Sd ? (
  // Native
  function(e) {
    return e.trimStart();
  }
) : (
  // Ponyfill
  function(e) {
    return e.replace(Jd, "");
  }
), wd = Xd ? (
  // Native
  function(e) {
    return e.trimEnd();
  }
) : (
  // Ponyfill
  function(e) {
    return e.replace(Cd, "");
  }
);
function Ea(t, e) {
  return new RegExp(t, e);
}
var Ul;
if (cl) {
  var oi = Ea("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  Ul = function(e, n) {
    var l;
    oi.lastIndex = n;
    var i = oi.exec(e);
    return (l = i[1]) !== null && l !== void 0 ? l : "";
  };
} else
  Ul = function(e, n) {
    for (var l = []; ; ) {
      var i = Na(e, n);
      if (i === void 0 || ya(i) || xd(i))
        break;
      l.push(i), n += i >= 65536 ? 2 : 1;
    }
    return Fl.apply(void 0, l);
  };
var vd = (
  /** @class */
  function() {
    function t(e, n) {
      n === void 0 && (n = {}), this.message = e, this.position = { offset: 0, line: 1, column: 1 }, this.ignoreTag = !!n.ignoreTag, this.locale = n.locale, this.requiresOtherClause = !!n.requiresOtherClause, this.shouldParseSkeletons = !!n.shouldParseSkeletons;
    }
    return t.prototype.parse = function() {
      if (this.offset() !== 0)
        throw Error("parser can only be used once");
      return this.parseMessage(0, "", !1);
    }, t.prototype.parseMessage = function(e, n, l) {
      for (var i = []; !this.isEOF(); ) {
        var s = this.char();
        if (s === 123) {
          var a = this.parseArgument(e, l);
          if (a.err)
            return a;
          i.push(a.val);
        } else {
          if (s === 125 && e > 0)
            break;
          if (s === 35 && (n === "plural" || n === "selectordinal")) {
            var r = this.clonePosition();
            this.bump(), i.push({
              type: ne.pound,
              location: L(r, this.clonePosition())
            });
          } else if (s === 60 && !this.ignoreTag && this.peek() === 47) {
            if (l)
              break;
            return this.error(O.UNMATCHED_CLOSING_TAG, L(this.clonePosition(), this.clonePosition()));
          } else if (s === 60 && !this.ignoreTag && hl(this.peek() || 0)) {
            var a = this.parseTag(e, n);
            if (a.err)
              return a;
            i.push(a.val);
          } else {
            var a = this.parseLiteral(e, n);
            if (a.err)
              return a;
            i.push(a.val);
          }
        }
      }
      return { val: i, err: null };
    }, t.prototype.parseTag = function(e, n) {
      var l = this.clonePosition();
      this.bump();
      var i = this.parseTagName();
      if (this.bumpSpace(), this.bumpIf("/>"))
        return {
          val: {
            type: ne.literal,
            value: "<".concat(i, "/>"),
            location: L(l, this.clonePosition())
          },
          err: null
        };
      if (this.bumpIf(">")) {
        var s = this.parseMessage(e + 1, n, !0);
        if (s.err)
          return s;
        var a = s.val, r = this.clonePosition();
        if (this.bumpIf("</")) {
          if (this.isEOF() || !hl(this.char()))
            return this.error(O.INVALID_TAG, L(r, this.clonePosition()));
          var d = this.clonePosition(), o = this.parseTagName();
          return i !== o ? this.error(O.UNMATCHED_CLOSING_TAG, L(d, this.clonePosition())) : (this.bumpSpace(), this.bumpIf(">") ? {
            val: {
              type: ne.tag,
              value: i,
              children: a,
              location: L(l, this.clonePosition())
            },
            err: null
          } : this.error(O.INVALID_TAG, L(r, this.clonePosition())));
        } else
          return this.error(O.UNCLOSED_TAG, L(l, this.clonePosition()));
      } else
        return this.error(O.INVALID_TAG, L(l, this.clonePosition()));
    }, t.prototype.parseTagName = function() {
      var e = this.offset();
      for (this.bump(); !this.isEOF() && Dd(this.char()); )
        this.bump();
      return this.message.slice(e, this.offset());
    }, t.prototype.parseLiteral = function(e, n) {
      for (var l = this.clonePosition(), i = ""; ; ) {
        var s = this.tryParseQuote(n);
        if (s) {
          i += s;
          continue;
        }
        var a = this.tryParseUnquoted(e, n);
        if (a) {
          i += a;
          continue;
        }
        var r = this.tryParseLeftAngleBracket();
        if (r) {
          i += r;
          continue;
        }
        break;
      }
      var d = L(l, this.clonePosition());
      return {
        val: { type: ne.literal, value: i, location: d },
        err: null
      };
    }, t.prototype.tryParseLeftAngleBracket = function() {
      return !this.isEOF() && this.char() === 60 && (this.ignoreTag || // If at the opening tag or closing tag position, bail.
      !Hd(this.peek() || 0)) ? (this.bump(), "<") : null;
    }, t.prototype.tryParseQuote = function(e) {
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
          if (e === "plural" || e === "selectordinal")
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
      return Fl.apply(void 0, n);
    }, t.prototype.tryParseUnquoted = function(e, n) {
      if (this.isEOF())
        return null;
      var l = this.char();
      return l === 60 || l === 123 || l === 35 && (n === "plural" || n === "selectordinal") || l === 125 && e > 0 ? null : (this.bump(), Fl(l));
    }, t.prototype.parseArgument = function(e, n) {
      var l = this.clonePosition();
      if (this.bump(), this.bumpSpace(), this.isEOF())
        return this.error(O.EXPECT_ARGUMENT_CLOSING_BRACE, L(l, this.clonePosition()));
      if (this.char() === 125)
        return this.bump(), this.error(O.EMPTY_ARGUMENT, L(l, this.clonePosition()));
      var i = this.parseIdentifierIfPossible().value;
      if (!i)
        return this.error(O.MALFORMED_ARGUMENT, L(l, this.clonePosition()));
      if (this.bumpSpace(), this.isEOF())
        return this.error(O.EXPECT_ARGUMENT_CLOSING_BRACE, L(l, this.clonePosition()));
      switch (this.char()) {
        case 125:
          return this.bump(), {
            val: {
              type: ne.argument,
              // value does not include the opening and closing braces.
              value: i,
              location: L(l, this.clonePosition())
            },
            err: null
          };
        case 44:
          return this.bump(), this.bumpSpace(), this.isEOF() ? this.error(O.EXPECT_ARGUMENT_CLOSING_BRACE, L(l, this.clonePosition())) : this.parseArgumentOptions(e, n, i, l);
        default:
          return this.error(O.MALFORMED_ARGUMENT, L(l, this.clonePosition()));
      }
    }, t.prototype.parseIdentifierIfPossible = function() {
      var e = this.clonePosition(), n = this.offset(), l = Ul(this.message, n), i = n + l.length;
      this.bumpTo(i);
      var s = this.clonePosition(), a = L(e, s);
      return { value: l, location: a };
    }, t.prototype.parseArgumentOptions = function(e, n, l, i) {
      var s, a = this.clonePosition(), r = this.parseIdentifierIfPossible().value, d = this.clonePosition();
      switch (r) {
        case "":
          return this.error(O.EXPECT_ARGUMENT_TYPE, L(a, d));
        case "number":
        case "date":
        case "time": {
          this.bumpSpace();
          var o = null;
          if (this.bumpIf(",")) {
            this.bumpSpace();
            var c = this.clonePosition(), U = this.parseSimpleArgStyleIfPossible();
            if (U.err)
              return U;
            var F = wd(U.val);
            if (F.length === 0)
              return this.error(O.EXPECT_ARGUMENT_STYLE, L(this.clonePosition(), this.clonePosition()));
            var h = L(c, this.clonePosition());
            o = { style: F, styleLocation: h };
          }
          var u = this.tryParseArgumentClose(i);
          if (u.err)
            return u;
          var R = L(i, this.clonePosition());
          if (o && si(o == null ? void 0 : o.style, "::", 0)) {
            var V = _d(o.style.slice(2));
            if (r === "number") {
              var U = this.parseNumberSkeletonFromString(V, o.styleLocation);
              return U.err ? U : {
                val: { type: ne.number, value: l, location: R, style: U.val },
                err: null
              };
            } else {
              if (V.length === 0)
                return this.error(O.EXPECT_DATE_TIME_SKELETON, R);
              var I = V;
              this.locale && (I = Id(V, this.locale));
              var F = {
                type: Nt.dateTime,
                pattern: I,
                location: o.styleLocation,
                parsedOptions: this.shouldParseSkeletons ? Zd(I) : {}
              }, W = r === "date" ? ne.date : ne.time;
              return {
                val: { type: W, value: l, location: R, style: F },
                err: null
              };
            }
          }
          return {
            val: {
              type: r === "number" ? ne.number : r === "date" ? ne.date : ne.time,
              value: l,
              location: R,
              style: (s = o == null ? void 0 : o.style) !== null && s !== void 0 ? s : null
            },
            err: null
          };
        }
        case "plural":
        case "selectordinal":
        case "select": {
          var m = this.clonePosition();
          if (this.bumpSpace(), !this.bumpIf(","))
            return this.error(O.EXPECT_SELECT_ARGUMENT_OPTIONS, L(m, ee({}, m)));
          this.bumpSpace();
          var A = this.parseIdentifierIfPossible(), p = 0;
          if (r !== "select" && A.value === "offset") {
            if (!this.bumpIf(":"))
              return this.error(O.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, L(this.clonePosition(), this.clonePosition()));
            this.bumpSpace();
            var U = this.tryParseDecimalInteger(O.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, O.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
            if (U.err)
              return U;
            this.bumpSpace(), A = this.parseIdentifierIfPossible(), p = U.val;
          }
          var z = this.tryParsePluralOrSelectOptions(e, r, n, A);
          if (z.err)
            return z;
          var u = this.tryParseArgumentClose(i);
          if (u.err)
            return u;
          var H = L(i, this.clonePosition());
          return r === "select" ? {
            val: {
              type: ne.select,
              value: l,
              options: ri(z.val),
              location: H
            },
            err: null
          } : {
            val: {
              type: ne.plural,
              value: l,
              options: ri(z.val),
              offset: p,
              pluralType: r === "plural" ? "cardinal" : "ordinal",
              location: H
            },
            err: null
          };
        }
        default:
          return this.error(O.INVALID_ARGUMENT_TYPE, L(a, d));
      }
    }, t.prototype.tryParseArgumentClose = function(e) {
      return this.isEOF() || this.char() !== 125 ? this.error(O.EXPECT_ARGUMENT_CLOSING_BRACE, L(e, this.clonePosition())) : (this.bump(), { val: !0, err: null });
    }, t.prototype.parseSimpleArgStyleIfPossible = function() {
      for (var e = 0, n = this.clonePosition(); !this.isEOF(); ) {
        var l = this.char();
        switch (l) {
          case 39: {
            this.bump();
            var i = this.clonePosition();
            if (!this.bumpUntil("'"))
              return this.error(O.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, L(i, this.clonePosition()));
            this.bump();
            break;
          }
          case 123: {
            e += 1, this.bump();
            break;
          }
          case 125: {
            if (e > 0)
              e -= 1;
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
    }, t.prototype.parseNumberSkeletonFromString = function(e, n) {
      var l = [];
      try {
        l = Rd(e);
      } catch {
        return this.error(O.INVALID_NUMBER_SKELETON, n);
      }
      return {
        val: {
          type: Nt.number,
          tokens: l,
          location: n,
          parsedOptions: this.shouldParseSkeletons ? fd(l) : {}
        },
        err: null
      };
    }, t.prototype.tryParsePluralOrSelectOptions = function(e, n, l, i) {
      for (var s, a = !1, r = [], d = /* @__PURE__ */ new Set(), o = i.value, c = i.location; ; ) {
        if (o.length === 0) {
          var U = this.clonePosition();
          if (n !== "select" && this.bumpIf("=")) {
            var F = this.tryParseDecimalInteger(O.EXPECT_PLURAL_ARGUMENT_SELECTOR, O.INVALID_PLURAL_ARGUMENT_SELECTOR);
            if (F.err)
              return F;
            c = L(U, this.clonePosition()), o = this.message.slice(U.offset, this.offset());
          } else
            break;
        }
        if (d.has(o))
          return this.error(n === "select" ? O.DUPLICATE_SELECT_ARGUMENT_SELECTOR : O.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, c);
        o === "other" && (a = !0), this.bumpSpace();
        var h = this.clonePosition();
        if (!this.bumpIf("{"))
          return this.error(n === "select" ? O.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : O.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, L(this.clonePosition(), this.clonePosition()));
        var u = this.parseMessage(e + 1, n, l);
        if (u.err)
          return u;
        var R = this.tryParseArgumentClose(h);
        if (R.err)
          return R;
        r.push([
          o,
          {
            value: u.val,
            location: L(h, this.clonePosition())
          }
        ]), d.add(o), this.bumpSpace(), s = this.parseIdentifierIfPossible(), o = s.value, c = s.location;
      }
      return r.length === 0 ? this.error(n === "select" ? O.EXPECT_SELECT_ARGUMENT_SELECTOR : O.EXPECT_PLURAL_ARGUMENT_SELECTOR, L(this.clonePosition(), this.clonePosition())) : this.requiresOtherClause && !a ? this.error(O.MISSING_OTHER_CLAUSE, L(this.clonePosition(), this.clonePosition())) : { val: r, err: null };
    }, t.prototype.tryParseDecimalInteger = function(e, n) {
      var l = 1, i = this.clonePosition();
      this.bumpIf("+") || this.bumpIf("-") && (l = -1);
      for (var s = !1, a = 0; !this.isEOF(); ) {
        var r = this.char();
        if (r >= 48 && r <= 57)
          s = !0, a = a * 10 + (r - 48), this.bump();
        else
          break;
      }
      var d = L(i, this.clonePosition());
      return s ? (a *= l, Yd(a) ? { val: a, err: null } : this.error(n, d)) : this.error(e, d);
    }, t.prototype.offset = function() {
      return this.position.offset;
    }, t.prototype.isEOF = function() {
      return this.offset() === this.message.length;
    }, t.prototype.clonePosition = function() {
      return {
        offset: this.position.offset,
        line: this.position.line,
        column: this.position.column
      };
    }, t.prototype.char = function() {
      var e = this.position.offset;
      if (e >= this.message.length)
        throw Error("out of bound");
      var n = Na(this.message, e);
      if (n === void 0)
        throw Error("Offset ".concat(e, " is at invalid UTF-16 code unit boundary"));
      return n;
    }, t.prototype.error = function(e, n) {
      return {
        val: null,
        err: {
          kind: e,
          message: this.message,
          location: n
        }
      };
    }, t.prototype.bump = function() {
      if (!this.isEOF()) {
        var e = this.char();
        e === 10 ? (this.position.line += 1, this.position.column = 1, this.position.offset += 1) : (this.position.column += 1, this.position.offset += e < 65536 ? 1 : 2);
      }
    }, t.prototype.bumpIf = function(e) {
      if (si(this.message, e, this.offset())) {
        for (var n = 0; n < e.length; n++)
          this.bump();
        return !0;
      }
      return !1;
    }, t.prototype.bumpUntil = function(e) {
      var n = this.offset(), l = this.message.indexOf(e, n);
      return l >= 0 ? (this.bumpTo(l), !0) : (this.bumpTo(this.message.length), !1);
    }, t.prototype.bumpTo = function(e) {
      if (this.offset() > e)
        throw Error("targetOffset ".concat(e, " must be greater than or equal to the current offset ").concat(this.offset()));
      for (e = Math.min(e, this.message.length); ; ) {
        var n = this.offset();
        if (n === e)
          break;
        if (n > e)
          throw Error("targetOffset ".concat(e, " is at invalid UTF-16 code unit boundary"));
        if (this.bump(), this.isEOF())
          break;
      }
    }, t.prototype.bumpSpace = function() {
      for (; !this.isEOF() && ya(this.char()); )
        this.bump();
    }, t.prototype.peek = function() {
      if (this.isEOF())
        return null;
      var e = this.char(), n = this.offset(), l = this.message.charCodeAt(n + (e >= 65536 ? 2 : 1));
      return l ?? null;
    }, t;
  }()
);
function hl(t) {
  return t >= 97 && t <= 122 || t >= 65 && t <= 90;
}
function Hd(t) {
  return hl(t) || t === 47;
}
function Dd(t) {
  return t === 45 || t === 46 || t >= 48 && t <= 57 || t === 95 || t >= 97 && t <= 122 || t >= 65 && t <= 90 || t == 183 || t >= 192 && t <= 214 || t >= 216 && t <= 246 || t >= 248 && t <= 893 || t >= 895 && t <= 8191 || t >= 8204 && t <= 8205 || t >= 8255 && t <= 8256 || t >= 8304 && t <= 8591 || t >= 11264 && t <= 12271 || t >= 12289 && t <= 55295 || t >= 63744 && t <= 64975 || t >= 65008 && t <= 65533 || t >= 65536 && t <= 983039;
}
function ya(t) {
  return t >= 9 && t <= 13 || t === 32 || t === 133 || t >= 8206 && t <= 8207 || t === 8232 || t === 8233;
}
function xd(t) {
  return t >= 33 && t <= 35 || t === 36 || t >= 37 && t <= 39 || t === 40 || t === 41 || t === 42 || t === 43 || t === 44 || t === 45 || t >= 46 && t <= 47 || t >= 58 && t <= 59 || t >= 60 && t <= 62 || t >= 63 && t <= 64 || t === 91 || t === 92 || t === 93 || t === 94 || t === 96 || t === 123 || t === 124 || t === 125 || t === 126 || t === 161 || t >= 162 && t <= 165 || t === 166 || t === 167 || t === 169 || t === 171 || t === 172 || t === 174 || t === 176 || t === 177 || t === 182 || t === 187 || t === 191 || t === 215 || t === 247 || t >= 8208 && t <= 8213 || t >= 8214 && t <= 8215 || t === 8216 || t === 8217 || t === 8218 || t >= 8219 && t <= 8220 || t === 8221 || t === 8222 || t === 8223 || t >= 8224 && t <= 8231 || t >= 8240 && t <= 8248 || t === 8249 || t === 8250 || t >= 8251 && t <= 8254 || t >= 8257 && t <= 8259 || t === 8260 || t === 8261 || t === 8262 || t >= 8263 && t <= 8273 || t === 8274 || t === 8275 || t >= 8277 && t <= 8286 || t >= 8592 && t <= 8596 || t >= 8597 && t <= 8601 || t >= 8602 && t <= 8603 || t >= 8604 && t <= 8607 || t === 8608 || t >= 8609 && t <= 8610 || t === 8611 || t >= 8612 && t <= 8613 || t === 8614 || t >= 8615 && t <= 8621 || t === 8622 || t >= 8623 && t <= 8653 || t >= 8654 && t <= 8655 || t >= 8656 && t <= 8657 || t === 8658 || t === 8659 || t === 8660 || t >= 8661 && t <= 8691 || t >= 8692 && t <= 8959 || t >= 8960 && t <= 8967 || t === 8968 || t === 8969 || t === 8970 || t === 8971 || t >= 8972 && t <= 8991 || t >= 8992 && t <= 8993 || t >= 8994 && t <= 9e3 || t === 9001 || t === 9002 || t >= 9003 && t <= 9083 || t === 9084 || t >= 9085 && t <= 9114 || t >= 9115 && t <= 9139 || t >= 9140 && t <= 9179 || t >= 9180 && t <= 9185 || t >= 9186 && t <= 9254 || t >= 9255 && t <= 9279 || t >= 9280 && t <= 9290 || t >= 9291 && t <= 9311 || t >= 9472 && t <= 9654 || t === 9655 || t >= 9656 && t <= 9664 || t === 9665 || t >= 9666 && t <= 9719 || t >= 9720 && t <= 9727 || t >= 9728 && t <= 9838 || t === 9839 || t >= 9840 && t <= 10087 || t === 10088 || t === 10089 || t === 10090 || t === 10091 || t === 10092 || t === 10093 || t === 10094 || t === 10095 || t === 10096 || t === 10097 || t === 10098 || t === 10099 || t === 10100 || t === 10101 || t >= 10132 && t <= 10175 || t >= 10176 && t <= 10180 || t === 10181 || t === 10182 || t >= 10183 && t <= 10213 || t === 10214 || t === 10215 || t === 10216 || t === 10217 || t === 10218 || t === 10219 || t === 10220 || t === 10221 || t === 10222 || t === 10223 || t >= 10224 && t <= 10239 || t >= 10240 && t <= 10495 || t >= 10496 && t <= 10626 || t === 10627 || t === 10628 || t === 10629 || t === 10630 || t === 10631 || t === 10632 || t === 10633 || t === 10634 || t === 10635 || t === 10636 || t === 10637 || t === 10638 || t === 10639 || t === 10640 || t === 10641 || t === 10642 || t === 10643 || t === 10644 || t === 10645 || t === 10646 || t === 10647 || t === 10648 || t >= 10649 && t <= 10711 || t === 10712 || t === 10713 || t === 10714 || t === 10715 || t >= 10716 && t <= 10747 || t === 10748 || t === 10749 || t >= 10750 && t <= 11007 || t >= 11008 && t <= 11055 || t >= 11056 && t <= 11076 || t >= 11077 && t <= 11078 || t >= 11079 && t <= 11084 || t >= 11085 && t <= 11123 || t >= 11124 && t <= 11125 || t >= 11126 && t <= 11157 || t === 11158 || t >= 11159 && t <= 11263 || t >= 11776 && t <= 11777 || t === 11778 || t === 11779 || t === 11780 || t === 11781 || t >= 11782 && t <= 11784 || t === 11785 || t === 11786 || t === 11787 || t === 11788 || t === 11789 || t >= 11790 && t <= 11798 || t === 11799 || t >= 11800 && t <= 11801 || t === 11802 || t === 11803 || t === 11804 || t === 11805 || t >= 11806 && t <= 11807 || t === 11808 || t === 11809 || t === 11810 || t === 11811 || t === 11812 || t === 11813 || t === 11814 || t === 11815 || t === 11816 || t === 11817 || t >= 11818 && t <= 11822 || t === 11823 || t >= 11824 && t <= 11833 || t >= 11834 && t <= 11835 || t >= 11836 && t <= 11839 || t === 11840 || t === 11841 || t === 11842 || t >= 11843 && t <= 11855 || t >= 11856 && t <= 11857 || t === 11858 || t >= 11859 && t <= 11903 || t >= 12289 && t <= 12291 || t === 12296 || t === 12297 || t === 12298 || t === 12299 || t === 12300 || t === 12301 || t === 12302 || t === 12303 || t === 12304 || t === 12305 || t >= 12306 && t <= 12307 || t === 12308 || t === 12309 || t === 12310 || t === 12311 || t === 12312 || t === 12313 || t === 12314 || t === 12315 || t === 12316 || t === 12317 || t >= 12318 && t <= 12319 || t === 12320 || t === 12336 || t === 64830 || t === 64831 || t >= 65093 && t <= 65094;
}
function Ql(t) {
  t.forEach(function(e) {
    if (delete e.location, ba(e) || ga(e))
      for (var n in e.options)
        delete e.options[n].location, Ql(e.options[n].value);
    else
      Za(e) && fa(e.style) || (ma(e) || Ra(e)) && dl(e.style) ? delete e.style.location : Wa(e) && Ql(e.children);
  });
}
function Md(t, e) {
  e === void 0 && (e = {}), e = ee({ shouldParseSkeletons: !0, requiresOtherClause: !0 }, e);
  var n = new vd(t, e).parse();
  if (n.err) {
    var l = SyntaxError(O[n.err.kind]);
    throw l.location = n.err.location, l.originalMessage = n.err.message, l;
  }
  return e != null && e.captureLocation || Ql(n.val), n.val;
}
function Mn(t, e) {
  var n = e && e.cache ? e.cache : Pd, l = e && e.serializer ? e.serializer : Ld, i = e && e.strategy ? e.strategy : jd;
  return i(t, {
    cache: n,
    serializer: l
  });
}
function zd(t) {
  return t == null || typeof t == "number" || typeof t == "boolean";
}
function Ga(t, e, n, l) {
  var i = zd(l) ? l : n(l), s = e.get(i);
  return typeof s > "u" && (s = t.call(this, l), e.set(i, s)), s;
}
function Sa(t, e, n) {
  var l = Array.prototype.slice.call(arguments, 3), i = n(l), s = e.get(i);
  return typeof s > "u" && (s = t.apply(this, l), e.set(i, s)), s;
}
function Rl(t, e, n, l, i) {
  return n.bind(e, t, l, i);
}
function jd(t, e) {
  var n = t.length === 1 ? Ga : Sa;
  return Rl(t, this, n, e.cache.create(), e.serializer);
}
function Kd(t, e) {
  return Rl(t, this, Sa, e.cache.create(), e.serializer);
}
function Od(t, e) {
  return Rl(t, this, Ga, e.cache.create(), e.serializer);
}
var Ld = function() {
  return JSON.stringify(arguments);
};
function bl() {
  this.cache = /* @__PURE__ */ Object.create(null);
}
bl.prototype.get = function(t) {
  return this.cache[t];
};
bl.prototype.set = function(t, e) {
  this.cache[t] = e;
};
var Pd = {
  create: function() {
    return new bl();
  }
}, zn = {
  variadic: Kd,
  monadic: Od
}, Et;
(function(t) {
  t.MISSING_VALUE = "MISSING_VALUE", t.INVALID_VALUE = "INVALID_VALUE", t.MISSING_INTL_API = "MISSING_INTL_API";
})(Et || (Et = {}));
var Zn = (
  /** @class */
  function(t) {
    Vn(e, t);
    function e(n, l, i) {
      var s = t.call(this, n) || this;
      return s.code = l, s.originalMessage = i, s;
    }
    return e.prototype.toString = function() {
      return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
    }, e;
  }(Error)
), di = (
  /** @class */
  function(t) {
    Vn(e, t);
    function e(n, l, i, s) {
      return t.call(this, 'Invalid values for "'.concat(n, '": "').concat(l, '". Options are "').concat(Object.keys(i).join('", "'), '"'), Et.INVALID_VALUE, s) || this;
    }
    return e;
  }(Zn)
), qd = (
  /** @class */
  function(t) {
    Vn(e, t);
    function e(n, l, i) {
      return t.call(this, 'Value for "'.concat(n, '" must be of type ').concat(l), Et.INVALID_VALUE, i) || this;
    }
    return e;
  }(Zn)
), $d = (
  /** @class */
  function(t) {
    Vn(e, t);
    function e(n, l) {
      return t.call(this, 'The intl string context variable "'.concat(n, '" was not provided to the string "').concat(l, '"'), Et.MISSING_VALUE, l) || this;
    }
    return e;
  }(Zn)
), be;
(function(t) {
  t[t.literal = 0] = "literal", t[t.object = 1] = "object";
})(be || (be = {}));
function e0(t) {
  return t.length < 2 ? t : t.reduce(function(e, n) {
    var l = e[e.length - 1];
    return !l || l.type !== be.literal || n.type !== be.literal ? e.push(n) : l.value += n.value, e;
  }, []);
}
function t0(t) {
  return typeof t == "function";
}
function Fn(t, e, n, l, i, s, a) {
  if (t.length === 1 && ni(t[0]))
    return [
      {
        type: be.literal,
        value: t[0].value
      }
    ];
  for (var r = [], d = 0, o = t; d < o.length; d++) {
    var c = o[d];
    if (ni(c)) {
      r.push({
        type: be.literal,
        value: c.value
      });
      continue;
    }
    if (Ad(c)) {
      typeof s == "number" && r.push({
        type: be.literal,
        value: n.getNumberFormat(e).format(s)
      });
      continue;
    }
    var U = c.value;
    if (!(i && U in i))
      throw new $d(U, a);
    var F = i[U];
    if (ud(c)) {
      (!F || typeof F == "string" || typeof F == "number") && (F = typeof F == "string" || typeof F == "number" ? String(F) : ""), r.push({
        type: typeof F == "string" ? be.literal : be.object,
        value: F
      });
      continue;
    }
    if (ma(c)) {
      var h = typeof c.style == "string" ? l.date[c.style] : dl(c.style) ? c.style.parsedOptions : void 0;
      r.push({
        type: be.literal,
        value: n.getDateTimeFormat(e, h).format(F)
      });
      continue;
    }
    if (Ra(c)) {
      var h = typeof c.style == "string" ? l.time[c.style] : dl(c.style) ? c.style.parsedOptions : l.time.medium;
      r.push({
        type: be.literal,
        value: n.getDateTimeFormat(e, h).format(F)
      });
      continue;
    }
    if (Za(c)) {
      var h = typeof c.style == "string" ? l.number[c.style] : fa(c.style) ? c.style.parsedOptions : void 0;
      h && h.scale && (F = F * (h.scale || 1)), r.push({
        type: be.literal,
        value: n.getNumberFormat(e, h).format(F)
      });
      continue;
    }
    if (Wa(c)) {
      var u = c.children, R = c.value, V = i[R];
      if (!t0(V))
        throw new qd(R, "function", a);
      var I = Fn(u, e, n, l, i, s), W = V(I.map(function(p) {
        return p.value;
      }));
      Array.isArray(W) || (W = [W]), r.push.apply(r, W.map(function(p) {
        return {
          type: typeof p == "string" ? be.literal : be.object,
          value: p
        };
      }));
    }
    if (ba(c)) {
      var m = c.options[F] || c.options.other;
      if (!m)
        throw new di(c.value, F, Object.keys(c.options), a);
      r.push.apply(r, Fn(m.value, e, n, l, i));
      continue;
    }
    if (ga(c)) {
      var m = c.options["=".concat(F)];
      if (!m) {
        if (!Intl.PluralRules)
          throw new Zn(`Intl.PluralRules is not available in this environment.
Try polyfilling it using "@formatjs/intl-pluralrules"
`, Et.MISSING_INTL_API, a);
        var A = n.getPluralRules(e, { type: c.pluralType }).select(F - (c.offset || 0));
        m = c.options[A] || c.options.other;
      }
      if (!m)
        throw new di(c.value, F, Object.keys(c.options), a);
      r.push.apply(r, Fn(m.value, e, n, l, i, F - (c.offset || 0)));
      continue;
    }
  }
  return e0(r);
}
function n0(t, e) {
  return e ? ee(ee(ee({}, t || {}), e || {}), Object.keys(t).reduce(function(n, l) {
    return n[l] = ee(ee({}, t[l]), e[l] || {}), n;
  }, {})) : t;
}
function l0(t, e) {
  return e ? Object.keys(t).reduce(function(n, l) {
    return n[l] = n0(t[l], e[l]), n;
  }, ee({}, t)) : t;
}
function jn(t) {
  return {
    create: function() {
      return {
        get: function(e) {
          return t[e];
        },
        set: function(e, n) {
          t[e] = n;
        }
      };
    }
  };
}
function i0(t) {
  return t === void 0 && (t = {
    number: {},
    dateTime: {},
    pluralRules: {}
  }), {
    getNumberFormat: Mn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.NumberFormat).bind.apply(e, Dn([void 0], n, !1)))();
    }, {
      cache: jn(t.number),
      strategy: zn.variadic
    }),
    getDateTimeFormat: Mn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.DateTimeFormat).bind.apply(e, Dn([void 0], n, !1)))();
    }, {
      cache: jn(t.dateTime),
      strategy: zn.variadic
    }),
    getPluralRules: Mn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.PluralRules).bind.apply(e, Dn([void 0], n, !1)))();
    }, {
      cache: jn(t.pluralRules),
      strategy: zn.variadic
    })
  };
}
var a0 = (
  /** @class */
  function() {
    function t(e, n, l, i) {
      var s = this;
      if (n === void 0 && (n = t.defaultLocale), this.formatterCache = {
        number: {},
        dateTime: {},
        pluralRules: {}
      }, this.format = function(a) {
        var r = s.formatToParts(a);
        if (r.length === 1)
          return r[0].value;
        var d = r.reduce(function(o, c) {
          return !o.length || c.type !== be.literal || typeof o[o.length - 1] != "string" ? o.push(c.value) : o[o.length - 1] += c.value, o;
        }, []);
        return d.length <= 1 ? d[0] || "" : d;
      }, this.formatToParts = function(a) {
        return Fn(s.ast, s.locales, s.formatters, s.formats, a, void 0, s.message);
      }, this.resolvedOptions = function() {
        return {
          locale: s.resolvedLocale.toString()
        };
      }, this.getAst = function() {
        return s.ast;
      }, this.locales = n, this.resolvedLocale = t.resolveLocale(n), typeof e == "string") {
        if (this.message = e, !t.__parse)
          throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");
        this.ast = t.__parse(e, {
          ignoreTag: i == null ? void 0 : i.ignoreTag,
          locale: this.resolvedLocale
        });
      } else
        this.ast = e;
      if (!Array.isArray(this.ast))
        throw new TypeError("A message must be provided as a String or AST.");
      this.formats = l0(t.formats, l), this.formatters = i && i.formatters || i0(this.formatterCache);
    }
    return Object.defineProperty(t, "defaultLocale", {
      get: function() {
        return t.memoizedDefaultLocale || (t.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale), t.memoizedDefaultLocale;
      },
      enumerable: !1,
      configurable: !0
    }), t.memoizedDefaultLocale = null, t.resolveLocale = function(e) {
      var n = Intl.NumberFormat.supportedLocalesOf(e);
      return n.length > 0 ? new Intl.Locale(n[0]) : new Intl.Locale(typeof e == "string" ? e : e[0]);
    }, t.__parse = Md, t.formats = {
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
    }, t;
  }()
);
function s0(t, e) {
  if (e == null)
    return;
  if (e in t)
    return t[e];
  const n = e.split(".");
  let l = t;
  for (let i = 0; i < n.length; i++)
    if (typeof l == "object") {
      if (i > 0) {
        const s = n.slice(i, n.length).join(".");
        if (s in l) {
          l = l[s];
          break;
        }
      }
      l = l[n[i]];
    } else
      l = void 0;
  return l;
}
const st = {}, r0 = (t, e, n) => n && (e in st || (st[e] = {}), t in st[e] || (st[e][t] = n), n), Xa = (t, e) => {
  if (e == null)
    return;
  if (e in st && t in st[e])
    return st[e][t];
  const n = mn(e);
  for (let l = 0; l < n.length; l++) {
    const i = n[l], s = d0(i, t);
    if (s)
      return r0(t, e, s);
  }
};
let gl;
const Pt = Lt({});
function o0(t) {
  return gl[t] || null;
}
function ka(t) {
  return t in gl;
}
function d0(t, e) {
  if (!ka(t))
    return null;
  const n = o0(t);
  return s0(n, e);
}
function c0(t) {
  if (t == null)
    return;
  const e = mn(t);
  for (let n = 0; n < e.length; n++) {
    const l = e[n];
    if (ka(l))
      return l;
  }
}
function F0(t, ...e) {
  delete st[t], Pt.update((n) => (n[t] = Bd.all([n[t] || {}, ...e]), n));
}
Yt(
  [Pt],
  ([t]) => Object.keys(t)
);
Pt.subscribe((t) => gl = t);
const Un = {};
function U0(t, e) {
  Un[t].delete(e), Un[t].size === 0 && delete Un[t];
}
function Ya(t) {
  return Un[t];
}
function h0(t) {
  return mn(t).map((e) => {
    const n = Ya(e);
    return [e, n ? [...n] : []];
  }).filter(([, e]) => e.length > 0);
}
function Bl(t) {
  return t == null ? !1 : mn(t).some(
    (e) => {
      var n;
      return (n = Ya(e)) == null ? void 0 : n.size;
    }
  );
}
function Q0(t, e) {
  return Promise.all(
    e.map((l) => (U0(t, l), l().then((i) => i.default || i)))
  ).then((l) => F0(t, ...l));
}
const xt = {};
function Ta(t) {
  if (!Bl(t))
    return t in xt ? xt[t] : Promise.resolve();
  const e = h0(t);
  return xt[t] = Promise.all(
    e.map(
      ([n, l]) => Q0(n, l)
    )
  ).then(() => {
    if (Bl(t))
      return Ta(t);
    delete xt[t];
  }), xt[t];
}
const B0 = {
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
}, u0 = {
  fallbackLocale: null,
  loadingDelay: 200,
  formats: B0,
  warnOnMissingMessages: !0,
  handleMissingMessage: void 0,
  ignoreTag: !0
}, A0 = u0;
function yt() {
  return A0;
}
const Kn = Lt(!1);
var V0 = Object.defineProperty, Z0 = Object.defineProperties, m0 = Object.getOwnPropertyDescriptors, ci = Object.getOwnPropertySymbols, R0 = Object.prototype.hasOwnProperty, b0 = Object.prototype.propertyIsEnumerable, Fi = (t, e, n) => e in t ? V0(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, g0 = (t, e) => {
  for (var n in e || (e = {}))
    R0.call(e, n) && Fi(t, n, e[n]);
  if (ci)
    for (var n of ci(e))
      b0.call(e, n) && Fi(t, n, e[n]);
  return t;
}, W0 = (t, e) => Z0(t, m0(e));
let ul;
const hn = Lt(null);
function Ui(t) {
  return t.split("-").map((e, n, l) => l.slice(0, n + 1).join("-")).reverse();
}
function mn(t, e = yt().fallbackLocale) {
  const n = Ui(t);
  return e ? [.../* @__PURE__ */ new Set([...n, ...Ui(e)])] : n;
}
function mt() {
  return ul ?? void 0;
}
hn.subscribe((t) => {
  ul = t ?? void 0, typeof window < "u" && t != null && document.documentElement.setAttribute("lang", t);
});
const f0 = (t) => {
  if (t && c0(t) && Bl(t)) {
    const { loadingDelay: e } = yt();
    let n;
    return typeof window < "u" && mt() != null && e ? n = window.setTimeout(
      () => Kn.set(!0),
      e
    ) : Kn.set(!0), Ta(t).then(() => {
      hn.set(t);
    }).finally(() => {
      clearTimeout(n), Kn.set(!1);
    });
  }
  return hn.set(t);
}, qt = W0(g0({}, hn), {
  set: f0
}), Rn = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (l) => {
    const i = JSON.stringify(l);
    return i in e ? e[i] : e[i] = t(l);
  };
};
var I0 = Object.defineProperty, Qn = Object.getOwnPropertySymbols, _a = Object.prototype.hasOwnProperty, wa = Object.prototype.propertyIsEnumerable, hi = (t, e, n) => e in t ? I0(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Wl = (t, e) => {
  for (var n in e || (e = {}))
    _a.call(e, n) && hi(t, n, e[n]);
  if (Qn)
    for (var n of Qn(e))
      wa.call(e, n) && hi(t, n, e[n]);
  return t;
}, Tt = (t, e) => {
  var n = {};
  for (var l in t)
    _a.call(t, l) && e.indexOf(l) < 0 && (n[l] = t[l]);
  if (t != null && Qn)
    for (var l of Qn(t))
      e.indexOf(l) < 0 && wa.call(t, l) && (n[l] = t[l]);
  return n;
};
const Kt = (t, e) => {
  const { formats: n } = yt();
  if (t in n && e in n[t])
    return n[t][e];
  throw new Error(`[svelte-i18n] Unknown "${e}" ${t} format.`);
}, p0 = Rn(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = Tt(e, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
    return l && (i = Kt("number", l)), new Intl.NumberFormat(n, i);
  }
), J0 = Rn(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = Tt(e, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format dates');
    return l ? i = Kt("date", l) : Object.keys(i).length === 0 && (i = Kt("date", "short")), new Intl.DateTimeFormat(n, i);
  }
), C0 = Rn(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = Tt(e, ["locale", "format"]);
    if (n == null)
      throw new Error(
        '[svelte-i18n] A "locale" must be set to format time values'
      );
    return l ? i = Kt("time", l) : Object.keys(i).length === 0 && (i = Kt("time", "short")), new Intl.DateTimeFormat(n, i);
  }
), N0 = (t = {}) => {
  var e = t, {
    locale: n = mt()
  } = e, l = Tt(e, [
    "locale"
  ]);
  return p0(Wl({ locale: n }, l));
}, E0 = (t = {}) => {
  var e = t, {
    locale: n = mt()
  } = e, l = Tt(e, [
    "locale"
  ]);
  return J0(Wl({ locale: n }, l));
}, y0 = (t = {}) => {
  var e = t, {
    locale: n = mt()
  } = e, l = Tt(e, [
    "locale"
  ]);
  return C0(Wl({ locale: n }, l));
}, G0 = Rn(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (t, e = mt()) => new a0(t, e, yt().formats, {
    ignoreTag: yt().ignoreTag
  })
), S0 = (t, e = {}) => {
  var n, l, i, s;
  let a = e;
  typeof t == "object" && (a = t, t = a.id);
  const {
    values: r,
    locale: d = mt(),
    default: o
  } = a;
  if (d == null)
    throw new Error(
      "[svelte-i18n] Cannot format a message without first setting the initial locale."
    );
  let c = Xa(t, d);
  if (!c)
    c = (s = (i = (l = (n = yt()).handleMissingMessage) == null ? void 0 : l.call(n, { locale: d, id: t, defaultValue: o })) != null ? i : o) != null ? s : t;
  else if (typeof c != "string")
    return console.warn(
      `[svelte-i18n] Message with id "${t}" must be of type "string", found: "${typeof c}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`
    ), c;
  if (!r)
    return c;
  let U = c;
  try {
    U = G0(c, d).format(r);
  } catch (F) {
    F instanceof Error && console.warn(
      `[svelte-i18n] Message "${t}" has syntax error:`,
      F.message
    );
  }
  return U;
}, X0 = (t, e) => y0(e).format(t), k0 = (t, e) => E0(e).format(t), Y0 = (t, e) => N0(e).format(t), T0 = (t, e = mt()) => Xa(t, e);
Yt([qt, Pt], () => S0);
Yt([qt], () => X0);
Yt([qt], () => k0);
Yt([qt], () => Y0);
Yt([qt, Pt], () => T0);
const {
  SvelteComponent: _0,
  append: Qi,
  attr: Le,
  binding_callbacks: w0,
  bubble: Ft,
  create_slot: v0,
  detach: H0,
  element: Bi,
  get_all_dirty_from_scope: D0,
  get_slot_changes: x0,
  init: M0,
  insert: z0,
  listen: ye,
  prevent_default: Ut,
  run_all: j0,
  safe_not_equal: K0,
  set_style: ui,
  space: O0,
  stop_propagation: ht,
  toggle_class: it,
  transition_in: L0,
  transition_out: P0,
  update_slot_base: q0
} = window.__gradio__svelte__internal, { createEventDispatcher: $0, tick: ec, getContext: tc } = window.__gradio__svelte__internal;
function nc(t) {
  let e, n, l, i, s, a, r, d, o;
  const c = (
    /*#slots*/
    t[17].default
  ), U = v0(
    c,
    t,
    /*$$scope*/
    t[16],
    null
  );
  return {
    c() {
      e = Bi("button"), U && U.c(), n = O0(), l = Bi("input"), Le(l, "type", "file"), Le(
        l,
        "accept",
        /*filetype*/
        t[0]
      ), l.multiple = i = /*file_count*/
      t[4] === "multiple" || void 0, Le(l, "webkitdirectory", s = /*file_count*/
      t[4] === "directory" || void 0), Le(l, "mozdirectory", a = /*file_count*/
      t[4] === "directory" || void 0), Le(l, "class", "svelte-a356bc"), Le(e, "class", "svelte-a356bc"), it(
        e,
        "hidden",
        /*hidden*/
        t[5]
      ), it(
        e,
        "center",
        /*center*/
        t[2]
      ), it(
        e,
        "boundedheight",
        /*boundedheight*/
        t[1]
      ), it(
        e,
        "flex",
        /*flex*/
        t[3]
      ), ui(
        e,
        "height",
        /*include_sources*/
        t[6] ? "calc(100% - 40px" : "100%"
      );
    },
    m(F, h) {
      z0(F, e, h), U && U.m(e, null), Qi(e, n), Qi(e, l), t[25](l), r = !0, d || (o = [
        ye(
          l,
          "change",
          /*load_files_from_upload*/
          t[10]
        ),
        ye(e, "drag", ht(Ut(
          /*drag_handler*/
          t[18]
        ))),
        ye(e, "dragstart", ht(Ut(
          /*dragstart_handler*/
          t[19]
        ))),
        ye(e, "dragend", ht(Ut(
          /*dragend_handler*/
          t[20]
        ))),
        ye(e, "dragover", ht(Ut(
          /*dragover_handler*/
          t[21]
        ))),
        ye(e, "dragenter", ht(Ut(
          /*dragenter_handler*/
          t[22]
        ))),
        ye(e, "dragleave", ht(Ut(
          /*dragleave_handler*/
          t[23]
        ))),
        ye(e, "drop", ht(Ut(
          /*drop_handler*/
          t[24]
        ))),
        ye(
          e,
          "click",
          /*open_file_upload*/
          t[7]
        ),
        ye(
          e,
          "drop",
          /*loadFilesFromDrop*/
          t[11]
        ),
        ye(
          e,
          "dragenter",
          /*updateDragging*/
          t[9]
        ),
        ye(
          e,
          "dragleave",
          /*updateDragging*/
          t[9]
        )
      ], d = !0);
    },
    p(F, [h]) {
      U && U.p && (!r || h & /*$$scope*/
      65536) && q0(
        U,
        c,
        F,
        /*$$scope*/
        F[16],
        r ? x0(
          c,
          /*$$scope*/
          F[16],
          h,
          null
        ) : D0(
          /*$$scope*/
          F[16]
        ),
        null
      ), (!r || h & /*filetype*/
      1) && Le(
        l,
        "accept",
        /*filetype*/
        F[0]
      ), (!r || h & /*file_count*/
      16 && i !== (i = /*file_count*/
      F[4] === "multiple" || void 0)) && (l.multiple = i), (!r || h & /*file_count*/
      16 && s !== (s = /*file_count*/
      F[4] === "directory" || void 0)) && Le(l, "webkitdirectory", s), (!r || h & /*file_count*/
      16 && a !== (a = /*file_count*/
      F[4] === "directory" || void 0)) && Le(l, "mozdirectory", a), (!r || h & /*hidden*/
      32) && it(
        e,
        "hidden",
        /*hidden*/
        F[5]
      ), (!r || h & /*center*/
      4) && it(
        e,
        "center",
        /*center*/
        F[2]
      ), (!r || h & /*boundedheight*/
      2) && it(
        e,
        "boundedheight",
        /*boundedheight*/
        F[1]
      ), (!r || h & /*flex*/
      8) && it(
        e,
        "flex",
        /*flex*/
        F[3]
      ), h & /*include_sources*/
      64 && ui(
        e,
        "height",
        /*include_sources*/
        F[6] ? "calc(100% - 40px" : "100%"
      );
    },
    i(F) {
      r || (L0(U, F), r = !0);
    },
    o(F) {
      P0(U, F), r = !1;
    },
    d(F) {
      F && H0(e), U && U.d(F), t[25](null), d = !1, j0(o);
    }
  };
}
function On(t) {
  let e, n = t[0], l = 1;
  for (; l < t.length; ) {
    const i = t[l], s = t[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (e = n, n = s(n)) : (i === "call" || i === "optionalCall") && (n = s((...a) => n.call(e, ...a)), e = void 0);
  }
  return n;
}
function lc(t, e) {
  return !t || t === "*" ? !0 : t.endsWith("/*") ? e.startsWith(t.slice(0, -1)) : t === e;
}
function ic(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e, { filetype: s = null } = e, { dragging: a = !1 } = e, { boundedheight: r = !0 } = e, { center: d = !0 } = e, { flex: o = !0 } = e, { file_count: c = "single" } = e, { disable_click: U = !1 } = e, { root: F } = e, { hidden: h = !1 } = e, { include_sources: u = !1 } = e;
  const R = tc("upload_files");
  let V;
  const I = $0();
  function W() {
    n(12, a = !a);
  }
  function m() {
    U || (n(8, V.value = "", V), V.click());
  }
  async function A(Q) {
    await ec();
    const g = await rs(Q, F, R);
    return I("load", c === "single" ? On([g, "optionalAccess", (X) => X[0]]) : g), g || [];
  }
  async function p(Q) {
    if (!Q.length)
      return;
    let g = Q.map((y) => new File([y], y.name)), X = await os(g);
    return await A(X);
  }
  async function z(Q) {
    const g = Q.target;
    g.files && await p(Array.from(g.files));
  }
  async function H(Q) {
    if (n(12, a = !1), !On([Q, "access", (X) => X.dataTransfer, "optionalAccess", (X) => X.files]))
      return;
    const g = Array.from(Q.dataTransfer.files).filter((X) => On([
      s,
      "optionalAccess",
      (y) => y.split,
      "call",
      (y) => y(","),
      "access",
      (y) => y.some,
      "call",
      (y) => y((K) => lc(K, X.type))
    ]) ? !0 : (I("error", `Invalid file type only ${s} allowed.`), !1));
    await p(g);
  }
  function k(Q) {
    Ft.call(this, t, Q);
  }
  function N(Q) {
    Ft.call(this, t, Q);
  }
  function J(Q) {
    Ft.call(this, t, Q);
  }
  function S(Q) {
    Ft.call(this, t, Q);
  }
  function me(Q) {
    Ft.call(this, t, Q);
  }
  function ae(Q) {
    Ft.call(this, t, Q);
  }
  function Y(Q) {
    Ft.call(this, t, Q);
  }
  function v(Q) {
    w0[Q ? "unshift" : "push"](() => {
      V = Q, n(8, V);
    });
  }
  return t.$$set = (Q) => {
    "filetype" in Q && n(0, s = Q.filetype), "dragging" in Q && n(12, a = Q.dragging), "boundedheight" in Q && n(1, r = Q.boundedheight), "center" in Q && n(2, d = Q.center), "flex" in Q && n(3, o = Q.flex), "file_count" in Q && n(4, c = Q.file_count), "disable_click" in Q && n(13, U = Q.disable_click), "root" in Q && n(14, F = Q.root), "hidden" in Q && n(5, h = Q.hidden), "include_sources" in Q && n(6, u = Q.include_sources), "$$scope" in Q && n(16, i = Q.$$scope);
  }, [
    s,
    r,
    d,
    o,
    c,
    h,
    u,
    m,
    V,
    W,
    z,
    H,
    a,
    U,
    F,
    p,
    i,
    l,
    k,
    N,
    J,
    S,
    me,
    ae,
    Y,
    v
  ];
}
class ac extends _0 {
  constructor(e) {
    super(), M0(this, e, ic, nc, K0, {
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
  SvelteComponent: sc,
  append: Ai,
  attr: rc,
  check_outros: Vi,
  create_component: fl,
  destroy_component: Il,
  detach: oc,
  element: dc,
  group_outros: Zi,
  init: cc,
  insert: Fc,
  mount_component: pl,
  safe_not_equal: Uc,
  set_style: mi,
  space: Ri,
  toggle_class: bi,
  transition_in: Pe,
  transition_out: Bt
} = window.__gradio__svelte__internal, { createEventDispatcher: hc } = window.__gradio__svelte__internal;
function gi(t) {
  let e, n;
  return e = new An({
    props: {
      Icon: Mr,
      label: (
        /*i18n*/
        t[3]("common.edit")
      )
    }
  }), e.$on(
    "click",
    /*click_handler*/
    t[5]
  ), {
    c() {
      fl(e.$$.fragment);
    },
    m(l, i) {
      pl(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*i18n*/
      8 && (s.label = /*i18n*/
      l[3]("common.edit")), e.$set(s);
    },
    i(l) {
      n || (Pe(e.$$.fragment, l), n = !0);
    },
    o(l) {
      Bt(e.$$.fragment, l), n = !1;
    },
    d(l) {
      Il(e, l);
    }
  };
}
function Wi(t) {
  let e, n;
  return e = new An({
    props: {
      Icon: io,
      label: (
        /*i18n*/
        t[3]("common.undo")
      )
    }
  }), e.$on(
    "click",
    /*click_handler_1*/
    t[6]
  ), {
    c() {
      fl(e.$$.fragment);
    },
    m(l, i) {
      pl(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*i18n*/
      8 && (s.label = /*i18n*/
      l[3]("common.undo")), e.$set(s);
    },
    i(l) {
      n || (Pe(e.$$.fragment, l), n = !0);
    },
    o(l) {
      Bt(e.$$.fragment, l), n = !1;
    },
    d(l) {
      Il(e, l);
    }
  };
}
function Qc(t) {
  let e, n, l, i, s, a = (
    /*editable*/
    t[0] && gi(t)
  ), r = (
    /*undoable*/
    t[1] && Wi(t)
  );
  return i = new An({
    props: {
      Icon: Cr,
      label: (
        /*i18n*/
        t[3]("common.clear")
      )
    }
  }), i.$on(
    "click",
    /*click_handler_2*/
    t[7]
  ), {
    c() {
      e = dc("div"), a && a.c(), n = Ri(), r && r.c(), l = Ri(), fl(i.$$.fragment), rc(e, "class", "svelte-1wj0ocy"), bi(e, "not-absolute", !/*absolute*/
      t[2]), mi(
        e,
        "position",
        /*absolute*/
        t[2] ? "absolute" : "static"
      );
    },
    m(d, o) {
      Fc(d, e, o), a && a.m(e, null), Ai(e, n), r && r.m(e, null), Ai(e, l), pl(i, e, null), s = !0;
    },
    p(d, [o]) {
      /*editable*/
      d[0] ? a ? (a.p(d, o), o & /*editable*/
      1 && Pe(a, 1)) : (a = gi(d), a.c(), Pe(a, 1), a.m(e, n)) : a && (Zi(), Bt(a, 1, 1, () => {
        a = null;
      }), Vi()), /*undoable*/
      d[1] ? r ? (r.p(d, o), o & /*undoable*/
      2 && Pe(r, 1)) : (r = Wi(d), r.c(), Pe(r, 1), r.m(e, l)) : r && (Zi(), Bt(r, 1, 1, () => {
        r = null;
      }), Vi());
      const c = {};
      o & /*i18n*/
      8 && (c.label = /*i18n*/
      d[3]("common.clear")), i.$set(c), (!s || o & /*absolute*/
      4) && bi(e, "not-absolute", !/*absolute*/
      d[2]), o & /*absolute*/
      4 && mi(
        e,
        "position",
        /*absolute*/
        d[2] ? "absolute" : "static"
      );
    },
    i(d) {
      s || (Pe(a), Pe(r), Pe(i.$$.fragment, d), s = !0);
    },
    o(d) {
      Bt(a), Bt(r), Bt(i.$$.fragment, d), s = !1;
    },
    d(d) {
      d && oc(e), a && a.d(), r && r.d(), Il(i);
    }
  };
}
function Bc(t, e, n) {
  let { editable: l = !1 } = e, { undoable: i = !1 } = e, { absolute: s = !0 } = e, { i18n: a } = e;
  const r = hc(), d = () => r("edit"), o = () => r("undo"), c = (U) => {
    r("clear"), U.stopPropagation();
  };
  return t.$$set = (U) => {
    "editable" in U && n(0, l = U.editable), "undoable" in U && n(1, i = U.undoable), "absolute" in U && n(2, s = U.absolute), "i18n" in U && n(3, a = U.i18n);
  }, [
    l,
    i,
    s,
    a,
    r,
    d,
    o,
    c
  ];
}
class uc extends sc {
  constructor(e) {
    super(), cc(this, e, Bc, Qc, Uc, {
      editable: 0,
      undoable: 1,
      absolute: 2,
      i18n: 3
    });
  }
}
const {
  SvelteComponent: Ac,
  add_flush_callback: Vc,
  append: fi,
  attr: Ii,
  bind: Zc,
  binding_callbacks: va,
  check_outros: mc,
  create_component: Jl,
  create_slot: Rc,
  destroy_component: Cl,
  detach: Al,
  element: pi,
  empty: bc,
  get_all_dirty_from_scope: gc,
  get_slot_changes: Wc,
  group_outros: fc,
  init: Ic,
  insert: Vl,
  mount_component: Nl,
  safe_not_equal: pc,
  space: Ha,
  transition_in: pt,
  transition_out: Jt,
  update_slot_base: Jc
} = window.__gradio__svelte__internal, { createEventDispatcher: Cc, tick: Ji, onMount: Nc } = window.__gradio__svelte__internal;
function Ec(t) {
  let e, n, l, i, s;
  return n = new uc({
    props: { i18n: (
      /*i18n*/
      t[4]
    ), absolute: !0 }
  }), n.$on(
    "clear",
    /*handle_clear*/
    t[8]
  ), {
    c() {
      e = pi("div"), Jl(n.$$.fragment), l = Ha(), i = pi("canvas"), Ii(i, "class", "svelte-pxj656"), Ii(e, "class", "input-model svelte-pxj656");
    },
    m(a, r) {
      Vl(a, e, r), Nl(n, e, null), fi(e, l), fi(e, i), t[15](i), s = !0;
    },
    p(a, r) {
      const d = {};
      r & /*i18n*/
      16 && (d.i18n = /*i18n*/
      a[4]), n.$set(d);
    },
    i(a) {
      s || (pt(n.$$.fragment, a), s = !0);
    },
    o(a) {
      Jt(n.$$.fragment, a), s = !1;
    },
    d(a) {
      a && Al(e), Cl(n), t[15](null);
    }
  };
}
function yc(t) {
  let e, n, l;
  function i(a) {
    t[14](a);
  }
  let s = {
    root: (
      /*root*/
      t[3]
    ),
    filetype: ".ply, .splat",
    $$slots: { default: [Gc] },
    $$scope: { ctx: t }
  };
  return (
    /*dragging*/
    t[6] !== void 0 && (s.dragging = /*dragging*/
    t[6]), e = new ac({ props: s }), va.push(() => Zc(e, "dragging", i)), e.$on(
      "load",
      /*handle_upload*/
      t[7]
    ), {
      c() {
        Jl(e.$$.fragment);
      },
      m(a, r) {
        Nl(e, a, r), l = !0;
      },
      p(a, r) {
        const d = {};
        r & /*root*/
        8 && (d.root = /*root*/
        a[3]), r & /*$$scope*/
        65536 && (d.$$scope = { dirty: r, ctx: a }), !n && r & /*dragging*/
        64 && (n = !0, d.dragging = /*dragging*/
        a[6], Vc(() => n = !1)), e.$set(d);
      },
      i(a) {
        l || (pt(e.$$.fragment, a), l = !0);
      },
      o(a) {
        Jt(e.$$.fragment, a), l = !1;
      },
      d(a) {
        Cl(e, a);
      }
    }
  );
}
function Gc(t) {
  let e;
  const n = (
    /*#slots*/
    t[13].default
  ), l = Rc(
    n,
    t,
    /*$$scope*/
    t[16],
    null
  );
  return {
    c() {
      l && l.c();
    },
    m(i, s) {
      l && l.m(i, s), e = !0;
    },
    p(i, s) {
      l && l.p && (!e || s & /*$$scope*/
      65536) && Jc(
        l,
        n,
        i,
        /*$$scope*/
        i[16],
        e ? Wc(
          n,
          /*$$scope*/
          i[16],
          s,
          null
        ) : gc(
          /*$$scope*/
          i[16]
        ),
        null
      );
    },
    i(i) {
      e || (pt(l, i), e = !0);
    },
    o(i) {
      Jt(l, i), e = !1;
    },
    d(i) {
      l && l.d(i);
    }
  };
}
function Sc(t) {
  let e, n, l, i, s, a;
  e = new un({
    props: {
      show_label: (
        /*show_label*/
        t[2]
      ),
      Icon: Ot,
      label: (
        /*label*/
        t[1] || "Splat"
      )
    }
  });
  const r = [yc, Ec], d = [];
  function o(c, U) {
    return (
      /*value*/
      c[0] === null ? 0 : 1
    );
  }
  return l = o(t), i = d[l] = r[l](t), {
    c() {
      Jl(e.$$.fragment), n = Ha(), i.c(), s = bc();
    },
    m(c, U) {
      Nl(e, c, U), Vl(c, n, U), d[l].m(c, U), Vl(c, s, U), a = !0;
    },
    p(c, [U]) {
      const F = {};
      U & /*show_label*/
      4 && (F.show_label = /*show_label*/
      c[2]), U & /*label*/
      2 && (F.label = /*label*/
      c[1] || "Splat"), e.$set(F);
      let h = l;
      l = o(c), l === h ? d[l].p(c, U) : (fc(), Jt(d[h], 1, 1, () => {
        d[h] = null;
      }), mc(), i = d[l], i ? i.p(c, U) : (i = d[l] = r[l](c), i.c()), pt(i, 1), i.m(s.parentNode, s));
    },
    i(c) {
      a || (pt(e.$$.fragment, c), pt(i), a = !0);
    },
    o(c) {
      Jt(e.$$.fragment, c), Jt(i), a = !1;
    },
    d(c) {
      c && (Al(n), Al(s)), Cl(e, c), d[l].d(c);
    }
  };
}
function Xc(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { value: a } = e, { label: r = "" } = e, { show_label: d } = e, { root: o } = e, { i18n: c } = e, { zoom_speed: U = 1 } = e, { pan_speed: F = 1 } = e, h = !1, u, R, V, I = null, W, m = null;
  function A() {
    if (m !== null && (cancelAnimationFrame(m), m = null), I !== null && (I.dispose(), I = null), R = new ia(), V = new la(), I = new da(u), W = new ca(V, u), W.zoomSpeed = U, W.panSpeed = F, !a)
      return;
    let S = !1;
    const me = async () => {
      if (S) {
        console.error("Already loading");
        return;
      }
      if (S = !0, a.url.endsWith(".ply"))
        await ml.LoadAsync(a.url, R, (Y) => {
        });
      else if (a.url.endsWith(".splat"))
        await aa.LoadAsync(a.url, R, (Y) => {
        });
      else
        throw new Error("Unsupported file type");
      S = !1;
    }, ae = () => {
      if (I) {
        if (S) {
          m = requestAnimationFrame(ae);
          return;
        }
        W.update(), I.render(R, V), m = requestAnimationFrame(ae);
      }
    };
    me(), m = requestAnimationFrame(ae);
  }
  Nc(() => {
    a != null && A(), n(11, h = !0);
  });
  async function p({ detail: S }) {
    n(0, a = S), await Ji(), A(), H("change", a), H("load", a);
  }
  async function z() {
    n(0, a = null), I && (I.dispose(), I = null), await Ji(), H("clear"), H("change");
  }
  const H = Cc();
  let k = !1;
  function N(S) {
    k = S, n(6, k);
  }
  function J(S) {
    va[S ? "unshift" : "push"](() => {
      u = S, n(5, u);
    });
  }
  return t.$$set = (S) => {
    "value" in S && n(0, a = S.value), "label" in S && n(1, r = S.label), "show_label" in S && n(2, d = S.show_label), "root" in S && n(3, o = S.root), "i18n" in S && n(4, c = S.i18n), "zoom_speed" in S && n(9, U = S.zoom_speed), "pan_speed" in S && n(10, F = S.pan_speed), "$$scope" in S && n(16, s = S.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty & /*value*/
    1 && n(12, { path: l } = a || { path: void 0 }, l), t.$$.dirty & /*canvas, mounted, path*/
    6176 && u && h && l != null && A(), t.$$.dirty & /*dragging*/
    64 && H("drag", k);
  }, [
    a,
    r,
    d,
    o,
    c,
    u,
    k,
    p,
    z,
    U,
    F,
    h,
    l,
    i,
    N,
    J,
    s
  ];
}
class kc extends Ac {
  constructor(e) {
    super(), Ic(this, e, Xc, Sc, pc, {
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
function Wt(t) {
  let e = ["", "k", "M", "G", "T", "P", "E", "Z"], n = 0;
  for (; t > 1e3 && n < e.length - 1; )
    t /= 1e3, n++;
  let l = e[n];
  return (Number.isInteger(t) ? t : t.toFixed(1)) + l;
}
const {
  SvelteComponent: Yc,
  append: ve,
  attr: q,
  component_subscribe: Ci,
  detach: Tc,
  element: _c,
  init: wc,
  insert: vc,
  noop: Ni,
  safe_not_equal: Hc,
  set_style: sn,
  svg_element: He,
  toggle_class: Ei
} = window.__gradio__svelte__internal, { onMount: Dc } = window.__gradio__svelte__internal;
function xc(t) {
  let e, n, l, i, s, a, r, d, o, c, U, F;
  return {
    c() {
      e = _c("div"), n = He("svg"), l = He("g"), i = He("path"), s = He("path"), a = He("path"), r = He("path"), d = He("g"), o = He("path"), c = He("path"), U = He("path"), F = He("path"), q(i, "d", "M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z"), q(i, "fill", "#FF7C00"), q(i, "fill-opacity", "0.4"), q(i, "class", "svelte-43sxxs"), q(s, "d", "M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z"), q(s, "fill", "#FF7C00"), q(s, "class", "svelte-43sxxs"), q(a, "d", "M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z"), q(a, "fill", "#FF7C00"), q(a, "fill-opacity", "0.4"), q(a, "class", "svelte-43sxxs"), q(r, "d", "M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z"), q(r, "fill", "#FF7C00"), q(r, "class", "svelte-43sxxs"), sn(l, "transform", "translate(" + /*$top*/
      t[1][0] + "px, " + /*$top*/
      t[1][1] + "px)"), q(o, "d", "M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z"), q(o, "fill", "#FF7C00"), q(o, "fill-opacity", "0.4"), q(o, "class", "svelte-43sxxs"), q(c, "d", "M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z"), q(c, "fill", "#FF7C00"), q(c, "class", "svelte-43sxxs"), q(U, "d", "M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z"), q(U, "fill", "#FF7C00"), q(U, "fill-opacity", "0.4"), q(U, "class", "svelte-43sxxs"), q(F, "d", "M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z"), q(F, "fill", "#FF7C00"), q(F, "class", "svelte-43sxxs"), sn(d, "transform", "translate(" + /*$bottom*/
      t[2][0] + "px, " + /*$bottom*/
      t[2][1] + "px)"), q(n, "viewBox", "-1200 -1200 3000 3000"), q(n, "fill", "none"), q(n, "xmlns", "http://www.w3.org/2000/svg"), q(n, "class", "svelte-43sxxs"), q(e, "class", "svelte-43sxxs"), Ei(
        e,
        "margin",
        /*margin*/
        t[0]
      );
    },
    m(h, u) {
      vc(h, e, u), ve(e, n), ve(n, l), ve(l, i), ve(l, s), ve(l, a), ve(l, r), ve(n, d), ve(d, o), ve(d, c), ve(d, U), ve(d, F);
    },
    p(h, [u]) {
      u & /*$top*/
      2 && sn(l, "transform", "translate(" + /*$top*/
      h[1][0] + "px, " + /*$top*/
      h[1][1] + "px)"), u & /*$bottom*/
      4 && sn(d, "transform", "translate(" + /*$bottom*/
      h[2][0] + "px, " + /*$bottom*/
      h[2][1] + "px)"), u & /*margin*/
      1 && Ei(
        e,
        "margin",
        /*margin*/
        h[0]
      );
    },
    i: Ni,
    o: Ni,
    d(h) {
      h && Tc(e);
    }
  };
}
function Mc(t, e, n) {
  let l, i, { margin: s = !0 } = e;
  const a = ei([0, 0]);
  Ci(t, a, (F) => n(1, l = F));
  const r = ei([0, 0]);
  Ci(t, r, (F) => n(2, i = F));
  let d;
  async function o() {
    await Promise.all([a.set([125, 140]), r.set([-125, -140])]), await Promise.all([a.set([-125, 140]), r.set([125, -140])]), await Promise.all([a.set([-125, 0]), r.set([125, -0])]), await Promise.all([a.set([125, 0]), r.set([-125, 0])]);
  }
  async function c() {
    await o(), d || c();
  }
  async function U() {
    await Promise.all([a.set([125, 0]), r.set([-125, 0])]), c();
  }
  return Dc(() => (U(), () => d = !0)), t.$$set = (F) => {
    "margin" in F && n(0, s = F.margin);
  }, [s, l, i, a, r];
}
class zc extends Yc {
  constructor(e) {
    super(), wc(this, e, Mc, xc, Hc, { margin: 0 });
  }
}
const {
  SvelteComponent: jc,
  append: Vt,
  attr: Ke,
  binding_callbacks: yi,
  check_outros: Da,
  create_component: Kc,
  create_slot: Oc,
  destroy_component: Lc,
  destroy_each: xa,
  detach: x,
  element: qe,
  empty: _t,
  ensure_array_like: Bn,
  get_all_dirty_from_scope: Pc,
  get_slot_changes: qc,
  group_outros: Ma,
  init: $c,
  insert: M,
  mount_component: eF,
  noop: Zl,
  safe_not_equal: tF,
  set_data: ke,
  set_style: rt,
  space: Oe,
  text: ie,
  toggle_class: Ge,
  transition_in: Gt,
  transition_out: St,
  update_slot_base: nF
} = window.__gradio__svelte__internal, { tick: lF } = window.__gradio__svelte__internal, { onDestroy: iF } = window.__gradio__svelte__internal, aF = (t) => ({}), Gi = (t) => ({});
function Si(t, e, n) {
  const l = t.slice();
  return l[38] = e[n], l[40] = n, l;
}
function Xi(t, e, n) {
  const l = t.slice();
  return l[38] = e[n], l;
}
function sF(t) {
  let e, n = (
    /*i18n*/
    t[1]("common.error") + ""
  ), l, i, s;
  const a = (
    /*#slots*/
    t[29].error
  ), r = Oc(
    a,
    t,
    /*$$scope*/
    t[28],
    Gi
  );
  return {
    c() {
      e = qe("span"), l = ie(n), i = Oe(), r && r.c(), Ke(e, "class", "error svelte-14miwb5");
    },
    m(d, o) {
      M(d, e, o), Vt(e, l), M(d, i, o), r && r.m(d, o), s = !0;
    },
    p(d, o) {
      (!s || o[0] & /*i18n*/
      2) && n !== (n = /*i18n*/
      d[1]("common.error") + "") && ke(l, n), r && r.p && (!s || o[0] & /*$$scope*/
      268435456) && nF(
        r,
        a,
        d,
        /*$$scope*/
        d[28],
        s ? qc(
          a,
          /*$$scope*/
          d[28],
          o,
          aF
        ) : Pc(
          /*$$scope*/
          d[28]
        ),
        Gi
      );
    },
    i(d) {
      s || (Gt(r, d), s = !0);
    },
    o(d) {
      St(r, d), s = !1;
    },
    d(d) {
      d && (x(e), x(i)), r && r.d(d);
    }
  };
}
function rF(t) {
  let e, n, l, i, s, a, r, d, o, c = (
    /*variant*/
    t[8] === "default" && /*show_eta_bar*/
    t[18] && /*show_progress*/
    t[6] === "full" && ki(t)
  );
  function U(m, A) {
    if (
      /*progress*/
      m[7]
    )
      return cF;
    if (
      /*queue_position*/
      m[2] !== null && /*queue_size*/
      m[3] !== void 0 && /*queue_position*/
      m[2] >= 0
    )
      return dF;
    if (
      /*queue_position*/
      m[2] === 0
    )
      return oF;
  }
  let F = U(t), h = F && F(t), u = (
    /*timer*/
    t[5] && _i(t)
  );
  const R = [QF, hF], V = [];
  function I(m, A) {
    return (
      /*last_progress_level*/
      m[15] != null ? 0 : (
        /*show_progress*/
        m[6] === "full" ? 1 : -1
      )
    );
  }
  ~(s = I(t)) && (a = V[s] = R[s](t));
  let W = !/*timer*/
  t[5] && zi(t);
  return {
    c() {
      c && c.c(), e = Oe(), n = qe("div"), h && h.c(), l = Oe(), u && u.c(), i = Oe(), a && a.c(), r = Oe(), W && W.c(), d = _t(), Ke(n, "class", "progress-text svelte-14miwb5"), Ge(
        n,
        "meta-text-center",
        /*variant*/
        t[8] === "center"
      ), Ge(
        n,
        "meta-text",
        /*variant*/
        t[8] === "default"
      );
    },
    m(m, A) {
      c && c.m(m, A), M(m, e, A), M(m, n, A), h && h.m(n, null), Vt(n, l), u && u.m(n, null), M(m, i, A), ~s && V[s].m(m, A), M(m, r, A), W && W.m(m, A), M(m, d, A), o = !0;
    },
    p(m, A) {
      /*variant*/
      m[8] === "default" && /*show_eta_bar*/
      m[18] && /*show_progress*/
      m[6] === "full" ? c ? c.p(m, A) : (c = ki(m), c.c(), c.m(e.parentNode, e)) : c && (c.d(1), c = null), F === (F = U(m)) && h ? h.p(m, A) : (h && h.d(1), h = F && F(m), h && (h.c(), h.m(n, l))), /*timer*/
      m[5] ? u ? u.p(m, A) : (u = _i(m), u.c(), u.m(n, null)) : u && (u.d(1), u = null), (!o || A[0] & /*variant*/
      256) && Ge(
        n,
        "meta-text-center",
        /*variant*/
        m[8] === "center"
      ), (!o || A[0] & /*variant*/
      256) && Ge(
        n,
        "meta-text",
        /*variant*/
        m[8] === "default"
      );
      let p = s;
      s = I(m), s === p ? ~s && V[s].p(m, A) : (a && (Ma(), St(V[p], 1, 1, () => {
        V[p] = null;
      }), Da()), ~s ? (a = V[s], a ? a.p(m, A) : (a = V[s] = R[s](m), a.c()), Gt(a, 1), a.m(r.parentNode, r)) : a = null), /*timer*/
      m[5] ? W && (W.d(1), W = null) : W ? W.p(m, A) : (W = zi(m), W.c(), W.m(d.parentNode, d));
    },
    i(m) {
      o || (Gt(a), o = !0);
    },
    o(m) {
      St(a), o = !1;
    },
    d(m) {
      m && (x(e), x(n), x(i), x(r), x(d)), c && c.d(m), h && h.d(), u && u.d(), ~s && V[s].d(m), W && W.d(m);
    }
  };
}
function ki(t) {
  let e, n = `translateX(${/*eta_level*/
  (t[17] || 0) * 100 - 100}%)`;
  return {
    c() {
      e = qe("div"), Ke(e, "class", "eta-bar svelte-14miwb5"), rt(e, "transform", n);
    },
    m(l, i) {
      M(l, e, i);
    },
    p(l, i) {
      i[0] & /*eta_level*/
      131072 && n !== (n = `translateX(${/*eta_level*/
      (l[17] || 0) * 100 - 100}%)`) && rt(e, "transform", n);
    },
    d(l) {
      l && x(e);
    }
  };
}
function oF(t) {
  let e;
  return {
    c() {
      e = ie("processing |");
    },
    m(n, l) {
      M(n, e, l);
    },
    p: Zl,
    d(n) {
      n && x(e);
    }
  };
}
function dF(t) {
  let e, n = (
    /*queue_position*/
    t[2] + 1 + ""
  ), l, i, s, a;
  return {
    c() {
      e = ie("queue: "), l = ie(n), i = ie("/"), s = ie(
        /*queue_size*/
        t[3]
      ), a = ie(" |");
    },
    m(r, d) {
      M(r, e, d), M(r, l, d), M(r, i, d), M(r, s, d), M(r, a, d);
    },
    p(r, d) {
      d[0] & /*queue_position*/
      4 && n !== (n = /*queue_position*/
      r[2] + 1 + "") && ke(l, n), d[0] & /*queue_size*/
      8 && ke(
        s,
        /*queue_size*/
        r[3]
      );
    },
    d(r) {
      r && (x(e), x(l), x(i), x(s), x(a));
    }
  };
}
function cF(t) {
  let e, n = Bn(
    /*progress*/
    t[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = Ti(Xi(t, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      e = _t();
    },
    m(i, s) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, s);
      M(i, e, s);
    },
    p(i, s) {
      if (s[0] & /*progress*/
      128) {
        n = Bn(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const r = Xi(i, n, a);
          l[a] ? l[a].p(r, s) : (l[a] = Ti(r), l[a].c(), l[a].m(e.parentNode, e));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && x(e), xa(l, i);
    }
  };
}
function Yi(t) {
  let e, n = (
    /*p*/
    t[38].unit + ""
  ), l, i, s = " ", a;
  function r(c, U) {
    return (
      /*p*/
      c[38].length != null ? UF : FF
    );
  }
  let d = r(t), o = d(t);
  return {
    c() {
      o.c(), e = Oe(), l = ie(n), i = ie(" | "), a = ie(s);
    },
    m(c, U) {
      o.m(c, U), M(c, e, U), M(c, l, U), M(c, i, U), M(c, a, U);
    },
    p(c, U) {
      d === (d = r(c)) && o ? o.p(c, U) : (o.d(1), o = d(c), o && (o.c(), o.m(e.parentNode, e))), U[0] & /*progress*/
      128 && n !== (n = /*p*/
      c[38].unit + "") && ke(l, n);
    },
    d(c) {
      c && (x(e), x(l), x(i), x(a)), o.d(c);
    }
  };
}
function FF(t) {
  let e = Wt(
    /*p*/
    t[38].index || 0
  ) + "", n;
  return {
    c() {
      n = ie(e);
    },
    m(l, i) {
      M(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && e !== (e = Wt(
        /*p*/
        l[38].index || 0
      ) + "") && ke(n, e);
    },
    d(l) {
      l && x(n);
    }
  };
}
function UF(t) {
  let e = Wt(
    /*p*/
    t[38].index || 0
  ) + "", n, l, i = Wt(
    /*p*/
    t[38].length
  ) + "", s;
  return {
    c() {
      n = ie(e), l = ie("/"), s = ie(i);
    },
    m(a, r) {
      M(a, n, r), M(a, l, r), M(a, s, r);
    },
    p(a, r) {
      r[0] & /*progress*/
      128 && e !== (e = Wt(
        /*p*/
        a[38].index || 0
      ) + "") && ke(n, e), r[0] & /*progress*/
      128 && i !== (i = Wt(
        /*p*/
        a[38].length
      ) + "") && ke(s, i);
    },
    d(a) {
      a && (x(n), x(l), x(s));
    }
  };
}
function Ti(t) {
  let e, n = (
    /*p*/
    t[38].index != null && Yi(t)
  );
  return {
    c() {
      n && n.c(), e = _t();
    },
    m(l, i) {
      n && n.m(l, i), M(l, e, i);
    },
    p(l, i) {
      /*p*/
      l[38].index != null ? n ? n.p(l, i) : (n = Yi(l), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null);
    },
    d(l) {
      l && x(e), n && n.d(l);
    }
  };
}
function _i(t) {
  let e, n = (
    /*eta*/
    t[0] ? `/${/*formatted_eta*/
    t[19]}` : ""
  ), l, i;
  return {
    c() {
      e = ie(
        /*formatted_timer*/
        t[20]
      ), l = ie(n), i = ie("s");
    },
    m(s, a) {
      M(s, e, a), M(s, l, a), M(s, i, a);
    },
    p(s, a) {
      a[0] & /*formatted_timer*/
      1048576 && ke(
        e,
        /*formatted_timer*/
        s[20]
      ), a[0] & /*eta, formatted_eta*/
      524289 && n !== (n = /*eta*/
      s[0] ? `/${/*formatted_eta*/
      s[19]}` : "") && ke(l, n);
    },
    d(s) {
      s && (x(e), x(l), x(i));
    }
  };
}
function hF(t) {
  let e, n;
  return e = new zc({
    props: { margin: (
      /*variant*/
      t[8] === "default"
    ) }
  }), {
    c() {
      Kc(e.$$.fragment);
    },
    m(l, i) {
      eF(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i[0] & /*variant*/
      256 && (s.margin = /*variant*/
      l[8] === "default"), e.$set(s);
    },
    i(l) {
      n || (Gt(e.$$.fragment, l), n = !0);
    },
    o(l) {
      St(e.$$.fragment, l), n = !1;
    },
    d(l) {
      Lc(e, l);
    }
  };
}
function QF(t) {
  let e, n, l, i, s, a = `${/*last_progress_level*/
  t[15] * 100}%`, r = (
    /*progress*/
    t[7] != null && wi(t)
  );
  return {
    c() {
      e = qe("div"), n = qe("div"), r && r.c(), l = Oe(), i = qe("div"), s = qe("div"), Ke(n, "class", "progress-level-inner svelte-14miwb5"), Ke(s, "class", "progress-bar svelte-14miwb5"), rt(s, "width", a), Ke(i, "class", "progress-bar-wrap svelte-14miwb5"), Ke(e, "class", "progress-level svelte-14miwb5");
    },
    m(d, o) {
      M(d, e, o), Vt(e, n), r && r.m(n, null), Vt(e, l), Vt(e, i), Vt(i, s), t[30](s);
    },
    p(d, o) {
      /*progress*/
      d[7] != null ? r ? r.p(d, o) : (r = wi(d), r.c(), r.m(n, null)) : r && (r.d(1), r = null), o[0] & /*last_progress_level*/
      32768 && a !== (a = `${/*last_progress_level*/
      d[15] * 100}%`) && rt(s, "width", a);
    },
    i: Zl,
    o: Zl,
    d(d) {
      d && x(e), r && r.d(), t[30](null);
    }
  };
}
function wi(t) {
  let e, n = Bn(
    /*progress*/
    t[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = Mi(Si(t, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      e = _t();
    },
    m(i, s) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, s);
      M(i, e, s);
    },
    p(i, s) {
      if (s[0] & /*progress_level, progress*/
      16512) {
        n = Bn(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const r = Si(i, n, a);
          l[a] ? l[a].p(r, s) : (l[a] = Mi(r), l[a].c(), l[a].m(e.parentNode, e));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && x(e), xa(l, i);
    }
  };
}
function vi(t) {
  let e, n, l, i, s = (
    /*i*/
    t[40] !== 0 && BF()
  ), a = (
    /*p*/
    t[38].desc != null && Hi(t)
  ), r = (
    /*p*/
    t[38].desc != null && /*progress_level*/
    t[14] && /*progress_level*/
    t[14][
      /*i*/
      t[40]
    ] != null && Di()
  ), d = (
    /*progress_level*/
    t[14] != null && xi(t)
  );
  return {
    c() {
      s && s.c(), e = Oe(), a && a.c(), n = Oe(), r && r.c(), l = Oe(), d && d.c(), i = _t();
    },
    m(o, c) {
      s && s.m(o, c), M(o, e, c), a && a.m(o, c), M(o, n, c), r && r.m(o, c), M(o, l, c), d && d.m(o, c), M(o, i, c);
    },
    p(o, c) {
      /*p*/
      o[38].desc != null ? a ? a.p(o, c) : (a = Hi(o), a.c(), a.m(n.parentNode, n)) : a && (a.d(1), a = null), /*p*/
      o[38].desc != null && /*progress_level*/
      o[14] && /*progress_level*/
      o[14][
        /*i*/
        o[40]
      ] != null ? r || (r = Di(), r.c(), r.m(l.parentNode, l)) : r && (r.d(1), r = null), /*progress_level*/
      o[14] != null ? d ? d.p(o, c) : (d = xi(o), d.c(), d.m(i.parentNode, i)) : d && (d.d(1), d = null);
    },
    d(o) {
      o && (x(e), x(n), x(l), x(i)), s && s.d(o), a && a.d(o), r && r.d(o), d && d.d(o);
    }
  };
}
function BF(t) {
  let e;
  return {
    c() {
      e = ie(" /");
    },
    m(n, l) {
      M(n, e, l);
    },
    d(n) {
      n && x(e);
    }
  };
}
function Hi(t) {
  let e = (
    /*p*/
    t[38].desc + ""
  ), n;
  return {
    c() {
      n = ie(e);
    },
    m(l, i) {
      M(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && e !== (e = /*p*/
      l[38].desc + "") && ke(n, e);
    },
    d(l) {
      l && x(n);
    }
  };
}
function Di(t) {
  let e;
  return {
    c() {
      e = ie("-");
    },
    m(n, l) {
      M(n, e, l);
    },
    d(n) {
      n && x(e);
    }
  };
}
function xi(t) {
  let e = (100 * /*progress_level*/
  (t[14][
    /*i*/
    t[40]
  ] || 0)).toFixed(1) + "", n, l;
  return {
    c() {
      n = ie(e), l = ie("%");
    },
    m(i, s) {
      M(i, n, s), M(i, l, s);
    },
    p(i, s) {
      s[0] & /*progress_level*/
      16384 && e !== (e = (100 * /*progress_level*/
      (i[14][
        /*i*/
        i[40]
      ] || 0)).toFixed(1) + "") && ke(n, e);
    },
    d(i) {
      i && (x(n), x(l));
    }
  };
}
function Mi(t) {
  let e, n = (
    /*p*/
    (t[38].desc != null || /*progress_level*/
    t[14] && /*progress_level*/
    t[14][
      /*i*/
      t[40]
    ] != null) && vi(t)
  );
  return {
    c() {
      n && n.c(), e = _t();
    },
    m(l, i) {
      n && n.m(l, i), M(l, e, i);
    },
    p(l, i) {
      /*p*/
      l[38].desc != null || /*progress_level*/
      l[14] && /*progress_level*/
      l[14][
        /*i*/
        l[40]
      ] != null ? n ? n.p(l, i) : (n = vi(l), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null);
    },
    d(l) {
      l && x(e), n && n.d(l);
    }
  };
}
function zi(t) {
  let e, n;
  return {
    c() {
      e = qe("p"), n = ie(
        /*loading_text*/
        t[9]
      ), Ke(e, "class", "loading svelte-14miwb5");
    },
    m(l, i) {
      M(l, e, i), Vt(e, n);
    },
    p(l, i) {
      i[0] & /*loading_text*/
      512 && ke(
        n,
        /*loading_text*/
        l[9]
      );
    },
    d(l) {
      l && x(e);
    }
  };
}
function uF(t) {
  let e, n, l, i, s;
  const a = [rF, sF], r = [];
  function d(o, c) {
    return (
      /*status*/
      o[4] === "pending" ? 0 : (
        /*status*/
        o[4] === "error" ? 1 : -1
      )
    );
  }
  return ~(n = d(t)) && (l = r[n] = a[n](t)), {
    c() {
      e = qe("div"), l && l.c(), Ke(e, "class", i = "wrap " + /*variant*/
      t[8] + " " + /*show_progress*/
      t[6] + " svelte-14miwb5"), Ge(e, "hide", !/*status*/
      t[4] || /*status*/
      t[4] === "complete" || /*show_progress*/
      t[6] === "hidden"), Ge(
        e,
        "translucent",
        /*variant*/
        t[8] === "center" && /*status*/
        (t[4] === "pending" || /*status*/
        t[4] === "error") || /*translucent*/
        t[11] || /*show_progress*/
        t[6] === "minimal"
      ), Ge(
        e,
        "generating",
        /*status*/
        t[4] === "generating"
      ), Ge(
        e,
        "border",
        /*border*/
        t[12]
      ), rt(
        e,
        "position",
        /*absolute*/
        t[10] ? "absolute" : "static"
      ), rt(
        e,
        "padding",
        /*absolute*/
        t[10] ? "0" : "var(--size-8) 0"
      );
    },
    m(o, c) {
      M(o, e, c), ~n && r[n].m(e, null), t[31](e), s = !0;
    },
    p(o, c) {
      let U = n;
      n = d(o), n === U ? ~n && r[n].p(o, c) : (l && (Ma(), St(r[U], 1, 1, () => {
        r[U] = null;
      }), Da()), ~n ? (l = r[n], l ? l.p(o, c) : (l = r[n] = a[n](o), l.c()), Gt(l, 1), l.m(e, null)) : l = null), (!s || c[0] & /*variant, show_progress*/
      320 && i !== (i = "wrap " + /*variant*/
      o[8] + " " + /*show_progress*/
      o[6] + " svelte-14miwb5")) && Ke(e, "class", i), (!s || c[0] & /*variant, show_progress, status, show_progress*/
      336) && Ge(e, "hide", !/*status*/
      o[4] || /*status*/
      o[4] === "complete" || /*show_progress*/
      o[6] === "hidden"), (!s || c[0] & /*variant, show_progress, variant, status, translucent, show_progress*/
      2384) && Ge(
        e,
        "translucent",
        /*variant*/
        o[8] === "center" && /*status*/
        (o[4] === "pending" || /*status*/
        o[4] === "error") || /*translucent*/
        o[11] || /*show_progress*/
        o[6] === "minimal"
      ), (!s || c[0] & /*variant, show_progress, status*/
      336) && Ge(
        e,
        "generating",
        /*status*/
        o[4] === "generating"
      ), (!s || c[0] & /*variant, show_progress, border*/
      4416) && Ge(
        e,
        "border",
        /*border*/
        o[12]
      ), c[0] & /*absolute*/
      1024 && rt(
        e,
        "position",
        /*absolute*/
        o[10] ? "absolute" : "static"
      ), c[0] & /*absolute*/
      1024 && rt(
        e,
        "padding",
        /*absolute*/
        o[10] ? "0" : "var(--size-8) 0"
      );
    },
    i(o) {
      s || (Gt(l), s = !0);
    },
    o(o) {
      St(l), s = !1;
    },
    d(o) {
      o && x(e), ~n && r[n].d(), t[31](null);
    }
  };
}
let rn = [], Ln = !1;
async function AF(t, e = !0) {
  if (!(window.__gradio_mode__ === "website" || window.__gradio_mode__ !== "app" && e !== !0)) {
    if (rn.push(t), !Ln)
      Ln = !0;
    else
      return;
    await lF(), requestAnimationFrame(() => {
      let n = [0, 0];
      for (let l = 0; l < rn.length; l++) {
        const s = rn[l].getBoundingClientRect();
        (l === 0 || s.top + window.scrollY <= n[0]) && (n[0] = s.top + window.scrollY, n[1] = l);
      }
      window.scrollTo({ top: n[0] - 20, behavior: "smooth" }), Ln = !1, rn = [];
    });
  }
}
function VF(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { i18n: a } = e, { eta: r = null } = e, { queue: d = !1 } = e, { queue_position: o } = e, { queue_size: c } = e, { status: U } = e, { scroll_to_output: F = !1 } = e, { timer: h = !0 } = e, { show_progress: u = "full" } = e, { message: R = null } = e, { progress: V = null } = e, { variant: I = "default" } = e, { loading_text: W = "Loading..." } = e, { absolute: m = !0 } = e, { translucent: A = !1 } = e, { border: p = !1 } = e, { autoscroll: z } = e, H, k = !1, N = 0, J = 0, S = null, me = 0, ae = null, Y, v = null, Q = !0;
  const g = () => {
    n(25, N = performance.now()), n(26, J = 0), k = !0, X();
  };
  function X() {
    requestAnimationFrame(() => {
      n(26, J = (performance.now() - N) / 1e3), k && X();
    });
  }
  function y() {
    n(26, J = 0), k && (k = !1);
  }
  iF(() => {
    k && y();
  });
  let K = null;
  function de(C) {
    yi[C ? "unshift" : "push"](() => {
      v = C, n(16, v), n(7, V), n(14, ae), n(15, Y);
    });
  }
  function T(C) {
    yi[C ? "unshift" : "push"](() => {
      H = C, n(13, H);
    });
  }
  return t.$$set = (C) => {
    "i18n" in C && n(1, a = C.i18n), "eta" in C && n(0, r = C.eta), "queue" in C && n(21, d = C.queue), "queue_position" in C && n(2, o = C.queue_position), "queue_size" in C && n(3, c = C.queue_size), "status" in C && n(4, U = C.status), "scroll_to_output" in C && n(22, F = C.scroll_to_output), "timer" in C && n(5, h = C.timer), "show_progress" in C && n(6, u = C.show_progress), "message" in C && n(23, R = C.message), "progress" in C && n(7, V = C.progress), "variant" in C && n(8, I = C.variant), "loading_text" in C && n(9, W = C.loading_text), "absolute" in C && n(10, m = C.absolute), "translucent" in C && n(11, A = C.translucent), "border" in C && n(12, p = C.border), "autoscroll" in C && n(24, z = C.autoscroll), "$$scope" in C && n(28, s = C.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty[0] & /*eta, old_eta, queue, timer_start*/
    169869313 && (r === null ? n(0, r = S) : d && n(0, r = (performance.now() - N) / 1e3 + r), r != null && (n(19, K = r.toFixed(1)), n(27, S = r))), t.$$.dirty[0] & /*eta, timer_diff*/
    67108865 && n(17, me = r === null || r <= 0 || !J ? null : Math.min(J / r, 1)), t.$$.dirty[0] & /*progress*/
    128 && V != null && n(18, Q = !1), t.$$.dirty[0] & /*progress, progress_level, progress_bar, last_progress_level*/
    114816 && (V != null ? n(14, ae = V.map((C) => {
      if (C.index != null && C.length != null)
        return C.index / C.length;
      if (C.progress != null)
        return C.progress;
    })) : n(14, ae = null), ae ? (n(15, Y = ae[ae.length - 1]), v && (Y === 0 ? n(16, v.style.transition = "0", v) : n(16, v.style.transition = "150ms", v))) : n(15, Y = void 0)), t.$$.dirty[0] & /*status*/
    16 && (U === "pending" ? g() : y()), t.$$.dirty[0] & /*el, scroll_to_output, status, autoscroll*/
    20979728 && H && F && (U === "pending" || U === "complete") && AF(H, z), t.$$.dirty[0] & /*status, message*/
    8388624, t.$$.dirty[0] & /*timer_diff*/
    67108864 && n(20, l = J.toFixed(1));
  }, [
    r,
    a,
    o,
    c,
    U,
    h,
    u,
    V,
    I,
    W,
    m,
    A,
    p,
    H,
    ae,
    Y,
    v,
    me,
    Q,
    K,
    l,
    d,
    F,
    R,
    z,
    N,
    J,
    S,
    s,
    i,
    de,
    T
  ];
}
class za extends jc {
  constructor(e) {
    super(), $c(
      this,
      e,
      VF,
      uF,
      tF,
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
  SvelteComponent: ZF,
  append: mF,
  attr: RF,
  detach: bF,
  element: gF,
  init: WF,
  insert: fF,
  noop: ji,
  safe_not_equal: IF,
  set_data: pF,
  text: JF,
  toggle_class: gt
} = window.__gradio__svelte__internal;
function CF(t) {
  let e, n;
  return {
    c() {
      e = gF("div"), n = JF(
        /*value*/
        t[0]
      ), RF(e, "class", "svelte-1gecy8w"), gt(
        e,
        "table",
        /*type*/
        t[1] === "table"
      ), gt(
        e,
        "gallery",
        /*type*/
        t[1] === "gallery"
      ), gt(
        e,
        "selected",
        /*selected*/
        t[2]
      );
    },
    m(l, i) {
      fF(l, e, i), mF(e, n);
    },
    p(l, [i]) {
      i & /*value*/
      1 && pF(
        n,
        /*value*/
        l[0]
      ), i & /*type*/
      2 && gt(
        e,
        "table",
        /*type*/
        l[1] === "table"
      ), i & /*type*/
      2 && gt(
        e,
        "gallery",
        /*type*/
        l[1] === "gallery"
      ), i & /*selected*/
      4 && gt(
        e,
        "selected",
        /*selected*/
        l[2]
      );
    },
    i: ji,
    o: ji,
    d(l) {
      l && bF(e);
    }
  };
}
function NF(t, e, n) {
  let { value: l } = e, { type: i } = e, { selected: s = !1 } = e;
  return t.$$set = (a) => {
    "value" in a && n(0, l = a.value), "type" in a && n(1, i = a.type), "selected" in a && n(2, s = a.selected);
  }, [l, i, s];
}
class OF extends ZF {
  constructor(e) {
    super(), WF(this, e, NF, CF, IF, { value: 0, type: 1, selected: 2 });
  }
}
const {
  SvelteComponent: EF,
  assign: ja,
  check_outros: Ka,
  create_component: De,
  destroy_component: xe,
  detach: Xt,
  empty: Oa,
  get_spread_object: La,
  get_spread_update: Pa,
  group_outros: qa,
  init: yF,
  insert: kt,
  mount_component: Me,
  safe_not_equal: GF,
  space: bn,
  transition_in: ge,
  transition_out: We
} = window.__gradio__svelte__internal;
function SF(t) {
  let e, n;
  return e = new qi({
    props: {
      visible: (
        /*visible*/
        t[3]
      ),
      variant: (
        /*value*/
        t[0] === null ? "dashed" : "solid"
      ),
      border_mode: (
        /*dragging*/
        t[17] ? "focus" : "base"
      ),
      padding: !1,
      elem_id: (
        /*elem_id*/
        t[1]
      ),
      elem_classes: (
        /*elem_classes*/
        t[2]
      ),
      container: (
        /*container*/
        t[8]
      ),
      scale: (
        /*scale*/
        t[9]
      ),
      min_width: (
        /*min_width*/
        t[10]
      ),
      height: (
        /*height*/
        t[12]
      ),
      $$slots: { default: [YF] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      De(e.$$.fragment);
    },
    m(l, i) {
      Me(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*visible*/
      8 && (s.visible = /*visible*/
      l[3]), i & /*value*/
      1 && (s.variant = /*value*/
      l[0] === null ? "dashed" : "solid"), i & /*dragging*/
      131072 && (s.border_mode = /*dragging*/
      l[17] ? "focus" : "base"), i & /*elem_id*/
      2 && (s.elem_id = /*elem_id*/
      l[1]), i & /*elem_classes*/
      4 && (s.elem_classes = /*elem_classes*/
      l[2]), i & /*container*/
      256 && (s.container = /*container*/
      l[8]), i & /*scale*/
      512 && (s.scale = /*scale*/
      l[9]), i & /*min_width*/
      1024 && (s.min_width = /*min_width*/
      l[10]), i & /*height*/
      4096 && (s.height = /*height*/
      l[12]), i & /*$$scope, label, show_label, root, _value, zoom_speed, pan_speed, gradio, value, dragging, loading_status*/
      8612081 && (s.$$scope = { dirty: i, ctx: l }), e.$set(s);
    },
    i(l) {
      n || (ge(e.$$.fragment, l), n = !0);
    },
    o(l) {
      We(e.$$.fragment, l), n = !1;
    },
    d(l) {
      xe(e, l);
    }
  };
}
function XF(t) {
  let e, n;
  return e = new qi({
    props: {
      visible: (
        /*visible*/
        t[3]
      ),
      variant: (
        /*value*/
        t[0] === null ? "dashed" : "solid"
      ),
      border_mode: (
        /*dragging*/
        t[17] ? "focus" : "base"
      ),
      padding: !1,
      elem_id: (
        /*elem_id*/
        t[1]
      ),
      elem_classes: (
        /*elem_classes*/
        t[2]
      ),
      container: (
        /*container*/
        t[8]
      ),
      scale: (
        /*scale*/
        t[9]
      ),
      min_width: (
        /*min_width*/
        t[10]
      ),
      height: (
        /*height*/
        t[12]
      ),
      $$slots: { default: [vF] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      De(e.$$.fragment);
    },
    m(l, i) {
      Me(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*visible*/
      8 && (s.visible = /*visible*/
      l[3]), i & /*value*/
      1 && (s.variant = /*value*/
      l[0] === null ? "dashed" : "solid"), i & /*dragging*/
      131072 && (s.border_mode = /*dragging*/
      l[17] ? "focus" : "base"), i & /*elem_id*/
      2 && (s.elem_id = /*elem_id*/
      l[1]), i & /*elem_classes*/
      4 && (s.elem_classes = /*elem_classes*/
      l[2]), i & /*container*/
      256 && (s.container = /*container*/
      l[8]), i & /*scale*/
      512 && (s.scale = /*scale*/
      l[9]), i & /*min_width*/
      1024 && (s.min_width = /*min_width*/
      l[10]), i & /*height*/
      4096 && (s.height = /*height*/
      l[12]), i & /*$$scope, _value, gradio, label, show_label, zoom_speed, pan_speed, value, loading_status*/
      8480993 && (s.$$scope = { dirty: i, ctx: l }), e.$set(s);
    },
    i(l) {
      n || (ge(e.$$.fragment, l), n = !0);
    },
    o(l) {
      We(e.$$.fragment, l), n = !1;
    },
    d(l) {
      xe(e, l);
    }
  };
}
function kF(t) {
  let e, n;
  return e = new Wo({
    props: {
      i18n: (
        /*gradio*/
        t[11].i18n
      ),
      type: "file"
    }
  }), {
    c() {
      De(e.$$.fragment);
    },
    m(l, i) {
      Me(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*gradio*/
      2048 && (s.i18n = /*gradio*/
      l[11].i18n), e.$set(s);
    },
    i(l) {
      n || (ge(e.$$.fragment, l), n = !0);
    },
    o(l) {
      We(e.$$.fragment, l), n = !1;
    },
    d(l) {
      xe(e, l);
    }
  };
}
function YF(t) {
  let e, n, l, i;
  const s = [
    {
      autoscroll: (
        /*gradio*/
        t[11].autoscroll
      )
    },
    { i18n: (
      /*gradio*/
      t[11].i18n
    ) },
    /*loading_status*/
    t[5]
  ];
  let a = {};
  for (let r = 0; r < s.length; r += 1)
    a = ja(a, s[r]);
  return e = new za({ props: a }), l = new kc({
    props: {
      label: (
        /*label*/
        t[6]
      ),
      show_label: (
        /*show_label*/
        t[7]
      ),
      root: (
        /*root*/
        t[4]
      ),
      value: (
        /*_value*/
        t[16]
      ),
      zoom_speed: (
        /*zoom_speed*/
        t[13]
      ),
      pan_speed: (
        /*pan_speed*/
        t[14]
      ),
      i18n: (
        /*gradio*/
        t[11].i18n
      ),
      $$slots: { default: [kF] },
      $$scope: { ctx: t }
    }
  }), l.$on(
    "change",
    /*change_handler*/
    t[19]
  ), l.$on(
    "drag",
    /*drag_handler*/
    t[20]
  ), l.$on(
    "change",
    /*change_handler_1*/
    t[21]
  ), l.$on(
    "clear",
    /*clear_handler*/
    t[22]
  ), {
    c() {
      De(e.$$.fragment), n = bn(), De(l.$$.fragment);
    },
    m(r, d) {
      Me(e, r, d), kt(r, n, d), Me(l, r, d), i = !0;
    },
    p(r, d) {
      const o = d & /*gradio, loading_status*/
      2080 ? Pa(s, [
        d & /*gradio*/
        2048 && {
          autoscroll: (
            /*gradio*/
            r[11].autoscroll
          )
        },
        d & /*gradio*/
        2048 && { i18n: (
          /*gradio*/
          r[11].i18n
        ) },
        d & /*loading_status*/
        32 && La(
          /*loading_status*/
          r[5]
        )
      ]) : {};
      e.$set(o);
      const c = {};
      d & /*label*/
      64 && (c.label = /*label*/
      r[6]), d & /*show_label*/
      128 && (c.show_label = /*show_label*/
      r[7]), d & /*root*/
      16 && (c.root = /*root*/
      r[4]), d & /*_value*/
      65536 && (c.value = /*_value*/
      r[16]), d & /*zoom_speed*/
      8192 && (c.zoom_speed = /*zoom_speed*/
      r[13]), d & /*pan_speed*/
      16384 && (c.pan_speed = /*pan_speed*/
      r[14]), d & /*gradio*/
      2048 && (c.i18n = /*gradio*/
      r[11].i18n), d & /*$$scope, gradio*/
      8390656 && (c.$$scope = { dirty: d, ctx: r }), l.$set(c);
    },
    i(r) {
      i || (ge(e.$$.fragment, r), ge(l.$$.fragment, r), i = !0);
    },
    o(r) {
      We(e.$$.fragment, r), We(l.$$.fragment, r), i = !1;
    },
    d(r) {
      r && Xt(n), xe(e, r), xe(l, r);
    }
  };
}
function TF(t) {
  let e, n, l, i;
  return e = new un({
    props: {
      show_label: (
        /*show_label*/
        t[7]
      ),
      Icon: Ot,
      label: (
        /*label*/
        t[6] || "Splat"
      )
    }
  }), l = new br({
    props: {
      unpadded_box: !0,
      size: "large",
      $$slots: { default: [wF] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      De(e.$$.fragment), n = bn(), De(l.$$.fragment);
    },
    m(s, a) {
      Me(e, s, a), kt(s, n, a), Me(l, s, a), i = !0;
    },
    p(s, a) {
      const r = {};
      a & /*show_label*/
      128 && (r.show_label = /*show_label*/
      s[7]), a & /*label*/
      64 && (r.label = /*label*/
      s[6] || "Splat"), e.$set(r);
      const d = {};
      a & /*$$scope*/
      8388608 && (d.$$scope = { dirty: a, ctx: s }), l.$set(d);
    },
    i(s) {
      i || (ge(e.$$.fragment, s), ge(l.$$.fragment, s), i = !0);
    },
    o(s) {
      We(e.$$.fragment, s), We(l.$$.fragment, s), i = !1;
    },
    d(s) {
      s && Xt(n), xe(e, s), xe(l, s);
    }
  };
}
function _F(t) {
  let e, n, l, i;
  return e = new un({
    props: {
      show_label: (
        /*show_label*/
        t[7]
      ),
      Icon: Ot,
      label: (
        /*label*/
        t[6] || "Splat"
      )
    }
  }), l = new zo({
    props: {
      value: (
        /*_value*/
        t[16]
      ),
      i18n: (
        /*gradio*/
        t[11].i18n
      ),
      label: (
        /*label*/
        t[6]
      ),
      show_label: (
        /*show_label*/
        t[7]
      ),
      zoom_speed: (
        /*zoom_speed*/
        t[13]
      ),
      pan_speed: (
        /*pan_speed*/
        t[14]
      )
    }
  }), {
    c() {
      De(e.$$.fragment), n = bn(), De(l.$$.fragment);
    },
    m(s, a) {
      Me(e, s, a), kt(s, n, a), Me(l, s, a), i = !0;
    },
    p(s, a) {
      const r = {};
      a & /*show_label*/
      128 && (r.show_label = /*show_label*/
      s[7]), a & /*label*/
      64 && (r.label = /*label*/
      s[6] || "Splat"), e.$set(r);
      const d = {};
      a & /*_value*/
      65536 && (d.value = /*_value*/
      s[16]), a & /*gradio*/
      2048 && (d.i18n = /*gradio*/
      s[11].i18n), a & /*label*/
      64 && (d.label = /*label*/
      s[6]), a & /*show_label*/
      128 && (d.show_label = /*show_label*/
      s[7]), a & /*zoom_speed*/
      8192 && (d.zoom_speed = /*zoom_speed*/
      s[13]), a & /*pan_speed*/
      16384 && (d.pan_speed = /*pan_speed*/
      s[14]), l.$set(d);
    },
    i(s) {
      i || (ge(e.$$.fragment, s), ge(l.$$.fragment, s), i = !0);
    },
    o(s) {
      We(e.$$.fragment, s), We(l.$$.fragment, s), i = !1;
    },
    d(s) {
      s && Xt(n), xe(e, s), xe(l, s);
    }
  };
}
function wF(t) {
  let e, n;
  return e = new Ot({}), {
    c() {
      De(e.$$.fragment);
    },
    m(l, i) {
      Me(e, l, i), n = !0;
    },
    i(l) {
      n || (ge(e.$$.fragment, l), n = !0);
    },
    o(l) {
      We(e.$$.fragment, l), n = !1;
    },
    d(l) {
      xe(e, l);
    }
  };
}
function vF(t) {
  let e, n, l, i, s, a;
  const r = [
    {
      autoscroll: (
        /*gradio*/
        t[11].autoscroll
      )
    },
    { i18n: (
      /*gradio*/
      t[11].i18n
    ) },
    /*loading_status*/
    t[5]
  ];
  let d = {};
  for (let F = 0; F < r.length; F += 1)
    d = ja(d, r[F]);
  e = new za({ props: d });
  const o = [_F, TF], c = [];
  function U(F, h) {
    return (
      /*value*/
      F[0] ? 0 : 1
    );
  }
  return l = U(t), i = c[l] = o[l](t), {
    c() {
      De(e.$$.fragment), n = bn(), i.c(), s = Oa();
    },
    m(F, h) {
      Me(e, F, h), kt(F, n, h), c[l].m(F, h), kt(F, s, h), a = !0;
    },
    p(F, h) {
      const u = h & /*gradio, loading_status*/
      2080 ? Pa(r, [
        h & /*gradio*/
        2048 && {
          autoscroll: (
            /*gradio*/
            F[11].autoscroll
          )
        },
        h & /*gradio*/
        2048 && { i18n: (
          /*gradio*/
          F[11].i18n
        ) },
        h & /*loading_status*/
        32 && La(
          /*loading_status*/
          F[5]
        )
      ]) : {};
      e.$set(u);
      let R = l;
      l = U(F), l === R ? c[l].p(F, h) : (qa(), We(c[R], 1, 1, () => {
        c[R] = null;
      }), Ka(), i = c[l], i ? i.p(F, h) : (i = c[l] = o[l](F), i.c()), ge(i, 1), i.m(s.parentNode, s));
    },
    i(F) {
      a || (ge(e.$$.fragment, F), ge(i), a = !0);
    },
    o(F) {
      We(e.$$.fragment, F), We(i), a = !1;
    },
    d(F) {
      F && (Xt(n), Xt(s)), xe(e, F), c[l].d(F);
    }
  };
}
function HF(t) {
  let e, n, l, i;
  const s = [XF, SF], a = [];
  function r(d, o) {
    return (
      /*interactive*/
      d[15] ? 1 : 0
    );
  }
  return e = r(t), n = a[e] = s[e](t), {
    c() {
      n.c(), l = Oa();
    },
    m(d, o) {
      a[e].m(d, o), kt(d, l, o), i = !0;
    },
    p(d, [o]) {
      let c = e;
      e = r(d), e === c ? a[e].p(d, o) : (qa(), We(a[c], 1, 1, () => {
        a[c] = null;
      }), Ka(), n = a[e], n ? n.p(d, o) : (n = a[e] = s[e](d), n.c()), ge(n, 1), n.m(l.parentNode, l));
    },
    i(d) {
      i || (ge(n), i = !0);
    },
    o(d) {
      We(n), i = !1;
    },
    d(d) {
      d && Xt(l), a[e].d(d);
    }
  };
}
function DF(t, e, n) {
  let { elem_id: l = "" } = e, { elem_classes: i = [] } = e, { visible: s = !0 } = e, { value: a = null } = e, { root: r } = e, { proxy_url: d } = e, { loading_status: o } = e, { label: c } = e, { show_label: U } = e, { container: F = !0 } = e, { scale: h = null } = e, { min_width: u = void 0 } = e, { gradio: R } = e, { height: V = void 0 } = e, { zoom_speed: I = 1 } = e, { pan_speed: W = 1 } = e, { interactive: m } = e, A, p = !1;
  const z = ({ detail: J }) => n(0, a = J), H = ({ detail: J }) => n(17, p = J), k = ({ detail: J }) => R.dispatch("change", J), N = () => R.dispatch("clear");
  return t.$$set = (J) => {
    "elem_id" in J && n(1, l = J.elem_id), "elem_classes" in J && n(2, i = J.elem_classes), "visible" in J && n(3, s = J.visible), "value" in J && n(0, a = J.value), "root" in J && n(4, r = J.root), "proxy_url" in J && n(18, d = J.proxy_url), "loading_status" in J && n(5, o = J.loading_status), "label" in J && n(6, c = J.label), "show_label" in J && n(7, U = J.show_label), "container" in J && n(8, F = J.container), "scale" in J && n(9, h = J.scale), "min_width" in J && n(10, u = J.min_width), "gradio" in J && n(11, R = J.gradio), "height" in J && n(12, V = J.height), "zoom_speed" in J && n(13, I = J.zoom_speed), "pan_speed" in J && n(14, W = J.pan_speed), "interactive" in J && n(15, m = J.interactive);
  }, t.$$.update = () => {
    t.$$.dirty & /*value, root, proxy_url*/
    262161 && n(16, A = ut(a, r, d));
  }, [
    a,
    l,
    i,
    s,
    r,
    o,
    c,
    U,
    F,
    h,
    u,
    R,
    V,
    I,
    W,
    m,
    A,
    p,
    d,
    z,
    H,
    k,
    N
  ];
}
class LF extends EF {
  constructor(e) {
    super(), yF(this, e, DF, HF, GF, {
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
  OF as BaseExample,
  zo as BaseModel3DGS,
  kc as BaseModel3DGSUpload,
  LF as default
};
