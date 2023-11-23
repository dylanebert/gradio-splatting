var $t = new Intl.Collator(0, { numeric: 1 }).compare;
function rl(t, e, n) {
  return t = t.split("."), e = e.split("."), $t(t[0], e[0]) || $t(t[1], e[1]) || (e[2] = e.slice(2).join("."), n = /[.-]/.test(t[2] = t.slice(2).join(".")), n == /[.-]/.test(e[2]) ? $t(t[2], e[2]) : n ? -1 : 1);
}
function Ce(t, e, n) {
  return e.startsWith("http://") || e.startsWith("https://") ? n ? t : e : t + e;
}
function en(t) {
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
const Wi = /^[^\/]*\/[^\/]*$/, gs = /.*hf\.space\/{0,1}$/;
async function ys(t, e) {
  const n = {};
  e && (n.Authorization = `Bearer ${e}`);
  const l = t.trim();
  if (Wi.test(l))
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
        ...en(s)
      };
    } catch (i) {
      throw new Error("Space metadata could not be loaded." + i.message);
    }
  if (gs.test(l)) {
    const { ws_protocol: i, http_protocol: s, host: a } = en(l);
    return {
      space_id: a.replace(".hf.space", ""),
      ws_protocol: i,
      http_protocol: s,
      host: a
    };
  }
  return {
    space_id: !1,
    ...en(l)
  };
}
function Js(t) {
  let e = {};
  return t.forEach(({ api_name: n }, l) => {
    n && (e[n] = l);
  }), e;
}
const Ns = /^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function ol(t) {
  try {
    const n = (await fetch(
      `https://huggingface.co/api/spaces/${t}/discussions`,
      {
        method: "HEAD"
      }
    )).headers.get("x-error-message");
    return !(n && Ns.test(n));
  } catch {
    return !1;
  }
}
function je(t, e, n) {
  if (t == null)
    return null;
  if (Array.isArray(t)) {
    const l = [];
    for (const i of t)
      i == null ? l.push(null) : l.push(je(i, e, n));
    return l;
  }
  return t.is_stream ? n == null ? new lt({
    ...t,
    url: e + "/stream/" + t.path
  }) : new lt({
    ...t,
    url: "/proxy=" + n + "stream/" + t.path
  }) : new lt({
    ...t,
    url: vs(t.path, e, n)
  });
}
function Ss(t) {
  try {
    const e = new URL(t);
    return e.protocol === "http:" || e.protocol === "https:";
  } catch {
    return !1;
  }
}
function vs(t, e, n) {
  return t == null ? n ? `/proxy=${n}file=` : `${e}/file=` : Ss(t) ? t : n ? `/proxy=${n}file=${t}` : `${e}/file=${t}`;
}
async function Gs(t, e, n = Ts) {
  let l = (Array.isArray(t) ? t : [t]).map(
    (i) => i.blob
  );
  return await Promise.all(
    await n(e, l).then(
      async (i) => {
        if (i.error)
          throw new Error(i.error);
        return i.files ? i.files.map((s, a) => {
          const o = new lt({ ...t[a], path: s });
          return je(o, e, null);
        }) : [];
      }
    )
  );
}
async function Es(t, e) {
  return t.map(
    (n, l) => new lt({
      path: n.name,
      orig_name: n.name,
      blob: n,
      size: n.size,
      mime_type: n.type,
      is_stream: e
    })
  );
}
class lt {
  constructor({
    path: e,
    url: n,
    orig_name: l,
    size: i,
    blob: s,
    is_stream: a,
    mime_type: o,
    alt_text: r
  }) {
    this.path = e, this.url = n, this.orig_name = l, this.size = i, this.blob = n ? void 0 : s, this.is_stream = a, this.mime_type = o, this.alt_text = r;
  }
}
const ks = "This application is too busy. Keep trying!", Vt = "Connection errored out.";
let gi;
function ws(t, e) {
  return { post_data: n, upload_files: l, client: i, handle_blob: s };
  async function n(a, o, r) {
    const c = { "Content-Type": "application/json" };
    r && (c.Authorization = `Bearer ${r}`);
    try {
      var d = await t(a, {
        method: "POST",
        body: JSON.stringify(o),
        headers: c
      });
    } catch {
      return [{ error: Vt }, 500];
    }
    return [await d.json(), d.status];
  }
  async function l(a, o, r) {
    const c = {};
    r && (c.Authorization = `Bearer ${r}`);
    const d = 1e3, u = [];
    for (let h = 0; h < o.length; h += d) {
      const m = o.slice(h, h + d), V = new FormData();
      m.forEach((Q) => {
        V.append("files", Q);
      });
      try {
        var f = await t(`${a}/upload`, {
          method: "POST",
          body: V,
          headers: c
        });
      } catch {
        return { error: Vt };
      }
      const U = await f.json();
      u.push(...U);
    }
    return { files: u };
  }
  async function i(a, o = { normalise_files: !0 }) {
    return new Promise(async (r) => {
      const { status_callback: c, hf_token: d, normalise_files: u } = o, f = {
        predict: y,
        submit: q,
        view_api: L,
        component_server: w
      }, h = u ?? !0;
      if ((typeof window > "u" || !("WebSocket" in window)) && !global.Websocket) {
        const N = await import("./wrapper-98f94c21-f7f71f53.js");
        gi = (await import("./__vite-browser-external-2447137e.js")).Blob, global.WebSocket = N.WebSocket;
      }
      const { ws_protocol: m, http_protocol: V, host: U, space_id: Q } = await ys(a, d), R = Math.random().toString(36).substring(2), F = {};
      let Z, p = {}, X = !1;
      d && Q && (X = await Is(Q, d));
      async function S(N) {
        if (Z = N, p = Js((N == null ? void 0 : N.dependencies) || []), Z.auth_required)
          return {
            config: Z,
            ...f
          };
        try {
          k = await L(Z);
        } catch (x) {
          console.error(`Could not get api details: ${x.message}`);
        }
        return {
          config: Z,
          ...f
        };
      }
      let k;
      async function J(N) {
        if (c && c(N), N.status === "running")
          try {
            Z = await hl(
              t,
              `${V}//${U}`,
              d
            );
            const x = await S(Z);
            r(x);
          } catch (x) {
            console.error(x), c && c({
              status: "error",
              message: "Could not load this space.",
              load_status: "error",
              detail: "NOT_FOUND"
            });
          }
      }
      try {
        Z = await hl(
          t,
          `${V}//${U}`,
          d
        );
        const N = await S(Z);
        r(N);
      } catch (N) {
        console.error(N), Q ? Jn(
          Q,
          Wi.test(Q) ? "space_name" : "subdomain",
          J
        ) : c && c({
          status: "error",
          message: "Could not load this space.",
          load_status: "error",
          detail: "NOT_FOUND"
        });
      }
      function y(N, x, _) {
        let B = !1, b = !1, g;
        if (typeof N == "number")
          g = Z.dependencies[N];
        else {
          const v = N.replace(/^\//, "");
          g = Z.dependencies[p[v]];
        }
        if (g.types.continuous)
          throw new Error(
            "Cannot call predict on this function as it may run forever. Use submit instead"
          );
        return new Promise((v, M) => {
          const T = q(N, x, _);
          let W;
          T.on("data", (z) => {
            b && (T.destroy(), v(z)), B = !0, W = z;
          }).on("status", (z) => {
            z.stage === "error" && M(z), z.stage === "complete" && (b = !0, B && (T.destroy(), v(W)));
          });
        });
      }
      function q(N, x, _) {
        let B, b;
        if (typeof N == "number")
          B = N, b = k.unnamed_endpoints[B];
        else {
          const ee = N.replace(/^\//, "");
          B = p[ee], b = k.named_endpoints[N.trim()];
        }
        if (typeof B != "number")
          throw new Error(
            "There is no endpoint matching that name of fn_index matching that number."
          );
        let g, v, M = Z.protocol ?? "sse";
        const T = typeof N == "number" ? "/predict" : N;
        let W, z = null, $ = !1;
        const ie = {};
        let le = "";
        typeof window < "u" && (le = new URLSearchParams(window.location.search).toString()), s(
          `${V}//${Ce(U, Z.path, !0)}`,
          x,
          b,
          d
        ).then((ee) => {
          if (W = { data: ee || [], event_data: _, fn_index: B }, Cs(B, Z))
            O({
              type: "status",
              endpoint: T,
              stage: "pending",
              queue: !1,
              fn_index: B,
              time: /* @__PURE__ */ new Date()
            }), n(
              `${V}//${Ce(U, Z.path, !0)}/run${T.startsWith("/") ? T : `/${T}`}${le ? "?" + le : ""}`,
              {
                ...W,
                session_hash: R
              },
              d
            ).then(([P, te]) => {
              const Ee = h ? tn(
                P.data,
                b,
                Z.root,
                Z.root_url
              ) : P.data;
              te == 200 ? (O({
                type: "data",
                endpoint: T,
                fn_index: B,
                data: Ee,
                time: /* @__PURE__ */ new Date()
              }), O({
                type: "status",
                endpoint: T,
                fn_index: B,
                stage: "complete",
                eta: P.average_duration,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              })) : O({
                type: "status",
                stage: "error",
                endpoint: T,
                fn_index: B,
                message: P.error,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            }).catch((P) => {
              O({
                type: "status",
                stage: "error",
                message: P.message,
                endpoint: T,
                fn_index: B,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            });
          else if (M == "ws") {
            O({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: T,
              fn_index: B,
              time: /* @__PURE__ */ new Date()
            });
            let P = new URL(`${m}://${Ce(
              U,
              Z.path,
              !0
            )}
							/queue/join${le ? "?" + le : ""}`);
            X && P.searchParams.set("__sign", X), g = e(P), g.onclose = (te) => {
              te.wasClean || O({
                type: "status",
                stage: "error",
                broken: !0,
                message: Vt,
                queue: !0,
                endpoint: T,
                fn_index: B,
                time: /* @__PURE__ */ new Date()
              });
            }, g.onmessage = function(te) {
              const Ee = JSON.parse(te.data), { type: he, status: K, data: pe } = fl(
                Ee,
                F[B]
              );
              if (he === "update" && K && !$)
                O({
                  type: "status",
                  endpoint: T,
                  fn_index: B,
                  time: /* @__PURE__ */ new Date(),
                  ...K
                }), K.stage === "error" && g.close();
              else if (he === "hash") {
                g.send(JSON.stringify({ fn_index: B, session_hash: R }));
                return;
              } else
                he === "data" ? g.send(JSON.stringify({ ...W, session_hash: R })) : he === "complete" ? $ = K : he === "log" ? O({
                  type: "log",
                  log: pe.log,
                  level: pe.level,
                  endpoint: T,
                  fn_index: B
                }) : he === "generating" && O({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...K,
                  stage: K == null ? void 0 : K.stage,
                  queue: !0,
                  endpoint: T,
                  fn_index: B
                });
              pe && (O({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: h ? tn(
                  pe.data,
                  b,
                  Z.root,
                  Z.root_url
                ) : pe.data,
                endpoint: T,
                fn_index: B
              }), $ && (O({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...$,
                stage: K == null ? void 0 : K.stage,
                queue: !0,
                endpoint: T,
                fn_index: B
              }), g.close()));
            }, rl(Z.version || "2.0.0", "3.6") < 0 && addEventListener(
              "open",
              () => g.send(JSON.stringify({ hash: R }))
            );
          } else {
            O({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: T,
              fn_index: B,
              time: /* @__PURE__ */ new Date()
            });
            var ue = new URLSearchParams({
              fn_index: B.toString(),
              session_hash: R
            }).toString();
            let P = new URL(
              `${V}//${Ce(
                U,
                Z.path,
                !0
              )}/queue/join?${le ? le + "&" : ""}${ue}`
            );
            v = new EventSource(P), v.onmessage = async function(te) {
              const Ee = JSON.parse(te.data), { type: he, status: K, data: pe } = fl(
                Ee,
                F[B]
              );
              if (he === "update" && K && !$)
                O({
                  type: "status",
                  endpoint: T,
                  fn_index: B,
                  time: /* @__PURE__ */ new Date(),
                  ...K
                }), K.stage === "error" && v.close();
              else if (he === "data") {
                z = Ee.event_id;
                let [ou, Ws] = await n(
                  `${V}//${Ce(
                    U,
                    Z.path,
                    !0
                  )}/queue/data`,
                  {
                    ...W,
                    session_hash: R,
                    event_id: z
                  },
                  d
                );
                Ws !== 200 && (O({
                  type: "status",
                  stage: "error",
                  message: Vt,
                  queue: !0,
                  endpoint: T,
                  fn_index: B,
                  time: /* @__PURE__ */ new Date()
                }), v.close());
              } else
                he === "complete" ? $ = K : he === "log" ? O({
                  type: "log",
                  log: pe.log,
                  level: pe.level,
                  endpoint: T,
                  fn_index: B
                }) : he === "generating" && O({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...K,
                  stage: K == null ? void 0 : K.stage,
                  queue: !0,
                  endpoint: T,
                  fn_index: B
                });
              pe && (O({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: h ? tn(
                  pe.data,
                  b,
                  Z.root,
                  Z.root_url
                ) : pe.data,
                endpoint: T,
                fn_index: B
              }), $ && (O({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...$,
                stage: K == null ? void 0 : K.stage,
                queue: !0,
                endpoint: T,
                fn_index: B
              }), v.close()));
            };
          }
        });
        function O(ee) {
          const P = ie[ee.type] || [];
          P == null || P.forEach((te) => te(ee));
        }
        function pt(ee, ue) {
          const P = ie, te = P[ee] || [];
          return P[ee] = te, te == null || te.push(ue), { on: pt, off: Nt, cancel: Kt, destroy: qt };
        }
        function Nt(ee, ue) {
          const P = ie;
          let te = P[ee] || [];
          return te = te == null ? void 0 : te.filter((Ee) => Ee !== ue), P[ee] = te, { on: pt, off: Nt, cancel: Kt, destroy: qt };
        }
        async function Kt() {
          const ee = {
            stage: "complete",
            queue: !1,
            time: /* @__PURE__ */ new Date()
          };
          $ = ee, O({
            ...ee,
            type: "status",
            endpoint: T,
            fn_index: B
          });
          let ue = {};
          M === "ws" ? (g && g.readyState === 0 ? g.addEventListener("open", () => {
            g.close();
          }) : g.close(), ue = { fn_index: B, session_hash: R }) : (v.close(), ue = { event_id: z });
          try {
            await t(
              `${V}//${Ce(
                U,
                Z.path,
                !0
              )}/reset`,
              {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(ue)
              }
            );
          } catch {
            console.warn(
              "The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
            );
          }
        }
        function qt() {
          for (const ee in ie)
            ie[ee].forEach((ue) => {
              Nt(ee, ue);
            });
        }
        return {
          on: pt,
          off: Nt,
          cancel: Kt,
          destroy: qt
        };
      }
      async function w(N, x, _) {
        var B;
        const b = { "Content-Type": "application/json" };
        d && (b.Authorization = `Bearer ${d}`);
        let g, v = Z.components.find(
          (W) => W.id === N
        );
        (B = v == null ? void 0 : v.props) != null && B.root_url ? g = v.props.root_url : g = `${V}//${Ce(
          U,
          Z.path,
          !0
        )}/`;
        const M = await t(
          `${g}component_server/`,
          {
            method: "POST",
            body: JSON.stringify({
              data: _,
              component_id: N,
              fn_name: x,
              session_hash: R
            }),
            headers: b
          }
        );
        if (!M.ok)
          throw new Error(
            "Could not connect to component server: " + M.statusText
          );
        return await M.json();
      }
      async function L(N) {
        if (k)
          return k;
        const x = { "Content-Type": "application/json" };
        d && (x.Authorization = `Bearer ${d}`);
        let _;
        if (rl(N.version || "2.0.0", "3.30") < 0 ? _ = await t(
          "https://gradio-space-api-fetcher-v2.hf.space/api",
          {
            method: "POST",
            body: JSON.stringify({
              serialize: !1,
              config: JSON.stringify(N)
            }),
            headers: x
          }
        ) : _ = await t(`${N.root}/info`, {
          headers: x
        }), !_.ok)
          throw new Error(Vt);
        let B = await _.json();
        return "api" in B && (B = B.api), B.named_endpoints["/predict"] && !B.unnamed_endpoints[0] && (B.unnamed_endpoints[0] = B.named_endpoints["/predict"]), Xs(B, N, p);
      }
    });
  }
  async function s(a, o, r, c) {
    const d = await yn(
      o,
      void 0,
      [],
      !0,
      r
    );
    return Promise.all(
      d.map(async ({ path: u, blob: f, type: h }) => {
        if (f) {
          const m = (await l(a, [f], c)).files[0];
          return { path: u, file_url: m, type: h, name: f == null ? void 0 : f.name };
        }
        return { path: u, type: h };
      })
    ).then((u) => (u.forEach(({ path: f, file_url: h, type: m, name: V }) => {
      if (m === "Gallery")
        ul(o, h, f);
      else if (h) {
        const U = new lt({ path: h, orig_name: V });
        ul(o, U, f);
      }
    }), o));
  }
}
const { post_data: cu, upload_files: Ts, client: du, handle_blob: uu } = ws(
  fetch,
  (...t) => new WebSocket(...t)
);
function tn(t, e, n, l) {
  return t.map((i, s) => {
    var a, o, r, c;
    return ((o = (a = e == null ? void 0 : e.returns) == null ? void 0 : a[s]) == null ? void 0 : o.component) === "File" ? je(i, n, l) : ((c = (r = e == null ? void 0 : e.returns) == null ? void 0 : r[s]) == null ? void 0 : c.component) === "Gallery" ? i.map((d) => Array.isArray(d) ? [je(d[0], n, l), d[1]] : [je(d, n, l), null]) : typeof i == "object" && i.path ? je(i, n, l) : i;
  });
}
function cl(t, e, n, l) {
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
function dl(t, e) {
  return e === "GallerySerializable" ? "array of [file, label] tuples" : e === "ListStringSerializable" ? "array of strings" : e === "FileSerializable" ? "array of files or single file" : t.description;
}
function Xs(t, e, n) {
  const l = {
    named_endpoints: {},
    unnamed_endpoints: {}
  };
  for (const i in t) {
    const s = t[i];
    for (const a in s) {
      const o = e.dependencies[a] ? a : n[a.replace("/", "")], r = s[a];
      l[i][a] = {}, l[i][a].parameters = {}, l[i][a].returns = {}, l[i][a].type = e.dependencies[o].types, l[i][a].parameters = r.parameters.map(
        ({ label: c, component: d, type: u, serializer: f }) => ({
          label: c,
          component: d,
          type: cl(u, d, f, "parameter"),
          description: dl(u, f)
        })
      ), l[i][a].returns = r.returns.map(
        ({ label: c, component: d, type: u, serializer: f }) => ({
          label: c,
          component: d,
          type: cl(u, d, f, "return"),
          description: dl(u, f)
        })
      );
    }
  }
  return l;
}
async function Is(t, e) {
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
function ul(t, e, n) {
  for (; n.length > 1; )
    t = t[n.shift()];
  t[n.shift()] = e;
}
async function yn(t, e = void 0, n = [], l = !1, i = void 0) {
  if (Array.isArray(t)) {
    let s = [];
    return await Promise.all(
      t.map(async (a, o) => {
        var r;
        let c = n.slice();
        c.push(o);
        const d = await yn(
          t[o],
          l ? ((r = i == null ? void 0 : i.parameters[o]) == null ? void 0 : r.component) || void 0 : e,
          c,
          !1,
          i
        );
        s = s.concat(d);
      })
    ), s;
  } else {
    if (globalThis.Buffer && t instanceof globalThis.Buffer)
      return [
        {
          path: n,
          blob: e === "Image" ? !1 : new gi([t]),
          type: e
        }
      ];
    if (typeof t == "object") {
      let s = [];
      for (let a in t)
        if (t.hasOwnProperty(a)) {
          let o = n.slice();
          o.push(a), s = s.concat(
            await yn(
              t[a],
              void 0,
              o,
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
function Cs(t, e) {
  var n, l, i, s;
  return !(((l = (n = e == null ? void 0 : e.dependencies) == null ? void 0 : n[t]) == null ? void 0 : l.queue) === null ? e.enable_queue : (s = (i = e == null ? void 0 : e.dependencies) == null ? void 0 : i[t]) != null && s.queue) || !1;
}
async function hl(t, e, n) {
  const l = {};
  if (n && (l.Authorization = `Bearer ${n}`), typeof window < "u" && window.gradio_config && location.origin !== "http://localhost:9876" && !window.gradio_config.dev_mode) {
    const i = window.gradio_config.root, s = window.gradio_config;
    return s.root = Ce(e, s.root, !1), { ...s, path: i };
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
async function Jn(t, e, n) {
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
    id: o
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
        Jn(t, e, n);
      }, 1e3);
      break;
    case "PAUSED":
      n({
        status: "paused",
        load_status: "error",
        message: "This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
        detail: a,
        discussions_enabled: await ol(o)
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
        Jn(t, e, n);
      }, 1e3);
      break;
    default:
      n({
        status: "space_error",
        load_status: "error",
        message: "This space is experiencing an issue.",
        detail: a,
        discussions_enabled: await ol(o)
      });
      break;
  }
}
function fl(t, e) {
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
          message: ks,
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
  SvelteComponent: Hs,
  assign: Ys,
  create_slot: xs,
  detach: Ms,
  element: Ds,
  get_all_dirty_from_scope: zs,
  get_slot_changes: Os,
  get_spread_update: As,
  init: js,
  insert: Ps,
  safe_not_equal: Ls,
  set_dynamic_element_data: ml,
  set_style: de,
  toggle_class: ke,
  transition_in: yi,
  transition_out: Ji,
  update_slot_base: Ks
} = window.__gradio__svelte__internal;
function qs(t) {
  let e, n, l;
  const i = (
    /*#slots*/
    t[17].default
  ), s = xs(
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
  ], o = {};
  for (let r = 0; r < a.length; r += 1)
    o = Ys(o, a[r]);
  return {
    c() {
      e = Ds(
        /*tag*/
        t[14]
      ), s && s.c(), ml(
        /*tag*/
        t[14]
      )(e, o), ke(
        e,
        "hidden",
        /*visible*/
        t[10] === !1
      ), ke(
        e,
        "padded",
        /*padding*/
        t[6]
      ), ke(
        e,
        "border_focus",
        /*border_mode*/
        t[5] === "focus"
      ), ke(e, "hide-container", !/*explicit_call*/
      t[8] && !/*container*/
      t[9]), de(e, "height", typeof /*height*/
      t[0] == "number" ? (
        /*height*/
        t[0] + "px"
      ) : void 0), de(e, "width", typeof /*width*/
      t[1] == "number" ? `calc(min(${/*width*/
      t[1]}px, 100%))` : void 0), de(
        e,
        "border-style",
        /*variant*/
        t[4]
      ), de(
        e,
        "overflow",
        /*allow_overflow*/
        t[11] ? "visible" : "hidden"
      ), de(
        e,
        "flex-grow",
        /*scale*/
        t[12]
      ), de(e, "min-width", `calc(min(${/*min_width*/
      t[13]}px, 100%))`), de(e, "border-width", "var(--block-border-width)");
    },
    m(r, c) {
      Ps(r, e, c), s && s.m(e, null), l = !0;
    },
    p(r, c) {
      s && s.p && (!l || c & /*$$scope*/
      65536) && Ks(
        s,
        i,
        r,
        /*$$scope*/
        r[16],
        l ? Os(
          i,
          /*$$scope*/
          r[16],
          c,
          null
        ) : zs(
          /*$$scope*/
          r[16]
        ),
        null
      ), ml(
        /*tag*/
        r[14]
      )(e, o = As(a, [
        (!l || c & /*test_id*/
        128) && { "data-testid": (
          /*test_id*/
          r[7]
        ) },
        (!l || c & /*elem_id*/
        4) && { id: (
          /*elem_id*/
          r[2]
        ) },
        (!l || c & /*elem_classes*/
        8 && n !== (n = "block " + /*elem_classes*/
        r[3].join(" ") + " svelte-1t38q2d")) && { class: n }
      ])), ke(
        e,
        "hidden",
        /*visible*/
        r[10] === !1
      ), ke(
        e,
        "padded",
        /*padding*/
        r[6]
      ), ke(
        e,
        "border_focus",
        /*border_mode*/
        r[5] === "focus"
      ), ke(e, "hide-container", !/*explicit_call*/
      r[8] && !/*container*/
      r[9]), c & /*height*/
      1 && de(e, "height", typeof /*height*/
      r[0] == "number" ? (
        /*height*/
        r[0] + "px"
      ) : void 0), c & /*width*/
      2 && de(e, "width", typeof /*width*/
      r[1] == "number" ? `calc(min(${/*width*/
      r[1]}px, 100%))` : void 0), c & /*variant*/
      16 && de(
        e,
        "border-style",
        /*variant*/
        r[4]
      ), c & /*allow_overflow*/
      2048 && de(
        e,
        "overflow",
        /*allow_overflow*/
        r[11] ? "visible" : "hidden"
      ), c & /*scale*/
      4096 && de(
        e,
        "flex-grow",
        /*scale*/
        r[12]
      ), c & /*min_width*/
      8192 && de(e, "min-width", `calc(min(${/*min_width*/
      r[13]}px, 100%))`);
    },
    i(r) {
      l || (yi(s, r), l = !0);
    },
    o(r) {
      Ji(s, r), l = !1;
    },
    d(r) {
      r && Ms(e), s && s.d(r);
    }
  };
}
function $s(t) {
  let e, n = (
    /*tag*/
    t[14] && qs(t)
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
      e || (yi(n, l), e = !0);
    },
    o(l) {
      Ji(n, l), e = !1;
    },
    d(l) {
      n && n.d(l);
    }
  };
}
function ea(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e, { height: s = void 0 } = e, { width: a = void 0 } = e, { elem_id: o = "" } = e, { elem_classes: r = [] } = e, { variant: c = "solid" } = e, { border_mode: d = "base" } = e, { padding: u = !0 } = e, { type: f = "normal" } = e, { test_id: h = void 0 } = e, { explicit_call: m = !1 } = e, { container: V = !0 } = e, { visible: U = !0 } = e, { allow_overflow: Q = !0 } = e, { scale: R = null } = e, { min_width: F = 0 } = e, Z = f === "fieldset" ? "fieldset" : "div";
  return t.$$set = (p) => {
    "height" in p && n(0, s = p.height), "width" in p && n(1, a = p.width), "elem_id" in p && n(2, o = p.elem_id), "elem_classes" in p && n(3, r = p.elem_classes), "variant" in p && n(4, c = p.variant), "border_mode" in p && n(5, d = p.border_mode), "padding" in p && n(6, u = p.padding), "type" in p && n(15, f = p.type), "test_id" in p && n(7, h = p.test_id), "explicit_call" in p && n(8, m = p.explicit_call), "container" in p && n(9, V = p.container), "visible" in p && n(10, U = p.visible), "allow_overflow" in p && n(11, Q = p.allow_overflow), "scale" in p && n(12, R = p.scale), "min_width" in p && n(13, F = p.min_width), "$$scope" in p && n(16, i = p.$$scope);
  }, [
    s,
    a,
    o,
    r,
    c,
    d,
    u,
    h,
    m,
    V,
    U,
    Q,
    R,
    F,
    Z,
    f,
    i,
    l
  ];
}
class Ni extends Hs {
  constructor(e) {
    super(), js(this, e, ea, $s, Ls, {
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
  attr: St,
  create_component: na,
  destroy_component: la,
  detach: ia,
  element: Ul,
  init: sa,
  insert: aa,
  mount_component: ra,
  safe_not_equal: oa,
  set_data: ca,
  space: da,
  text: ua,
  toggle_class: we,
  transition_in: ha,
  transition_out: fa
} = window.__gradio__svelte__internal;
function ma(t) {
  let e, n, l, i, s, a;
  return l = new /*Icon*/
  t[1]({}), {
    c() {
      e = Ul("label"), n = Ul("span"), na(l.$$.fragment), i = da(), s = ua(
        /*label*/
        t[0]
      ), St(n, "class", "svelte-9gxdi0"), St(e, "for", ""), St(e, "data-testid", "block-label"), St(e, "class", "svelte-9gxdi0"), we(e, "hide", !/*show_label*/
      t[2]), we(e, "sr-only", !/*show_label*/
      t[2]), we(
        e,
        "float",
        /*float*/
        t[4]
      ), we(
        e,
        "hide-label",
        /*disable*/
        t[3]
      );
    },
    m(o, r) {
      aa(o, e, r), nn(e, n), ra(l, n, null), nn(e, i), nn(e, s), a = !0;
    },
    p(o, [r]) {
      (!a || r & /*label*/
      1) && ca(
        s,
        /*label*/
        o[0]
      ), (!a || r & /*show_label*/
      4) && we(e, "hide", !/*show_label*/
      o[2]), (!a || r & /*show_label*/
      4) && we(e, "sr-only", !/*show_label*/
      o[2]), (!a || r & /*float*/
      16) && we(
        e,
        "float",
        /*float*/
        o[4]
      ), (!a || r & /*disable*/
      8) && we(
        e,
        "hide-label",
        /*disable*/
        o[3]
      );
    },
    i(o) {
      a || (ha(l.$$.fragment, o), a = !0);
    },
    o(o) {
      fa(l.$$.fragment, o), a = !1;
    },
    d(o) {
      o && ia(e), la(l);
    }
  };
}
function Ua(t, e, n) {
  let { label: l = null } = e, { Icon: i } = e, { show_label: s = !0 } = e, { disable: a = !1 } = e, { float: o = !0 } = e;
  return t.$$set = (r) => {
    "label" in r && n(0, l = r.label), "Icon" in r && n(1, i = r.Icon), "show_label" in r && n(2, s = r.show_label), "disable" in r && n(3, a = r.disable), "float" in r && n(4, o = r.float);
  }, [l, i, s, a, o];
}
class Dt extends ta {
  constructor(e) {
    super(), sa(this, e, Ua, ma, oa, {
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
  attr: Oe,
  bubble: ba,
  create_component: pa,
  destroy_component: Va,
  detach: Si,
  element: Sn,
  init: Za,
  insert: vi,
  listen: Qa,
  mount_component: Ra,
  safe_not_equal: Ba,
  set_data: _a,
  space: Wa,
  text: ga,
  toggle_class: Te,
  transition_in: ya,
  transition_out: Ja
} = window.__gradio__svelte__internal;
function Fl(t) {
  let e, n;
  return {
    c() {
      e = Sn("span"), n = ga(
        /*label*/
        t[1]
      ), Oe(e, "class", "svelte-xtz2g8");
    },
    m(l, i) {
      vi(l, e, i), Nn(e, n);
    },
    p(l, i) {
      i & /*label*/
      2 && _a(
        n,
        /*label*/
        l[1]
      );
    },
    d(l) {
      l && Si(e);
    }
  };
}
function Na(t) {
  let e, n, l, i, s, a, o, r = (
    /*show_label*/
    t[2] && Fl(t)
  );
  return i = new /*Icon*/
  t[0]({}), {
    c() {
      e = Sn("button"), r && r.c(), n = Wa(), l = Sn("div"), pa(i.$$.fragment), Oe(l, "class", "svelte-xtz2g8"), Te(
        l,
        "small",
        /*size*/
        t[4] === "small"
      ), Te(
        l,
        "large",
        /*size*/
        t[4] === "large"
      ), Oe(
        e,
        "aria-label",
        /*label*/
        t[1]
      ), Oe(
        e,
        "title",
        /*label*/
        t[1]
      ), Oe(e, "class", "svelte-xtz2g8"), Te(
        e,
        "pending",
        /*pending*/
        t[3]
      ), Te(
        e,
        "padded",
        /*padded*/
        t[5]
      );
    },
    m(c, d) {
      vi(c, e, d), r && r.m(e, null), Nn(e, n), Nn(e, l), Ra(i, l, null), s = !0, a || (o = Qa(
        e,
        "click",
        /*click_handler*/
        t[6]
      ), a = !0);
    },
    p(c, [d]) {
      /*show_label*/
      c[2] ? r ? r.p(c, d) : (r = Fl(c), r.c(), r.m(e, n)) : r && (r.d(1), r = null), (!s || d & /*size*/
      16) && Te(
        l,
        "small",
        /*size*/
        c[4] === "small"
      ), (!s || d & /*size*/
      16) && Te(
        l,
        "large",
        /*size*/
        c[4] === "large"
      ), (!s || d & /*label*/
      2) && Oe(
        e,
        "aria-label",
        /*label*/
        c[1]
      ), (!s || d & /*label*/
      2) && Oe(
        e,
        "title",
        /*label*/
        c[1]
      ), (!s || d & /*pending*/
      8) && Te(
        e,
        "pending",
        /*pending*/
        c[3]
      ), (!s || d & /*padded*/
      32) && Te(
        e,
        "padded",
        /*padded*/
        c[5]
      );
    },
    i(c) {
      s || (ya(i.$$.fragment, c), s = !0);
    },
    o(c) {
      Ja(i.$$.fragment, c), s = !1;
    },
    d(c) {
      c && Si(e), r && r.d(), Va(i), a = !1, o();
    }
  };
}
function Sa(t, e, n) {
  let { Icon: l } = e, { label: i = "" } = e, { show_label: s = !1 } = e, { pending: a = !1 } = e, { size: o = "small" } = e, { padded: r = !0 } = e;
  function c(d) {
    ba.call(this, t, d);
  }
  return t.$$set = (d) => {
    "Icon" in d && n(0, l = d.Icon), "label" in d && n(1, i = d.label), "show_label" in d && n(2, s = d.show_label), "pending" in d && n(3, a = d.pending), "size" in d && n(4, o = d.size), "padded" in d && n(5, r = d.padded);
  }, [l, i, s, a, o, r, c];
}
class zt extends Fa {
  constructor(e) {
    super(), Za(this, e, Sa, Na, Ba, {
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
  SvelteComponent: va,
  append: Ga,
  attr: ln,
  binding_callbacks: Ea,
  create_slot: ka,
  detach: wa,
  element: bl,
  get_all_dirty_from_scope: Ta,
  get_slot_changes: Xa,
  init: Ia,
  insert: Ca,
  safe_not_equal: Ha,
  toggle_class: Xe,
  transition_in: Ya,
  transition_out: xa,
  update_slot_base: Ma
} = window.__gradio__svelte__internal;
function Da(t) {
  let e, n, l;
  const i = (
    /*#slots*/
    t[5].default
  ), s = ka(
    i,
    t,
    /*$$scope*/
    t[4],
    null
  );
  return {
    c() {
      e = bl("div"), n = bl("div"), s && s.c(), ln(n, "class", "icon svelte-3w3rth"), ln(e, "class", "empty svelte-3w3rth"), ln(e, "aria-label", "Empty value"), Xe(
        e,
        "small",
        /*size*/
        t[0] === "small"
      ), Xe(
        e,
        "large",
        /*size*/
        t[0] === "large"
      ), Xe(
        e,
        "unpadded_box",
        /*unpadded_box*/
        t[1]
      ), Xe(
        e,
        "small_parent",
        /*parent_height*/
        t[3]
      );
    },
    m(a, o) {
      Ca(a, e, o), Ga(e, n), s && s.m(n, null), t[6](e), l = !0;
    },
    p(a, [o]) {
      s && s.p && (!l || o & /*$$scope*/
      16) && Ma(
        s,
        i,
        a,
        /*$$scope*/
        a[4],
        l ? Xa(
          i,
          /*$$scope*/
          a[4],
          o,
          null
        ) : Ta(
          /*$$scope*/
          a[4]
        ),
        null
      ), (!l || o & /*size*/
      1) && Xe(
        e,
        "small",
        /*size*/
        a[0] === "small"
      ), (!l || o & /*size*/
      1) && Xe(
        e,
        "large",
        /*size*/
        a[0] === "large"
      ), (!l || o & /*unpadded_box*/
      2) && Xe(
        e,
        "unpadded_box",
        /*unpadded_box*/
        a[1]
      ), (!l || o & /*parent_height*/
      8) && Xe(
        e,
        "small_parent",
        /*parent_height*/
        a[3]
      );
    },
    i(a) {
      l || (Ya(s, a), l = !0);
    },
    o(a) {
      xa(s, a), l = !1;
    },
    d(a) {
      a && wa(e), s && s.d(a), t[6](null);
    }
  };
}
function za(t) {
  let e, n = t[0], l = 1;
  for (; l < t.length; ) {
    const i = t[l], s = t[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (e = n, n = s(n)) : (i === "call" || i === "optionalCall") && (n = s((...a) => n.call(e, ...a)), e = void 0);
  }
  return n;
}
function Oa(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { size: a = "small" } = e, { unpadded_box: o = !1 } = e, r;
  function c(u) {
    if (!u)
      return !1;
    const { height: f } = u.getBoundingClientRect(), { height: h } = za([
      u,
      "access",
      (m) => m.parentElement,
      "optionalAccess",
      (m) => m.getBoundingClientRect,
      "call",
      (m) => m()
    ]) || { height: f };
    return f > h + 2;
  }
  function d(u) {
    Ea[u ? "unshift" : "push"](() => {
      r = u, n(2, r);
    });
  }
  return t.$$set = (u) => {
    "size" in u && n(0, a = u.size), "unpadded_box" in u && n(1, o = u.unpadded_box), "$$scope" in u && n(4, s = u.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty & /*el*/
    4 && n(3, l = c(r));
  }, [a, o, r, l, s, i, d];
}
class Aa extends va {
  constructor(e) {
    super(), Ia(this, e, Oa, Da, Ha, { size: 0, unpadded_box: 1 });
  }
}
const {
  SvelteComponent: ja,
  append: sn,
  attr: Ve,
  detach: Pa,
  init: La,
  insert: Ka,
  noop: an,
  safe_not_equal: qa,
  set_style: ye,
  svg_element: vt
} = window.__gradio__svelte__internal;
function $a(t) {
  let e, n, l, i;
  return {
    c() {
      e = vt("svg"), n = vt("g"), l = vt("path"), i = vt("path"), Ve(l, "d", "M18,6L6.087,17.913"), ye(l, "fill", "none"), ye(l, "fill-rule", "nonzero"), ye(l, "stroke-width", "2px"), Ve(n, "transform", "matrix(1.14096,-0.140958,-0.140958,1.14096,-0.0559523,0.0559523)"), Ve(i, "d", "M4.364,4.364L19.636,19.636"), ye(i, "fill", "none"), ye(i, "fill-rule", "nonzero"), ye(i, "stroke-width", "2px"), Ve(e, "width", "100%"), Ve(e, "height", "100%"), Ve(e, "viewBox", "0 0 24 24"), Ve(e, "version", "1.1"), Ve(e, "xmlns", "http://www.w3.org/2000/svg"), Ve(e, "xmlns:xlink", "http://www.w3.org/1999/xlink"), Ve(e, "xml:space", "preserve"), Ve(e, "stroke", "currentColor"), ye(e, "fill-rule", "evenodd"), ye(e, "clip-rule", "evenodd"), ye(e, "stroke-linecap", "round"), ye(e, "stroke-linejoin", "round");
    },
    m(s, a) {
      Ka(s, e, a), sn(e, n), sn(n, l), sn(e, i);
    },
    p: an,
    i: an,
    o: an,
    d(s) {
      s && Pa(e);
    }
  };
}
class er extends ja {
  constructor(e) {
    super(), La(this, e, null, $a, qa, {});
  }
}
const {
  SvelteComponent: tr,
  append: nr,
  attr: $e,
  detach: lr,
  init: ir,
  insert: sr,
  noop: rn,
  safe_not_equal: ar,
  svg_element: pl
} = window.__gradio__svelte__internal;
function rr(t) {
  let e, n;
  return {
    c() {
      e = pl("svg"), n = pl("path"), $e(n, "fill", "currentColor"), $e(n, "d", "M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z"), $e(e, "xmlns", "http://www.w3.org/2000/svg"), $e(e, "width", "100%"), $e(e, "height", "100%"), $e(e, "viewBox", "0 0 32 32");
    },
    m(l, i) {
      sr(l, e, i), nr(e, n);
    },
    p: rn,
    i: rn,
    o: rn,
    d(l) {
      l && lr(e);
    }
  };
}
class or extends tr {
  constructor(e) {
    super(), ir(this, e, null, rr, ar, {});
  }
}
const {
  SvelteComponent: cr,
  append: dr,
  attr: Ze,
  detach: ur,
  init: hr,
  insert: fr,
  noop: on,
  safe_not_equal: mr,
  svg_element: Vl
} = window.__gradio__svelte__internal;
function Ur(t) {
  let e, n;
  return {
    c() {
      e = Vl("svg"), n = Vl("path"), Ze(n, "d", "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"), Ze(e, "xmlns", "http://www.w3.org/2000/svg"), Ze(e, "width", "100%"), Ze(e, "height", "100%"), Ze(e, "viewBox", "0 0 24 24"), Ze(e, "fill", "none"), Ze(e, "stroke", "currentColor"), Ze(e, "stroke-width", "1.5"), Ze(e, "stroke-linecap", "round"), Ze(e, "stroke-linejoin", "round"), Ze(e, "class", "feather feather-edit-2");
    },
    m(l, i) {
      fr(l, e, i), dr(e, n);
    },
    p: on,
    i: on,
    o: on,
    d(l) {
      l && ur(e);
    }
  };
}
class Fr extends cr {
  constructor(e) {
    super(), hr(this, e, null, Ur, mr, {});
  }
}
const {
  SvelteComponent: br,
  append: Zl,
  attr: fe,
  detach: pr,
  init: Vr,
  insert: Zr,
  noop: cn,
  safe_not_equal: Qr,
  svg_element: dn
} = window.__gradio__svelte__internal;
function Rr(t) {
  let e, n, l;
  return {
    c() {
      e = dn("svg"), n = dn("path"), l = dn("polyline"), fe(n, "d", "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"), fe(l, "points", "13 2 13 9 20 9"), fe(e, "xmlns", "http://www.w3.org/2000/svg"), fe(e, "width", "100%"), fe(e, "height", "100%"), fe(e, "viewBox", "0 0 24 24"), fe(e, "fill", "none"), fe(e, "stroke", "currentColor"), fe(e, "stroke-width", "1.5"), fe(e, "stroke-linecap", "round"), fe(e, "stroke-linejoin", "round"), fe(e, "class", "feather feather-file");
    },
    m(i, s) {
      Zr(i, e, s), Zl(e, n), Zl(e, l);
    },
    p: cn,
    i: cn,
    o: cn,
    d(i) {
      i && pr(e);
    }
  };
}
let Wt = class extends br {
  constructor(e) {
    super(), Vr(this, e, null, Rr, Qr, {});
  }
};
const {
  SvelteComponent: Br,
  append: Ql,
  attr: me,
  detach: _r,
  init: Wr,
  insert: gr,
  noop: un,
  safe_not_equal: yr,
  svg_element: hn
} = window.__gradio__svelte__internal;
function Jr(t) {
  let e, n, l;
  return {
    c() {
      e = hn("svg"), n = hn("polyline"), l = hn("path"), me(n, "points", "1 4 1 10 7 10"), me(l, "d", "M3.51 15a9 9 0 1 0 2.13-9.36L1 10"), me(e, "xmlns", "http://www.w3.org/2000/svg"), me(e, "width", "100%"), me(e, "height", "100%"), me(e, "viewBox", "0 0 24 24"), me(e, "fill", "none"), me(e, "stroke", "currentColor"), me(e, "stroke-width", "2"), me(e, "stroke-linecap", "round"), me(e, "stroke-linejoin", "round"), me(e, "class", "feather feather-rotate-ccw");
    },
    m(i, s) {
      gr(i, e, s), Ql(e, n), Ql(e, l);
    },
    p: un,
    i: un,
    o: un,
    d(i) {
      i && _r(e);
    }
  };
}
class Nr extends Br {
  constructor(e) {
    super(), Wr(this, e, null, Jr, yr, {});
  }
}
const {
  SvelteComponent: Sr,
  append: fn,
  attr: se,
  detach: vr,
  init: Gr,
  insert: Er,
  noop: mn,
  safe_not_equal: kr,
  svg_element: Gt
} = window.__gradio__svelte__internal;
function wr(t) {
  let e, n, l, i;
  return {
    c() {
      e = Gt("svg"), n = Gt("path"), l = Gt("polyline"), i = Gt("line"), se(n, "d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), se(l, "points", "17 8 12 3 7 8"), se(i, "x1", "12"), se(i, "y1", "3"), se(i, "x2", "12"), se(i, "y2", "15"), se(e, "xmlns", "http://www.w3.org/2000/svg"), se(e, "width", "90%"), se(e, "height", "90%"), se(e, "viewBox", "0 0 24 24"), se(e, "fill", "none"), se(e, "stroke", "currentColor"), se(e, "stroke-width", "2"), se(e, "stroke-linecap", "round"), se(e, "stroke-linejoin", "round"), se(e, "class", "feather feather-upload");
    },
    m(s, a) {
      Er(s, e, a), fn(e, n), fn(e, l), fn(e, i);
    },
    p: mn,
    i: mn,
    o: mn,
    d(s) {
      s && vr(e);
    }
  };
}
let Tr = class extends Sr {
  constructor(e) {
    super(), Gr(this, e, null, wr, kr, {});
  }
};
const Xr = [
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
], Rl = {
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
Xr.reduce(
  (t, { color: e, primary: n, secondary: l }) => ({
    ...t,
    [e]: {
      primary: Rl[e][n],
      secondary: Rl[e][l]
    }
  }),
  {}
);
const {
  SvelteComponent: Ir,
  append: Pe,
  attr: vn,
  create_component: Cr,
  destroy_component: Hr,
  detach: Tt,
  element: Gn,
  init: Yr,
  insert: Xt,
  mount_component: xr,
  safe_not_equal: Mr,
  set_data: En,
  space: kn,
  text: Qt,
  toggle_class: Bl,
  transition_in: Dr,
  transition_out: zr
} = window.__gradio__svelte__internal;
function _l(t) {
  let e, n, l = (
    /*i18n*/
    t[1]("common.or") + ""
  ), i, s, a, o = (
    /*message*/
    (t[2] || /*i18n*/
    t[1]("upload_text.click_to_upload")) + ""
  ), r;
  return {
    c() {
      e = Gn("span"), n = Qt("- "), i = Qt(l), s = Qt(" -"), a = kn(), r = Qt(o), vn(e, "class", "or svelte-kzcjhc");
    },
    m(c, d) {
      Xt(c, e, d), Pe(e, n), Pe(e, i), Pe(e, s), Xt(c, a, d), Xt(c, r, d);
    },
    p(c, d) {
      d & /*i18n*/
      2 && l !== (l = /*i18n*/
      c[1]("common.or") + "") && En(i, l), d & /*message, i18n*/
      6 && o !== (o = /*message*/
      (c[2] || /*i18n*/
      c[1]("upload_text.click_to_upload")) + "") && En(r, o);
    },
    d(c) {
      c && (Tt(e), Tt(a), Tt(r));
    }
  };
}
function Or(t) {
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
  ), a, o, r;
  l = new Tr({});
  let c = (
    /*mode*/
    t[3] !== "short" && _l(t)
  );
  return {
    c() {
      e = Gn("div"), n = Gn("span"), Cr(l.$$.fragment), i = kn(), a = Qt(s), o = kn(), c && c.c(), vn(n, "class", "icon-wrap svelte-kzcjhc"), Bl(
        n,
        "hovered",
        /*hovered*/
        t[4]
      ), vn(e, "class", "wrap svelte-kzcjhc");
    },
    m(d, u) {
      Xt(d, e, u), Pe(e, n), xr(l, n, null), Pe(e, i), Pe(e, a), Pe(e, o), c && c.m(e, null), r = !0;
    },
    p(d, [u]) {
      (!r || u & /*hovered*/
      16) && Bl(
        n,
        "hovered",
        /*hovered*/
        d[4]
      ), (!r || u & /*i18n, type*/
      3) && s !== (s = /*i18n*/
      d[1](
        /*defs*/
        d[5][
          /*type*/
          d[0]
        ] || /*defs*/
        d[5].file
      ) + "") && En(a, s), /*mode*/
      d[3] !== "short" ? c ? c.p(d, u) : (c = _l(d), c.c(), c.m(e, null)) : c && (c.d(1), c = null);
    },
    i(d) {
      r || (Dr(l.$$.fragment, d), r = !0);
    },
    o(d) {
      zr(l.$$.fragment, d), r = !1;
    },
    d(d) {
      d && Tt(e), Hr(l), c && c.d();
    }
  };
}
function Ar(t, e, n) {
  let { type: l = "file" } = e, { i18n: i } = e, { message: s = void 0 } = e, { mode: a = "full" } = e, { hovered: o = !1 } = e;
  const r = {
    image: "upload_text.drop_image",
    video: "upload_text.drop_video",
    audio: "upload_text.drop_audio",
    file: "upload_text.drop_file",
    csv: "upload_text.drop_csv"
  };
  return t.$$set = (c) => {
    "type" in c && n(0, l = c.type), "i18n" in c && n(1, i = c.i18n), "message" in c && n(2, s = c.message), "mode" in c && n(3, a = c.mode), "hovered" in c && n(4, o = c.hovered);
  }, [l, i, s, a, o, r];
}
class jr extends Ir {
  constructor(e) {
    super(), Yr(this, e, Ar, Or, Mr, {
      type: 0,
      i18n: 1,
      message: 2,
      mode: 3,
      hovered: 4
    });
  }
}
class D {
  constructor(e = 0, n = 0, l = 0) {
    this.x = e, this.y = n, this.z = l;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z;
  }
  add(e) {
    return typeof e == "number" ? new D(this.x + e, this.y + e, this.z + e) : new D(this.x + e.x, this.y + e.y, this.z + e.z);
  }
  subtract(e) {
    return typeof e == "number" ? new D(this.x - e, this.y - e, this.z - e) : new D(this.x - e.x, this.y - e.y, this.z - e.z);
  }
  multiply(e) {
    return typeof e == "number" ? new D(this.x * e, this.y * e, this.z * e) : new D(this.x * e.x, this.y * e.y, this.z * e.z);
  }
  lerp(e, n) {
    return new D(this.x + (e.x - this.x) * n, this.y + (e.y - this.y) * n, this.z + (e.z - this.z) * n);
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  distanceTo(e) {
    return Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2 + (this.z - e.z) ** 2);
  }
  normalize() {
    const e = this.length();
    return new D(this.x / e, this.y / e, this.z / e);
  }
  flat() {
    return [this.x, this.y, this.z];
  }
  clone() {
    return new D(this.x, this.y, this.z);
  }
}
class re {
  constructor(e = 0, n = 0, l = 0, i = 1) {
    this.x = e, this.y = n, this.z = l, this.w = i;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z && this.w === e.w;
  }
  normalize() {
    const e = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    return new re(this.x / e, this.y / e, this.z / e, this.w / e);
  }
  multiply(e) {
    const n = this.w, l = this.x, i = this.y, s = this.z, a = e.w, o = e.x, r = e.y, c = e.z;
    return new re(n * o + l * a + i * c - s * r, n * r - l * c + i * a + s * o, n * c + l * r - i * o + s * a, n * a - l * o - i * r - s * c);
  }
  flat() {
    return [this.x, this.y, this.z, this.w];
  }
  clone() {
    return new re(this.x, this.y, this.z, this.w);
  }
  static FromEuler(e) {
    const n = e.x / 2, l = e.y / 2, i = e.z / 2, s = Math.cos(l), a = Math.sin(l), o = Math.cos(n), r = Math.sin(n), c = Math.cos(i), d = Math.sin(i);
    return new re(s * r * c + a * o * d, a * o * c - s * r * d, s * o * d - a * r * c, s * o * c + a * r * d);
  }
  toEuler() {
    const e = 2 * (this.w * this.x + this.y * this.z), n = 1 - 2 * (this.x * this.x + this.y * this.y), l = Math.atan2(e, n);
    let i;
    const s = 2 * (this.w * this.y - this.z * this.x);
    i = Math.abs(s) >= 1 ? Math.sign(s) * Math.PI / 2 : Math.asin(s);
    const a = 2 * (this.w * this.z + this.x * this.y), o = 1 - 2 * (this.y * this.y + this.z * this.z), r = Math.atan2(a, o);
    return new D(l, i, r);
  }
  static FromMatrix3(e) {
    const n = e.buffer, l = n[0] + n[4] + n[8];
    let i, s, a, o;
    if (l > 0) {
      const r = 0.5 / Math.sqrt(l + 1);
      o = 0.25 / r, i = (n[7] - n[5]) * r, s = (n[2] - n[6]) * r, a = (n[3] - n[1]) * r;
    } else if (n[0] > n[4] && n[0] > n[8]) {
      const r = 2 * Math.sqrt(1 + n[0] - n[4] - n[8]);
      o = (n[7] - n[5]) / r, i = 0.25 * r, s = (n[1] + n[3]) / r, a = (n[2] + n[6]) / r;
    } else if (n[4] > n[8]) {
      const r = 2 * Math.sqrt(1 + n[4] - n[0] - n[8]);
      o = (n[2] - n[6]) / r, i = (n[1] + n[3]) / r, s = 0.25 * r, a = (n[5] + n[7]) / r;
    } else {
      const r = 2 * Math.sqrt(1 + n[8] - n[0] - n[4]);
      o = (n[3] - n[1]) / r, i = (n[2] + n[6]) / r, s = (n[5] + n[7]) / r, a = 0.25 * r;
    }
    return new re(i, s, a, o);
  }
}
class Gi {
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
class Pr extends Gi {
  constructor() {
    super(), this._position = new D(), this._rotation = new re(), this._changeEvent = { type: "change" };
  }
  get position() {
    return this._position;
  }
  set position(e) {
    this._position.equals(e) || (this._position = e, this.dispatchEvent(this._changeEvent));
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(e) {
    this._rotation.equals(e) || (this._rotation = e, this.dispatchEvent(this._changeEvent));
  }
}
class ne {
  constructor(e = 1, n = 0, l = 0, i = 0, s = 1, a = 0, o = 0, r = 0, c = 1) {
    this.buffer = [e, n, l, i, s, a, o, r, c];
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
    return new ne(l[0] * n[0] + l[3] * n[1] + l[6] * n[2], l[1] * n[0] + l[4] * n[1] + l[7] * n[2], l[2] * n[0] + l[5] * n[1] + l[8] * n[2], l[0] * n[3] + l[3] * n[4] + l[6] * n[5], l[1] * n[3] + l[4] * n[4] + l[7] * n[5], l[2] * n[3] + l[5] * n[4] + l[8] * n[5], l[0] * n[6] + l[3] * n[7] + l[6] * n[8], l[1] * n[6] + l[4] * n[7] + l[7] * n[8], l[2] * n[6] + l[5] * n[7] + l[8] * n[8]);
  }
  clone() {
    const e = this.buffer;
    return new ne(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8]);
  }
  static Eye(e = 1) {
    return new ne(e, 0, 0, 0, e, 0, 0, 0, e);
  }
  static Diagonal(e) {
    return new ne(e.x, 0, 0, 0, e.y, 0, 0, 0, e.z);
  }
  static RotationFromQuaternion(e) {
    return new ne(1 - 2 * e.y * e.y - 2 * e.z * e.z, 2 * e.x * e.y - 2 * e.z * e.w, 2 * e.x * e.z + 2 * e.y * e.w, 2 * e.x * e.y + 2 * e.z * e.w, 1 - 2 * e.x * e.x - 2 * e.z * e.z, 2 * e.y * e.z - 2 * e.x * e.w, 2 * e.x * e.z - 2 * e.y * e.w, 2 * e.y * e.z + 2 * e.x * e.w, 1 - 2 * e.x * e.x - 2 * e.y * e.y);
  }
  static RotationFromEuler(e) {
    const n = Math.cos(e.x), l = Math.sin(e.x), i = Math.cos(e.y), s = Math.sin(e.y), a = Math.cos(e.z), o = Math.sin(e.z);
    return new ne(i * a + s * l * o, -i * o + s * l * a, s * n, n * o, n * a, -l, -s * a + i * l * o, s * o + i * l * a, i * n);
  }
}
class He {
  constructor(e = 1, n = 0, l = 0, i = 0, s = 0, a = 1, o = 0, r = 0, c = 0, d = 0, u = 1, f = 0, h = 0, m = 0, V = 0, U = 1) {
    this.buffer = [e, n, l, i, s, a, o, r, c, d, u, f, h, m, V, U];
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
    return new He(l[0] * n[0] + l[1] * n[4] + l[2] * n[8] + l[3] * n[12], l[0] * n[1] + l[1] * n[5] + l[2] * n[9] + l[3] * n[13], l[0] * n[2] + l[1] * n[6] + l[2] * n[10] + l[3] * n[14], l[0] * n[3] + l[1] * n[7] + l[2] * n[11] + l[3] * n[15], l[4] * n[0] + l[5] * n[4] + l[6] * n[8] + l[7] * n[12], l[4] * n[1] + l[5] * n[5] + l[6] * n[9] + l[7] * n[13], l[4] * n[2] + l[5] * n[6] + l[6] * n[10] + l[7] * n[14], l[4] * n[3] + l[5] * n[7] + l[6] * n[11] + l[7] * n[15], l[8] * n[0] + l[9] * n[4] + l[10] * n[8] + l[11] * n[12], l[8] * n[1] + l[9] * n[5] + l[10] * n[9] + l[11] * n[13], l[8] * n[2] + l[9] * n[6] + l[10] * n[10] + l[11] * n[14], l[8] * n[3] + l[9] * n[7] + l[10] * n[11] + l[11] * n[15], l[12] * n[0] + l[13] * n[4] + l[14] * n[8] + l[15] * n[12], l[12] * n[1] + l[13] * n[5] + l[14] * n[9] + l[15] * n[13], l[12] * n[2] + l[13] * n[6] + l[14] * n[10] + l[15] * n[14], l[12] * n[3] + l[13] * n[7] + l[14] * n[11] + l[15] * n[15]);
  }
  clone() {
    const e = this.buffer;
    return new He(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]);
  }
}
class Ei extends Pr {
  constructor(e = new D(0, 0, -5), n = new re(), l = 1132, i = 1132, s = 0.1, a = 100) {
    super();
    const o = () => {
      const r = ne.RotationFromQuaternion(this.rotation).buffer, c = this.position.flat(), d = [[r[0], r[1], r[2], 0], [r[3], r[4], r[5], 0], [r[6], r[7], r[8], 0], [-c[0] * r[0] - c[1] * r[3] - c[2] * r[6], -c[0] * r[1] - c[1] * r[4] - c[2] * r[7], -c[0] * r[2] - c[1] * r[5] - c[2] * r[8], 1]].flat();
      return new He(...d);
    };
    this.position = e, this.rotation = n, this.fx = l, this.fy = i, this.near = s, this.far = a, this.projectionMatrix = new He(), this.viewMatrix = new He(), this.viewProj = new He(), this.update = (r, c) => {
      this.projectionMatrix = new He(2 * this.fx / r, 0, 0, 0, 0, -2 * this.fy / c, 0, 0, 0, 0, this.far / (this.far - this.near), 1, 0, 0, -this.far * this.near / (this.far - this.near), 0), this.viewMatrix = o(), this.viewProj = this.projectionMatrix.multiply(this.viewMatrix);
    };
  }
}
class Be extends Gi {
  constructor() {
    super();
    const e = new Float32Array(1), n = new Int32Array(e.buffer), l = (a) => {
      e[0] = a;
      const o = n[0], r = o >> 23 & 255;
      let c, d = 8388607 & o;
      return r == 0 ? c = 0 : r < 113 ? (c = 0, d |= 8388608, d >>= 113 - r, 16777216 & d && (c = 1, d = 0)) : r < 142 ? c = r - 112 : (c = 31, d = 0), (o >> 31 & 1) << 15 | c << 10 | d >> 13;
    }, i = (a, o) => (l(a) | l(o) << 16) >>> 0, s = { type: "change" };
    this._data = new Uint32Array(0), this._vertexCount = 0, this._width = 2048, this._height = 0, this._positions = new Float32Array(0), this._rotations = new Float32Array(0), this._scales = new Float32Array(0), this.setData = (a) => {
      this._vertexCount = a.length / Be.RowLength, this._height = Math.ceil(2 * this._vertexCount / this._width), this._data = new Uint32Array(this._width * this._height * 4), this._positions = new Float32Array(3 * this._vertexCount), this._rotations = new Float32Array(4 * this._vertexCount), this._scales = new Float32Array(3 * this._vertexCount);
      const o = new Float32Array(a.buffer), r = new Uint8Array(a.buffer), c = new Uint8Array(this._data.buffer), d = new Float32Array(this._data.buffer);
      for (let u = 0; u < this._vertexCount; u++) {
        this._positions[3 * u + 0] = o[8 * u + 0], this._positions[3 * u + 1] = o[8 * u + 1], this._positions[3 * u + 2] = o[8 * u + 2], this._rotations[4 * u + 0] = (r[32 * u + 28 + 0] - 128) / 128, this._rotations[4 * u + 1] = (r[32 * u + 28 + 1] - 128) / 128, this._rotations[4 * u + 2] = (r[32 * u + 28 + 2] - 128) / 128, this._rotations[4 * u + 3] = (r[32 * u + 28 + 3] - 128) / 128, this._scales[3 * u + 0] = o[8 * u + 3 + 0], this._scales[3 * u + 1] = o[8 * u + 3 + 1], this._scales[3 * u + 2] = o[8 * u + 3 + 2], d[8 * u + 0] = this._positions[3 * u + 0], d[8 * u + 1] = this._positions[3 * u + 1], d[8 * u + 2] = this._positions[3 * u + 2], c[4 * (8 * u + 7) + 0] = r[32 * u + 24 + 0], c[4 * (8 * u + 7) + 1] = r[32 * u + 24 + 1], c[4 * (8 * u + 7) + 2] = r[32 * u + 24 + 2], c[4 * (8 * u + 7) + 3] = r[32 * u + 24 + 3];
        const f = ne.RotationFromQuaternion(new re(this._rotations[4 * u + 1], this._rotations[4 * u + 2], this._rotations[4 * u + 3], -this._rotations[4 * u + 0])), h = ne.Diagonal(new D(this._scales[3 * u + 0], this._scales[3 * u + 1], this._scales[3 * u + 2])).multiply(f).buffer, m = [h[0] * h[0] + h[3] * h[3] + h[6] * h[6], h[0] * h[1] + h[3] * h[4] + h[6] * h[7], h[0] * h[2] + h[3] * h[5] + h[6] * h[8], h[1] * h[1] + h[4] * h[4] + h[7] * h[7], h[1] * h[2] + h[4] * h[5] + h[7] * h[8], h[2] * h[2] + h[5] * h[5] + h[8] * h[8]];
        this._data[8 * u + 4] = i(4 * m[0], 4 * m[1]), this._data[8 * u + 5] = i(4 * m[2], 4 * m[3]), this._data[8 * u + 6] = i(4 * m[4], 4 * m[5]);
      }
      this.dispatchEvent(s);
    }, this.translate = (a) => {
      const o = new Float32Array(this._data.buffer);
      for (let r = 0; r < this._vertexCount; r++)
        this._positions[3 * r + 0] += a.x, this._positions[3 * r + 1] += a.y, this._positions[3 * r + 2] += a.z, o[8 * r + 0] = this._positions[3 * r + 0], o[8 * r + 1] = this._positions[3 * r + 1], o[8 * r + 2] = this._positions[3 * r + 2];
      this.dispatchEvent(s);
    }, this.rotate = (a) => {
      const o = ne.RotationFromQuaternion(a).buffer, r = new Float32Array(this._data.buffer);
      for (let c = 0; c < this._vertexCount; c++) {
        const d = this._positions[3 * c + 0], u = this._positions[3 * c + 1], f = this._positions[3 * c + 2];
        this._positions[3 * c + 0] = o[0] * d + o[1] * u + o[2] * f, this._positions[3 * c + 1] = o[3] * d + o[4] * u + o[5] * f, this._positions[3 * c + 2] = o[6] * d + o[7] * u + o[8] * f, r[8 * c + 0] = this._positions[3 * c + 0], r[8 * c + 1] = this._positions[3 * c + 1], r[8 * c + 2] = this._positions[3 * c + 2];
        const h = new re(this._rotations[4 * c + 1], this._rotations[4 * c + 2], this._rotations[4 * c + 3], this._rotations[4 * c + 0]), m = a.multiply(h);
        this._rotations[4 * c + 1] = m.x, this._rotations[4 * c + 2] = m.y, this._rotations[4 * c + 3] = m.z, this._rotations[4 * c + 0] = m.w;
        const V = ne.RotationFromQuaternion(new re(this._rotations[4 * c + 1], this._rotations[4 * c + 2], this._rotations[4 * c + 3], -this._rotations[4 * c + 0])), U = ne.Diagonal(new D(this._scales[3 * c + 0], this._scales[3 * c + 1], this._scales[3 * c + 2])).multiply(V).buffer, Q = [U[0] * U[0] + U[3] * U[3] + U[6] * U[6], U[0] * U[1] + U[3] * U[4] + U[6] * U[7], U[0] * U[2] + U[3] * U[5] + U[6] * U[8], U[1] * U[1] + U[4] * U[4] + U[7] * U[7], U[1] * U[2] + U[4] * U[5] + U[7] * U[8], U[2] * U[2] + U[5] * U[5] + U[8] * U[8]];
        this._data[8 * c + 4] = i(4 * Q[0], 4 * Q[1]), this._data[8 * c + 5] = i(4 * Q[2], 4 * Q[3]), this._data[8 * c + 6] = i(4 * Q[4], 4 * Q[5]);
      }
      this.dispatchEvent(s);
    }, this.scale = (a) => {
      const o = new Float32Array(this._data.buffer);
      for (let r = 0; r < this.vertexCount; r++) {
        this._positions[3 * r + 0] *= a.x, this._positions[3 * r + 1] *= a.y, this._positions[3 * r + 2] *= a.z, o[8 * r + 0] = this._positions[3 * r + 0], o[8 * r + 1] = this._positions[3 * r + 1], o[8 * r + 2] = this._positions[3 * r + 2], this._scales[3 * r + 0] *= a.x, this._scales[3 * r + 1] *= a.y, this._scales[3 * r + 2] *= a.z;
        const c = ne.RotationFromQuaternion(new re(this._rotations[4 * r + 1], this._rotations[4 * r + 2], this._rotations[4 * r + 3], -this._rotations[4 * r + 0])), d = ne.Diagonal(new D(this._scales[3 * r + 0], this._scales[3 * r + 1], this._scales[3 * r + 2])).multiply(c).buffer, u = [d[0] * d[0] + d[3] * d[3] + d[6] * d[6], d[0] * d[1] + d[3] * d[4] + d[6] * d[7], d[0] * d[2] + d[3] * d[5] + d[6] * d[8], d[1] * d[1] + d[4] * d[4] + d[7] * d[7], d[1] * d[2] + d[4] * d[5] + d[7] * d[8], d[2] * d[2] + d[5] * d[5] + d[8] * d[8]];
        this._data[8 * r + 4] = i(4 * u[0], 4 * u[1]), this._data[8 * r + 5] = i(4 * u[2], 4 * u[3]), this._data[8 * r + 6] = i(4 * u[4], 4 * u[5]);
      }
      this.dispatchEvent(s);
    }, this.limitBox = (a, o, r, c, d, u) => {
      if (a >= o)
        throw new Error(`xMin (${a}) must be smaller than xMax (${o})`);
      if (r >= c)
        throw new Error(`yMin (${r}) must be smaller than yMax (${c})`);
      if (d >= u)
        throw new Error(`zMin (${d}) must be smaller than zMax (${u})`);
      const f = new Uint8Array(this._vertexCount);
      for (let m = 0; m < this._vertexCount; m++) {
        const V = this._positions[3 * m + 0], U = this._positions[3 * m + 1], Q = this._positions[3 * m + 2];
        V >= a && V <= o && U >= r && U <= c && Q >= d && Q <= u && (f[m] = 1);
      }
      let h = 0;
      for (let m = 0; m < this._vertexCount; m++)
        f[m] !== 0 && (this._data[8 * h + 0] = this._data[8 * m + 0], this._data[8 * h + 1] = this._data[8 * m + 1], this._data[8 * h + 2] = this._data[8 * m + 2], this._data[8 * h + 3] = this._data[8 * m + 3], this._data[8 * h + 4] = this._data[8 * m + 4], this._data[8 * h + 5] = this._data[8 * m + 5], this._data[8 * h + 6] = this._data[8 * m + 6], this._data[8 * h + 7] = this._data[8 * m + 7], this._positions[3 * h + 0] = this._positions[3 * m + 0], this._positions[3 * h + 1] = this._positions[3 * m + 1], this._positions[3 * h + 2] = this._positions[3 * m + 2], this._rotations[4 * h + 0] = this._rotations[4 * m + 0], this._rotations[4 * h + 1] = this._rotations[4 * m + 1], this._rotations[4 * h + 2] = this._rotations[4 * m + 2], this._rotations[4 * h + 3] = this._rotations[4 * m + 3], this._scales[3 * h + 0] = this._scales[3 * m + 0], this._scales[3 * h + 1] = this._scales[3 * m + 1], this._scales[3 * h + 2] = this._scales[3 * m + 2], h += 1);
      this._height = Math.ceil(2 * h / this._width), this._vertexCount = h, this._data = new Uint32Array(this._data.buffer, 0, this._width * this._height * 4), this._positions = new Float32Array(this._positions.buffer, 0, 3 * h), this._rotations = new Float32Array(this._rotations.buffer, 0, 4 * h), this._scales = new Float32Array(this._scales.buffer, 0, 3 * h), this.dispatchEvent(s);
    }, this.saveToFile = (a) => {
      if (!document)
        return;
      const o = new Uint8Array(this._vertexCount * Be.RowLength), r = new Float32Array(o.buffer), c = new Uint8Array(o.buffer), d = new Uint8Array(this._data.buffer);
      for (let h = 0; h < this._vertexCount; h++)
        r[8 * h + 0] = this._positions[3 * h + 0], r[8 * h + 1] = this._positions[3 * h + 1], r[8 * h + 2] = this._positions[3 * h + 2], c[32 * h + 24 + 0] = d[4 * (8 * h + 7) + 0], c[32 * h + 24 + 1] = d[4 * (8 * h + 7) + 1], c[32 * h + 24 + 2] = d[4 * (8 * h + 7) + 2], c[32 * h + 24 + 3] = d[4 * (8 * h + 7) + 3], r[8 * h + 3 + 0] = this._scales[3 * h + 0], r[8 * h + 3 + 1] = this._scales[3 * h + 1], r[8 * h + 3 + 2] = this._scales[3 * h + 2], c[32 * h + 28 + 0] = 128 * this._rotations[4 * h + 0] + 128 & 255, c[32 * h + 28 + 1] = 128 * this._rotations[4 * h + 1] + 128 & 255, c[32 * h + 28 + 2] = 128 * this._rotations[4 * h + 2] + 128 & 255, c[32 * h + 28 + 3] = 128 * this._rotations[4 * h + 3] + 128 & 255;
      const u = new Blob([o.buffer], { type: "application/octet-stream" }), f = document.createElement("a");
      f.download = a, f.href = URL.createObjectURL(u), f.click();
    };
  }
  get data() {
    return this._data;
  }
  get vertexCount() {
    return this._vertexCount;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
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
}
Be.RowLength = 32;
class ki {
  static async LoadAsync(e, n, l) {
    const i = await fetch(e, { mode: "cors", credentials: "omit" });
    if (i.status != 200)
      throw new Error(i.status + " Unable to load " + i.url);
    const s = i.body.getReader(), a = parseInt(i.headers.get("content-length")), o = new Uint8Array(a);
    let r = 0;
    for (; ; ) {
      const { done: c, value: d } = await s.read();
      if (c)
        break;
      o.set(d, r), r += d.length, l == null || l(r / a);
    }
    n.setData(o);
  }
  static async LoadFromFileAsync(e, n, l) {
    const i = new FileReader();
    i.onload = (s) => {
      const a = new Uint8Array(s.target.result);
      n.setData(a);
    }, i.onprogress = (s) => {
      l == null || l(s.loaded / s.total);
    }, i.readAsArrayBuffer(e), await new Promise((s) => {
      i.onloadend = () => {
        s();
      };
    });
  }
}
class Ln {
  static async LoadAsync(e, n, l, i = "") {
    const s = await fetch(e, { mode: "cors", credentials: "omit" });
    if (s.status != 200)
      throw new Error(s.status + " Unable to load " + s.url);
    const a = s.body.getReader(), o = parseInt(s.headers.get("content-length")), r = new Uint8Array(o);
    let c = 0;
    for (; ; ) {
      const { done: u, value: f } = await a.read();
      if (u)
        break;
      r.set(f, c), c += f.length, l == null || l(c / o);
    }
    if (r[0] !== 112 || r[1] !== 108 || r[2] !== 121 || r[3] !== 10)
      throw new Error("Invalid PLY file");
    const d = new Uint8Array(this._ParsePLYBuffer(r.buffer, i));
    n.setData(d);
  }
  static async LoadFromFileAsync(e, n, l, i = "") {
    const s = new FileReader();
    s.onload = (a) => {
      const o = new Uint8Array(this._ParsePLYBuffer(a.target.result, i));
      n.setData(o);
    }, s.onprogress = (a) => {
      l == null || l(a.loaded / a.total);
    }, s.readAsArrayBuffer(e), await new Promise((a) => {
      s.onloadend = () => {
        a();
      };
    });
  }
  static _ParsePLYBuffer(e, n) {
    const l = new Uint8Array(e), i = new TextDecoder().decode(l.slice(0, 10240)), s = `end_header
`, a = i.indexOf(s);
    if (a < 0)
      throw new Error("Unable to read .ply file header");
    const o = parseInt(/element vertex (\d+)\n/.exec(i)[1]);
    let r = 0;
    const c = { double: 8, int: 4, uint: 4, float: 4, short: 2, ushort: 2, uchar: 1 }, d = [];
    for (const m of i.slice(0, a).split(`
`).filter((V) => V.startsWith("property "))) {
      const [V, U, Q] = m.split(" ");
      if (d.push({ name: Q, type: U, offset: r }), !c[U])
        throw new Error(`Unsupported property type: ${U}`);
      r += c[U];
    }
    const u = new DataView(e, a + 11), f = new ArrayBuffer(Be.RowLength * o), h = re.FromEuler(new D(Math.PI / 2, 0, 0));
    for (let m = 0; m < o; m++) {
      const V = new Float32Array(f, m * Be.RowLength, 3), U = new Float32Array(f, m * Be.RowLength + 12, 3), Q = new Uint8ClampedArray(f, m * Be.RowLength + 24, 4), R = new Uint8ClampedArray(f, m * Be.RowLength + 28, 4);
      let F = 255, Z = 0, p = 0, X = 0;
      d.forEach((k) => {
        let J;
        switch (k.type) {
          case "float":
            J = u.getFloat32(k.offset + m * r, !0);
            break;
          case "int":
            J = u.getInt32(k.offset + m * r, !0);
            break;
          default:
            throw new Error(`Unsupported property type: ${k.type}`);
        }
        switch (k.name) {
          case "x":
            V[0] = J;
            break;
          case "y":
            V[1] = J;
            break;
          case "z":
            V[2] = J;
            break;
          case "scale_0":
            U[0] = Math.exp(J);
            break;
          case "scale_1":
            U[1] = Math.exp(J);
            break;
          case "scale_2":
            U[2] = Math.exp(J);
            break;
          case "red":
            Q[0] = J;
            break;
          case "green":
            Q[1] = J;
            break;
          case "blue":
            Q[2] = J;
            break;
          case "f_dc_0":
            Q[0] = 255 * (0.5 + this.SH_C0 * J);
            break;
          case "f_dc_1":
            Q[1] = 255 * (0.5 + this.SH_C0 * J);
            break;
          case "f_dc_2":
            Q[2] = 255 * (0.5 + this.SH_C0 * J);
            break;
          case "f_dc_3":
            Q[3] = 255 * (0.5 + this.SH_C0 * J);
            break;
          case "opacity":
            Q[3] = 1 / (1 + Math.exp(-J)) * 255;
            break;
          case "rot_0":
            F = J;
            break;
          case "rot_1":
            Z = J;
            break;
          case "rot_2":
            p = J;
            break;
          case "rot_3":
            X = J;
        }
      });
      let S = new re(Z, p, X, F);
      switch (n) {
        case "polycam": {
          const k = V[1];
          V[1] = -V[2], V[2] = k, S = h.multiply(S);
          break;
        }
        case "":
          break;
        default:
          throw new Error(`Unsupported format: ${n}`);
      }
      S = S.normalize(), R[0] = 128 * S.w + 128, R[1] = 128 * S.x + 128, R[2] = 128 * S.y + 128, R[3] = 128 * S.z + 128;
    }
    return f;
  }
}
function Lr(t, e, n) {
  var l = e === void 0 ? null : e, i = function(r, c) {
    var d = atob(r);
    if (c) {
      for (var u = new Uint8Array(d.length), f = 0, h = d.length; f < h; ++f)
        u[f] = d.charCodeAt(f);
      return String.fromCharCode.apply(null, new Uint16Array(u.buffer));
    }
    return d;
  }(t, n !== void 0 && n), s = i.indexOf(`
`, 10) + 1, a = i.substring(s) + (l ? "//# sourceMappingURL=" + l : ""), o = new Blob([a], { type: "application/javascript" });
  return URL.createObjectURL(o);
}
Ln.SH_C0 = 0.28209479177387814;
var Wl, gl, yl, Un, Kr = (Wl = "Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgdmFyIGxvYWRXYXNtID0gKCgpID0+IHsKICAgIAogICAgcmV0dXJuICgKICBmdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkgewoKICB2YXIgTW9kdWxlPW1vZHVsZUFyZzt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdDt9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkQmluYXJ5O3t7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZjt9aWYoc2NyaXB0RGlyZWN0b3J5LmluZGV4T2YoImJsb2I6IikhPT0wKXtzY3JpcHREaXJlY3Rvcnk9c2NyaXB0RGlyZWN0b3J5LnN1YnN0cigwLHNjcmlwdERpcmVjdG9yeS5yZXBsYWNlKC9bPyNdLiovLCIiKS5sYXN0SW5kZXhPZigiLyIpKzEpO31lbHNlIHtzY3JpcHREaXJlY3Rvcnk9IiI7fXt7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX07fX19TW9kdWxlWyJwcmludCJdfHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO3ZhciBlcnI9TW9kdWxlWyJwcmludEVyciJdfHxjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlNb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIik7fWZ1bmN0aW9uIGludEFycmF5RnJvbUJhc2U2NChzKXt2YXIgZGVjb2RlZD1hdG9iKHMpO3ZhciBieXRlcz1uZXcgVWludDhBcnJheShkZWNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkZWNvZGVkLmxlbmd0aDsrK2kpe2J5dGVzW2ldPWRlY29kZWQuY2hhckNvZGVBdChpKTt9cmV0dXJuIGJ5dGVzfWZ1bmN0aW9uIHRyeVBhcnNlQXNEYXRhVVJJKGZpbGVuYW1lKXtpZighaXNEYXRhVVJJKGZpbGVuYW1lKSl7cmV0dXJufXJldHVybiBpbnRBcnJheUZyb21CYXNlNjQoZmlsZW5hbWUuc2xpY2UoZGF0YVVSSVByZWZpeC5sZW5ndGgpKX12YXIgd2FzbU1lbW9yeTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7ZnVuY3Rpb24gdXBkYXRlTWVtb3J5Vmlld3MoKXt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjtNb2R1bGVbIkhFQVA4Il09SEVBUDg9bmV3IEludDhBcnJheShiKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVBVOCJdPUhFQVBVOD1uZXcgVWludDhBcnJheShiKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBGMzIiXT1IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGIpO312YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO2Z1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpO319Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTt9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKTt9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKTt9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pO31mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpO31mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYik7fWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKTt9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztpZihNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXSl7TW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0ocnVuRGVwZW5kZW5jaWVzKTt9fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO2lmKE1vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKXtNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXShydW5EZXBlbmRlbmNpZXMpO31pZihydW5EZXBlbmRlbmNpZXM9PTApe2lmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpO319fWZ1bmN0aW9uIGFib3J0KHdoYXQpe2lmKE1vZHVsZVsib25BYm9ydCJdKXtNb2R1bGVbIm9uQWJvcnQiXSh3aGF0KTt9d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO3doYXQrPSIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uIjt2YXIgZT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKHdoYXQpO3JlYWR5UHJvbWlzZVJlamVjdChlKTt0aHJvdyBlfXZhciBkYXRhVVJJUHJlZml4PSJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsIjt2YXIgaXNEYXRhVVJJPWZpbGVuYW1lPT5maWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpO3ZhciB3YXNtQmluYXJ5RmlsZTt3YXNtQmluYXJ5RmlsZT0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LEFHRnpiUUVBQUFBQlRneGdCSDkvZjM4QVlBTi9mMzhBWUFWL2YzOS9md0JnQm45L2YzOS9md0JnQVg4QmYyQUNmMzhBWUFOL2YzOEJmMkFCZndCZ0IzOS9mMzkvZjM4QVlBQUFZQUovZndGL1lBUi9mMzUrQUFJOUNnRmhBV0VBQVFGaEFXSUFBZ0ZoQVdNQUFRRmhBV1FBQlFGaEFXVUFBUUZoQVdZQUNBRmhBV2NBQkFGaEFXZ0FCUUZoQVdrQUFBRmhBV29BQlFNWkdBWUVCd2tIQndvTENRRUFBUVFFQXdNQ0FnQUFDZ1lHQ0FRRkFYQUJFQkFGQndFQmdBS0FnQUlHQ0FGL0FVSEFuZ1FMQnhrR0FXc0NBQUZzQUEwQmJRQWhBVzRCQUFGdkFCY0JjQUFQQ1JVQkFFRUJDdzhTRmd3T0RpQU1IeGdhSFF3Wkd4d0tqa2NZY1FFQmZ5QUNSUVJBSUFBb0FnUWdBU2dDQkVZUEN5QUFJQUZHQkVCQkFROExBa0FnQUNnQ0JDSUNMUUFBSWdCRklBQWdBU2dDQkNJQkxRQUFJZ05IY2cwQUEwQWdBUzBBQVNFRElBSXRBQUVpQUVVTkFTQUJRUUZxSVFFZ0FrRUJhaUVDSUFBZ0EwWU5BQXNMSUFBZ0EwWUxUd0VDZjBHNEdpZ0NBQ0lCSUFCQkIycEJlSEVpQW1vaEFBSkFJQUpCQUNBQUlBRk5HdzBBSUFBL0FFRVFkRXNFUUNBQUVBWkZEUUVMUWJnYUlBQTJBZ0FnQVE4TFFjZ2FRVEEyQWdCQmZ3c0dBQ0FBRUE4TEtRQkJ3QnBCQVRZQ0FFSEVHa0VBTmdJQUVCSkJ4QnBCdkJvb0FnQTJBZ0JCdkJwQndCbzJBZ0FMQWdBTDBnc0JCMzhDUUNBQVJRMEFJQUJCQ0dzaUFpQUFRUVJyS0FJQUlnRkJlSEVpQUdvaEJRSkFJQUZCQVhFTkFDQUJRUU54UlEwQklBSWdBaWdDQUNJQmF5SUNRZHdhS0FJQVNRMEJJQUFnQVdvaEFBSkFBa0JCNEJvb0FnQWdBa2NFUUNBQlFmOEJUUVJBSUFGQkEzWWhCQ0FDS0FJTUlnRWdBaWdDQ0NJRFJnUkFRY3dhUWN3YUtBSUFRWDRnQkhkeE5nSUFEQVVMSUFNZ0FUWUNEQ0FCSUFNMkFnZ01CQXNnQWlnQ0dDRUdJQUlnQWlnQ0RDSUJSd1JBSUFJb0FnZ2lBeUFCTmdJTUlBRWdBellDQ0F3REN5QUNRUlJxSWdRb0FnQWlBMFVFUUNBQ0tBSVFJZ05GRFFJZ0FrRVFhaUVFQ3dOQUlBUWhCeUFESWdGQkZHb2lCQ2dDQUNJRERRQWdBVUVRYWlFRUlBRW9BaEFpQXcwQUN5QUhRUUEyQWdBTUFnc2dCU2dDQkNJQlFRTnhRUU5IRFFKQjFCb2dBRFlDQUNBRklBRkJmbkUyQWdRZ0FpQUFRUUZ5TmdJRUlBVWdBRFlDQUE4TFFRQWhBUXNnQmtVTkFBSkFJQUlvQWh3aUEwRUNkRUg4SEdvaUJDZ0NBQ0FDUmdSQUlBUWdBVFlDQUNBQkRRRkIwQnBCMEJvb0FnQkJmaUFEZDNFMkFnQU1BZ3NnQmtFUVFSUWdCaWdDRUNBQ1JodHFJQUUyQWdBZ0FVVU5BUXNnQVNBR05nSVlJQUlvQWhBaUF3UkFJQUVnQXpZQ0VDQURJQUUyQWhnTElBSW9BaFFpQTBVTkFDQUJJQU0yQWhRZ0F5QUJOZ0lZQ3lBQ0lBVlBEUUFnQlNnQ0JDSUJRUUZ4UlEwQUFrQUNRQUpBQWtBZ0FVRUNjVVVFUUVIa0dpZ0NBQ0FGUmdSQVFlUWFJQUkyQWdCQjJCcEIyQm9vQWdBZ0FHb2lBRFlDQUNBQ0lBQkJBWEkyQWdRZ0FrSGdHaWdDQUVjTkJrSFVHa0VBTmdJQVFlQWFRUUEyQWdBUEMwSGdHaWdDQUNBRlJnUkFRZUFhSUFJMkFnQkIxQnBCMUJvb0FnQWdBR29pQURZQ0FDQUNJQUJCQVhJMkFnUWdBQ0FDYWlBQU5nSUFEd3NnQVVGNGNTQUFhaUVBSUFGQi93Rk5CRUFnQVVFRGRpRUVJQVVvQWd3aUFTQUZLQUlJSWdOR0JFQkJ6QnBCekJvb0FnQkJmaUFFZDNFMkFnQU1CUXNnQXlBQk5nSU1JQUVnQXpZQ0NBd0VDeUFGS0FJWUlRWWdCU0FGS0FJTUlnRkhCRUJCM0Jvb0FnQWFJQVVvQWdnaUF5QUJOZ0lNSUFFZ0F6WUNDQXdEQ3lBRlFSUnFJZ1FvQWdBaUEwVUVRQ0FGS0FJUUlnTkZEUUlnQlVFUWFpRUVDd05BSUFRaEJ5QURJZ0ZCRkdvaUJDZ0NBQ0lERFFBZ0FVRVFhaUVFSUFFb0FoQWlBdzBBQ3lBSFFRQTJBZ0FNQWdzZ0JTQUJRWDV4TmdJRUlBSWdBRUVCY2pZQ0JDQUFJQUpxSUFBMkFnQU1Bd3RCQUNFQkN5QUdSUTBBQWtBZ0JTZ0NIQ0lEUVFKMFFmd2NhaUlFS0FJQUlBVkdCRUFnQkNBQk5nSUFJQUVOQVVIUUdrSFFHaWdDQUVGK0lBTjNjVFlDQUF3Q0N5QUdRUkJCRkNBR0tBSVFJQVZHRzJvZ0FUWUNBQ0FCUlEwQkN5QUJJQVkyQWhnZ0JTZ0NFQ0lEQkVBZ0FTQUROZ0lRSUFNZ0FUWUNHQXNnQlNnQ0ZDSURSUTBBSUFFZ0F6WUNGQ0FESUFFMkFoZ0xJQUlnQUVFQmNqWUNCQ0FBSUFKcUlBQTJBZ0FnQWtIZ0dpZ0NBRWNOQUVIVUdpQUFOZ0lBRHdzZ0FFSC9BVTBFUUNBQVFYaHhRZlFhYWlFQkFuOUJ6Qm9vQWdBaUEwRUJJQUJCQTNaMElnQnhSUVJBUWN3YUlBQWdBM0kyQWdBZ0FRd0JDeUFCS0FJSUN5RUFJQUVnQWpZQ0NDQUFJQUkyQWd3Z0FpQUJOZ0lNSUFJZ0FEWUNDQThMUVI4aEF5QUFRZi8vL3dkTkJFQWdBRUVtSUFCQkNIWm5JZ0ZyZGtFQmNTQUJRUUYwYTBFK2FpRURDeUFDSUFNMkFod2dBa0lBTndJUUlBTkJBblJCL0J4cUlRRUNRQUpBQWtCQjBCb29BZ0FpQkVFQklBTjBJZ2R4UlFSQVFkQWFJQVFnQjNJMkFnQWdBU0FDTmdJQUlBSWdBVFlDR0F3QkN5QUFRUmtnQTBFQmRtdEJBQ0FEUVI5SEczUWhBeUFCS0FJQUlRRURRQ0FCSWdRb0FnUkJlSEVnQUVZTkFpQURRUjEySVFFZ0EwRUJkQ0VESUFRZ0FVRUVjV29pQjBFUWFpZ0NBQ0lCRFFBTElBY2dBallDRUNBQ0lBUTJBaGdMSUFJZ0FqWUNEQ0FDSUFJMkFnZ01BUXNnQkNnQ0NDSUFJQUkyQWd3Z0JDQUNOZ0lJSUFKQkFEWUNHQ0FDSUFRMkFnd2dBaUFBTmdJSUMwSHNHa0hzR2lnQ0FFRUJheUlBUVg4Z0FCczJBZ0FMQ3lrQkFYOGdBUVJBSUFBaEFnTkFJQUpCQURvQUFDQUNRUUZxSVFJZ0FVRUJheUlCRFFBTEN5QUFDeHdBSUFBZ0FVRUlJQUtuSUFKQ0lJaW5JQU9uSUFOQ0lJaW5FQVVMNFFNQVFld1hRWm9KRUFsQitCZEJ1UWhCQVVFQUVBaEJoQmhCdEFoQkFVR0FmMEgvQUJBQlFad1lRYTBJUVFGQmdIOUIvd0FRQVVHUUdFR3JDRUVCUVFCQi93RVFBVUdvR0VHSkNFRUNRWUNBZmtILy93RVFBVUcwR0VHQUNFRUNRUUJCLy84REVBRkJ3QmhCbUFoQkJFR0FnSUNBZUVILy8vLy9CeEFCUWN3WVFZOElRUVJCQUVGL0VBRkIyQmhCMXdoQkJFR0FnSUNBZUVILy8vLy9CeEFCUWVRWVFjNElRUVJCQUVGL0VBRkI4QmhCb3doQ2dJQ0FnSUNBZ0lDQWYwTC8vLy8vLy8vLy8vOEFFQkZCL0JoQm9naENBRUovRUJGQmlCbEJuQWhCQkJBRVFaUVpRWk1KUVFnUUJFR0VEMEhwQ0JBRFFjd1BRWmNORUFOQmxCQkJCRUhjQ0JBQ1FlQVFRUUpCOVFnUUFrR3NFVUVFUVlRSkVBSkJ5QkZCdmdnUUIwSHdFVUVBUWRJTUVBQkJtQkpCQUVHNERSQUFRY0FTUVFGQjhBd1FBRUhvRWtFQ1FaOEpFQUJCa0JOQkEwRytDUkFBUWJnVFFRUkI1Z2tRQUVIZ0UwRUZRWU1LRUFCQmlCUkJCRUhkRFJBQVFiQVVRUVZCK3cwUUFFR1lFa0VBUWVrS0VBQkJ3QkpCQVVISUNoQUFRZWdTUVFKQnF3c1FBRUdRRTBFRFFZa0xFQUJCdUJOQkJFR3hEQkFBUWVBVFFRVkJqd3dRQUVIWUZFRUlRZTRMRUFCQmdCVkJDVUhNQ3hBQVFhZ1ZRUVpCcVFvUUFFSFFGVUVIUWFJT0VBQUxJQUFDUUNBQUtBSUVJQUZIRFFBZ0FDZ0NIRUVCUmcwQUlBQWdBallDSEFzTG1nRUFJQUJCQVRvQU5RSkFJQUFvQWdRZ0FrY05BQ0FBUVFFNkFEUUNRQ0FBS0FJUUlnSkZCRUFnQUVFQk5nSWtJQUFnQXpZQ0dDQUFJQUUyQWhBZ0EwRUJSdzBDSUFBb0FqQkJBVVlOQVF3Q0N5QUJJQUpHQkVBZ0FDZ0NHQ0lDUVFKR0JFQWdBQ0FETmdJWUlBTWhBZ3NnQUNnQ01FRUJSdzBDSUFKQkFVWU5BUXdDQ3lBQUlBQW9BaVJCQVdvMkFpUUxJQUJCQVRvQU5nc0xYUUVCZnlBQUtBSVFJZ05GQkVBZ0FFRUJOZ0lrSUFBZ0FqWUNHQ0FBSUFFMkFoQVBDd0pBSUFFZ0EwWUVRQ0FBS0FJWVFRSkhEUUVnQUNBQ05nSVlEd3NnQUVFQk9nQTJJQUJCQWpZQ0dDQUFJQUFvQWlSQkFXbzJBaVFMQ3dRQUlBQUx4U2NCREg4akFFRVFheUlLSkFBQ1FBSkFBa0FDUUFKQUFrQUNRQUpBQWtBZ0FFSDBBVTBFUUVITUdpZ0NBQ0lHUVJBZ0FFRUxha0Y0Y1NBQVFRdEpHeUlGUVFOMklnQjJJZ0ZCQTNFRVFBSkFJQUZCZjNOQkFYRWdBR29pQWtFRGRDSUJRZlFhYWlJQUlBRkIvQnBxS0FJQUlnRW9BZ2dpQTBZRVFFSE1HaUFHUVg0Z0FuZHhOZ0lBREFFTElBTWdBRFlDRENBQUlBTTJBZ2dMSUFGQkNHb2hBQ0FCSUFKQkEzUWlBa0VEY2pZQ0JDQUJJQUpxSWdFZ0FTZ0NCRUVCY2pZQ0JBd0tDeUFGUWRRYUtBSUFJZ2RORFFFZ0FRUkFBa0JCQWlBQWRDSUNRUUFnQW10eUlBRWdBSFJ4YUNJQlFRTjBJZ0JCOUJwcUlnSWdBRUg4R21vb0FnQWlBQ2dDQ0NJRFJnUkFRY3dhSUFaQmZpQUJkM0VpQmpZQ0FBd0JDeUFESUFJMkFnd2dBaUFETmdJSUN5QUFJQVZCQTNJMkFnUWdBQ0FGYWlJRUlBRkJBM1FpQVNBRmF5SURRUUZ5TmdJRUlBQWdBV29nQXpZQ0FDQUhCRUFnQjBGNGNVSDBHbW9oQVVIZ0dpZ0NBQ0VDQW44Z0JrRUJJQWRCQTNaMElnVnhSUVJBUWN3YUlBVWdCbkkyQWdBZ0FRd0JDeUFCS0FJSUN5RUZJQUVnQWpZQ0NDQUZJQUkyQWd3Z0FpQUJOZ0lNSUFJZ0JUWUNDQXNnQUVFSWFpRUFRZUFhSUFRMkFnQkIxQm9nQXpZQ0FBd0tDMEhRR2lnQ0FDSUxSUTBCSUF0b1FRSjBRZndjYWlnQ0FDSUNLQUlFUVhoeElBVnJJUVFnQWlFQkEwQUNRQ0FCS0FJUUlnQkZCRUFnQVNnQ0ZDSUFSUTBCQ3lBQUtBSUVRWGh4SUFWcklnRWdCQ0FCSUFSSklnRWJJUVFnQUNBQ0lBRWJJUUlnQUNFQkRBRUxDeUFDS0FJWUlRa2dBaUFDS0FJTUlnTkhCRUJCM0Jvb0FnQWFJQUlvQWdnaUFDQUROZ0lNSUFNZ0FEWUNDQXdKQ3lBQ1FSUnFJZ0VvQWdBaUFFVUVRQ0FDS0FJUUlnQkZEUU1nQWtFUWFpRUJDd05BSUFFaENDQUFJZ05CRkdvaUFTZ0NBQ0lBRFFBZ0EwRVFhaUVCSUFNb0FoQWlBQTBBQ3lBSVFRQTJBZ0FNQ0F0QmZ5RUZJQUJCdjM5TERRQWdBRUVMYWlJQVFYaHhJUVZCMEJvb0FnQWlDRVVOQUVFQUlBVnJJUVFDUUFKQUFrQUNmMEVBSUFWQmdBSkpEUUFhUVI4Z0JVSC8vLzhIU3cwQUdpQUZRU1lnQUVFSWRtY2lBR3QyUVFGeElBQkJBWFJyUVQ1cUN5SUhRUUowUWZ3Y2FpZ0NBQ0lCUlFSQVFRQWhBQXdCQzBFQUlRQWdCVUVaSUFkQkFYWnJRUUFnQjBFZlJ4dDBJUUlEUUFKQUlBRW9BZ1JCZUhFZ0JXc2lCaUFFVHcwQUlBRWhBeUFHSWdRTkFFRUFJUVFnQVNFQURBTUxJQUFnQVNnQ0ZDSUdJQVlnQVNBQ1FSMTJRUVJ4YWlnQ0VDSUJSaHNnQUNBR0d5RUFJQUpCQVhRaEFpQUJEUUFMQ3lBQUlBTnlSUVJBUVFBaEEwRUNJQWQwSWdCQkFDQUFhM0lnQ0hFaUFFVU5BeUFBYUVFQ2RFSDhIR29vQWdBaEFBc2dBRVVOQVFzRFFDQUFLQUlFUVhoeElBVnJJZ0lnQkVraEFTQUNJQVFnQVJzaEJDQUFJQU1nQVJzaEF5QUFLQUlRSWdFRWZ5QUJCU0FBS0FJVUN5SUFEUUFMQ3lBRFJRMEFJQVJCMUJvb0FnQWdCV3RQRFFBZ0F5Z0NHQ0VISUFNZ0F5Z0NEQ0lDUndSQVFkd2FLQUlBR2lBREtBSUlJZ0FnQWpZQ0RDQUNJQUEyQWdnTUJ3c2dBMEVVYWlJQktBSUFJZ0JGQkVBZ0F5Z0NFQ0lBUlEwRElBTkJFR29oQVFzRFFDQUJJUVlnQUNJQ1FSUnFJZ0VvQWdBaUFBMEFJQUpCRUdvaEFTQUNLQUlRSWdBTkFBc2dCa0VBTmdJQURBWUxJQVZCMUJvb0FnQWlBMDBFUUVIZ0dpZ0NBQ0VBQWtBZ0F5QUZheUlCUVJCUEJFQWdBQ0FGYWlJQ0lBRkJBWEkyQWdRZ0FDQURhaUFCTmdJQUlBQWdCVUVEY2pZQ0JBd0JDeUFBSUFOQkEzSTJBZ1FnQUNBRGFpSUJJQUVvQWdSQkFYSTJBZ1JCQUNFQ1FRQWhBUXRCMUJvZ0FUWUNBRUhnR2lBQ05nSUFJQUJCQ0dvaEFBd0lDeUFGUWRnYUtBSUFJZ0pKQkVCQjJCb2dBaUFGYXlJQk5nSUFRZVFhUWVRYUtBSUFJZ0FnQldvaUFqWUNBQ0FDSUFGQkFYSTJBZ1FnQUNBRlFRTnlOZ0lFSUFCQkNHb2hBQXdJQzBFQUlRQWdCVUV2YWlJRUFuOUJwQjRvQWdBRVFFR3NIaWdDQUF3QkMwR3dIa0ovTndJQVFhZ2VRb0NnZ0lDQWdBUTNBZ0JCcEI0Z0NrRU1ha0Z3Y1VIWXF0V3FCWE0yQWdCQnVCNUJBRFlDQUVHSUhrRUFOZ0lBUVlBZ0N5SUJhaUlHUVFBZ0FXc2lDSEVpQVNBRlRRMEhRWVFlS0FJQUlnTUVRRUg4SFNnQ0FDSUhJQUZxSWdrZ0IwMGdBeUFKU1hJTkNBc0NRRUdJSGkwQUFFRUVjVVVFUUFKQUFrQUNRQUpBUWVRYUtBSUFJZ01FUUVHTUhpRUFBMEFnQXlBQUtBSUFJZ2RQQkVBZ0J5QUFLQUlFYWlBRFN3MERDeUFBS0FJSUlnQU5BQXNMUVFBUUN5SUNRWDlHRFFNZ0FTRUdRYWdlS0FJQUlnQkJBV3NpQXlBQ2NRUkFJQUVnQW1zZ0FpQURha0VBSUFCcmNXb2hCZ3NnQlNBR1R3MERRWVFlS0FJQUlnQUVRRUg4SFNnQ0FDSURJQVpxSWdnZ0EwMGdBQ0FJU1hJTkJBc2dCaEFMSWdBZ0FrY05BUXdGQ3lBR0lBSnJJQWh4SWdZUUN5SUNJQUFvQWdBZ0FDZ0NCR3BHRFFFZ0FpRUFDeUFBUVg5R0RRRWdCVUV3YWlBR1RRUkFJQUFoQWd3RUMwR3NIaWdDQUNJQ0lBUWdCbXRxUVFBZ0FtdHhJZ0lRQzBGL1JnMEJJQUlnQm1vaEJpQUFJUUlNQXdzZ0FrRi9SdzBDQzBHSUhrR0lIaWdDQUVFRWNqWUNBQXNnQVJBTElnSkJmMFpCQUJBTElnQkJmMFp5SUFBZ0FrMXlEUVVnQUNBQ2F5SUdJQVZCS0dwTkRRVUxRZndkUWZ3ZEtBSUFJQVpxSWdBMkFnQkJnQjRvQWdBZ0FFa0VRRUdBSGlBQU5nSUFDd0pBUWVRYUtBSUFJZ1FFUUVHTUhpRUFBMEFnQWlBQUtBSUFJZ0VnQUNnQ0JDSURha1lOQWlBQUtBSUlJZ0FOQUFzTUJBdEIzQm9vQWdBaUFFRUFJQUFnQWswYlJRUkFRZHdhSUFJMkFnQUxRUUFoQUVHUUhpQUdOZ0lBUVl3ZUlBSTJBZ0JCN0JwQmZ6WUNBRUh3R2tHa0hpZ0NBRFlDQUVHWUhrRUFOZ0lBQTBBZ0FFRURkQ0lCUWZ3YWFpQUJRZlFhYWlJRE5nSUFJQUZCZ0J0cUlBTTJBZ0FnQUVFQmFpSUFRU0JIRFFBTFFkZ2FJQVpCS0dzaUFFRjRJQUpyUVFkeElnRnJJZ00yQWdCQjVCb2dBU0FDYWlJQk5nSUFJQUVnQTBFQmNqWUNCQ0FBSUFKcVFTZzJBZ1JCNkJwQnRCNG9BZ0EyQWdBTUJBc2dBaUFFVFNBQklBUkxjZzBDSUFBb0FneEJDSEVOQWlBQUlBTWdCbW8yQWdSQjVCb2dCRUY0SUFSclFRZHhJZ0JxSWdFMkFnQkIyQnBCMkJvb0FnQWdCbW9pQWlBQWF5SUFOZ0lBSUFFZ0FFRUJjallDQkNBQ0lBUnFRU2cyQWdSQjZCcEJ0QjRvQWdBMkFnQU1Bd3RCQUNFRERBVUxRUUFoQWd3REMwSGNHaWdDQUNBQ1N3UkFRZHdhSUFJMkFnQUxJQUlnQm1vaEFVR01IaUVBQWtBQ1FBSkFBMEFnQVNBQUtBSUFSd1JBSUFBb0FnZ2lBQTBCREFJTEN5QUFMUUFNUVFoeFJRMEJDMEdNSGlFQUEwQUNRQ0FFSUFBb0FnQWlBVThFUUNBQklBQW9BZ1JxSWdNZ0JFc05BUXNnQUNnQ0NDRUFEQUVMQzBIWUdpQUdRU2hySWdCQmVDQUNhMEVIY1NJQmF5SUlOZ0lBUWVRYUlBRWdBbW9pQVRZQ0FDQUJJQWhCQVhJMkFnUWdBQ0FDYWtFb05nSUVRZWdhUWJRZUtBSUFOZ0lBSUFRZ0EwRW5JQU5yUVFkeGFrRXZheUlBSUFBZ0JFRVFha2tiSWdGQkd6WUNCQ0FCUVpRZUtRSUFOd0lRSUFGQmpCNHBBZ0EzQWdoQmxCNGdBVUVJYWpZQ0FFR1FIaUFHTmdJQVFZd2VJQUkyQWdCQm1CNUJBRFlDQUNBQlFSaHFJUUFEUUNBQVFRYzJBZ1FnQUVFSWFpRU1JQUJCQkdvaEFDQU1JQU5KRFFBTElBRWdCRVlOQWlBQklBRW9BZ1JCZm5FMkFnUWdCQ0FCSUFScklnSkJBWEkyQWdRZ0FTQUNOZ0lBSUFKQi93Rk5CRUFnQWtGNGNVSDBHbW9oQUFKL1Fjd2FLQUlBSWdGQkFTQUNRUU4yZENJQ2NVVUVRRUhNR2lBQklBSnlOZ0lBSUFBTUFRc2dBQ2dDQ0FzaEFTQUFJQVEyQWdnZ0FTQUVOZ0lNSUFRZ0FEWUNEQ0FFSUFFMkFnZ01Bd3RCSHlFQUlBSkIvLy8vQjAwRVFDQUNRU1lnQWtFSWRtY2lBR3QyUVFGeElBQkJBWFJyUVQ1cUlRQUxJQVFnQURZQ0hDQUVRZ0EzQWhBZ0FFRUNkRUg4SEdvaEFRSkFRZEFhS0FJQUlnTkJBU0FBZENJR2NVVUVRRUhRR2lBRElBWnlOZ0lBSUFFZ0JEWUNBQXdCQ3lBQ1FSa2dBRUVCZG10QkFDQUFRUjlIRzNRaEFDQUJLQUlBSVFNRFFDQURJZ0VvQWdSQmVIRWdBa1lOQXlBQVFSMTJJUU1nQUVFQmRDRUFJQUVnQTBFRWNXb2lCaWdDRUNJRERRQUxJQVlnQkRZQ0VBc2dCQ0FCTmdJWUlBUWdCRFlDRENBRUlBUTJBZ2dNQWdzZ0FDQUNOZ0lBSUFBZ0FDZ0NCQ0FHYWpZQ0JDQUNRWGdnQW10QkIzRnFJZ2NnQlVFRGNqWUNCQ0FCUVhnZ0FXdEJCM0ZxSWdRZ0JTQUhhaUlGYXlFR0FrQkI1Qm9vQWdBZ0JFWUVRRUhrR2lBRk5nSUFRZGdhUWRnYUtBSUFJQVpxSWdBMkFnQWdCU0FBUVFGeU5nSUVEQUVMUWVBYUtBSUFJQVJHQkVCQjRCb2dCVFlDQUVIVUdrSFVHaWdDQUNBR2FpSUFOZ0lBSUFVZ0FFRUJjallDQkNBQUlBVnFJQUEyQWdBTUFRc2dCQ2dDQkNJQ1FRTnhRUUZHQkVBZ0FrRjRjU0VKQWtBZ0FrSC9BVTBFUUNBRUtBSU1JZ0FnQkNnQ0NDSUJSZ1JBUWN3YVFjd2FLQUlBUVg0Z0FrRURkbmR4TmdJQURBSUxJQUVnQURZQ0RDQUFJQUUyQWdnTUFRc2dCQ2dDR0NFSUFrQWdCQ0FFS0FJTUlnQkhCRUJCM0Jvb0FnQWFJQVFvQWdnaUFTQUFOZ0lNSUFBZ0FUWUNDQXdCQ3dKQUlBUkJGR29pQVNnQ0FDSUNSUVJBSUFRb0FoQWlBa1VOQVNBRVFSQnFJUUVMQTBBZ0FTRURJQUlpQUVFVWFpSUJLQUlBSWdJTkFDQUFRUkJxSVFFZ0FDZ0NFQ0lDRFFBTElBTkJBRFlDQUF3QkMwRUFJUUFMSUFoRkRRQUNRQ0FFS0FJY0lnRkJBblJCL0J4cUlnSW9BZ0FnQkVZRVFDQUNJQUEyQWdBZ0FBMEJRZEFhUWRBYUtBSUFRWDRnQVhkeE5nSUFEQUlMSUFoQkVFRVVJQWdvQWhBZ0JFWWJhaUFBTmdJQUlBQkZEUUVMSUFBZ0NEWUNHQ0FFS0FJUUlnRUVRQ0FBSUFFMkFoQWdBU0FBTmdJWUN5QUVLQUlVSWdGRkRRQWdBQ0FCTmdJVUlBRWdBRFlDR0FzZ0JpQUphaUVHSUFRZ0NXb2lCQ2dDQkNFQ0N5QUVJQUpCZm5FMkFnUWdCU0FHUVFGeU5nSUVJQVVnQm1vZ0JqWUNBQ0FHUWY4QlRRUkFJQVpCZUhGQjlCcHFJUUFDZjBITUdpZ0NBQ0lCUVFFZ0JrRURkblFpQW5GRkJFQkJ6Qm9nQVNBQ2NqWUNBQ0FBREFFTElBQW9BZ2dMSVFFZ0FDQUZOZ0lJSUFFZ0JUWUNEQ0FGSUFBMkFnd2dCU0FCTmdJSURBRUxRUjhoQWlBR1FmLy8vd2ROQkVBZ0JrRW1JQVpCQ0habklnQnJka0VCY1NBQVFRRjBhMEUrYWlFQ0N5QUZJQUkyQWh3Z0JVSUFOd0lRSUFKQkFuUkIvQnhxSVFFQ1FBSkFRZEFhS0FJQUlnQkJBU0FDZENJRGNVVUVRRUhRR2lBQUlBTnlOZ0lBSUFFZ0JUWUNBQXdCQ3lBR1FSa2dBa0VCZG10QkFDQUNRUjlIRzNRaEFpQUJLQUlBSVFBRFFDQUFJZ0VvQWdSQmVIRWdCa1lOQWlBQ1FSMTJJUUFnQWtFQmRDRUNJQUVnQUVFRWNXb2lBeWdDRUNJQURRQUxJQU1nQlRZQ0VBc2dCU0FCTmdJWUlBVWdCVFlDRENBRklBVTJBZ2dNQVFzZ0FTZ0NDQ0lBSUFVMkFnd2dBU0FGTmdJSUlBVkJBRFlDR0NBRklBRTJBZ3dnQlNBQU5nSUlDeUFIUVFocUlRQU1CUXNnQVNnQ0NDSUFJQVEyQWd3Z0FTQUVOZ0lJSUFSQkFEWUNHQ0FFSUFFMkFnd2dCQ0FBTmdJSUMwSFlHaWdDQUNJQUlBVk5EUUJCMkJvZ0FDQUZheUlCTmdJQVFlUWFRZVFhS0FJQUlnQWdCV29pQWpZQ0FDQUNJQUZCQVhJMkFnUWdBQ0FGUVFOeU5nSUVJQUJCQ0dvaEFBd0RDMEhJR2tFd05nSUFRUUFoQUF3Q0N3SkFJQWRGRFFBQ1FDQURLQUljSWdCQkFuUkIvQnhxSWdFb0FnQWdBMFlFUUNBQklBSTJBZ0FnQWcwQlFkQWFJQWhCZmlBQWQzRWlDRFlDQUF3Q0N5QUhRUkJCRkNBSEtBSVFJQU5HRzJvZ0FqWUNBQ0FDUlEwQkN5QUNJQWMyQWhnZ0F5Z0NFQ0lBQkVBZ0FpQUFOZ0lRSUFBZ0FqWUNHQXNnQXlnQ0ZDSUFSUTBBSUFJZ0FEWUNGQ0FBSUFJMkFoZ0xBa0FnQkVFUFRRUkFJQU1nQkNBRmFpSUFRUU55TmdJRUlBQWdBMm9pQUNBQUtBSUVRUUZ5TmdJRURBRUxJQU1nQlVFRGNqWUNCQ0FESUFWcUlnSWdCRUVCY2pZQ0JDQUNJQVJxSUFRMkFnQWdCRUgvQVUwRVFDQUVRWGh4UWZRYWFpRUFBbjlCekJvb0FnQWlBVUVCSUFSQkEzWjBJZ1Z4UlFSQVFjd2FJQUVnQlhJMkFnQWdBQXdCQ3lBQUtBSUlDeUVCSUFBZ0FqWUNDQ0FCSUFJMkFnd2dBaUFBTmdJTUlBSWdBVFlDQ0F3QkMwRWZJUUFnQkVILy8vOEhUUVJBSUFSQkppQUVRUWgyWnlJQWEzWkJBWEVnQUVFQmRHdEJQbW9oQUFzZ0FpQUFOZ0ljSUFKQ0FEY0NFQ0FBUVFKMFFmd2NhaUVCQWtBQ1FDQUlRUUVnQUhRaUJYRkZCRUJCMEJvZ0JTQUljallDQUNBQklBSTJBZ0FNQVFzZ0JFRVpJQUJCQVhaclFRQWdBRUVmUnh0MElRQWdBU2dDQUNFRkEwQWdCU0lCS0FJRVFYaHhJQVJHRFFJZ0FFRWRkaUVGSUFCQkFYUWhBQ0FCSUFWQkJIRnFJZ1lvQWhBaUJRMEFDeUFHSUFJMkFoQUxJQUlnQVRZQ0dDQUNJQUkyQWd3Z0FpQUNOZ0lJREFFTElBRW9BZ2dpQUNBQ05nSU1JQUVnQWpZQ0NDQUNRUUEyQWhnZ0FpQUJOZ0lNSUFJZ0FEWUNDQXNnQTBFSWFpRUFEQUVMQWtBZ0NVVU5BQUpBSUFJb0Fod2lBRUVDZEVIOEhHb2lBU2dDQUNBQ1JnUkFJQUVnQXpZQ0FDQUREUUZCMEJvZ0MwRitJQUIzY1RZQ0FBd0NDeUFKUVJCQkZDQUpLQUlRSUFKR0cyb2dBellDQUNBRFJRMEJDeUFESUFrMkFoZ2dBaWdDRUNJQUJFQWdBeUFBTmdJUUlBQWdBellDR0FzZ0FpZ0NGQ0lBUlEwQUlBTWdBRFlDRkNBQUlBTTJBaGdMQWtBZ0JFRVBUUVJBSUFJZ0JDQUZhaUlBUVFOeU5nSUVJQUFnQW1vaUFDQUFLQUlFUVFGeU5nSUVEQUVMSUFJZ0JVRURjallDQkNBQ0lBVnFJZ01nQkVFQmNqWUNCQ0FESUFScUlBUTJBZ0FnQndSQUlBZEJlSEZCOUJwcUlRQkI0Qm9vQWdBaEFRSi9RUUVnQjBFRGRuUWlCU0FHY1VVRVFFSE1HaUFGSUFaeU5nSUFJQUFNQVFzZ0FDZ0NDQXNoQlNBQUlBRTJBZ2dnQlNBQk5nSU1JQUVnQURZQ0RDQUJJQVUyQWdnTFFlQWFJQU0yQWdCQjFCb2dCRFlDQUFzZ0FrRUlhaUVBQ3lBS1FSQnFKQUFnQUFzYUFDQUFJQUVvQWdnZ0JSQUtCRUFnQVNBQ0lBTWdCQkFVQ3dzM0FDQUFJQUVvQWdnZ0JSQUtCRUFnQVNBQ0lBTWdCQkFVRHdzZ0FDZ0NDQ0lBSUFFZ0FpQURJQVFnQlNBQUtBSUFLQUlVRVFNQUM1RUJBQ0FBSUFFb0FnZ2dCQkFLQkVBZ0FTQUNJQU1RRXc4TEFrQWdBQ0FCS0FJQUlBUVFDa1VOQUFKQUlBSWdBU2dDRUVjRVFDQUJLQUlVSUFKSERRRUxJQU5CQVVjTkFTQUJRUUUyQWlBUEN5QUJJQUkyQWhRZ0FTQUROZ0lnSUFFZ0FTZ0NLRUVCYWpZQ0tBSkFJQUVvQWlSQkFVY05BQ0FCS0FJWVFRSkhEUUFnQVVFQk9nQTJDeUFCUVFRMkFpd0xDL0lCQUNBQUlBRW9BZ2dnQkJBS0JFQWdBU0FDSUFNUUV3OExBa0FnQUNBQktBSUFJQVFRQ2dSQUFrQWdBaUFCS0FJUVJ3UkFJQUVvQWhRZ0FrY05BUXNnQTBFQlJ3MENJQUZCQVRZQ0lBOExJQUVnQXpZQ0lBSkFJQUVvQWl4QkJFWU5BQ0FCUVFBN0FUUWdBQ2dDQ0NJQUlBRWdBaUFDUVFFZ0JDQUFLQUlBS0FJVUVRTUFJQUV0QURVRVFDQUJRUU0yQWl3Z0FTMEFORVVOQVF3REN5QUJRUVEyQWl3TElBRWdBallDRkNBQklBRW9BaWhCQVdvMkFpZ2dBU2dDSkVFQlJ3MEJJQUVvQWhoQkFrY05BU0FCUVFFNkFEWVBDeUFBS0FJSUlnQWdBU0FDSUFNZ0JDQUFLQUlBS0FJWUVRSUFDd3N4QUNBQUlBRW9BZ2hCQUJBS0JFQWdBU0FDSUFNUUZROExJQUFvQWdnaUFDQUJJQUlnQXlBQUtBSUFLQUljRVFBQUN4Z0FJQUFnQVNnQ0NFRUFFQW9FUUNBQklBSWdBeEFWQ3d1NUFnRURmeU1BUVVCcUlnSWtBQ0FBS0FJQUlnTkJCR3NvQWdBaEJDQURRUWhyS0FJQUlRTWdBa0lBTndJZ0lBSkNBRGNDS0NBQ1FnQTNBakFnQWtJQU53QTNJQUpDQURjQ0dDQUNRUUEyQWhRZ0FrSDhGVFlDRUNBQ0lBQTJBZ3dnQWlBQk5nSUlJQUFnQTJvaEFFRUFJUU1DUUNBRUlBRkJBQkFLQkVBZ0FrRUJOZ0k0SUFRZ0FrRUlhaUFBSUFCQkFVRUFJQVFvQWdBb0FoUVJBd0FnQUVFQUlBSW9BaUJCQVVZYklRTU1BUXNnQkNBQ1FRaHFJQUJCQVVFQUlBUW9BZ0FvQWhnUkFnQUNRQUpBSUFJb0Fpd09BZ0FCQWdzZ0FpZ0NIRUVBSUFJb0FpaEJBVVliUVFBZ0FpZ0NKRUVCUmh0QkFDQUNLQUl3UVFGR0d5RUREQUVMSUFJb0FpQkJBVWNFUUNBQ0tBSXdEUUVnQWlnQ0pFRUJSdzBCSUFJb0FpaEJBVWNOQVFzZ0FpZ0NHQ0VEQ3lBQ1FVQnJKQUFnQXd1YUFRRUNmeU1BUVVCcUlnTWtBQUovUVFFZ0FDQUJRUUFRQ2cwQUdrRUFJQUZGRFFBYVFRQWdBVUdzRmhBZUlnRkZEUUFhSUFOQkRHcEJOQkFRR2lBRFFRRTJBamdnQTBGL05nSVVJQU1nQURZQ0VDQURJQUUyQWdnZ0FTQURRUWhxSUFJb0FnQkJBU0FCS0FJQUtBSWNFUUFBSUFNb0FpQWlBRUVCUmdSQUlBSWdBeWdDR0RZQ0FBc2dBRUVCUmdzaEJDQURRVUJySkFBZ0JBc0tBQ0FBSUFGQkFCQUtDNmtEQWdSL0FuMUIvLy8vL3djaENVR0FnSUNBZUNFS0EwQWdBU0FJUmdSQVFRQWhCeUFHUVlDQUVCQVFJUUJEQUFDQVJ5QUtJQWxyc3BVaERBTkFJQUVnQjBZRVFFRUFJUWNnQlVFQU5nSUFJQUJCQkdzaEFFRUFJUWxCQVNFSUEwQWdDRUdBZ0FSR1JRUkFJQVVnQ0VFQ2RDSUNhaUFBSUFKcUtBSUFJQWxxSWdrMkFnQWdDRUVCYWlFSURBRUxDd05BSUFFZ0IwWkZCRUFnQlNBRElBZEJBblJxS0FJQVFRSjBhaUlBSUFBb0FnQWlBRUVCYWpZQ0FDQUVJQUJCQW5ScUlBYzJBZ0FnQjBFQmFpRUhEQUVMQ3dVQ2Z5QU1JQU1nQjBFQ2RHb2lBaWdDQUNBSmE3T1VJZ3REQUFDQVQxMGdDME1BQUFBQVlIRUVRQ0FMcVF3QkMwRUFDeUVJSUFJZ0NEWUNBQ0FBSUFoQkFuUnFJZ0lnQWlnQ0FFRUJhallDQUNBSFFRRnFJUWNNQVFzTEJTQURJQWhCQW5ScUFuOGdBQ29DQ0NBQ0lBaEJER3hxSWdjcUFnQ1VJQUFxQWhnZ0J5b0NCSlNTSUFBcUFpZ2dCeW9DQ0pTU1F3QUFnRVdVSWd1TFF3QUFBRTlkQkVBZ0M2Z01BUXRCZ0lDQWdIZ0xJZ2MyQWdBZ0NTQUhJQWNnQ1VvYklRa2dDaUFISUFjZ0NrZ2JJUW9nQ0VFQmFpRUlEQUVMQ3dzTHh4SUNBRUdBQ0F1MkVuVnVjMmxuYm1Wa0lITm9iM0owQUhWdWMybG5ibVZrSUdsdWRBQm1iRzloZEFCMWFXNTBOalJmZEFCMWJuTnBaMjVsWkNCamFHRnlBR0p2YjJ3QVpXMXpZM0pwY0hSbGJqbzZkbUZzQUhWdWMybG5ibVZrSUd4dmJtY0FjM1JrT2pwM2MzUnlhVzVuQUhOMFpEbzZjM1J5YVc1bkFITjBaRG82ZFRFMmMzUnlhVzVuQUhOMFpEbzZkVE15YzNSeWFXNW5BR1J2ZFdKc1pRQjJiMmxrQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQSE5vYjNKMFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4MWJuTnBaMjVsWkNCemFHOXlkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhhVzUwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYm5OcFoyNWxaQ0JwYm5RK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEdac2IyRjBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eDFhVzUwT0Y5MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4cGJuUTRYM1ErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQSFZwYm5ReE5sOTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHBiblF4Tmw5MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4MWFXNTBOalJmZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4YVc1ME5qUmZkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhkV2x1ZERNeVgzUStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BHbHVkRE15WDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEdOb1lYSStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BIVnVjMmxuYm1Wa0lHTm9ZWEkrQUhOMFpEbzZZbUZ6YVdOZmMzUnlhVzVuUEhWdWMybG5ibVZrSUdOb1lYSStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BITnBaMjVsWkNCamFHRnlQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHNiMjVuUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYm5OcFoyNWxaQ0JzYjI1blBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4a2IzVmliR1UrQUU1VGRETmZYekl4TW1KaGMybGpYM04wY21sdVowbGpUbE5mTVRGamFHRnlYM1J5WVdsMGMwbGpSVVZPVTE4NVlXeHNiMk5oZEc5eVNXTkZSVVZGQUFBQUFLUU1BQUJDQndBQVRsTjBNMTlmTWpFeVltRnphV05mYzNSeWFXNW5TV2hPVTE4eE1XTm9ZWEpmZEhKaGFYUnpTV2hGUlU1VFh6bGhiR3h2WTJGMGIzSkphRVZGUlVVQUFLUU1BQUNNQndBQVRsTjBNMTlmTWpFeVltRnphV05mYzNSeWFXNW5TWGRPVTE4eE1XTm9ZWEpmZEhKaGFYUnpTWGRGUlU1VFh6bGhiR3h2WTJGMGIzSkpkMFZGUlVVQUFLUU1BQURVQndBQVRsTjBNMTlmTWpFeVltRnphV05mYzNSeWFXNW5TVVJ6VGxOZk1URmphR0Z5WDNSeVlXbDBjMGxFYzBWRlRsTmZPV0ZzYkc5allYUnZja2xFYzBWRlJVVUFBQUNrREFBQUhBZ0FBRTVUZEROZlh6SXhNbUpoYzJsalgzTjBjbWx1WjBsRWFVNVRYekV4WTJoaGNsOTBjbUZwZEhOSlJHbEZSVTVUWHpsaGJHeHZZMkYwYjNKSlJHbEZSVVZGQUFBQXBBd0FBR2dJQUFCT01UQmxiWE5qY21sd2RHVnVNM1poYkVVQUFLUU1BQUMwQ0FBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSlkwVkZBQUNrREFBQTBBZ0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTV0ZGUlFBQXBBd0FBUGdJQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsb1JVVUFBS1FNQUFBZ0NRQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEpjMFZGQUFDa0RBQUFTQWtBQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1hSRlJRQUFwQXdBQUhBSkFBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbHBSVVVBQUtRTUFBQ1lDUUFBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKYWtWRkFBQ2tEQUFBd0FrQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NXeEZSUUFBcEF3QUFPZ0pBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGx0UlVVQUFLUU1BQUFRQ2dBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSmVFVkZBQUNrREFBQU9Bb0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTWGxGUlFBQXBBd0FBR0FLQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsbVJVVUFBS1FNQUFDSUNnQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEpaRVZGQUFDa0RBQUFzQW9BQUU0eE1GOWZZM2g0WVdKcGRqRXhObDlmYzJocGJWOTBlWEJsWDJsdVptOUZBQUFBQU13TUFBRFlDZ0FBTUEwQUFFNHhNRjlmWTNoNFlXSnBkakV4TjE5ZlkyeGhjM05mZEhsd1pWOXBibVp2UlFBQUFNd01BQUFJQ3dBQS9Bb0FBRTR4TUY5ZlkzaDRZV0pwZGpFeE4xOWZjR0poYzJWZmRIbHdaVjlwYm1adlJRQUFBTXdNQUFBNEN3QUEvQW9BQUU0eE1GOWZZM2g0WVdKcGRqRXhPVjlmY0c5cGJuUmxjbDkwZVhCbFgybHVabTlGQU13TUFBQm9Dd0FBWEFzQUFBQUFBQURjQ3dBQUFnQUFBQU1BQUFBRUFBQUFCUUFBQUFZQUFBQk9NVEJmWDJONGVHRmlhWFl4TWpOZlgyWjFibVJoYldWdWRHRnNYM1I1Y0dWZmFXNW1iMFVBekF3QUFMUUxBQUQ4Q2dBQWRnQUFBS0FMQUFEb0N3QUFZZ0FBQUtBTEFBRDBDd0FBWXdBQUFLQUxBQUFBREFBQWFBQUFBS0FMQUFBTURBQUFZUUFBQUtBTEFBQVlEQUFBY3dBQUFLQUxBQUFrREFBQWRBQUFBS0FMQUFBd0RBQUFhUUFBQUtBTEFBQThEQUFBYWdBQUFLQUxBQUJJREFBQWJBQUFBS0FMQUFCVURBQUFiUUFBQUtBTEFBQmdEQUFBZUFBQUFLQUxBQUJzREFBQWVRQUFBS0FMQUFCNERBQUFaZ0FBQUtBTEFBQ0VEQUFBWkFBQUFLQUxBQUNRREFBQUFBQUFBQ3dMQUFBQ0FBQUFCd0FBQUFRQUFBQUZBQUFBQ0FBQUFBa0FBQUFLQUFBQUN3QUFBQUFBQUFBVURRQUFBZ0FBQUF3QUFBQUVBQUFBQlFBQUFBZ0FBQUFOQUFBQURnQUFBQThBQUFCT01UQmZYMk40ZUdGaWFYWXhNakJmWDNOcFgyTnNZWE56WDNSNWNHVmZhVzVtYjBVQUFBQUF6QXdBQU93TUFBQXNDd0FBVTNRNWRIbHdaVjlwYm1adkFBQUFBS1FNQUFBZ0RRQkJ1Qm9MQTBBUEFRPT0iO2lmKCFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpKXt3YXNtQmluYXJ5RmlsZT1sb2NhdGVGaWxlKHdhc21CaW5hcnlGaWxlKTt9ZnVuY3Rpb24gZ2V0QmluYXJ5U3luYyhmaWxlKXtpZihmaWxlPT13YXNtQmluYXJ5RmlsZSYmd2FzbUJpbmFyeSl7cmV0dXJuIG5ldyBVaW50OEFycmF5KHdhc21CaW5hcnkpfXZhciBiaW5hcnk9dHJ5UGFyc2VBc0RhdGFVUkkoZmlsZSk7aWYoYmluYXJ5KXtyZXR1cm4gYmluYXJ5fWlmKHJlYWRCaW5hcnkpe3JldHVybiByZWFkQmluYXJ5KGZpbGUpfXRocm93ICJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZCJ9ZnVuY3Rpb24gZ2V0QmluYXJ5UHJvbWlzZShiaW5hcnlGaWxlKXtyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKT0+Z2V0QmluYXJ5U3luYyhiaW5hcnlGaWxlKSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMscmVjZWl2ZXIpe3JldHVybiBnZXRCaW5hcnlQcm9taXNlKGJpbmFyeUZpbGUpLnRoZW4oYmluYXJ5PT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZShiaW5hcnksaW1wb3J0cykpLnRoZW4oaW5zdGFuY2U9Pmluc3RhbmNlKS50aGVuKHJlY2VpdmVyLHJlYXNvbj0+e2VycihgZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogJHtyZWFzb259YCk7YWJvcnQocmVhc29uKTt9KX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKGJpbmFyeSxiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spe3JldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKGJpbmFyeUZpbGUsaW1wb3J0cyxjYWxsYmFjayl9ZnVuY3Rpb24gY3JlYXRlV2FzbSgpe3ZhciBpbmZvPXsiYSI6d2FzbUltcG9ydHN9O2Z1bmN0aW9uIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSxtb2R1bGUpe3dhc21FeHBvcnRzPWluc3RhbmNlLmV4cG9ydHM7d2FzbU1lbW9yeT13YXNtRXhwb3J0c1siayJdO3VwZGF0ZU1lbW9yeVZpZXdzKCk7YWRkT25Jbml0KHdhc21FeHBvcnRzWyJsIl0pO3JlbW92ZVJ1bkRlcGVuZGVuY3koKTtyZXR1cm4gd2FzbUV4cG9ydHN9YWRkUnVuRGVwZW5kZW5jeSgpO2Z1bmN0aW9uIHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KHJlc3VsdCl7cmVjZWl2ZUluc3RhbmNlKHJlc3VsdFsiaW5zdGFuY2UiXSk7fWlmKE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0pe3RyeXtyZXR1cm4gTW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXShpbmZvLHJlY2VpdmVJbnN0YW5jZSl9Y2F0Y2goZSl7ZXJyKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2V9YCk7cmVhZHlQcm9taXNlUmVqZWN0KGUpO319aW5zdGFudGlhdGVBc3luYyh3YXNtQmluYXJ5LHdhc21CaW5hcnlGaWxlLGluZm8scmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQpLmNhdGNoKHJlYWR5UHJvbWlzZVJlamVjdCk7cmV0dXJuIHt9fXZhciBjYWxsUnVudGltZUNhbGxiYWNrcz1jYWxsYmFja3M9Pnt3aGlsZShjYWxsYmFja3MubGVuZ3RoPjApe2NhbGxiYWNrcy5zaGlmdCgpKE1vZHVsZSk7fX07TW9kdWxlWyJub0V4aXRSdW50aW1lIl18fHRydWU7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludD0ocHJpbWl0aXZlVHlwZSxuYW1lLHNpemUsbWluUmFuZ2UsbWF4UmFuZ2UpPT57fTt2YXIgZW1iaW5kX2luaXRfY2hhckNvZGVzPSgpPT57dmFyIGNvZGVzPW5ldyBBcnJheSgyNTYpO2Zvcih2YXIgaT0wO2k8MjU2OysraSl7Y29kZXNbaV09U3RyaW5nLmZyb21DaGFyQ29kZShpKTt9ZW1iaW5kX2NoYXJDb2Rlcz1jb2Rlczt9O3ZhciBlbWJpbmRfY2hhckNvZGVzO3ZhciByZWFkTGF0aW4xU3RyaW5nPXB0cj0+e3ZhciByZXQ9IiI7dmFyIGM9cHRyO3doaWxlKEhFQVBVOFtjXSl7cmV0Kz1lbWJpbmRfY2hhckNvZGVzW0hFQVBVOFtjKytdXTt9cmV0dXJuIHJldH07dmFyIGF3YWl0aW5nRGVwZW5kZW5jaWVzPXt9O3ZhciByZWdpc3RlcmVkVHlwZXM9e307dmFyIEJpbmRpbmdFcnJvcjt2YXIgdGhyb3dCaW5kaW5nRXJyb3I9bWVzc2FnZT0+e3Rocm93IG5ldyBCaW5kaW5nRXJyb3IobWVzc2FnZSl9O2Z1bmN0aW9uIHNoYXJlZFJlZ2lzdGVyVHlwZShyYXdUeXBlLHJlZ2lzdGVyZWRJbnN0YW5jZSxvcHRpb25zPXt9KXt2YXIgbmFtZT1yZWdpc3RlcmVkSW5zdGFuY2UubmFtZTtpZighcmF3VHlwZSl7dGhyb3dCaW5kaW5nRXJyb3IoYHR5cGUgIiR7bmFtZX0iIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXJgKTt9aWYocmVnaXN0ZXJlZFR5cGVzLmhhc093blByb3BlcnR5KHJhd1R5cGUpKXtpZihvcHRpb25zLmlnbm9yZUR1cGxpY2F0ZVJlZ2lzdHJhdGlvbnMpe3JldHVybn1lbHNlIHt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyR7bmFtZX0nIHR3aWNlYCk7fX1yZWdpc3RlcmVkVHlwZXNbcmF3VHlwZV09cmVnaXN0ZXJlZEluc3RhbmNlO2lmKGF3YWl0aW5nRGVwZW5kZW5jaWVzLmhhc093blByb3BlcnR5KHJhd1R5cGUpKXt2YXIgY2FsbGJhY2tzPWF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2RlbGV0ZSBhd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtjYWxsYmFja3MuZm9yRWFjaChjYj0+Y2IoKSk7fX1mdW5jdGlvbiByZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucz17fSl7aWYoISgiYXJnUGFja0FkdmFuY2UiaW4gcmVnaXN0ZXJlZEluc3RhbmNlKSl7dGhyb3cgbmV3IFR5cGVFcnJvcigicmVnaXN0ZXJUeXBlIHJlZ2lzdGVyZWRJbnN0YW5jZSByZXF1aXJlcyBhcmdQYWNrQWR2YW5jZSIpfXJldHVybiBzaGFyZWRSZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucyl9dmFyIEdlbmVyaWNXaXJlVHlwZVNpemU9ODt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfYm9vbD0ocmF3VHlwZSxuYW1lLHRydWVWYWx1ZSxmYWxzZVZhbHVlKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZ1bmN0aW9uKHd0KXtyZXR1cm4gISF3dH0sInRvV2lyZVR5cGUiOmZ1bmN0aW9uKGRlc3RydWN0b3JzLG8pe3JldHVybiBvP3RydWVWYWx1ZTpmYWxzZVZhbHVlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUFU4W3BvaW50ZXJdKX0sZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KTt9O2Z1bmN0aW9uIGhhbmRsZUFsbG9jYXRvckluaXQoKXtPYmplY3QuYXNzaWduKEhhbmRsZUFsbG9jYXRvci5wcm90b3R5cGUse2dldChpZCl7cmV0dXJuIHRoaXMuYWxsb2NhdGVkW2lkXX0saGFzKGlkKXtyZXR1cm4gdGhpcy5hbGxvY2F0ZWRbaWRdIT09dW5kZWZpbmVkfSxhbGxvY2F0ZShoYW5kbGUpe3ZhciBpZD10aGlzLmZyZWVsaXN0LnBvcCgpfHx0aGlzLmFsbG9jYXRlZC5sZW5ndGg7dGhpcy5hbGxvY2F0ZWRbaWRdPWhhbmRsZTtyZXR1cm4gaWR9LGZyZWUoaWQpe3RoaXMuYWxsb2NhdGVkW2lkXT11bmRlZmluZWQ7dGhpcy5mcmVlbGlzdC5wdXNoKGlkKTt9fSk7fWZ1bmN0aW9uIEhhbmRsZUFsbG9jYXRvcigpe3RoaXMuYWxsb2NhdGVkPVt1bmRlZmluZWRdO3RoaXMuZnJlZWxpc3Q9W107fXZhciBlbXZhbF9oYW5kbGVzPW5ldyBIYW5kbGVBbGxvY2F0b3I7dmFyIF9fZW12YWxfZGVjcmVmPWhhbmRsZT0+e2lmKGhhbmRsZT49ZW12YWxfaGFuZGxlcy5yZXNlcnZlZCYmMD09PS0tZW12YWxfaGFuZGxlcy5nZXQoaGFuZGxlKS5yZWZjb3VudCl7ZW12YWxfaGFuZGxlcy5mcmVlKGhhbmRsZSk7fX07dmFyIGNvdW50X2VtdmFsX2hhbmRsZXM9KCk9Pnt2YXIgY291bnQ9MDtmb3IodmFyIGk9ZW12YWxfaGFuZGxlcy5yZXNlcnZlZDtpPGVtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLmxlbmd0aDsrK2kpe2lmKGVtdmFsX2hhbmRsZXMuYWxsb2NhdGVkW2ldIT09dW5kZWZpbmVkKXsrK2NvdW50O319cmV0dXJuIGNvdW50fTt2YXIgaW5pdF9lbXZhbD0oKT0+e2VtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLnB1c2goe3ZhbHVlOnVuZGVmaW5lZH0se3ZhbHVlOm51bGx9LHt2YWx1ZTp0cnVlfSx7dmFsdWU6ZmFsc2V9KTtlbXZhbF9oYW5kbGVzLnJlc2VydmVkPWVtdmFsX2hhbmRsZXMuYWxsb2NhdGVkLmxlbmd0aDtNb2R1bGVbImNvdW50X2VtdmFsX2hhbmRsZXMiXT1jb3VudF9lbXZhbF9oYW5kbGVzO307dmFyIEVtdmFsPXt0b1ZhbHVlOmhhbmRsZT0+e2lmKCFoYW5kbGUpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSAiK2hhbmRsZSk7fXJldHVybiBlbXZhbF9oYW5kbGVzLmdldChoYW5kbGUpLnZhbHVlfSx0b0hhbmRsZTp2YWx1ZT0+e3N3aXRjaCh2YWx1ZSl7Y2FzZSB1bmRlZmluZWQ6cmV0dXJuIDE7Y2FzZSBudWxsOnJldHVybiAyO2Nhc2UgdHJ1ZTpyZXR1cm4gMztjYXNlIGZhbHNlOnJldHVybiA0O2RlZmF1bHQ6e3JldHVybiBlbXZhbF9oYW5kbGVzLmFsbG9jYXRlKHtyZWZjb3VudDoxLHZhbHVlOnZhbHVlfSl9fX19O2Z1bmN0aW9uIHNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQMzJbcG9pbnRlcj4+Ml0pfXZhciBfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbD0ocmF3VHlwZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmhhbmRsZT0+e3ZhciBydj1FbXZhbC50b1ZhbHVlKGhhbmRsZSk7X19lbXZhbF9kZWNyZWYoaGFuZGxlKTtyZXR1cm4gcnZ9LCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsdmFsdWUpPT5FbXZhbC50b0hhbmRsZSh2YWx1ZSksImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KTt9O3ZhciBmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyPShuYW1lLHdpZHRoKT0+e3N3aXRjaCh3aWR0aCl7Y2FzZSA0OnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEYzMltwb2ludGVyPj4yXSl9O2Nhc2UgODpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGNjRbcG9pbnRlcj4+M10pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgZmxvYXQgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0PShyYXdUeXBlLG5hbWUsc2l6ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjp2YWx1ZT0+dmFsdWUsInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PnZhbHVlLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaXplKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pO307dmFyIGludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcj0obmFtZSx3aWR0aCxzaWduZWQpPT57c3dpdGNoKHdpZHRoKXtjYXNlIDE6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQOFtwb2ludGVyPj4wXTpwb2ludGVyPT5IRUFQVThbcG9pbnRlcj4+MF07Y2FzZSAyOnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDE2W3BvaW50ZXI+PjFdOnBvaW50ZXI9PkhFQVBVMTZbcG9pbnRlcj4+MV07Y2FzZSA0OnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDMyW3BvaW50ZXI+PjJdOnBvaW50ZXI9PkhFQVBVMzJbcG9pbnRlcj4+Ml07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGludGVnZXIgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXI9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTtpZihtaW5SYW5nZT09PTApe3ZhciBiaXRzaGlmdD0zMi04KnNpemU7ZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTw8Yml0c2hpZnQ+Pj5iaXRzaGlmdDt9dmFyIGlzVW5zaWduZWRUeXBlPW5hbWUuaW5jbHVkZXMoInVuc2lnbmVkIik7dmFyIGNoZWNrQXNzZXJ0aW9ucz0odmFsdWUsdG9UeXBlTmFtZSk9Pnt9O3ZhciB0b1dpcmVUeXBlO2lmKGlzVW5zaWduZWRUeXBlKXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWU+Pj4wfTt9ZWxzZSB7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlfTt9cmVnaXN0ZXJUeXBlKHByaW1pdGl2ZVR5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmcm9tV2lyZVR5cGUsInRvV2lyZVR5cGUiOnRvV2lyZVR5cGUsImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6aW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2l6ZSxtaW5SYW5nZSE9PTApLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXc9KHJhd1R5cGUsZGF0YVR5cGVJbmRleCxuYW1lKT0+e3ZhciB0eXBlTWFwcGluZz1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXldO3ZhciBUQT10eXBlTWFwcGluZ1tkYXRhVHlwZUluZGV4XTtmdW5jdGlvbiBkZWNvZGVNZW1vcnlWaWV3KGhhbmRsZSl7dmFyIHNpemU9SEVBUFUzMltoYW5kbGU+PjJdO3ZhciBkYXRhPUhFQVBVMzJbaGFuZGxlKzQ+PjJdO3JldHVybiBuZXcgVEEoSEVBUDguYnVmZmVyLGRhdGEsc2l6ZSl9bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZGVjb2RlTWVtb3J5VmlldywiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpkZWNvZGVNZW1vcnlWaWV3fSx7aWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9uczp0cnVlfSk7fTtmdW5jdGlvbiByZWFkUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUFUzMltwb2ludGVyPj4yXSl9dmFyIHN0cmluZ1RvVVRGOEFycmF5PShzdHIsaGVhcCxvdXRJZHgsbWF4Qnl0ZXNUb1dyaXRlKT0+e2lmKCEobWF4Qnl0ZXNUb1dyaXRlPjApKXJldHVybiAwO3ZhciBzdGFydElkeD1vdXRJZHg7dmFyIGVuZElkeD1vdXRJZHgrbWF4Qnl0ZXNUb1dyaXRlLTE7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIHU9c3RyLmNoYXJDb2RlQXQoaSk7aWYodT49NTUyOTYmJnU8PTU3MzQzKXt2YXIgdTE9c3RyLmNoYXJDb2RlQXQoKytpKTt1PTY1NTM2KygodSYxMDIzKTw8MTApfHUxJjEwMjM7fWlmKHU8PTEyNyl7aWYob3V0SWR4Pj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109dTt9ZWxzZSBpZih1PD0yMDQ3KXtpZihvdXRJZHgrMT49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTE5Mnx1Pj42O2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzO31lbHNlIGlmKHU8PTY1NTM1KXtpZihvdXRJZHgrMj49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTIyNHx1Pj4xMjtoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2Mzt9ZWxzZSB7aWYob3V0SWR4KzM+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yNDB8dT4+MTg7aGVhcFtvdXRJZHgrK109MTI4fHU+PjEyJjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzO319aGVhcFtvdXRJZHhdPTA7cmV0dXJuIG91dElkeC1zdGFydElkeH07dmFyIHN0cmluZ1RvVVRGOD0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT5zdHJpbmdUb1VURjhBcnJheShzdHIsSEVBUFU4LG91dFB0cixtYXhCeXRlc1RvV3JpdGUpO3ZhciBsZW5ndGhCeXRlc1VURjg9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjPXN0ci5jaGFyQ29kZUF0KGkpO2lmKGM8PTEyNyl7bGVuKys7fWVsc2UgaWYoYzw9MjA0Nyl7bGVuKz0yO31lbHNlIGlmKGM+PTU1Mjk2JiZjPD01NzM0Myl7bGVuKz00OysraTt9ZWxzZSB7bGVuKz0zO319cmV0dXJuIGxlbn07dmFyIFVURjhEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGY4Iik6dW5kZWZpbmVkO3ZhciBVVEY4QXJyYXlUb1N0cmluZz0oaGVhcE9yQXJyYXksaWR4LG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBlbmRJZHg9aWR4K21heEJ5dGVzVG9SZWFkO3ZhciBlbmRQdHI9aWR4O3doaWxlKGhlYXBPckFycmF5W2VuZFB0cl0mJiEoZW5kUHRyPj1lbmRJZHgpKSsrZW5kUHRyO2lmKGVuZFB0ci1pZHg+MTYmJmhlYXBPckFycmF5LmJ1ZmZlciYmVVRGOERlY29kZXIpe3JldHVybiBVVEY4RGVjb2Rlci5kZWNvZGUoaGVhcE9yQXJyYXkuc3ViYXJyYXkoaWR4LGVuZFB0cikpfXZhciBzdHI9IiI7d2hpbGUoaWR4PGVuZFB0cil7dmFyIHUwPWhlYXBPckFycmF5W2lkeCsrXTtpZighKHUwJjEyOCkpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7Y29udGludWV9dmFyIHUxPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjI0KT09MTkyKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoKHUwJjMxKTw8Nnx1MSk7Y29udGludWV9dmFyIHUyPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjQwKT09MjI0KXt1MD0odTAmMTUpPDwxMnx1MTw8Nnx1Mjt9ZWxzZSB7dTA9KHUwJjcpPDwxOHx1MTw8MTJ8dTI8PDZ8aGVhcE9yQXJyYXlbaWR4KytdJjYzO31pZih1MDw2NTUzNil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTt9ZWxzZSB7dmFyIGNoPXUwLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyk7fX1yZXR1cm4gc3RyfTt2YXIgVVRGOFRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT5wdHI/VVRGOEFycmF5VG9TdHJpbmcoSEVBUFU4LHB0cixtYXhCeXRlc1RvUmVhZCk6IiI7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmc9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIHN0ZFN0cmluZ0lzVVRGOD1uYW1lPT09InN0ZDo6c3RyaW5nIjtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiKHZhbHVlKXt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBwYXlsb2FkPXZhbHVlKzQ7dmFyIHN0cjtpZihzdGRTdHJpbmdJc1VURjgpe3ZhciBkZWNvZGVTdGFydFB0cj1wYXlsb2FkO2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj1wYXlsb2FkK2k7aWYoaT09bGVuZ3RofHxIRUFQVThbY3VycmVudEJ5dGVQdHJdPT0wKXt2YXIgbWF4UmVhZD1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1VVEY4VG9TdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZCk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudDt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudDt9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrMTt9fX1lbHNlIHt2YXIgYT1uZXcgQXJyYXkobGVuZ3RoKTtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe2FbaV09U3RyaW5nLmZyb21DaGFyQ29kZShIRUFQVThbcGF5bG9hZCtpXSk7fXN0cj1hLmpvaW4oIiIpO31fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiKGRlc3RydWN0b3JzLHZhbHVlKXtpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXt2YWx1ZT1uZXcgVWludDhBcnJheSh2YWx1ZSk7fXZhciBsZW5ndGg7dmFyIHZhbHVlSXNPZlR5cGVTdHJpbmc9dHlwZW9mIHZhbHVlPT0ic3RyaW5nIjtpZighKHZhbHVlSXNPZlR5cGVTdHJpbmd8fHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZyIpO31pZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe2xlbmd0aD1sZW5ndGhCeXRlc1VURjgodmFsdWUpO31lbHNlIHtsZW5ndGg9dmFsdWUubGVuZ3RoO312YXIgYmFzZT1fbWFsbG9jKDQrbGVuZ3RoKzEpO3ZhciBwdHI9YmFzZSs0O0hFQVBVMzJbYmFzZT4+Ml09bGVuZ3RoO2lmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7c3RyaW5nVG9VVEY4KHZhbHVlLHB0cixsZW5ndGgrMSk7fWVsc2Uge2lmKHZhbHVlSXNPZlR5cGVTdHJpbmcpe2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7dmFyIGNoYXJDb2RlPXZhbHVlLmNoYXJDb2RlQXQoaSk7aWYoY2hhckNvZGU+MjU1KXtfZnJlZShwdHIpO3Rocm93QmluZGluZ0Vycm9yKCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHMiKTt9SEVBUFU4W3B0citpXT1jaGFyQ29kZTt9fWVsc2Uge2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7SEVBUFU4W3B0citpXT12YWx1ZVtpXTt9fX1pZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUsYmFzZSk7fXJldHVybiBiYXNlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpyZWFkUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpO319KTt9O3ZhciBVVEYxNkRlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0Zi0xNmxlIik6dW5kZWZpbmVkO3ZhciBVVEYxNlRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGVuZFB0cj1wdHI7dmFyIGlkeD1lbmRQdHI+PjE7dmFyIG1heElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQvMjt3aGlsZSghKGlkeD49bWF4SWR4KSYmSEVBUFUxNltpZHhdKSsraWR4O2VuZFB0cj1pZHg8PDE7aWYoZW5kUHRyLXB0cj4zMiYmVVRGMTZEZWNvZGVyKXJldHVybiBVVEYxNkRlY29kZXIuZGVjb2RlKEhFQVBVOC5zdWJhcnJheShwdHIsZW5kUHRyKSk7dmFyIHN0cj0iIjtmb3IodmFyIGk9MDshKGk+PW1heEJ5dGVzVG9SZWFkLzIpOysraSl7dmFyIGNvZGVVbml0PUhFQVAxNltwdHIraSoyPj4xXTtpZihjb2RlVW5pdD09MClicmVhaztzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVVuaXQpO31yZXR1cm4gc3RyfTt2YXIgc3RyaW5nVG9VVEYxNj0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT57aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0Nzt9aWYobWF4Qnl0ZXNUb1dyaXRlPDIpcmV0dXJuIDA7bWF4Qnl0ZXNUb1dyaXRlLT0yO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIG51bUNoYXJzVG9Xcml0ZT1tYXhCeXRlc1RvV3JpdGU8c3RyLmxlbmd0aCoyP21heEJ5dGVzVG9Xcml0ZS8yOnN0ci5sZW5ndGg7Zm9yKHZhciBpPTA7aTxudW1DaGFyc1RvV3JpdGU7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7SEVBUDE2W291dFB0cj4+MV09Y29kZVVuaXQ7b3V0UHRyKz0yO31IRUFQMTZbb3V0UHRyPj4xXT0wO3JldHVybiBvdXRQdHItc3RhcnRQdHJ9O3ZhciBsZW5ndGhCeXRlc1VURjE2PXN0cj0+c3RyLmxlbmd0aCoyO3ZhciBVVEYzMlRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGk9MDt2YXIgc3RyPSIiO3doaWxlKCEoaT49bWF4Qnl0ZXNUb1JlYWQvNCkpe3ZhciB1dGYzMj1IRUFQMzJbcHRyK2kqND4+Ml07aWYodXRmMzI9PTApYnJlYWs7KytpO2lmKHV0ZjMyPj02NTUzNil7dmFyIGNoPXV0ZjMyLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyk7fWVsc2Uge3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1dGYzMik7fX1yZXR1cm4gc3RyfTt2YXIgc3RyaW5nVG9VVEYzMj0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT57aWYobWF4Qnl0ZXNUb1dyaXRlPT09dW5kZWZpbmVkKXttYXhCeXRlc1RvV3JpdGU9MjE0NzQ4MzY0Nzt9aWYobWF4Qnl0ZXNUb1dyaXRlPDQpcmV0dXJuIDA7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgZW5kUHRyPXN0YXJ0UHRyK21heEJ5dGVzVG9Xcml0ZS00O2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0Myl7dmFyIHRyYWlsU3Vycm9nYXRlPXN0ci5jaGFyQ29kZUF0KCsraSk7Y29kZVVuaXQ9NjU1MzYrKChjb2RlVW5pdCYxMDIzKTw8MTApfHRyYWlsU3Vycm9nYXRlJjEwMjM7fUhFQVAzMltvdXRQdHI+PjJdPWNvZGVVbml0O291dFB0cis9NDtpZihvdXRQdHIrND5lbmRQdHIpYnJlYWt9SEVBUDMyW291dFB0cj4+Ml09MDtyZXR1cm4gb3V0UHRyLXN0YXJ0UHRyfTt2YXIgbGVuZ3RoQnl0ZXNVVEYzMj1zdHI9Pnt2YXIgbGVuPTA7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO2lmKGNvZGVVbml0Pj01NTI5NiYmY29kZVVuaXQ8PTU3MzQzKSsraTtsZW4rPTQ7fXJldHVybiBsZW59O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZz0ocmF3VHlwZSxjaGFyU2l6ZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgZGVjb2RlU3RyaW5nLGVuY29kZVN0cmluZyxnZXRIZWFwLGxlbmd0aEJ5dGVzVVRGLHNoaWZ0O2lmKGNoYXJTaXplPT09Mil7ZGVjb2RlU3RyaW5nPVVURjE2VG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMTY7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYxNjtnZXRIZWFwPSgpPT5IRUFQVTE2O3NoaWZ0PTE7fWVsc2UgaWYoY2hhclNpemU9PT00KXtkZWNvZGVTdHJpbmc9VVRGMzJUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYzMjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjMyO2dldEhlYXA9KCk9PkhFQVBVMzI7c2hpZnQ9Mjt9cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjp2YWx1ZT0+e3ZhciBsZW5ndGg9SEVBUFUzMlt2YWx1ZT4+Ml07dmFyIEhFQVA9Z2V0SGVhcCgpO3ZhciBzdHI7dmFyIGRlY29kZVN0YXJ0UHRyPXZhbHVlKzQ7Zm9yKHZhciBpPTA7aTw9bGVuZ3RoOysraSl7dmFyIGN1cnJlbnRCeXRlUHRyPXZhbHVlKzQraSpjaGFyU2l6ZTtpZihpPT1sZW5ndGh8fEhFQVBbY3VycmVudEJ5dGVQdHI+PnNoaWZ0XT09MCl7dmFyIG1heFJlYWRCeXRlcz1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1kZWNvZGVTdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZEJ5dGVzKTtpZihzdHI9PT11bmRlZmluZWQpe3N0cj1zdHJpbmdTZWdtZW50O31lbHNlIHtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50O31kZWNvZGVTdGFydFB0cj1jdXJyZW50Qnl0ZVB0citjaGFyU2l6ZTt9fV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLHZhbHVlKT0+e2lmKCEodHlwZW9mIHZhbHVlPT0ic3RyaW5nIikpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIEMrKyBzdHJpbmcgdHlwZSAke25hbWV9YCk7fXZhciBsZW5ndGg9bGVuZ3RoQnl0ZXNVVEYodmFsdWUpO3ZhciBwdHI9X21hbGxvYyg0K2xlbmd0aCtjaGFyU2l6ZSk7SEVBUFUzMltwdHI+PjJdPWxlbmd0aD4+c2hpZnQ7ZW5jb2RlU3RyaW5nKHZhbHVlLHB0cis0LGxlbmd0aCtjaGFyU2l6ZSk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLHB0cik7fXJldHVybiBwdHJ9LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbihwdHIpe19mcmVlKHB0cik7fX0pO307dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQ9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse2lzVm9pZDp0cnVlLG5hbWU6bmFtZSwiYXJnUGFja0FkdmFuY2UiOjAsImZyb21XaXJlVHlwZSI6KCk9PnVuZGVmaW5lZCwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLG8pPT51bmRlZmluZWR9KTt9O3ZhciBnZXRIZWFwTWF4PSgpPT4yMTQ3NDgzNjQ4O3ZhciBncm93TWVtb3J5PXNpemU9Pnt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjt2YXIgcGFnZXM9KHNpemUtYi5ieXRlTGVuZ3RoKzY1NTM1KS82NTUzNjt0cnl7d2FzbU1lbW9yeS5ncm93KHBhZ2VzKTt1cGRhdGVNZW1vcnlWaWV3cygpO3JldHVybiAxfWNhdGNoKGUpe319O3ZhciBfZW1zY3JpcHRlbl9yZXNpemVfaGVhcD1yZXF1ZXN0ZWRTaXplPT57dmFyIG9sZFNpemU9SEVBUFU4Lmxlbmd0aDtyZXF1ZXN0ZWRTaXplPj4+PTA7dmFyIG1heEhlYXBTaXplPWdldEhlYXBNYXgoKTtpZihyZXF1ZXN0ZWRTaXplPm1heEhlYXBTaXplKXtyZXR1cm4gZmFsc2V9dmFyIGFsaWduVXA9KHgsbXVsdGlwbGUpPT54KyhtdWx0aXBsZS14JW11bHRpcGxlKSVtdWx0aXBsZTtmb3IodmFyIGN1dERvd249MTtjdXREb3duPD00O2N1dERvd24qPTIpe3ZhciBvdmVyR3Jvd25IZWFwU2l6ZT1vbGRTaXplKigxKy4yL2N1dERvd24pO292ZXJHcm93bkhlYXBTaXplPU1hdGgubWluKG92ZXJHcm93bkhlYXBTaXplLHJlcXVlc3RlZFNpemUrMTAwNjYzMjk2KTt2YXIgbmV3U2l6ZT1NYXRoLm1pbihtYXhIZWFwU2l6ZSxhbGlnblVwKE1hdGgubWF4KHJlcXVlc3RlZFNpemUsb3Zlckdyb3duSGVhcFNpemUpLDY1NTM2KSk7dmFyIHJlcGxhY2VtZW50PWdyb3dNZW1vcnkobmV3U2l6ZSk7aWYocmVwbGFjZW1lbnQpe3JldHVybiB0cnVlfX1yZXR1cm4gZmFsc2V9O2VtYmluZF9pbml0X2NoYXJDb2RlcygpO0JpbmRpbmdFcnJvcj1Nb2R1bGVbIkJpbmRpbmdFcnJvciJdPWNsYXNzIEJpbmRpbmdFcnJvciBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKG1lc3NhZ2Upe3N1cGVyKG1lc3NhZ2UpO3RoaXMubmFtZT0iQmluZGluZ0Vycm9yIjt9fTtNb2R1bGVbIkludGVybmFsRXJyb3IiXT1jbGFzcyBJbnRlcm5hbEVycm9yIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IobWVzc2FnZSl7c3VwZXIobWVzc2FnZSk7dGhpcy5uYW1lPSJJbnRlcm5hbEVycm9yIjt9fTtoYW5kbGVBbGxvY2F0b3JJbml0KCk7aW5pdF9lbXZhbCgpO3ZhciB3YXNtSW1wb3J0cz17ZjpfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQsaTpfX2VtYmluZF9yZWdpc3Rlcl9ib29sLGg6X19lbWJpbmRfcmVnaXN0ZXJfZW12YWwsZTpfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdCxiOl9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXIsYTpfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldyxkOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcsYzpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZyxqOl9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQsZzpfZW1zY3JpcHRlbl9yZXNpemVfaGVhcH07dmFyIHdhc21FeHBvcnRzPWNyZWF0ZVdhc20oKTtNb2R1bGVbIl9zb3J0Il09KGEwLGExLGEyLGEzLGE0LGE1LGE2KT0+KE1vZHVsZVsiX3NvcnQiXT13YXNtRXhwb3J0c1sibSJdKShhMCxhMSxhMixhMyxhNCxhNSxhNik7dmFyIF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09YTA9PihfbWFsbG9jPU1vZHVsZVsiX21hbGxvYyJdPXdhc21FeHBvcnRzWyJvIl0pKGEwKTt2YXIgX2ZyZWU9TW9kdWxlWyJfZnJlZSJdPWEwPT4oX2ZyZWU9TW9kdWxlWyJfZnJlZSJdPXdhc21FeHBvcnRzWyJwIl0pKGEwKTt2YXIgY2FsbGVkUnVuO2RlcGVuZGVuY2llc0Z1bGZpbGxlZD1mdW5jdGlvbiBydW5DYWxsZXIoKXtpZighY2FsbGVkUnVuKXJ1bigpO2lmKCFjYWxsZWRSdW4pZGVwZW5kZW5jaWVzRnVsZmlsbGVkPXJ1bkNhbGxlcjt9O2Z1bmN0aW9uIHJ1bigpe2lmKHJ1bkRlcGVuZGVuY2llcz4wKXtyZXR1cm59cHJlUnVuKCk7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1mdW5jdGlvbiBkb1J1bigpe2lmKGNhbGxlZFJ1bilyZXR1cm47Y2FsbGVkUnVuPXRydWU7TW9kdWxlWyJjYWxsZWRSdW4iXT10cnVlO2lmKEFCT1JUKXJldHVybjtpbml0UnVudGltZSgpO3JlYWR5UHJvbWlzZVJlc29sdmUoTW9kdWxlKTtpZihNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0pTW9kdWxlWyJvblJ1bnRpbWVJbml0aWFsaXplZCJdKCk7cG9zdFJ1bigpO31pZihNb2R1bGVbInNldFN0YXR1cyJdKXtNb2R1bGVbInNldFN0YXR1cyJdKCJSdW5uaW5nLi4uIik7c2V0VGltZW91dChmdW5jdGlvbigpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtNb2R1bGVbInNldFN0YXR1cyJdKCIiKTt9LDEpO2RvUnVuKCk7fSwxKTt9ZWxzZSB7ZG9SdW4oKTt9fWlmKE1vZHVsZVsicHJlSW5pdCJdKXtpZih0eXBlb2YgTW9kdWxlWyJwcmVJbml0Il09PSJmdW5jdGlvbiIpTW9kdWxlWyJwcmVJbml0Il09W01vZHVsZVsicHJlSW5pdCJdXTt3aGlsZShNb2R1bGVbInByZUluaXQiXS5sZW5ndGg+MCl7TW9kdWxlWyJwcmVJbml0Il0ucG9wKCkoKTt9fXJ1bigpOwoKCiAgICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5CiAgfQogICk7CiAgfSkoKTsKCiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkKICBsZXQgd2FzbU1vZHVsZTsKICBhc3luYyBmdW5jdGlvbiBpbml0V2FzbSgpIHsKICAgICAgd2FzbU1vZHVsZSA9IGF3YWl0IGxvYWRXYXNtKCk7CiAgfQogIGxldCBzY2VuZTsKICBsZXQgdmlld1Byb2o7CiAgbGV0IHNvcnRSdW5uaW5nID0gZmFsc2U7CiAgbGV0IHZpZXdQcm9qUHRyOwogIGxldCBmQnVmZmVyUHRyOwogIGxldCBkZXB0aEJ1ZmZlclB0cjsKICBsZXQgZGVwdGhJbmRleFB0cjsKICBsZXQgc3RhcnRzUHRyOwogIGxldCBjb3VudHNQdHI7CiAgY29uc3QgaW5pdFNjZW5lID0gYXN5bmMgKCkgPT4gewogICAgICBpZiAoIXdhc21Nb2R1bGUpCiAgICAgICAgICBhd2FpdCBpbml0V2FzbSgpOwogICAgICBmQnVmZmVyUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKHNjZW5lLnBvc2l0aW9ucy5sZW5ndGggKiBzY2VuZS5wb3NpdGlvbnMuQllURVNfUEVSX0VMRU1FTlQpOwogICAgICB3YXNtTW9kdWxlLkhFQVBGMzIuc2V0KHNjZW5lLnBvc2l0aW9ucywgZkJ1ZmZlclB0ciAvIDQpOwogICAgICB2aWV3UHJvalB0ciA9IHdhc21Nb2R1bGUuX21hbGxvYygxNiAqIDQpOwogICAgICBkZXB0aEJ1ZmZlclB0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhzY2VuZS52ZXJ0ZXhDb3VudCAqIDQpOwogICAgICBkZXB0aEluZGV4UHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKHNjZW5lLnZlcnRleENvdW50ICogNCk7CiAgICAgIHN0YXJ0c1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhzY2VuZS52ZXJ0ZXhDb3VudCAqIDQpOwogICAgICBjb3VudHNQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2Moc2NlbmUudmVydGV4Q291bnQgKiA0KTsKICB9OwogIGNvbnN0IHJ1blNvcnQgPSAodmlld1Byb2opID0+IHsKICAgICAgY29uc3Qgdmlld1Byb2pCdWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHZpZXdQcm9qLmJ1ZmZlcik7CiAgICAgIHdhc21Nb2R1bGUuSEVBUEYzMi5zZXQodmlld1Byb2pCdWZmZXIsIHZpZXdQcm9qUHRyIC8gNCk7CiAgICAgIHdhc21Nb2R1bGUuX3NvcnQodmlld1Byb2pQdHIsIHNjZW5lLnZlcnRleENvdW50LCBmQnVmZmVyUHRyLCBkZXB0aEJ1ZmZlclB0ciwgZGVwdGhJbmRleFB0ciwgc3RhcnRzUHRyLCBjb3VudHNQdHIpOwogICAgICBjb25zdCBkZXB0aEluZGV4ID0gbmV3IFVpbnQzMkFycmF5KHdhc21Nb2R1bGUuSEVBUFUzMi5idWZmZXIsIGRlcHRoSW5kZXhQdHIsIHNjZW5lLnZlcnRleENvdW50KTsKICAgICAgY29uc3QgdHJhbnNmZXJhYmxlRGVwdGhJbmRleCA9IG5ldyBVaW50MzJBcnJheShkZXB0aEluZGV4LnNsaWNlKCkpOwogICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgZGVwdGhJbmRleDogdHJhbnNmZXJhYmxlRGVwdGhJbmRleCB9LCBbdHJhbnNmZXJhYmxlRGVwdGhJbmRleC5idWZmZXJdKTsKICB9OwogIGNvbnN0IHRocm90dGxlZFNvcnQgPSAoKSA9PiB7CiAgICAgIGlmICghc29ydFJ1bm5pbmcpIHsKICAgICAgICAgIHNvcnRSdW5uaW5nID0gdHJ1ZTsKICAgICAgICAgIGNvbnN0IGxhc3RWaWV3ID0gdmlld1Byb2o7CiAgICAgICAgICBydW5Tb3J0KGxhc3RWaWV3KTsKICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgICAgICAgIHNvcnRSdW5uaW5nID0gZmFsc2U7CiAgICAgICAgICAgICAgaWYgKGxhc3RWaWV3ICE9PSB2aWV3UHJvaikgewogICAgICAgICAgICAgICAgICB0aHJvdHRsZWRTb3J0KCk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgfSwgMCk7CiAgICAgIH0KICB9OwogIHNlbGYub25tZXNzYWdlID0gKGUpID0+IHsKICAgICAgaWYgKGUuZGF0YS5zY2VuZSkgewogICAgICAgICAgc2NlbmUgPSBlLmRhdGEuc2NlbmU7CiAgICAgICAgICBpbml0U2NlbmUoKTsKICAgICAgfQogICAgICBpZiAoIXNjZW5lIHx8ICF3YXNtTW9kdWxlKQogICAgICAgICAgcmV0dXJuOwogICAgICBpZiAoZS5kYXRhLnZpZXdQcm9qKSB7CiAgICAgICAgICB2aWV3UHJvaiA9IGUuZGF0YS52aWV3UHJvajsKICAgICAgICAgIHRocm90dGxlZFNvcnQoKTsKICAgICAgfQogIH07Cgp9KSgpOwovLyMgc291cmNlTWFwcGluZ1VSTD1Xb3JrZXIuanMubWFwCgo=", gl = null, yl = !1, function(t) {
  return Un = Un || Lr(Wl, gl, yl), new Worker(Un, t);
});
class qr {
  constructor(e = 1) {
    let n, l, i, s = 0, a = !1;
    this.init = (o, r) => {
      s = 0, a = !0, n = o, l = o.gl.getUniformLocation(r, "u_useDepthFade"), n.gl.uniform1i(l, 1), i = o.gl.getUniformLocation(r, "u_depthFade"), n.gl.uniform1f(i, s);
    }, this.render = () => {
      a && (s = Math.min(s + 0.01 * e, 1), s >= 1 && (a = !1, n.gl.uniform1i(l, 0)), n.gl.uniform1f(i, s));
    };
  }
}
class wi {
  constructor(e = null, n = null) {
    const l = e || document.createElement("canvas");
    e || (l.style.display = "block", l.style.boxSizing = "border-box", l.style.width = "100%", l.style.height = "100%", l.style.margin = "0", l.style.padding = "0", document.body.appendChild(l)), l.style.background = "#000", this.domElement = l;
    const i = l.getContext("webgl2", { antialias: !1 });
    this.gl = i;
    const s = n || [];
    let a, o, r, c, d, u, f, h, m, V, U, Q, R, F;
    n || s.push(new qr());
    let Z = !1;
    this.resize = () => {
      const S = l.clientWidth, k = l.clientHeight;
      l.width === S && l.height === k || this.setSize(S, k);
    }, this.setSize = (S, k) => {
      l.width = S, l.height = k, o && (i.viewport(0, 0, l.width, l.height), o.update(l.width, l.height), f = i.getUniformLocation(u, "projection"), i.uniformMatrix4fv(f, !1, o.projectionMatrix.buffer), h = i.getUniformLocation(u, "viewport"), i.uniform2fv(h, new Float32Array([l.width, l.height])));
    };
    const p = () => {
      r = new Kr();
      const S = { positions: a.positions, vertexCount: a.vertexCount };
      r.postMessage({ scene: S }), i.viewport(0, 0, l.width, l.height), c = i.createShader(i.VERTEX_SHADER), i.shaderSource(c, `#version 300 es
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
`), i.compileShader(d), i.getShaderParameter(d, i.COMPILE_STATUS) || console.error(i.getShaderInfoLog(d)), u = i.createProgram(), i.attachShader(u, c), i.attachShader(u, d), i.linkProgram(u), i.useProgram(u), i.getProgramParameter(u, i.LINK_STATUS) || console.error(i.getProgramInfoLog(u)), i.disable(i.DEPTH_TEST), i.enable(i.BLEND), i.blendFuncSeparate(i.ONE_MINUS_DST_ALPHA, i.ONE, i.ONE_MINUS_DST_ALPHA, i.ONE), i.blendEquationSeparate(i.FUNC_ADD, i.FUNC_ADD), o.update(l.width, l.height), f = i.getUniformLocation(u, "projection"), i.uniformMatrix4fv(f, !1, o.projectionMatrix.buffer), h = i.getUniformLocation(u, "viewport"), i.uniform2fv(h, new Float32Array([l.width, l.height])), m = i.getUniformLocation(u, "focal"), i.uniform2fv(m, new Float32Array([o.fx, o.fy])), V = i.getUniformLocation(u, "view"), i.uniformMatrix4fv(V, !1, o.viewMatrix.buffer);
      const k = new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]);
      F = i.createBuffer(), i.bindBuffer(i.ARRAY_BUFFER, F), i.bufferData(i.ARRAY_BUFFER, k, i.STATIC_DRAW), Q = i.getAttribLocation(u, "position"), i.enableVertexAttribArray(Q), i.vertexAttribPointer(Q, 2, i.FLOAT, !1, 0, 0);
      const J = i.createTexture();
      i.bindTexture(i.TEXTURE_2D, J), U = i.getUniformLocation(u, "u_texture"), i.uniform1i(U, 0);
      const y = i.createBuffer();
      R = i.getAttribLocation(u, "index"), i.enableVertexAttribArray(R), i.bindBuffer(i.ARRAY_BUFFER, y), i.vertexAttribIPointer(R, 1, i.INT, 0, 0), i.vertexAttribDivisor(R, 1), i.bindTexture(i.TEXTURE_2D, J), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA32UI, a.width, a.height, 0, i.RGBA_INTEGER, i.UNSIGNED_INT, a.data), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, J);
      for (const q of s)
        q.init(this, u);
      r.onmessage = (q) => {
        if (q.data.depthIndex) {
          const { depthIndex: w } = q.data;
          i.bindBuffer(i.ARRAY_BUFFER, y), i.bufferData(i.ARRAY_BUFFER, w, i.STATIC_DRAW);
        }
      }, Z = !0;
    }, X = () => {
      Z && this.dispose(), p();
    };
    this.render = (S, k) => {
      if (S === a && k === o || (Z && this.dispose(), o = k, S !== a && (a && a.removeEventListener("change", X), a = S, a.addEventListener("change", X)), p()), o.update(l.width, l.height), r.postMessage({ viewProj: o.viewProj }), a.vertexCount > 0) {
        for (const J of s)
          J.render();
        i.uniformMatrix4fv(V, !1, o.viewMatrix.buffer), i.clear(i.COLOR_BUFFER_BIT), i.drawArraysInstanced(i.TRIANGLE_FAN, 0, 4, a.vertexCount);
      } else
        i.clear(i.COLOR_BUFFER_BIT);
    }, this.dispose = () => {
      Z && (r.terminate(), i.deleteShader(c), i.deleteShader(d), i.deleteProgram(u), i.deleteBuffer(F), i.deleteBuffer(void 0), i.deleteBuffer(void 0), i.deleteBuffer(void 0), i.deleteBuffer(void 0), Z = !1);
    }, this.resize();
  }
}
class Ti {
  constructor(e, n, l = 0.5, i = 0.5, s = 5, a = !0, o = new D()) {
    this.minAngle = -90, this.maxAngle = 90, this.minZoom = 0.1, this.maxZoom = 30, this.orbitSpeed = 1, this.panSpeed = 1, this.zoomSpeed = 1, this.dampening = 0.12, this.setCameraTarget = () => {
    }, this.attach = () => {
    }, this.detach = () => {
    };
    let r = o.clone(), c = r.clone(), d = l, u = i, f = s, h = !1, m = !1, V = 0, U = 0, Q = 0;
    const R = {};
    let F = null, Z = !1;
    const p = () => {
      if (!F || Z)
        return;
      const b = F.rotation.toEuler();
      d = -b.y, u = -b.x;
      const g = F.position.x - f * Math.sin(d) * Math.cos(u), v = F.position.y + f * Math.sin(u), M = F.position.z + f * Math.cos(d) * Math.cos(u);
      c = new D(g, v, M);
    };
    this.attach = (b) => {
      F && this.detach(), F = b, F.addEventListener("change", p);
    }, this.detach = () => {
      F && (F.removeEventListener("change", p), F = null);
    }, this.attach(e), this.setCameraTarget = (b) => {
      if (!F)
        return;
      const g = b.x - F.position.x, v = b.y - F.position.y, M = b.z - F.position.z;
      f = Math.sqrt(g * g + v * v + M * M), u = Math.atan2(v, Math.sqrt(g * g + M * M)), d = -Math.atan2(g, M), c = new D(b.x, b.y, b.z);
    };
    const X = () => 0.1 + 0.9 * (f - this.minZoom) / (this.maxZoom - this.minZoom), S = (b) => {
      R[b.code] = !0, b.code === "ArrowUp" && (R.KeyW = !0), b.code === "ArrowDown" && (R.KeyS = !0), b.code === "ArrowLeft" && (R.KeyA = !0), b.code === "ArrowRight" && (R.KeyD = !0);
    }, k = (b) => {
      R[b.code] = !1, b.code === "ArrowUp" && (R.KeyW = !1), b.code === "ArrowDown" && (R.KeyS = !1), b.code === "ArrowLeft" && (R.KeyA = !1), b.code === "ArrowRight" && (R.KeyD = !1);
    }, J = (b) => {
      B(b), h = !0, m = b.button === 2, U = b.clientX, Q = b.clientY, window.addEventListener("mouseup", y);
    }, y = (b) => {
      B(b), h = !1, m = !1, window.removeEventListener("mouseup", y);
    }, q = (b) => {
      if (B(b), !h || !F)
        return;
      const g = b.clientX - U, v = b.clientY - Q;
      if (m) {
        const M = X(), T = -g * this.panSpeed * 0.01 * M, W = -v * this.panSpeed * 0.01 * M, z = ne.RotationFromQuaternion(F.rotation).buffer, $ = new D(z[0], z[3], z[6]), ie = new D(z[1], z[4], z[7]);
        c = c.add($.multiply(T)), c = c.add(ie.multiply(W));
      } else
        d -= g * this.orbitSpeed * 3e-3, u += v * this.orbitSpeed * 3e-3, u = Math.min(Math.max(u, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180);
      U = b.clientX, Q = b.clientY;
    }, w = (b) => {
      B(b);
      const g = X();
      f += b.deltaY * this.zoomSpeed * 0.025 * g, f = Math.min(Math.max(f, this.minZoom), this.maxZoom);
    }, L = (b) => {
      if (B(b), b.touches.length === 1)
        h = !0, m = !1, U = b.touches[0].clientX, Q = b.touches[0].clientY, V = 0;
      else if (b.touches.length === 2) {
        h = !0, m = !0, U = (b.touches[0].clientX + b.touches[1].clientX) / 2, Q = (b.touches[0].clientY + b.touches[1].clientY) / 2;
        const g = b.touches[0].clientX - b.touches[1].clientX, v = b.touches[0].clientY - b.touches[1].clientY;
        V = Math.sqrt(g * g + v * v);
      }
    }, N = (b) => {
      B(b), h = !1, m = !1;
    }, x = (b) => {
      if (B(b), h && F)
        if (m) {
          const g = X(), v = b.touches[0].clientX - b.touches[1].clientX, M = b.touches[0].clientY - b.touches[1].clientY, T = Math.sqrt(v * v + M * M);
          f += (V - T) * this.zoomSpeed * 0.1 * g, f = Math.min(Math.max(f, this.minZoom), this.maxZoom), V = T;
          const W = (b.touches[0].clientX + b.touches[1].clientX) / 2, z = (b.touches[0].clientY + b.touches[1].clientY) / 2, $ = W - U, ie = z - Q, le = ne.RotationFromQuaternion(F.rotation).buffer, O = new D(le[0], le[3], le[6]), pt = new D(le[1], le[4], le[7]);
          c = c.add(O.multiply(-$ * this.panSpeed * 0.025 * g)), c = c.add(pt.multiply(-ie * this.panSpeed * 0.025 * g)), U = W, Q = z;
        } else {
          const g = b.touches[0].clientX - U, v = b.touches[0].clientY - Q;
          d -= g * this.orbitSpeed * 3e-3, u += v * this.orbitSpeed * 3e-3, u = Math.min(Math.max(u, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180), U = b.touches[0].clientX, Q = b.touches[0].clientY;
        }
    }, _ = (b, g, v) => (1 - v) * b + v * g;
    this.update = () => {
      if (!F)
        return;
      Z = !0, l = _(l, d, this.dampening), i = _(i, u, this.dampening), s = _(s, f, this.dampening), r = r.lerp(c, this.dampening);
      const b = r.x + s * Math.sin(l) * Math.cos(i), g = r.y - s * Math.sin(i), v = r.z - s * Math.cos(l) * Math.cos(i);
      F.position = new D(b, g, v);
      const M = r.subtract(F.position).normalize(), T = Math.asin(-M.y), W = Math.atan2(M.x, M.z);
      F.rotation = re.FromEuler(new D(T, W, 0));
      const z = 0.025, $ = 0.01, ie = ne.RotationFromQuaternion(F.rotation).buffer, le = new D(-ie[2], -ie[5], -ie[8]), O = new D(ie[0], ie[3], ie[6]);
      R.KeyS && (c = c.add(le.multiply(z))), R.KeyW && (c = c.subtract(le.multiply(z))), R.KeyA && (c = c.subtract(O.multiply(z))), R.KeyD && (c = c.add(O.multiply(z))), R.KeyE && (d += $), R.KeyQ && (d -= $), R.KeyR && (u += $), R.KeyF && (u -= $), Z = !1;
    };
    const B = (b) => {
      b.preventDefault(), b.stopPropagation();
    };
    this.dispose = () => {
      n.removeEventListener("dragenter", B), n.removeEventListener("dragover", B), n.removeEventListener("dragleave", B), n.removeEventListener("contextmenu", B), n.removeEventListener("mousedown", J), n.removeEventListener("mousemove", q), n.removeEventListener("wheel", w), n.removeEventListener("touchstart", L), n.removeEventListener("touchend", N), n.removeEventListener("touchmove", x), a && (window.removeEventListener("keydown", S), window.removeEventListener("keyup", k));
    }, a && (window.addEventListener("keydown", S), window.addEventListener("keyup", k)), n.addEventListener("dragenter", B), n.addEventListener("dragover", B), n.addEventListener("dragleave", B), n.addEventListener("contextmenu", B), n.addEventListener("mousedown", J), n.addEventListener("mousemove", q), n.addEventListener("wheel", w), n.addEventListener("touchstart", L), n.addEventListener("touchend", N), n.addEventListener("touchmove", x), this.update();
  }
}
const {
  SvelteComponent: $r,
  append: Fn,
  attr: bn,
  binding_callbacks: eo,
  check_outros: to,
  create_component: Xi,
  destroy_component: Ii,
  detach: wn,
  element: pn,
  empty: no,
  group_outros: lo,
  init: io,
  insert: Tn,
  mount_component: Ci,
  safe_not_equal: so,
  space: Hi,
  transition_in: Rt,
  transition_out: It
} = window.__gradio__svelte__internal, { onMount: ao } = window.__gradio__svelte__internal;
function Jl(t) {
  let e, n, l, i, s, a;
  return l = new zt({
    props: {
      Icon: or,
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
      e = pn("div"), n = pn("div"), Xi(l.$$.fragment), i = Hi(), s = pn("canvas"), bn(n, "class", "buttons svelte-1jnxgzx"), bn(s, "class", "svelte-1jnxgzx"), bn(e, "class", "model3DGS svelte-1jnxgzx");
    },
    m(o, r) {
      Tn(o, e, r), Fn(e, n), Ci(l, n, null), Fn(e, i), Fn(e, s), t[10](s), a = !0;
    },
    p(o, r) {
      const c = {};
      r & /*i18n*/
      8 && (c.label = /*i18n*/
      o[3]("common.download")), l.$set(c);
    },
    i(o) {
      a || (Rt(l.$$.fragment, o), a = !0);
    },
    o(o) {
      It(l.$$.fragment, o), a = !1;
    },
    d(o) {
      o && wn(e), Ii(l), t[10](null);
    }
  };
}
function ro(t) {
  let e, n, l, i;
  e = new Dt({
    props: {
      show_label: (
        /*show_label*/
        t[2]
      ),
      Icon: Wt,
      label: (
        /*label*/
        t[1] || /*i18n*/
        t[3]("3DGS_model.splat")
      )
    }
  });
  let s = (
    /*value*/
    t[0] && Jl(t)
  );
  return {
    c() {
      Xi(e.$$.fragment), n = Hi(), s && s.c(), l = no();
    },
    m(a, o) {
      Ci(e, a, o), Tn(a, n, o), s && s.m(a, o), Tn(a, l, o), i = !0;
    },
    p(a, [o]) {
      const r = {};
      o & /*show_label*/
      4 && (r.show_label = /*show_label*/
      a[2]), o & /*label, i18n*/
      10 && (r.label = /*label*/
      a[1] || /*i18n*/
      a[3]("3DGS_model.splat")), e.$set(r), /*value*/
      a[0] ? s ? (s.p(a, o), o & /*value*/
      1 && Rt(s, 1)) : (s = Jl(a), s.c(), Rt(s, 1), s.m(l.parentNode, l)) : s && (lo(), It(s, 1, 1, () => {
        s = null;
      }), to());
    },
    i(a) {
      i || (Rt(e.$$.fragment, a), Rt(s), i = !0);
    },
    o(a) {
      It(e.$$.fragment, a), It(s), i = !1;
    },
    d(a) {
      a && (wn(n), wn(l)), Ii(e, a), s && s.d(a);
    }
  };
}
function oo(t, e, n) {
  let l, { value: i } = e, { label: s = "" } = e, { show_label: a } = e, { i18n: o } = e, { zoom_speed: r = 1 } = e, { pan_speed: c = 1 } = e, d, u, f, h = null, m, V = !1, U = !1, Q = !1;
  ao(() => {
    u = new Be(), f = new Ei(), n(8, Q = !0);
  });
  function R() {
    if (!i)
      return;
    const p = new Blob([u.data.buffer], { type: "application/octet-stream" }), X = document.createElement("a");
    X.download = "model.splat", X.href = window.URL.createObjectURL(p), X.click();
  }
  function F() {
    if (h !== null && h.dispose(), h = new wi(d), m = new Ti(f, d), m.zoomSpeed = r, m.panSpeed = c, !i)
      return;
    const p = async () => {
      if (V) {
        console.error("Already loading");
        return;
      }
      if (V = !0, i.url.endsWith(".ply"))
        await Ln.LoadAsync(i.url, u, (S) => {
        });
      else if (i.url.endsWith(".splat"))
        await ki.LoadAsync(i.url, u, (S) => {
        });
      else
        throw new Error("Unsupported file type");
      V = !1;
    }, X = () => {
      if (U) {
        if (V) {
          requestAnimationFrame(X);
          return;
        }
        m.update(), h.render(u, f), requestAnimationFrame(X);
      }
    };
    p(), U = !0, requestAnimationFrame(X);
  }
  function Z(p) {
    eo[p ? "unshift" : "push"](() => {
      d = p, n(4, d);
    });
  }
  return t.$$set = (p) => {
    "value" in p && n(0, i = p.value), "label" in p && n(1, s = p.label), "show_label" in p && n(2, a = p.show_label), "i18n" in p && n(3, o = p.i18n), "zoom_speed" in p && n(6, r = p.zoom_speed), "pan_speed" in p && n(7, c = p.pan_speed);
  }, t.$$.update = () => {
    t.$$.dirty & /*value*/
    1 && n(9, { path: l } = i || { path: void 0 }, l), t.$$.dirty & /*canvas, mounted, path*/
    784 && d && Q && l && F();
  }, [
    i,
    s,
    a,
    o,
    d,
    R,
    r,
    c,
    Q,
    l,
    Z
  ];
}
class co extends $r {
  constructor(e) {
    super(), io(this, e, oo, ro, so, {
      value: 0,
      label: 1,
      show_label: 2,
      i18n: 3,
      zoom_speed: 6,
      pan_speed: 7
    });
  }
}
function Ke() {
}
function uo(t) {
  return t();
}
function ho(t) {
  t.forEach(uo);
}
function fo(t) {
  return typeof t == "function";
}
function mo(t, e) {
  return t != t ? e == e : t !== e || t && typeof t == "object" || typeof t == "function";
}
function Uo(t, ...e) {
  if (t == null) {
    for (const l of e)
      l(void 0);
    return Ke;
  }
  const n = t.subscribe(...e);
  return n.unsubscribe ? () => n.unsubscribe() : n;
}
const Yi = typeof window < "u";
let Nl = Yi ? () => window.performance.now() : () => Date.now(), xi = Yi ? (t) => requestAnimationFrame(t) : Ke;
const it = /* @__PURE__ */ new Set();
function Mi(t) {
  it.forEach((e) => {
    e.c(t) || (it.delete(e), e.f());
  }), it.size !== 0 && xi(Mi);
}
function Fo(t) {
  let e;
  return it.size === 0 && xi(Mi), {
    promise: new Promise((n) => {
      it.add(e = { c: t, f: n });
    }),
    abort() {
      it.delete(e);
    }
  };
}
const et = [];
function bo(t, e) {
  return {
    subscribe: gt(t, e).subscribe
  };
}
function gt(t, e = Ke) {
  let n;
  const l = /* @__PURE__ */ new Set();
  function i(o) {
    if (mo(t, o) && (t = o, n)) {
      const r = !et.length;
      for (const c of l)
        c[1](), et.push(c, t);
      if (r) {
        for (let c = 0; c < et.length; c += 2)
          et[c][0](et[c + 1]);
        et.length = 0;
      }
    }
  }
  function s(o) {
    i(o(t));
  }
  function a(o, r = Ke) {
    const c = [o, r];
    return l.add(c), l.size === 1 && (n = e(i, s) || Ke), o(t), () => {
      l.delete(c), l.size === 0 && n && (n(), n = null);
    };
  }
  return { set: i, update: s, subscribe: a };
}
function Ut(t, e, n) {
  const l = !Array.isArray(t), i = l ? [t] : t;
  if (!i.every(Boolean))
    throw new Error("derived() expects stores as input, got a falsy value");
  const s = e.length < 2;
  return bo(n, (a, o) => {
    let r = !1;
    const c = [];
    let d = 0, u = Ke;
    const f = () => {
      if (d)
        return;
      u();
      const m = e(l ? c[0] : c, a, o);
      s ? a(m) : u = fo(m) ? m : Ke;
    }, h = i.map(
      (m, V) => Uo(
        m,
        (U) => {
          c[V] = U, d &= ~(1 << V), r && f();
        },
        () => {
          d |= 1 << V;
        }
      )
    );
    return r = !0, f(), function() {
      ho(h), u(), r = !1;
    };
  });
}
function Sl(t) {
  return Object.prototype.toString.call(t) === "[object Date]";
}
function Xn(t, e, n, l) {
  if (typeof n == "number" || Sl(n)) {
    const i = l - n, s = (n - e) / (t.dt || 1 / 60), a = t.opts.stiffness * i, o = t.opts.damping * s, r = (a - o) * t.inv_mass, c = (s + r) * t.dt;
    return Math.abs(c) < t.opts.precision && Math.abs(i) < t.opts.precision ? l : (t.settled = !1, Sl(n) ? new Date(n.getTime() + c) : n + c);
  } else {
    if (Array.isArray(n))
      return n.map(
        (i, s) => Xn(t, e[s], n[s], l[s])
      );
    if (typeof n == "object") {
      const i = {};
      for (const s in n)
        i[s] = Xn(t, e[s], n[s], l[s]);
      return i;
    } else
      throw new Error(`Cannot spring ${typeof n} values`);
  }
}
function vl(t, e = {}) {
  const n = gt(t), { stiffness: l = 0.15, damping: i = 0.8, precision: s = 0.01 } = e;
  let a, o, r, c = t, d = t, u = 1, f = 0, h = !1;
  function m(U, Q = {}) {
    d = U;
    const R = r = {};
    return t == null || Q.hard || V.stiffness >= 1 && V.damping >= 1 ? (h = !0, a = Nl(), c = U, n.set(t = d), Promise.resolve()) : (Q.soft && (f = 1 / ((Q.soft === !0 ? 0.5 : +Q.soft) * 60), u = 0), o || (a = Nl(), h = !1, o = Fo((F) => {
      if (h)
        return h = !1, o = null, !1;
      u = Math.min(u + f, 1);
      const Z = {
        inv_mass: u,
        opts: V,
        settled: !0,
        dt: (F - a) * 60 / 1e3
      }, p = Xn(Z, c, t, d);
      return a = F, c = t, n.set(t = p), Z.settled && (o = null), !Z.settled;
    })), new Promise((F) => {
      o.promise.then(() => {
        R === r && F();
      });
    }));
  }
  const V = {
    set: m,
    update: (U, Q) => m(U(d, t), Q),
    subscribe: n.subscribe,
    stiffness: l,
    damping: i,
    precision: s
  };
  return V;
}
function po(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Vo = function(e) {
  return Zo(e) && !Qo(e);
};
function Zo(t) {
  return !!t && typeof t == "object";
}
function Qo(t) {
  var e = Object.prototype.toString.call(t);
  return e === "[object RegExp]" || e === "[object Date]" || _o(t);
}
var Ro = typeof Symbol == "function" && Symbol.for, Bo = Ro ? Symbol.for("react.element") : 60103;
function _o(t) {
  return t.$$typeof === Bo;
}
function Wo(t) {
  return Array.isArray(t) ? [] : {};
}
function Bt(t, e) {
  return e.clone !== !1 && e.isMergeableObject(t) ? rt(Wo(t), t, e) : t;
}
function go(t, e, n) {
  return t.concat(e).map(function(l) {
    return Bt(l, n);
  });
}
function yo(t, e) {
  if (!e.customMerge)
    return rt;
  var n = e.customMerge(t);
  return typeof n == "function" ? n : rt;
}
function Jo(t) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(e) {
    return Object.propertyIsEnumerable.call(t, e);
  }) : [];
}
function Gl(t) {
  return Object.keys(t).concat(Jo(t));
}
function Di(t, e) {
  try {
    return e in t;
  } catch {
    return !1;
  }
}
function No(t, e) {
  return Di(t, e) && !(Object.hasOwnProperty.call(t, e) && Object.propertyIsEnumerable.call(t, e));
}
function So(t, e, n) {
  var l = {};
  return n.isMergeableObject(t) && Gl(t).forEach(function(i) {
    l[i] = Bt(t[i], n);
  }), Gl(e).forEach(function(i) {
    No(t, i) || (Di(t, i) && n.isMergeableObject(e[i]) ? l[i] = yo(i, n)(t[i], e[i], n) : l[i] = Bt(e[i], n));
  }), l;
}
function rt(t, e, n) {
  n = n || {}, n.arrayMerge = n.arrayMerge || go, n.isMergeableObject = n.isMergeableObject || Vo, n.cloneUnlessOtherwiseSpecified = Bt;
  var l = Array.isArray(e), i = Array.isArray(t), s = l === i;
  return s ? l ? n.arrayMerge(t, e, n) : So(t, e, n) : Bt(e, n);
}
rt.all = function(e, n) {
  if (!Array.isArray(e))
    throw new Error("first argument should be an array");
  return e.reduce(function(l, i) {
    return rt(l, i, n);
  }, {});
};
var vo = rt, Go = vo;
const Eo = /* @__PURE__ */ po(Go);
var In = function(t, e) {
  return In = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, l) {
    n.__proto__ = l;
  } || function(n, l) {
    for (var i in l)
      Object.prototype.hasOwnProperty.call(l, i) && (n[i] = l[i]);
  }, In(t, e);
};
function Ot(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  In(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
var Y = function() {
  return Y = Object.assign || function(e) {
    for (var n, l = 1, i = arguments.length; l < i; l++) {
      n = arguments[l];
      for (var s in n)
        Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
    }
    return e;
  }, Y.apply(this, arguments);
};
function Vn(t, e, n) {
  if (n || arguments.length === 2)
    for (var l = 0, i = e.length, s; l < i; l++)
      (s || !(l in e)) && (s || (s = Array.prototype.slice.call(e, 0, l)), s[l] = e[l]);
  return t.concat(s || Array.prototype.slice.call(e));
}
var I;
(function(t) {
  t[t.EXPECT_ARGUMENT_CLOSING_BRACE = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE", t[t.EMPTY_ARGUMENT = 2] = "EMPTY_ARGUMENT", t[t.MALFORMED_ARGUMENT = 3] = "MALFORMED_ARGUMENT", t[t.EXPECT_ARGUMENT_TYPE = 4] = "EXPECT_ARGUMENT_TYPE", t[t.INVALID_ARGUMENT_TYPE = 5] = "INVALID_ARGUMENT_TYPE", t[t.EXPECT_ARGUMENT_STYLE = 6] = "EXPECT_ARGUMENT_STYLE", t[t.INVALID_NUMBER_SKELETON = 7] = "INVALID_NUMBER_SKELETON", t[t.INVALID_DATE_TIME_SKELETON = 8] = "INVALID_DATE_TIME_SKELETON", t[t.EXPECT_NUMBER_SKELETON = 9] = "EXPECT_NUMBER_SKELETON", t[t.EXPECT_DATE_TIME_SKELETON = 10] = "EXPECT_DATE_TIME_SKELETON", t[t.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE", t[t.EXPECT_SELECT_ARGUMENT_OPTIONS = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS", t[t.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE", t[t.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE", t[t.EXPECT_SELECT_ARGUMENT_SELECTOR = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR", t[t.EXPECT_PLURAL_ARGUMENT_SELECTOR = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR", t[t.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT", t[t.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT", t[t.INVALID_PLURAL_ARGUMENT_SELECTOR = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR", t[t.DUPLICATE_PLURAL_ARGUMENT_SELECTOR = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR", t[t.DUPLICATE_SELECT_ARGUMENT_SELECTOR = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR", t[t.MISSING_OTHER_CLAUSE = 22] = "MISSING_OTHER_CLAUSE", t[t.INVALID_TAG = 23] = "INVALID_TAG", t[t.INVALID_TAG_NAME = 25] = "INVALID_TAG_NAME", t[t.UNMATCHED_CLOSING_TAG = 26] = "UNMATCHED_CLOSING_TAG", t[t.UNCLOSED_TAG = 27] = "UNCLOSED_TAG";
})(I || (I = {}));
var A;
(function(t) {
  t[t.literal = 0] = "literal", t[t.argument = 1] = "argument", t[t.number = 2] = "number", t[t.date = 3] = "date", t[t.time = 4] = "time", t[t.select = 5] = "select", t[t.plural = 6] = "plural", t[t.pound = 7] = "pound", t[t.tag = 8] = "tag";
})(A || (A = {}));
var ot;
(function(t) {
  t[t.number = 0] = "number", t[t.dateTime = 1] = "dateTime";
})(ot || (ot = {}));
function El(t) {
  return t.type === A.literal;
}
function ko(t) {
  return t.type === A.argument;
}
function zi(t) {
  return t.type === A.number;
}
function Oi(t) {
  return t.type === A.date;
}
function Ai(t) {
  return t.type === A.time;
}
function ji(t) {
  return t.type === A.select;
}
function Pi(t) {
  return t.type === A.plural;
}
function wo(t) {
  return t.type === A.pound;
}
function Li(t) {
  return t.type === A.tag;
}
function Ki(t) {
  return !!(t && typeof t == "object" && t.type === ot.number);
}
function Cn(t) {
  return !!(t && typeof t == "object" && t.type === ot.dateTime);
}
var qi = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/, To = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
function Xo(t) {
  var e = {};
  return t.replace(To, function(n) {
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
var Io = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
function Co(t) {
  if (t.length === 0)
    throw new Error("Number skeleton cannot be empty");
  for (var e = t.split(Io).filter(function(f) {
    return f.length > 0;
  }), n = [], l = 0, i = e; l < i.length; l++) {
    var s = i[l], a = s.split("/");
    if (a.length === 0)
      throw new Error("Invalid number skeleton");
    for (var o = a[0], r = a.slice(1), c = 0, d = r; c < d.length; c++) {
      var u = d[c];
      if (u.length === 0)
        throw new Error("Invalid number skeleton");
    }
    n.push({ stem: o, options: r });
  }
  return n;
}
function Ho(t) {
  return t.replace(/^(.*?)-/, "");
}
var kl = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g, $i = /^(@+)?(\+|#+)?[rs]?$/g, Yo = /(\*)(0+)|(#+)(0+)|(0+)/g, es = /^(0+)$/;
function wl(t) {
  var e = {};
  return t[t.length - 1] === "r" ? e.roundingPriority = "morePrecision" : t[t.length - 1] === "s" && (e.roundingPriority = "lessPrecision"), t.replace($i, function(n, l, i) {
    return typeof i != "string" ? (e.minimumSignificantDigits = l.length, e.maximumSignificantDigits = l.length) : i === "+" ? e.minimumSignificantDigits = l.length : l[0] === "#" ? e.maximumSignificantDigits = l.length : (e.minimumSignificantDigits = l.length, e.maximumSignificantDigits = l.length + (typeof i == "string" ? i.length : 0)), "";
  }), e;
}
function ts(t) {
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
function xo(t) {
  var e;
  if (t[0] === "E" && t[1] === "E" ? (e = {
    notation: "engineering"
  }, t = t.slice(2)) : t[0] === "E" && (e = {
    notation: "scientific"
  }, t = t.slice(1)), e) {
    var n = t.slice(0, 2);
    if (n === "+!" ? (e.signDisplay = "always", t = t.slice(2)) : n === "+?" && (e.signDisplay = "exceptZero", t = t.slice(2)), !es.test(t))
      throw new Error("Malformed concise eng/scientific notation");
    e.minimumIntegerDigits = t.length;
  }
  return e;
}
function Tl(t) {
  var e = {}, n = ts(t);
  return n || e;
}
function Mo(t) {
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
        e.style = "unit", e.unit = Ho(i.options[0]);
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
        e = Y(Y(Y({}, e), { notation: "scientific" }), i.options.reduce(function(r, c) {
          return Y(Y({}, r), Tl(c));
        }, {}));
        continue;
      case "engineering":
        e = Y(Y(Y({}, e), { notation: "engineering" }), i.options.reduce(function(r, c) {
          return Y(Y({}, r), Tl(c));
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
        i.options[0].replace(Yo, function(r, c, d, u, f, h) {
          if (c)
            e.minimumIntegerDigits = d.length;
          else {
            if (u && f)
              throw new Error("We currently do not support maximum integer digits");
            if (h)
              throw new Error("We currently do not support exact integer digits");
          }
          return "";
        });
        continue;
    }
    if (es.test(i.stem)) {
      e.minimumIntegerDigits = i.stem.length;
      continue;
    }
    if (kl.test(i.stem)) {
      if (i.options.length > 1)
        throw new RangeError("Fraction-precision stems only accept a single optional option");
      i.stem.replace(kl, function(r, c, d, u, f, h) {
        return d === "*" ? e.minimumFractionDigits = c.length : u && u[0] === "#" ? e.maximumFractionDigits = u.length : f && h ? (e.minimumFractionDigits = f.length, e.maximumFractionDigits = f.length + h.length) : (e.minimumFractionDigits = c.length, e.maximumFractionDigits = c.length), "";
      });
      var s = i.options[0];
      s === "w" ? e = Y(Y({}, e), { trailingZeroDisplay: "stripIfInteger" }) : s && (e = Y(Y({}, e), wl(s)));
      continue;
    }
    if ($i.test(i.stem)) {
      e = Y(Y({}, e), wl(i.stem));
      continue;
    }
    var a = ts(i.stem);
    a && (e = Y(Y({}, e), a));
    var o = xo(i.stem);
    o && (e = Y(Y({}, e), o));
  }
  return e;
}
var Et = {
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
function Do(t, e) {
  for (var n = "", l = 0; l < t.length; l++) {
    var i = t.charAt(l);
    if (i === "j") {
      for (var s = 0; l + 1 < t.length && t.charAt(l + 1) === i; )
        s++, l++;
      var a = 1 + (s & 1), o = s < 2 ? 1 : 3 + (s >> 1), r = "a", c = zo(e);
      for ((c == "H" || c == "k") && (o = 0); o-- > 0; )
        n += r;
      for (; a-- > 0; )
        n = c + n;
    } else
      i === "J" ? n += "H" : n += i;
  }
  return n;
}
function zo(t) {
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
  var i = Et[l || ""] || Et[n || ""] || Et["".concat(n, "-001")] || Et["001"];
  return i[0];
}
var Zn, Oo = new RegExp("^".concat(qi.source, "*")), Ao = new RegExp("".concat(qi.source, "*$"));
function C(t, e) {
  return { start: t, end: e };
}
var jo = !!String.prototype.startsWith, Po = !!String.fromCodePoint, Lo = !!Object.fromEntries, Ko = !!String.prototype.codePointAt, qo = !!String.prototype.trimStart, $o = !!String.prototype.trimEnd, e0 = !!Number.isSafeInteger, t0 = e0 ? Number.isSafeInteger : function(t) {
  return typeof t == "number" && isFinite(t) && Math.floor(t) === t && Math.abs(t) <= 9007199254740991;
}, Hn = !0;
try {
  var n0 = ls("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  Hn = ((Zn = n0.exec("a")) === null || Zn === void 0 ? void 0 : Zn[0]) === "a";
} catch {
  Hn = !1;
}
var Xl = jo ? (
  // Native
  function(e, n, l) {
    return e.startsWith(n, l);
  }
) : (
  // For IE11
  function(e, n, l) {
    return e.slice(l, l + n.length) === n;
  }
), Yn = Po ? String.fromCodePoint : (
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
), Il = (
  // native
  Lo ? Object.fromEntries : (
    // Ponyfill
    function(e) {
      for (var n = {}, l = 0, i = e; l < i.length; l++) {
        var s = i[l], a = s[0], o = s[1];
        n[a] = o;
      }
      return n;
    }
  )
), ns = Ko ? (
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
), l0 = qo ? (
  // Native
  function(e) {
    return e.trimStart();
  }
) : (
  // Ponyfill
  function(e) {
    return e.replace(Oo, "");
  }
), i0 = $o ? (
  // Native
  function(e) {
    return e.trimEnd();
  }
) : (
  // Ponyfill
  function(e) {
    return e.replace(Ao, "");
  }
);
function ls(t, e) {
  return new RegExp(t, e);
}
var xn;
if (Hn) {
  var Cl = ls("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  xn = function(e, n) {
    var l;
    Cl.lastIndex = n;
    var i = Cl.exec(e);
    return (l = i[1]) !== null && l !== void 0 ? l : "";
  };
} else
  xn = function(e, n) {
    for (var l = []; ; ) {
      var i = ns(e, n);
      if (i === void 0 || is(i) || o0(i))
        break;
      l.push(i), n += i >= 65536 ? 2 : 1;
    }
    return Yn.apply(void 0, l);
  };
var s0 = (
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
            var o = this.clonePosition();
            this.bump(), i.push({
              type: A.pound,
              location: C(o, this.clonePosition())
            });
          } else if (s === 60 && !this.ignoreTag && this.peek() === 47) {
            if (l)
              break;
            return this.error(I.UNMATCHED_CLOSING_TAG, C(this.clonePosition(), this.clonePosition()));
          } else if (s === 60 && !this.ignoreTag && Mn(this.peek() || 0)) {
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
            type: A.literal,
            value: "<".concat(i, "/>"),
            location: C(l, this.clonePosition())
          },
          err: null
        };
      if (this.bumpIf(">")) {
        var s = this.parseMessage(e + 1, n, !0);
        if (s.err)
          return s;
        var a = s.val, o = this.clonePosition();
        if (this.bumpIf("</")) {
          if (this.isEOF() || !Mn(this.char()))
            return this.error(I.INVALID_TAG, C(o, this.clonePosition()));
          var r = this.clonePosition(), c = this.parseTagName();
          return i !== c ? this.error(I.UNMATCHED_CLOSING_TAG, C(r, this.clonePosition())) : (this.bumpSpace(), this.bumpIf(">") ? {
            val: {
              type: A.tag,
              value: i,
              children: a,
              location: C(l, this.clonePosition())
            },
            err: null
          } : this.error(I.INVALID_TAG, C(o, this.clonePosition())));
        } else
          return this.error(I.UNCLOSED_TAG, C(l, this.clonePosition()));
      } else
        return this.error(I.INVALID_TAG, C(l, this.clonePosition()));
    }, t.prototype.parseTagName = function() {
      var e = this.offset();
      for (this.bump(); !this.isEOF() && r0(this.char()); )
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
        var o = this.tryParseLeftAngleBracket();
        if (o) {
          i += o;
          continue;
        }
        break;
      }
      var r = C(l, this.clonePosition());
      return {
        val: { type: A.literal, value: i, location: r },
        err: null
      };
    }, t.prototype.tryParseLeftAngleBracket = function() {
      return !this.isEOF() && this.char() === 60 && (this.ignoreTag || // If at the opening tag or closing tag position, bail.
      !a0(this.peek() || 0)) ? (this.bump(), "<") : null;
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
      return Yn.apply(void 0, n);
    }, t.prototype.tryParseUnquoted = function(e, n) {
      if (this.isEOF())
        return null;
      var l = this.char();
      return l === 60 || l === 123 || l === 35 && (n === "plural" || n === "selectordinal") || l === 125 && e > 0 ? null : (this.bump(), Yn(l));
    }, t.prototype.parseArgument = function(e, n) {
      var l = this.clonePosition();
      if (this.bump(), this.bumpSpace(), this.isEOF())
        return this.error(I.EXPECT_ARGUMENT_CLOSING_BRACE, C(l, this.clonePosition()));
      if (this.char() === 125)
        return this.bump(), this.error(I.EMPTY_ARGUMENT, C(l, this.clonePosition()));
      var i = this.parseIdentifierIfPossible().value;
      if (!i)
        return this.error(I.MALFORMED_ARGUMENT, C(l, this.clonePosition()));
      if (this.bumpSpace(), this.isEOF())
        return this.error(I.EXPECT_ARGUMENT_CLOSING_BRACE, C(l, this.clonePosition()));
      switch (this.char()) {
        case 125:
          return this.bump(), {
            val: {
              type: A.argument,
              // value does not include the opening and closing braces.
              value: i,
              location: C(l, this.clonePosition())
            },
            err: null
          };
        case 44:
          return this.bump(), this.bumpSpace(), this.isEOF() ? this.error(I.EXPECT_ARGUMENT_CLOSING_BRACE, C(l, this.clonePosition())) : this.parseArgumentOptions(e, n, i, l);
        default:
          return this.error(I.MALFORMED_ARGUMENT, C(l, this.clonePosition()));
      }
    }, t.prototype.parseIdentifierIfPossible = function() {
      var e = this.clonePosition(), n = this.offset(), l = xn(this.message, n), i = n + l.length;
      this.bumpTo(i);
      var s = this.clonePosition(), a = C(e, s);
      return { value: l, location: a };
    }, t.prototype.parseArgumentOptions = function(e, n, l, i) {
      var s, a = this.clonePosition(), o = this.parseIdentifierIfPossible().value, r = this.clonePosition();
      switch (o) {
        case "":
          return this.error(I.EXPECT_ARGUMENT_TYPE, C(a, r));
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
            var f = i0(u.val);
            if (f.length === 0)
              return this.error(I.EXPECT_ARGUMENT_STYLE, C(this.clonePosition(), this.clonePosition()));
            var h = C(d, this.clonePosition());
            c = { style: f, styleLocation: h };
          }
          var m = this.tryParseArgumentClose(i);
          if (m.err)
            return m;
          var V = C(i, this.clonePosition());
          if (c && Xl(c == null ? void 0 : c.style, "::", 0)) {
            var U = l0(c.style.slice(2));
            if (o === "number") {
              var u = this.parseNumberSkeletonFromString(U, c.styleLocation);
              return u.err ? u : {
                val: { type: A.number, value: l, location: V, style: u.val },
                err: null
              };
            } else {
              if (U.length === 0)
                return this.error(I.EXPECT_DATE_TIME_SKELETON, V);
              var Q = U;
              this.locale && (Q = Do(U, this.locale));
              var f = {
                type: ot.dateTime,
                pattern: Q,
                location: c.styleLocation,
                parsedOptions: this.shouldParseSkeletons ? Xo(Q) : {}
              }, R = o === "date" ? A.date : A.time;
              return {
                val: { type: R, value: l, location: V, style: f },
                err: null
              };
            }
          }
          return {
            val: {
              type: o === "number" ? A.number : o === "date" ? A.date : A.time,
              value: l,
              location: V,
              style: (s = c == null ? void 0 : c.style) !== null && s !== void 0 ? s : null
            },
            err: null
          };
        }
        case "plural":
        case "selectordinal":
        case "select": {
          var F = this.clonePosition();
          if (this.bumpSpace(), !this.bumpIf(","))
            return this.error(I.EXPECT_SELECT_ARGUMENT_OPTIONS, C(F, Y({}, F)));
          this.bumpSpace();
          var Z = this.parseIdentifierIfPossible(), p = 0;
          if (o !== "select" && Z.value === "offset") {
            if (!this.bumpIf(":"))
              return this.error(I.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, C(this.clonePosition(), this.clonePosition()));
            this.bumpSpace();
            var u = this.tryParseDecimalInteger(I.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, I.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
            if (u.err)
              return u;
            this.bumpSpace(), Z = this.parseIdentifierIfPossible(), p = u.val;
          }
          var X = this.tryParsePluralOrSelectOptions(e, o, n, Z);
          if (X.err)
            return X;
          var m = this.tryParseArgumentClose(i);
          if (m.err)
            return m;
          var S = C(i, this.clonePosition());
          return o === "select" ? {
            val: {
              type: A.select,
              value: l,
              options: Il(X.val),
              location: S
            },
            err: null
          } : {
            val: {
              type: A.plural,
              value: l,
              options: Il(X.val),
              offset: p,
              pluralType: o === "plural" ? "cardinal" : "ordinal",
              location: S
            },
            err: null
          };
        }
        default:
          return this.error(I.INVALID_ARGUMENT_TYPE, C(a, r));
      }
    }, t.prototype.tryParseArgumentClose = function(e) {
      return this.isEOF() || this.char() !== 125 ? this.error(I.EXPECT_ARGUMENT_CLOSING_BRACE, C(e, this.clonePosition())) : (this.bump(), { val: !0, err: null });
    }, t.prototype.parseSimpleArgStyleIfPossible = function() {
      for (var e = 0, n = this.clonePosition(); !this.isEOF(); ) {
        var l = this.char();
        switch (l) {
          case 39: {
            this.bump();
            var i = this.clonePosition();
            if (!this.bumpUntil("'"))
              return this.error(I.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, C(i, this.clonePosition()));
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
        l = Co(e);
      } catch {
        return this.error(I.INVALID_NUMBER_SKELETON, n);
      }
      return {
        val: {
          type: ot.number,
          tokens: l,
          location: n,
          parsedOptions: this.shouldParseSkeletons ? Mo(l) : {}
        },
        err: null
      };
    }, t.prototype.tryParsePluralOrSelectOptions = function(e, n, l, i) {
      for (var s, a = !1, o = [], r = /* @__PURE__ */ new Set(), c = i.value, d = i.location; ; ) {
        if (c.length === 0) {
          var u = this.clonePosition();
          if (n !== "select" && this.bumpIf("=")) {
            var f = this.tryParseDecimalInteger(I.EXPECT_PLURAL_ARGUMENT_SELECTOR, I.INVALID_PLURAL_ARGUMENT_SELECTOR);
            if (f.err)
              return f;
            d = C(u, this.clonePosition()), c = this.message.slice(u.offset, this.offset());
          } else
            break;
        }
        if (r.has(c))
          return this.error(n === "select" ? I.DUPLICATE_SELECT_ARGUMENT_SELECTOR : I.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, d);
        c === "other" && (a = !0), this.bumpSpace();
        var h = this.clonePosition();
        if (!this.bumpIf("{"))
          return this.error(n === "select" ? I.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : I.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, C(this.clonePosition(), this.clonePosition()));
        var m = this.parseMessage(e + 1, n, l);
        if (m.err)
          return m;
        var V = this.tryParseArgumentClose(h);
        if (V.err)
          return V;
        o.push([
          c,
          {
            value: m.val,
            location: C(h, this.clonePosition())
          }
        ]), r.add(c), this.bumpSpace(), s = this.parseIdentifierIfPossible(), c = s.value, d = s.location;
      }
      return o.length === 0 ? this.error(n === "select" ? I.EXPECT_SELECT_ARGUMENT_SELECTOR : I.EXPECT_PLURAL_ARGUMENT_SELECTOR, C(this.clonePosition(), this.clonePosition())) : this.requiresOtherClause && !a ? this.error(I.MISSING_OTHER_CLAUSE, C(this.clonePosition(), this.clonePosition())) : { val: o, err: null };
    }, t.prototype.tryParseDecimalInteger = function(e, n) {
      var l = 1, i = this.clonePosition();
      this.bumpIf("+") || this.bumpIf("-") && (l = -1);
      for (var s = !1, a = 0; !this.isEOF(); ) {
        var o = this.char();
        if (o >= 48 && o <= 57)
          s = !0, a = a * 10 + (o - 48), this.bump();
        else
          break;
      }
      var r = C(i, this.clonePosition());
      return s ? (a *= l, t0(a) ? { val: a, err: null } : this.error(n, r)) : this.error(e, r);
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
      var n = ns(this.message, e);
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
      if (Xl(this.message, e, this.offset())) {
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
      for (; !this.isEOF() && is(this.char()); )
        this.bump();
    }, t.prototype.peek = function() {
      if (this.isEOF())
        return null;
      var e = this.char(), n = this.offset(), l = this.message.charCodeAt(n + (e >= 65536 ? 2 : 1));
      return l ?? null;
    }, t;
  }()
);
function Mn(t) {
  return t >= 97 && t <= 122 || t >= 65 && t <= 90;
}
function a0(t) {
  return Mn(t) || t === 47;
}
function r0(t) {
  return t === 45 || t === 46 || t >= 48 && t <= 57 || t === 95 || t >= 97 && t <= 122 || t >= 65 && t <= 90 || t == 183 || t >= 192 && t <= 214 || t >= 216 && t <= 246 || t >= 248 && t <= 893 || t >= 895 && t <= 8191 || t >= 8204 && t <= 8205 || t >= 8255 && t <= 8256 || t >= 8304 && t <= 8591 || t >= 11264 && t <= 12271 || t >= 12289 && t <= 55295 || t >= 63744 && t <= 64975 || t >= 65008 && t <= 65533 || t >= 65536 && t <= 983039;
}
function is(t) {
  return t >= 9 && t <= 13 || t === 32 || t === 133 || t >= 8206 && t <= 8207 || t === 8232 || t === 8233;
}
function o0(t) {
  return t >= 33 && t <= 35 || t === 36 || t >= 37 && t <= 39 || t === 40 || t === 41 || t === 42 || t === 43 || t === 44 || t === 45 || t >= 46 && t <= 47 || t >= 58 && t <= 59 || t >= 60 && t <= 62 || t >= 63 && t <= 64 || t === 91 || t === 92 || t === 93 || t === 94 || t === 96 || t === 123 || t === 124 || t === 125 || t === 126 || t === 161 || t >= 162 && t <= 165 || t === 166 || t === 167 || t === 169 || t === 171 || t === 172 || t === 174 || t === 176 || t === 177 || t === 182 || t === 187 || t === 191 || t === 215 || t === 247 || t >= 8208 && t <= 8213 || t >= 8214 && t <= 8215 || t === 8216 || t === 8217 || t === 8218 || t >= 8219 && t <= 8220 || t === 8221 || t === 8222 || t === 8223 || t >= 8224 && t <= 8231 || t >= 8240 && t <= 8248 || t === 8249 || t === 8250 || t >= 8251 && t <= 8254 || t >= 8257 && t <= 8259 || t === 8260 || t === 8261 || t === 8262 || t >= 8263 && t <= 8273 || t === 8274 || t === 8275 || t >= 8277 && t <= 8286 || t >= 8592 && t <= 8596 || t >= 8597 && t <= 8601 || t >= 8602 && t <= 8603 || t >= 8604 && t <= 8607 || t === 8608 || t >= 8609 && t <= 8610 || t === 8611 || t >= 8612 && t <= 8613 || t === 8614 || t >= 8615 && t <= 8621 || t === 8622 || t >= 8623 && t <= 8653 || t >= 8654 && t <= 8655 || t >= 8656 && t <= 8657 || t === 8658 || t === 8659 || t === 8660 || t >= 8661 && t <= 8691 || t >= 8692 && t <= 8959 || t >= 8960 && t <= 8967 || t === 8968 || t === 8969 || t === 8970 || t === 8971 || t >= 8972 && t <= 8991 || t >= 8992 && t <= 8993 || t >= 8994 && t <= 9e3 || t === 9001 || t === 9002 || t >= 9003 && t <= 9083 || t === 9084 || t >= 9085 && t <= 9114 || t >= 9115 && t <= 9139 || t >= 9140 && t <= 9179 || t >= 9180 && t <= 9185 || t >= 9186 && t <= 9254 || t >= 9255 && t <= 9279 || t >= 9280 && t <= 9290 || t >= 9291 && t <= 9311 || t >= 9472 && t <= 9654 || t === 9655 || t >= 9656 && t <= 9664 || t === 9665 || t >= 9666 && t <= 9719 || t >= 9720 && t <= 9727 || t >= 9728 && t <= 9838 || t === 9839 || t >= 9840 && t <= 10087 || t === 10088 || t === 10089 || t === 10090 || t === 10091 || t === 10092 || t === 10093 || t === 10094 || t === 10095 || t === 10096 || t === 10097 || t === 10098 || t === 10099 || t === 10100 || t === 10101 || t >= 10132 && t <= 10175 || t >= 10176 && t <= 10180 || t === 10181 || t === 10182 || t >= 10183 && t <= 10213 || t === 10214 || t === 10215 || t === 10216 || t === 10217 || t === 10218 || t === 10219 || t === 10220 || t === 10221 || t === 10222 || t === 10223 || t >= 10224 && t <= 10239 || t >= 10240 && t <= 10495 || t >= 10496 && t <= 10626 || t === 10627 || t === 10628 || t === 10629 || t === 10630 || t === 10631 || t === 10632 || t === 10633 || t === 10634 || t === 10635 || t === 10636 || t === 10637 || t === 10638 || t === 10639 || t === 10640 || t === 10641 || t === 10642 || t === 10643 || t === 10644 || t === 10645 || t === 10646 || t === 10647 || t === 10648 || t >= 10649 && t <= 10711 || t === 10712 || t === 10713 || t === 10714 || t === 10715 || t >= 10716 && t <= 10747 || t === 10748 || t === 10749 || t >= 10750 && t <= 11007 || t >= 11008 && t <= 11055 || t >= 11056 && t <= 11076 || t >= 11077 && t <= 11078 || t >= 11079 && t <= 11084 || t >= 11085 && t <= 11123 || t >= 11124 && t <= 11125 || t >= 11126 && t <= 11157 || t === 11158 || t >= 11159 && t <= 11263 || t >= 11776 && t <= 11777 || t === 11778 || t === 11779 || t === 11780 || t === 11781 || t >= 11782 && t <= 11784 || t === 11785 || t === 11786 || t === 11787 || t === 11788 || t === 11789 || t >= 11790 && t <= 11798 || t === 11799 || t >= 11800 && t <= 11801 || t === 11802 || t === 11803 || t === 11804 || t === 11805 || t >= 11806 && t <= 11807 || t === 11808 || t === 11809 || t === 11810 || t === 11811 || t === 11812 || t === 11813 || t === 11814 || t === 11815 || t === 11816 || t === 11817 || t >= 11818 && t <= 11822 || t === 11823 || t >= 11824 && t <= 11833 || t >= 11834 && t <= 11835 || t >= 11836 && t <= 11839 || t === 11840 || t === 11841 || t === 11842 || t >= 11843 && t <= 11855 || t >= 11856 && t <= 11857 || t === 11858 || t >= 11859 && t <= 11903 || t >= 12289 && t <= 12291 || t === 12296 || t === 12297 || t === 12298 || t === 12299 || t === 12300 || t === 12301 || t === 12302 || t === 12303 || t === 12304 || t === 12305 || t >= 12306 && t <= 12307 || t === 12308 || t === 12309 || t === 12310 || t === 12311 || t === 12312 || t === 12313 || t === 12314 || t === 12315 || t === 12316 || t === 12317 || t >= 12318 && t <= 12319 || t === 12320 || t === 12336 || t === 64830 || t === 64831 || t >= 65093 && t <= 65094;
}
function Dn(t) {
  t.forEach(function(e) {
    if (delete e.location, ji(e) || Pi(e))
      for (var n in e.options)
        delete e.options[n].location, Dn(e.options[n].value);
    else
      zi(e) && Ki(e.style) || (Oi(e) || Ai(e)) && Cn(e.style) ? delete e.style.location : Li(e) && Dn(e.children);
  });
}
function c0(t, e) {
  e === void 0 && (e = {}), e = Y({ shouldParseSkeletons: !0, requiresOtherClause: !0 }, e);
  var n = new s0(t, e).parse();
  if (n.err) {
    var l = SyntaxError(I[n.err.kind]);
    throw l.location = n.err.location, l.originalMessage = n.err.message, l;
  }
  return e != null && e.captureLocation || Dn(n.val), n.val;
}
function Qn(t, e) {
  var n = e && e.cache ? e.cache : U0, l = e && e.serializer ? e.serializer : m0, i = e && e.strategy ? e.strategy : u0;
  return i(t, {
    cache: n,
    serializer: l
  });
}
function d0(t) {
  return t == null || typeof t == "number" || typeof t == "boolean";
}
function ss(t, e, n, l) {
  var i = d0(l) ? l : n(l), s = e.get(i);
  return typeof s > "u" && (s = t.call(this, l), e.set(i, s)), s;
}
function as(t, e, n) {
  var l = Array.prototype.slice.call(arguments, 3), i = n(l), s = e.get(i);
  return typeof s > "u" && (s = t.apply(this, l), e.set(i, s)), s;
}
function Kn(t, e, n, l, i) {
  return n.bind(e, t, l, i);
}
function u0(t, e) {
  var n = t.length === 1 ? ss : as;
  return Kn(t, this, n, e.cache.create(), e.serializer);
}
function h0(t, e) {
  return Kn(t, this, as, e.cache.create(), e.serializer);
}
function f0(t, e) {
  return Kn(t, this, ss, e.cache.create(), e.serializer);
}
var m0 = function() {
  return JSON.stringify(arguments);
};
function qn() {
  this.cache = /* @__PURE__ */ Object.create(null);
}
qn.prototype.get = function(t) {
  return this.cache[t];
};
qn.prototype.set = function(t, e) {
  this.cache[t] = e;
};
var U0 = {
  create: function() {
    return new qn();
  }
}, Rn = {
  variadic: h0,
  monadic: f0
}, ct;
(function(t) {
  t.MISSING_VALUE = "MISSING_VALUE", t.INVALID_VALUE = "INVALID_VALUE", t.MISSING_INTL_API = "MISSING_INTL_API";
})(ct || (ct = {}));
var At = (
  /** @class */
  function(t) {
    Ot(e, t);
    function e(n, l, i) {
      var s = t.call(this, n) || this;
      return s.code = l, s.originalMessage = i, s;
    }
    return e.prototype.toString = function() {
      return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
    }, e;
  }(Error)
), Hl = (
  /** @class */
  function(t) {
    Ot(e, t);
    function e(n, l, i, s) {
      return t.call(this, 'Invalid values for "'.concat(n, '": "').concat(l, '". Options are "').concat(Object.keys(i).join('", "'), '"'), ct.INVALID_VALUE, s) || this;
    }
    return e;
  }(At)
), F0 = (
  /** @class */
  function(t) {
    Ot(e, t);
    function e(n, l, i) {
      return t.call(this, 'Value for "'.concat(n, '" must be of type ').concat(l), ct.INVALID_VALUE, i) || this;
    }
    return e;
  }(At)
), b0 = (
  /** @class */
  function(t) {
    Ot(e, t);
    function e(n, l) {
      return t.call(this, 'The intl string context variable "'.concat(n, '" was not provided to the string "').concat(l, '"'), ct.MISSING_VALUE, l) || this;
    }
    return e;
  }(At)
), ae;
(function(t) {
  t[t.literal = 0] = "literal", t[t.object = 1] = "object";
})(ae || (ae = {}));
function p0(t) {
  return t.length < 2 ? t : t.reduce(function(e, n) {
    var l = e[e.length - 1];
    return !l || l.type !== ae.literal || n.type !== ae.literal ? e.push(n) : l.value += n.value, e;
  }, []);
}
function V0(t) {
  return typeof t == "function";
}
function Ct(t, e, n, l, i, s, a) {
  if (t.length === 1 && El(t[0]))
    return [
      {
        type: ae.literal,
        value: t[0].value
      }
    ];
  for (var o = [], r = 0, c = t; r < c.length; r++) {
    var d = c[r];
    if (El(d)) {
      o.push({
        type: ae.literal,
        value: d.value
      });
      continue;
    }
    if (wo(d)) {
      typeof s == "number" && o.push({
        type: ae.literal,
        value: n.getNumberFormat(e).format(s)
      });
      continue;
    }
    var u = d.value;
    if (!(i && u in i))
      throw new b0(u, a);
    var f = i[u];
    if (ko(d)) {
      (!f || typeof f == "string" || typeof f == "number") && (f = typeof f == "string" || typeof f == "number" ? String(f) : ""), o.push({
        type: typeof f == "string" ? ae.literal : ae.object,
        value: f
      });
      continue;
    }
    if (Oi(d)) {
      var h = typeof d.style == "string" ? l.date[d.style] : Cn(d.style) ? d.style.parsedOptions : void 0;
      o.push({
        type: ae.literal,
        value: n.getDateTimeFormat(e, h).format(f)
      });
      continue;
    }
    if (Ai(d)) {
      var h = typeof d.style == "string" ? l.time[d.style] : Cn(d.style) ? d.style.parsedOptions : l.time.medium;
      o.push({
        type: ae.literal,
        value: n.getDateTimeFormat(e, h).format(f)
      });
      continue;
    }
    if (zi(d)) {
      var h = typeof d.style == "string" ? l.number[d.style] : Ki(d.style) ? d.style.parsedOptions : void 0;
      h && h.scale && (f = f * (h.scale || 1)), o.push({
        type: ae.literal,
        value: n.getNumberFormat(e, h).format(f)
      });
      continue;
    }
    if (Li(d)) {
      var m = d.children, V = d.value, U = i[V];
      if (!V0(U))
        throw new F0(V, "function", a);
      var Q = Ct(m, e, n, l, i, s), R = U(Q.map(function(p) {
        return p.value;
      }));
      Array.isArray(R) || (R = [R]), o.push.apply(o, R.map(function(p) {
        return {
          type: typeof p == "string" ? ae.literal : ae.object,
          value: p
        };
      }));
    }
    if (ji(d)) {
      var F = d.options[f] || d.options.other;
      if (!F)
        throw new Hl(d.value, f, Object.keys(d.options), a);
      o.push.apply(o, Ct(F.value, e, n, l, i));
      continue;
    }
    if (Pi(d)) {
      var F = d.options["=".concat(f)];
      if (!F) {
        if (!Intl.PluralRules)
          throw new At(`Intl.PluralRules is not available in this environment.
Try polyfilling it using "@formatjs/intl-pluralrules"
`, ct.MISSING_INTL_API, a);
        var Z = n.getPluralRules(e, { type: d.pluralType }).select(f - (d.offset || 0));
        F = d.options[Z] || d.options.other;
      }
      if (!F)
        throw new Hl(d.value, f, Object.keys(d.options), a);
      o.push.apply(o, Ct(F.value, e, n, l, i, f - (d.offset || 0)));
      continue;
    }
  }
  return p0(o);
}
function Z0(t, e) {
  return e ? Y(Y(Y({}, t || {}), e || {}), Object.keys(t).reduce(function(n, l) {
    return n[l] = Y(Y({}, t[l]), e[l] || {}), n;
  }, {})) : t;
}
function Q0(t, e) {
  return e ? Object.keys(t).reduce(function(n, l) {
    return n[l] = Z0(t[l], e[l]), n;
  }, Y({}, t)) : t;
}
function Bn(t) {
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
function R0(t) {
  return t === void 0 && (t = {
    number: {},
    dateTime: {},
    pluralRules: {}
  }), {
    getNumberFormat: Qn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.NumberFormat).bind.apply(e, Vn([void 0], n, !1)))();
    }, {
      cache: Bn(t.number),
      strategy: Rn.variadic
    }),
    getDateTimeFormat: Qn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.DateTimeFormat).bind.apply(e, Vn([void 0], n, !1)))();
    }, {
      cache: Bn(t.dateTime),
      strategy: Rn.variadic
    }),
    getPluralRules: Qn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.PluralRules).bind.apply(e, Vn([void 0], n, !1)))();
    }, {
      cache: Bn(t.pluralRules),
      strategy: Rn.variadic
    })
  };
}
var B0 = (
  /** @class */
  function() {
    function t(e, n, l, i) {
      var s = this;
      if (n === void 0 && (n = t.defaultLocale), this.formatterCache = {
        number: {},
        dateTime: {},
        pluralRules: {}
      }, this.format = function(a) {
        var o = s.formatToParts(a);
        if (o.length === 1)
          return o[0].value;
        var r = o.reduce(function(c, d) {
          return !c.length || d.type !== ae.literal || typeof c[c.length - 1] != "string" ? c.push(d.value) : c[c.length - 1] += d.value, c;
        }, []);
        return r.length <= 1 ? r[0] || "" : r;
      }, this.formatToParts = function(a) {
        return Ct(s.ast, s.locales, s.formatters, s.formats, a, void 0, s.message);
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
      this.formats = Q0(t.formats, l), this.formatters = i && i.formatters || R0(this.formatterCache);
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
    }, t.__parse = c0, t.formats = {
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
function _0(t, e) {
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
const Ye = {}, W0 = (t, e, n) => n && (e in Ye || (Ye[e] = {}), t in Ye[e] || (Ye[e][t] = n), n), rs = (t, e) => {
  if (e == null)
    return;
  if (e in Ye && t in Ye[e])
    return Ye[e][t];
  const n = jt(e);
  for (let l = 0; l < n.length; l++) {
    const i = n[l], s = y0(i, t);
    if (s)
      return W0(t, e, s);
  }
};
let $n;
const yt = gt({});
function g0(t) {
  return $n[t] || null;
}
function os(t) {
  return t in $n;
}
function y0(t, e) {
  if (!os(t))
    return null;
  const n = g0(t);
  return _0(n, e);
}
function J0(t) {
  if (t == null)
    return;
  const e = jt(t);
  for (let n = 0; n < e.length; n++) {
    const l = e[n];
    if (os(l))
      return l;
  }
}
function N0(t, ...e) {
  delete Ye[t], yt.update((n) => (n[t] = Eo.all([n[t] || {}, ...e]), n));
}
Ut(
  [yt],
  ([t]) => Object.keys(t)
);
yt.subscribe((t) => $n = t);
const Ht = {};
function S0(t, e) {
  Ht[t].delete(e), Ht[t].size === 0 && delete Ht[t];
}
function cs(t) {
  return Ht[t];
}
function v0(t) {
  return jt(t).map((e) => {
    const n = cs(e);
    return [e, n ? [...n] : []];
  }).filter(([, e]) => e.length > 0);
}
function zn(t) {
  return t == null ? !1 : jt(t).some(
    (e) => {
      var n;
      return (n = cs(e)) == null ? void 0 : n.size;
    }
  );
}
function G0(t, e) {
  return Promise.all(
    e.map((l) => (S0(t, l), l().then((i) => i.default || i)))
  ).then((l) => N0(t, ...l));
}
const Zt = {};
function ds(t) {
  if (!zn(t))
    return t in Zt ? Zt[t] : Promise.resolve();
  const e = v0(t);
  return Zt[t] = Promise.all(
    e.map(
      ([n, l]) => G0(n, l)
    )
  ).then(() => {
    if (zn(t))
      return ds(t);
    delete Zt[t];
  }), Zt[t];
}
const E0 = {
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
}, k0 = {
  fallbackLocale: null,
  loadingDelay: 200,
  formats: E0,
  warnOnMissingMessages: !0,
  handleMissingMessage: void 0,
  ignoreTag: !0
}, w0 = k0;
function dt() {
  return w0;
}
const _n = gt(!1);
var T0 = Object.defineProperty, X0 = Object.defineProperties, I0 = Object.getOwnPropertyDescriptors, Yl = Object.getOwnPropertySymbols, C0 = Object.prototype.hasOwnProperty, H0 = Object.prototype.propertyIsEnumerable, xl = (t, e, n) => e in t ? T0(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Y0 = (t, e) => {
  for (var n in e || (e = {}))
    C0.call(e, n) && xl(t, n, e[n]);
  if (Yl)
    for (var n of Yl(e))
      H0.call(e, n) && xl(t, n, e[n]);
  return t;
}, x0 = (t, e) => X0(t, I0(e));
let On;
const Yt = gt(null);
function Ml(t) {
  return t.split("-").map((e, n, l) => l.slice(0, n + 1).join("-")).reverse();
}
function jt(t, e = dt().fallbackLocale) {
  const n = Ml(t);
  return e ? [.../* @__PURE__ */ new Set([...n, ...Ml(e)])] : n;
}
function qe() {
  return On ?? void 0;
}
Yt.subscribe((t) => {
  On = t ?? void 0, typeof window < "u" && t != null && document.documentElement.setAttribute("lang", t);
});
const M0 = (t) => {
  if (t && J0(t) && zn(t)) {
    const { loadingDelay: e } = dt();
    let n;
    return typeof window < "u" && qe() != null && e ? n = window.setTimeout(
      () => _n.set(!0),
      e
    ) : _n.set(!0), ds(t).then(() => {
      Yt.set(t);
    }).finally(() => {
      clearTimeout(n), _n.set(!1);
    });
  }
  return Yt.set(t);
}, Jt = x0(Y0({}, Yt), {
  set: M0
}), Pt = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (l) => {
    const i = JSON.stringify(l);
    return i in e ? e[i] : e[i] = t(l);
  };
};
var D0 = Object.defineProperty, xt = Object.getOwnPropertySymbols, us = Object.prototype.hasOwnProperty, hs = Object.prototype.propertyIsEnumerable, Dl = (t, e, n) => e in t ? D0(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, el = (t, e) => {
  for (var n in e || (e = {}))
    us.call(e, n) && Dl(t, n, e[n]);
  if (xt)
    for (var n of xt(e))
      hs.call(e, n) && Dl(t, n, e[n]);
  return t;
}, Ft = (t, e) => {
  var n = {};
  for (var l in t)
    us.call(t, l) && e.indexOf(l) < 0 && (n[l] = t[l]);
  if (t != null && xt)
    for (var l of xt(t))
      e.indexOf(l) < 0 && hs.call(t, l) && (n[l] = t[l]);
  return n;
};
const _t = (t, e) => {
  const { formats: n } = dt();
  if (t in n && e in n[t])
    return n[t][e];
  throw new Error(`[svelte-i18n] Unknown "${e}" ${t} format.`);
}, z0 = Pt(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = Ft(e, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
    return l && (i = _t("number", l)), new Intl.NumberFormat(n, i);
  }
), O0 = Pt(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = Ft(e, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format dates');
    return l ? i = _t("date", l) : Object.keys(i).length === 0 && (i = _t("date", "short")), new Intl.DateTimeFormat(n, i);
  }
), A0 = Pt(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = Ft(e, ["locale", "format"]);
    if (n == null)
      throw new Error(
        '[svelte-i18n] A "locale" must be set to format time values'
      );
    return l ? i = _t("time", l) : Object.keys(i).length === 0 && (i = _t("time", "short")), new Intl.DateTimeFormat(n, i);
  }
), j0 = (t = {}) => {
  var e = t, {
    locale: n = qe()
  } = e, l = Ft(e, [
    "locale"
  ]);
  return z0(el({ locale: n }, l));
}, P0 = (t = {}) => {
  var e = t, {
    locale: n = qe()
  } = e, l = Ft(e, [
    "locale"
  ]);
  return O0(el({ locale: n }, l));
}, L0 = (t = {}) => {
  var e = t, {
    locale: n = qe()
  } = e, l = Ft(e, [
    "locale"
  ]);
  return A0(el({ locale: n }, l));
}, K0 = Pt(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (t, e = qe()) => new B0(t, e, dt().formats, {
    ignoreTag: dt().ignoreTag
  })
), q0 = (t, e = {}) => {
  var n, l, i, s;
  let a = e;
  typeof t == "object" && (a = t, t = a.id);
  const {
    values: o,
    locale: r = qe(),
    default: c
  } = a;
  if (r == null)
    throw new Error(
      "[svelte-i18n] Cannot format a message without first setting the initial locale."
    );
  let d = rs(t, r);
  if (!d)
    d = (s = (i = (l = (n = dt()).handleMissingMessage) == null ? void 0 : l.call(n, { locale: r, id: t, defaultValue: c })) != null ? i : c) != null ? s : t;
  else if (typeof d != "string")
    return console.warn(
      `[svelte-i18n] Message with id "${t}" must be of type "string", found: "${typeof d}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`
    ), d;
  if (!o)
    return d;
  let u = d;
  try {
    u = K0(d, r).format(o);
  } catch (f) {
    f instanceof Error && console.warn(
      `[svelte-i18n] Message "${t}" has syntax error:`,
      f.message
    );
  }
  return u;
}, $0 = (t, e) => L0(e).format(t), ec = (t, e) => P0(e).format(t), tc = (t, e) => j0(e).format(t), nc = (t, e = qe()) => rs(t, e);
Ut([Jt, yt], () => q0);
Ut([Jt], () => $0);
Ut([Jt], () => ec);
Ut([Jt], () => tc);
Ut([Jt, yt], () => nc);
const {
  SvelteComponent: lc,
  append: zl,
  attr: Se,
  binding_callbacks: ic,
  bubble: Me,
  create_slot: sc,
  detach: ac,
  element: Ol,
  get_all_dirty_from_scope: rc,
  get_slot_changes: oc,
  init: cc,
  insert: dc,
  listen: Ue,
  prevent_default: De,
  run_all: uc,
  safe_not_equal: hc,
  set_style: Al,
  space: fc,
  stop_propagation: ze,
  toggle_class: Ie,
  transition_in: mc,
  transition_out: Uc,
  update_slot_base: Fc
} = window.__gradio__svelte__internal, { createEventDispatcher: bc, tick: pc, getContext: Vc } = window.__gradio__svelte__internal;
function Zc(t) {
  let e, n, l, i, s, a, o, r, c;
  const d = (
    /*#slots*/
    t[17].default
  ), u = sc(
    d,
    t,
    /*$$scope*/
    t[16],
    null
  );
  return {
    c() {
      e = Ol("button"), u && u.c(), n = fc(), l = Ol("input"), Se(l, "type", "file"), Se(
        l,
        "accept",
        /*filetype*/
        t[0]
      ), l.multiple = i = /*file_count*/
      t[4] === "multiple" || void 0, Se(l, "webkitdirectory", s = /*file_count*/
      t[4] === "directory" || void 0), Se(l, "mozdirectory", a = /*file_count*/
      t[4] === "directory" || void 0), Se(l, "class", "svelte-a356bc"), Se(e, "class", "svelte-a356bc"), Ie(
        e,
        "hidden",
        /*hidden*/
        t[5]
      ), Ie(
        e,
        "center",
        /*center*/
        t[2]
      ), Ie(
        e,
        "boundedheight",
        /*boundedheight*/
        t[1]
      ), Ie(
        e,
        "flex",
        /*flex*/
        t[3]
      ), Al(
        e,
        "height",
        /*include_sources*/
        t[6] ? "calc(100% - 40px" : "100%"
      );
    },
    m(f, h) {
      dc(f, e, h), u && u.m(e, null), zl(e, n), zl(e, l), t[25](l), o = !0, r || (c = [
        Ue(
          l,
          "change",
          /*load_files_from_upload*/
          t[10]
        ),
        Ue(e, "drag", ze(De(
          /*drag_handler*/
          t[18]
        ))),
        Ue(e, "dragstart", ze(De(
          /*dragstart_handler*/
          t[19]
        ))),
        Ue(e, "dragend", ze(De(
          /*dragend_handler*/
          t[20]
        ))),
        Ue(e, "dragover", ze(De(
          /*dragover_handler*/
          t[21]
        ))),
        Ue(e, "dragenter", ze(De(
          /*dragenter_handler*/
          t[22]
        ))),
        Ue(e, "dragleave", ze(De(
          /*dragleave_handler*/
          t[23]
        ))),
        Ue(e, "drop", ze(De(
          /*drop_handler*/
          t[24]
        ))),
        Ue(
          e,
          "click",
          /*open_file_upload*/
          t[7]
        ),
        Ue(
          e,
          "drop",
          /*loadFilesFromDrop*/
          t[11]
        ),
        Ue(
          e,
          "dragenter",
          /*updateDragging*/
          t[9]
        ),
        Ue(
          e,
          "dragleave",
          /*updateDragging*/
          t[9]
        )
      ], r = !0);
    },
    p(f, [h]) {
      u && u.p && (!o || h & /*$$scope*/
      65536) && Fc(
        u,
        d,
        f,
        /*$$scope*/
        f[16],
        o ? oc(
          d,
          /*$$scope*/
          f[16],
          h,
          null
        ) : rc(
          /*$$scope*/
          f[16]
        ),
        null
      ), (!o || h & /*filetype*/
      1) && Se(
        l,
        "accept",
        /*filetype*/
        f[0]
      ), (!o || h & /*file_count*/
      16 && i !== (i = /*file_count*/
      f[4] === "multiple" || void 0)) && (l.multiple = i), (!o || h & /*file_count*/
      16 && s !== (s = /*file_count*/
      f[4] === "directory" || void 0)) && Se(l, "webkitdirectory", s), (!o || h & /*file_count*/
      16 && a !== (a = /*file_count*/
      f[4] === "directory" || void 0)) && Se(l, "mozdirectory", a), (!o || h & /*hidden*/
      32) && Ie(
        e,
        "hidden",
        /*hidden*/
        f[5]
      ), (!o || h & /*center*/
      4) && Ie(
        e,
        "center",
        /*center*/
        f[2]
      ), (!o || h & /*boundedheight*/
      2) && Ie(
        e,
        "boundedheight",
        /*boundedheight*/
        f[1]
      ), (!o || h & /*flex*/
      8) && Ie(
        e,
        "flex",
        /*flex*/
        f[3]
      ), h & /*include_sources*/
      64 && Al(
        e,
        "height",
        /*include_sources*/
        f[6] ? "calc(100% - 40px" : "100%"
      );
    },
    i(f) {
      o || (mc(u, f), o = !0);
    },
    o(f) {
      Uc(u, f), o = !1;
    },
    d(f) {
      f && ac(e), u && u.d(f), t[25](null), r = !1, uc(c);
    }
  };
}
function Wn(t) {
  let e, n = t[0], l = 1;
  for (; l < t.length; ) {
    const i = t[l], s = t[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (e = n, n = s(n)) : (i === "call" || i === "optionalCall") && (n = s((...a) => n.call(e, ...a)), e = void 0);
  }
  return n;
}
function Qc(t, e) {
  return !t || t === "*" ? !0 : t.endsWith("/*") ? e.startsWith(t.slice(0, -1)) : t === e;
}
function Rc(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e, { filetype: s = null } = e, { dragging: a = !1 } = e, { boundedheight: o = !0 } = e, { center: r = !0 } = e, { flex: c = !0 } = e, { file_count: d = "single" } = e, { disable_click: u = !1 } = e, { root: f } = e, { hidden: h = !1 } = e, { include_sources: m = !1 } = e;
  const V = Vc("upload_files");
  let U;
  const Q = bc();
  function R() {
    n(12, a = !a);
  }
  function F() {
    u || (n(8, U.value = "", U), U.click());
  }
  async function Z(_) {
    await pc();
    const B = await Gs(_, f, V);
    return Q("load", d === "single" ? Wn([B, "optionalAccess", (b) => b[0]]) : B), B || [];
  }
  async function p(_) {
    if (!_.length)
      return;
    let B = _.map((g) => new File([g], g.name)), b = await Es(B);
    return await Z(b);
  }
  async function X(_) {
    const B = _.target;
    B.files && await p(Array.from(B.files));
  }
  async function S(_) {
    if (n(12, a = !1), !Wn([_, "access", (b) => b.dataTransfer, "optionalAccess", (b) => b.files]))
      return;
    const B = Array.from(_.dataTransfer.files).filter((b) => Wn([
      s,
      "optionalAccess",
      (g) => g.split,
      "call",
      (g) => g(","),
      "access",
      (g) => g.some,
      "call",
      (g) => g((v) => Qc(v, b.type))
    ]) ? !0 : (Q("error", `Invalid file type only ${s} allowed.`), !1));
    await p(B);
  }
  function k(_) {
    Me.call(this, t, _);
  }
  function J(_) {
    Me.call(this, t, _);
  }
  function y(_) {
    Me.call(this, t, _);
  }
  function q(_) {
    Me.call(this, t, _);
  }
  function w(_) {
    Me.call(this, t, _);
  }
  function L(_) {
    Me.call(this, t, _);
  }
  function N(_) {
    Me.call(this, t, _);
  }
  function x(_) {
    ic[_ ? "unshift" : "push"](() => {
      U = _, n(8, U);
    });
  }
  return t.$$set = (_) => {
    "filetype" in _ && n(0, s = _.filetype), "dragging" in _ && n(12, a = _.dragging), "boundedheight" in _ && n(1, o = _.boundedheight), "center" in _ && n(2, r = _.center), "flex" in _ && n(3, c = _.flex), "file_count" in _ && n(4, d = _.file_count), "disable_click" in _ && n(13, u = _.disable_click), "root" in _ && n(14, f = _.root), "hidden" in _ && n(5, h = _.hidden), "include_sources" in _ && n(6, m = _.include_sources), "$$scope" in _ && n(16, i = _.$$scope);
  }, [
    s,
    o,
    r,
    c,
    d,
    h,
    m,
    F,
    U,
    R,
    X,
    S,
    a,
    u,
    f,
    p,
    i,
    l,
    k,
    J,
    y,
    q,
    w,
    L,
    N,
    x
  ];
}
class Bc extends lc {
  constructor(e) {
    super(), cc(this, e, Rc, Zc, hc, {
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
  SvelteComponent: _c,
  append: jl,
  attr: Wc,
  check_outros: Pl,
  create_component: tl,
  destroy_component: nl,
  detach: gc,
  element: yc,
  group_outros: Ll,
  init: Jc,
  insert: Nc,
  mount_component: ll,
  safe_not_equal: Sc,
  set_style: Kl,
  space: ql,
  toggle_class: $l,
  transition_in: ve,
  transition_out: Ae
} = window.__gradio__svelte__internal, { createEventDispatcher: vc } = window.__gradio__svelte__internal;
function ei(t) {
  let e, n;
  return e = new zt({
    props: {
      Icon: Fr,
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
      tl(e.$$.fragment);
    },
    m(l, i) {
      ll(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*i18n*/
      8 && (s.label = /*i18n*/
      l[3]("common.edit")), e.$set(s);
    },
    i(l) {
      n || (ve(e.$$.fragment, l), n = !0);
    },
    o(l) {
      Ae(e.$$.fragment, l), n = !1;
    },
    d(l) {
      nl(e, l);
    }
  };
}
function ti(t) {
  let e, n;
  return e = new zt({
    props: {
      Icon: Nr,
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
      tl(e.$$.fragment);
    },
    m(l, i) {
      ll(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*i18n*/
      8 && (s.label = /*i18n*/
      l[3]("common.undo")), e.$set(s);
    },
    i(l) {
      n || (ve(e.$$.fragment, l), n = !0);
    },
    o(l) {
      Ae(e.$$.fragment, l), n = !1;
    },
    d(l) {
      nl(e, l);
    }
  };
}
function Gc(t) {
  let e, n, l, i, s, a = (
    /*editable*/
    t[0] && ei(t)
  ), o = (
    /*undoable*/
    t[1] && ti(t)
  );
  return i = new zt({
    props: {
      Icon: er,
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
      e = yc("div"), a && a.c(), n = ql(), o && o.c(), l = ql(), tl(i.$$.fragment), Wc(e, "class", "svelte-1wj0ocy"), $l(e, "not-absolute", !/*absolute*/
      t[2]), Kl(
        e,
        "position",
        /*absolute*/
        t[2] ? "absolute" : "static"
      );
    },
    m(r, c) {
      Nc(r, e, c), a && a.m(e, null), jl(e, n), o && o.m(e, null), jl(e, l), ll(i, e, null), s = !0;
    },
    p(r, [c]) {
      /*editable*/
      r[0] ? a ? (a.p(r, c), c & /*editable*/
      1 && ve(a, 1)) : (a = ei(r), a.c(), ve(a, 1), a.m(e, n)) : a && (Ll(), Ae(a, 1, 1, () => {
        a = null;
      }), Pl()), /*undoable*/
      r[1] ? o ? (o.p(r, c), c & /*undoable*/
      2 && ve(o, 1)) : (o = ti(r), o.c(), ve(o, 1), o.m(e, l)) : o && (Ll(), Ae(o, 1, 1, () => {
        o = null;
      }), Pl());
      const d = {};
      c & /*i18n*/
      8 && (d.label = /*i18n*/
      r[3]("common.clear")), i.$set(d), (!s || c & /*absolute*/
      4) && $l(e, "not-absolute", !/*absolute*/
      r[2]), c & /*absolute*/
      4 && Kl(
        e,
        "position",
        /*absolute*/
        r[2] ? "absolute" : "static"
      );
    },
    i(r) {
      s || (ve(a), ve(o), ve(i.$$.fragment, r), s = !0);
    },
    o(r) {
      Ae(a), Ae(o), Ae(i.$$.fragment, r), s = !1;
    },
    d(r) {
      r && gc(e), a && a.d(), o && o.d(), nl(i);
    }
  };
}
function Ec(t, e, n) {
  let { editable: l = !1 } = e, { undoable: i = !1 } = e, { absolute: s = !0 } = e, { i18n: a } = e;
  const o = vc(), r = () => o("edit"), c = () => o("undo"), d = (u) => {
    o("clear"), u.stopPropagation();
  };
  return t.$$set = (u) => {
    "editable" in u && n(0, l = u.editable), "undoable" in u && n(1, i = u.undoable), "absolute" in u && n(2, s = u.absolute), "i18n" in u && n(3, a = u.i18n);
  }, [
    l,
    i,
    s,
    a,
    o,
    r,
    c,
    d
  ];
}
class kc extends _c {
  constructor(e) {
    super(), Jc(this, e, Ec, Gc, Sc, {
      editable: 0,
      undoable: 1,
      absolute: 2,
      i18n: 3
    });
  }
}
const {
  SvelteComponent: wc,
  add_flush_callback: Tc,
  append: ni,
  attr: li,
  bind: Xc,
  binding_callbacks: fs,
  check_outros: Ic,
  create_component: il,
  create_slot: Cc,
  destroy_component: sl,
  detach: An,
  element: ii,
  empty: Hc,
  get_all_dirty_from_scope: Yc,
  get_slot_changes: xc,
  group_outros: Mc,
  init: Dc,
  insert: jn,
  mount_component: al,
  safe_not_equal: zc,
  space: ms,
  transition_in: st,
  transition_out: at,
  update_slot_base: Oc
} = window.__gradio__svelte__internal, { createEventDispatcher: Ac, tick: si, onMount: jc } = window.__gradio__svelte__internal;
function Pc(t) {
  let e, n, l, i, s;
  return n = new kc({
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
      e = ii("div"), il(n.$$.fragment), l = ms(), i = ii("canvas"), li(i, "class", "svelte-pxj656"), li(e, "class", "input-model svelte-pxj656");
    },
    m(a, o) {
      jn(a, e, o), al(n, e, null), ni(e, l), ni(e, i), t[15](i), s = !0;
    },
    p(a, o) {
      const r = {};
      o & /*i18n*/
      16 && (r.i18n = /*i18n*/
      a[4]), n.$set(r);
    },
    i(a) {
      s || (st(n.$$.fragment, a), s = !0);
    },
    o(a) {
      at(n.$$.fragment, a), s = !1;
    },
    d(a) {
      a && An(e), sl(n), t[15](null);
    }
  };
}
function Lc(t) {
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
    $$slots: { default: [Kc] },
    $$scope: { ctx: t }
  };
  return (
    /*dragging*/
    t[6] !== void 0 && (s.dragging = /*dragging*/
    t[6]), e = new Bc({ props: s }), fs.push(() => Xc(e, "dragging", i)), e.$on(
      "load",
      /*handle_upload*/
      t[7]
    ), {
      c() {
        il(e.$$.fragment);
      },
      m(a, o) {
        al(e, a, o), l = !0;
      },
      p(a, o) {
        const r = {};
        o & /*root*/
        8 && (r.root = /*root*/
        a[3]), o & /*$$scope*/
        65536 && (r.$$scope = { dirty: o, ctx: a }), !n && o & /*dragging*/
        64 && (n = !0, r.dragging = /*dragging*/
        a[6], Tc(() => n = !1)), e.$set(r);
      },
      i(a) {
        l || (st(e.$$.fragment, a), l = !0);
      },
      o(a) {
        at(e.$$.fragment, a), l = !1;
      },
      d(a) {
        sl(e, a);
      }
    }
  );
}
function Kc(t) {
  let e;
  const n = (
    /*#slots*/
    t[13].default
  ), l = Cc(
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
      65536) && Oc(
        l,
        n,
        i,
        /*$$scope*/
        i[16],
        e ? xc(
          n,
          /*$$scope*/
          i[16],
          s,
          null
        ) : Yc(
          /*$$scope*/
          i[16]
        ),
        null
      );
    },
    i(i) {
      e || (st(l, i), e = !0);
    },
    o(i) {
      at(l, i), e = !1;
    },
    d(i) {
      l && l.d(i);
    }
  };
}
function qc(t) {
  let e, n, l, i, s, a;
  e = new Dt({
    props: {
      show_label: (
        /*show_label*/
        t[2]
      ),
      Icon: Wt,
      label: (
        /*label*/
        t[1] || "Splat"
      )
    }
  });
  const o = [Lc, Pc], r = [];
  function c(d, u) {
    return (
      /*value*/
      d[0] === null ? 0 : 1
    );
  }
  return l = c(t), i = r[l] = o[l](t), {
    c() {
      il(e.$$.fragment), n = ms(), i.c(), s = Hc();
    },
    m(d, u) {
      al(e, d, u), jn(d, n, u), r[l].m(d, u), jn(d, s, u), a = !0;
    },
    p(d, [u]) {
      const f = {};
      u & /*show_label*/
      4 && (f.show_label = /*show_label*/
      d[2]), u & /*label*/
      2 && (f.label = /*label*/
      d[1] || "Splat"), e.$set(f);
      let h = l;
      l = c(d), l === h ? r[l].p(d, u) : (Mc(), at(r[h], 1, 1, () => {
        r[h] = null;
      }), Ic(), i = r[l], i ? i.p(d, u) : (i = r[l] = o[l](d), i.c()), st(i, 1), i.m(s.parentNode, s));
    },
    i(d) {
      a || (st(e.$$.fragment, d), st(i), a = !0);
    },
    o(d) {
      at(e.$$.fragment, d), at(i), a = !1;
    },
    d(d) {
      d && (An(n), An(s)), sl(e, d), r[l].d(d);
    }
  };
}
function $c(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { value: a } = e, { label: o = "" } = e, { show_label: r } = e, { root: c } = e, { i18n: d } = e, { zoom_speed: u = 1 } = e, { pan_speed: f = 1 } = e, h = !1, m, V, U, Q = null, R, F = !1, Z = !1;
  function p() {
    if (Q && Q.dispose(), Q = new wi(m), R = new Ti(U, m), R.zoomSpeed = u, R.panSpeed = f, !a)
      return;
    const w = async () => {
      if (F) {
        console.error("Already loading");
        return;
      }
      if (F = !0, a.url.endsWith(".ply"))
        await Ln.LoadAsync(a.url, V, (N) => {
        });
      else if (a.url.endsWith(".splat"))
        await ki.LoadAsync(a.url, V, (N) => {
        });
      else
        throw new Error("Unsupported file type");
      F = !1;
    }, L = () => {
      if (Z) {
        if (F) {
          requestAnimationFrame(L);
          return;
        }
        R.update(), Q.render(V, U), requestAnimationFrame(L);
      }
    };
    w(), Z = !0, requestAnimationFrame(L);
  }
  jc(() => {
    V = new Be(), U = new Ei(), n(11, h = !0);
  });
  async function X({ detail: w }) {
    n(0, a = w), await si(), p(), k("change", a);
  }
  async function S() {
    n(0, a = null), Q && (Q.dispose(), Q = null), F = !1, Z = !1, await si(), k("clear");
  }
  const k = Ac();
  let J = !1;
  function y(w) {
    J = w, n(6, J);
  }
  function q(w) {
    fs[w ? "unshift" : "push"](() => {
      m = w, n(5, m);
    });
  }
  return t.$$set = (w) => {
    "value" in w && n(0, a = w.value), "label" in w && n(1, o = w.label), "show_label" in w && n(2, r = w.show_label), "root" in w && n(3, c = w.root), "i18n" in w && n(4, d = w.i18n), "zoom_speed" in w && n(9, u = w.zoom_speed), "pan_speed" in w && n(10, f = w.pan_speed), "$$scope" in w && n(16, s = w.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty & /*value*/
    1 && n(12, { path: l } = a || { path: void 0 }, l), t.$$.dirty & /*canvas, mounted, path*/
    6176 && m && h && l != null && p(), t.$$.dirty & /*dragging*/
    64 && k("drag", J);
  }, [
    a,
    o,
    r,
    c,
    d,
    m,
    J,
    X,
    S,
    u,
    f,
    h,
    l,
    i,
    y,
    q,
    s
  ];
}
class ed extends wc {
  constructor(e) {
    super(), Dc(this, e, $c, qc, zc, {
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
function nt(t) {
  let e = ["", "k", "M", "G", "T", "P", "E", "Z"], n = 0;
  for (; t > 1e3 && n < e.length - 1; )
    t /= 1e3, n++;
  let l = e[n];
  return (Number.isInteger(t) ? t : t.toFixed(1)) + l;
}
const {
  SvelteComponent: td,
  append: Qe,
  attr: H,
  component_subscribe: ai,
  detach: nd,
  element: ld,
  init: id,
  insert: sd,
  noop: ri,
  safe_not_equal: ad,
  set_style: kt,
  svg_element: Re,
  toggle_class: oi
} = window.__gradio__svelte__internal, { onMount: rd } = window.__gradio__svelte__internal;
function od(t) {
  let e, n, l, i, s, a, o, r, c, d, u, f;
  return {
    c() {
      e = ld("div"), n = Re("svg"), l = Re("g"), i = Re("path"), s = Re("path"), a = Re("path"), o = Re("path"), r = Re("g"), c = Re("path"), d = Re("path"), u = Re("path"), f = Re("path"), H(i, "d", "M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z"), H(i, "fill", "#FF7C00"), H(i, "fill-opacity", "0.4"), H(i, "class", "svelte-43sxxs"), H(s, "d", "M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z"), H(s, "fill", "#FF7C00"), H(s, "class", "svelte-43sxxs"), H(a, "d", "M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z"), H(a, "fill", "#FF7C00"), H(a, "fill-opacity", "0.4"), H(a, "class", "svelte-43sxxs"), H(o, "d", "M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z"), H(o, "fill", "#FF7C00"), H(o, "class", "svelte-43sxxs"), kt(l, "transform", "translate(" + /*$top*/
      t[1][0] + "px, " + /*$top*/
      t[1][1] + "px)"), H(c, "d", "M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z"), H(c, "fill", "#FF7C00"), H(c, "fill-opacity", "0.4"), H(c, "class", "svelte-43sxxs"), H(d, "d", "M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z"), H(d, "fill", "#FF7C00"), H(d, "class", "svelte-43sxxs"), H(u, "d", "M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z"), H(u, "fill", "#FF7C00"), H(u, "fill-opacity", "0.4"), H(u, "class", "svelte-43sxxs"), H(f, "d", "M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z"), H(f, "fill", "#FF7C00"), H(f, "class", "svelte-43sxxs"), kt(r, "transform", "translate(" + /*$bottom*/
      t[2][0] + "px, " + /*$bottom*/
      t[2][1] + "px)"), H(n, "viewBox", "-1200 -1200 3000 3000"), H(n, "fill", "none"), H(n, "xmlns", "http://www.w3.org/2000/svg"), H(n, "class", "svelte-43sxxs"), H(e, "class", "svelte-43sxxs"), oi(
        e,
        "margin",
        /*margin*/
        t[0]
      );
    },
    m(h, m) {
      sd(h, e, m), Qe(e, n), Qe(n, l), Qe(l, i), Qe(l, s), Qe(l, a), Qe(l, o), Qe(n, r), Qe(r, c), Qe(r, d), Qe(r, u), Qe(r, f);
    },
    p(h, [m]) {
      m & /*$top*/
      2 && kt(l, "transform", "translate(" + /*$top*/
      h[1][0] + "px, " + /*$top*/
      h[1][1] + "px)"), m & /*$bottom*/
      4 && kt(r, "transform", "translate(" + /*$bottom*/
      h[2][0] + "px, " + /*$bottom*/
      h[2][1] + "px)"), m & /*margin*/
      1 && oi(
        e,
        "margin",
        /*margin*/
        h[0]
      );
    },
    i: ri,
    o: ri,
    d(h) {
      h && nd(e);
    }
  };
}
function cd(t, e, n) {
  let l, i, { margin: s = !0 } = e;
  const a = vl([0, 0]);
  ai(t, a, (f) => n(1, l = f));
  const o = vl([0, 0]);
  ai(t, o, (f) => n(2, i = f));
  let r;
  async function c() {
    await Promise.all([a.set([125, 140]), o.set([-125, -140])]), await Promise.all([a.set([-125, 140]), o.set([125, -140])]), await Promise.all([a.set([-125, 0]), o.set([125, -0])]), await Promise.all([a.set([125, 0]), o.set([-125, 0])]);
  }
  async function d() {
    await c(), r || d();
  }
  async function u() {
    await Promise.all([a.set([125, 0]), o.set([-125, 0])]), d();
  }
  return rd(() => (u(), () => r = !0)), t.$$set = (f) => {
    "margin" in f && n(0, s = f.margin);
  }, [s, l, i, a, o];
}
class dd extends td {
  constructor(e) {
    super(), id(this, e, cd, od, ad, { margin: 0 });
  }
}
const {
  SvelteComponent: ud,
  append: Le,
  attr: Je,
  binding_callbacks: ci,
  check_outros: Us,
  create_component: hd,
  create_slot: fd,
  destroy_component: md,
  destroy_each: Fs,
  detach: G,
  element: Ge,
  empty: bt,
  ensure_array_like: Mt,
  get_all_dirty_from_scope: Ud,
  get_slot_changes: Fd,
  group_outros: bs,
  init: bd,
  insert: E,
  mount_component: pd,
  noop: Pn,
  safe_not_equal: Vd,
  set_data: be,
  set_style: xe,
  space: Ne,
  text: j,
  toggle_class: Fe,
  transition_in: ut,
  transition_out: ht,
  update_slot_base: Zd
} = window.__gradio__svelte__internal, { tick: Qd } = window.__gradio__svelte__internal, { onDestroy: Rd } = window.__gradio__svelte__internal, Bd = (t) => ({}), di = (t) => ({});
function ui(t, e, n) {
  const l = t.slice();
  return l[38] = e[n], l[40] = n, l;
}
function hi(t, e, n) {
  const l = t.slice();
  return l[38] = e[n], l;
}
function _d(t) {
  let e, n = (
    /*i18n*/
    t[1]("common.error") + ""
  ), l, i, s;
  const a = (
    /*#slots*/
    t[29].error
  ), o = fd(
    a,
    t,
    /*$$scope*/
    t[28],
    di
  );
  return {
    c() {
      e = Ge("span"), l = j(n), i = Ne(), o && o.c(), Je(e, "class", "error svelte-14miwb5");
    },
    m(r, c) {
      E(r, e, c), Le(e, l), E(r, i, c), o && o.m(r, c), s = !0;
    },
    p(r, c) {
      (!s || c[0] & /*i18n*/
      2) && n !== (n = /*i18n*/
      r[1]("common.error") + "") && be(l, n), o && o.p && (!s || c[0] & /*$$scope*/
      268435456) && Zd(
        o,
        a,
        r,
        /*$$scope*/
        r[28],
        s ? Fd(
          a,
          /*$$scope*/
          r[28],
          c,
          Bd
        ) : Ud(
          /*$$scope*/
          r[28]
        ),
        di
      );
    },
    i(r) {
      s || (ut(o, r), s = !0);
    },
    o(r) {
      ht(o, r), s = !1;
    },
    d(r) {
      r && (G(e), G(i)), o && o.d(r);
    }
  };
}
function Wd(t) {
  let e, n, l, i, s, a, o, r, c, d = (
    /*variant*/
    t[8] === "default" && /*show_eta_bar*/
    t[18] && /*show_progress*/
    t[6] === "full" && fi(t)
  );
  function u(F, Z) {
    if (
      /*progress*/
      F[7]
    )
      return Jd;
    if (
      /*queue_position*/
      F[2] !== null && /*queue_size*/
      F[3] !== void 0 && /*queue_position*/
      F[2] >= 0
    )
      return yd;
    if (
      /*queue_position*/
      F[2] === 0
    )
      return gd;
  }
  let f = u(t), h = f && f(t), m = (
    /*timer*/
    t[5] && Fi(t)
  );
  const V = [Gd, vd], U = [];
  function Q(F, Z) {
    return (
      /*last_progress_level*/
      F[15] != null ? 0 : (
        /*show_progress*/
        F[6] === "full" ? 1 : -1
      )
    );
  }
  ~(s = Q(t)) && (a = U[s] = V[s](t));
  let R = !/*timer*/
  t[5] && Bi(t);
  return {
    c() {
      d && d.c(), e = Ne(), n = Ge("div"), h && h.c(), l = Ne(), m && m.c(), i = Ne(), a && a.c(), o = Ne(), R && R.c(), r = bt(), Je(n, "class", "progress-text svelte-14miwb5"), Fe(
        n,
        "meta-text-center",
        /*variant*/
        t[8] === "center"
      ), Fe(
        n,
        "meta-text",
        /*variant*/
        t[8] === "default"
      );
    },
    m(F, Z) {
      d && d.m(F, Z), E(F, e, Z), E(F, n, Z), h && h.m(n, null), Le(n, l), m && m.m(n, null), E(F, i, Z), ~s && U[s].m(F, Z), E(F, o, Z), R && R.m(F, Z), E(F, r, Z), c = !0;
    },
    p(F, Z) {
      /*variant*/
      F[8] === "default" && /*show_eta_bar*/
      F[18] && /*show_progress*/
      F[6] === "full" ? d ? d.p(F, Z) : (d = fi(F), d.c(), d.m(e.parentNode, e)) : d && (d.d(1), d = null), f === (f = u(F)) && h ? h.p(F, Z) : (h && h.d(1), h = f && f(F), h && (h.c(), h.m(n, l))), /*timer*/
      F[5] ? m ? m.p(F, Z) : (m = Fi(F), m.c(), m.m(n, null)) : m && (m.d(1), m = null), (!c || Z[0] & /*variant*/
      256) && Fe(
        n,
        "meta-text-center",
        /*variant*/
        F[8] === "center"
      ), (!c || Z[0] & /*variant*/
      256) && Fe(
        n,
        "meta-text",
        /*variant*/
        F[8] === "default"
      );
      let p = s;
      s = Q(F), s === p ? ~s && U[s].p(F, Z) : (a && (bs(), ht(U[p], 1, 1, () => {
        U[p] = null;
      }), Us()), ~s ? (a = U[s], a ? a.p(F, Z) : (a = U[s] = V[s](F), a.c()), ut(a, 1), a.m(o.parentNode, o)) : a = null), /*timer*/
      F[5] ? R && (R.d(1), R = null) : R ? R.p(F, Z) : (R = Bi(F), R.c(), R.m(r.parentNode, r));
    },
    i(F) {
      c || (ut(a), c = !0);
    },
    o(F) {
      ht(a), c = !1;
    },
    d(F) {
      F && (G(e), G(n), G(i), G(o), G(r)), d && d.d(F), h && h.d(), m && m.d(), ~s && U[s].d(F), R && R.d(F);
    }
  };
}
function fi(t) {
  let e, n = `translateX(${/*eta_level*/
  (t[17] || 0) * 100 - 100}%)`;
  return {
    c() {
      e = Ge("div"), Je(e, "class", "eta-bar svelte-14miwb5"), xe(e, "transform", n);
    },
    m(l, i) {
      E(l, e, i);
    },
    p(l, i) {
      i[0] & /*eta_level*/
      131072 && n !== (n = `translateX(${/*eta_level*/
      (l[17] || 0) * 100 - 100}%)`) && xe(e, "transform", n);
    },
    d(l) {
      l && G(e);
    }
  };
}
function gd(t) {
  let e;
  return {
    c() {
      e = j("processing |");
    },
    m(n, l) {
      E(n, e, l);
    },
    p: Pn,
    d(n) {
      n && G(e);
    }
  };
}
function yd(t) {
  let e, n = (
    /*queue_position*/
    t[2] + 1 + ""
  ), l, i, s, a;
  return {
    c() {
      e = j("queue: "), l = j(n), i = j("/"), s = j(
        /*queue_size*/
        t[3]
      ), a = j(" |");
    },
    m(o, r) {
      E(o, e, r), E(o, l, r), E(o, i, r), E(o, s, r), E(o, a, r);
    },
    p(o, r) {
      r[0] & /*queue_position*/
      4 && n !== (n = /*queue_position*/
      o[2] + 1 + "") && be(l, n), r[0] & /*queue_size*/
      8 && be(
        s,
        /*queue_size*/
        o[3]
      );
    },
    d(o) {
      o && (G(e), G(l), G(i), G(s), G(a));
    }
  };
}
function Jd(t) {
  let e, n = Mt(
    /*progress*/
    t[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = Ui(hi(t, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      e = bt();
    },
    m(i, s) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, s);
      E(i, e, s);
    },
    p(i, s) {
      if (s[0] & /*progress*/
      128) {
        n = Mt(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const o = hi(i, n, a);
          l[a] ? l[a].p(o, s) : (l[a] = Ui(o), l[a].c(), l[a].m(e.parentNode, e));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && G(e), Fs(l, i);
    }
  };
}
function mi(t) {
  let e, n = (
    /*p*/
    t[38].unit + ""
  ), l, i, s = " ", a;
  function o(d, u) {
    return (
      /*p*/
      d[38].length != null ? Sd : Nd
    );
  }
  let r = o(t), c = r(t);
  return {
    c() {
      c.c(), e = Ne(), l = j(n), i = j(" | "), a = j(s);
    },
    m(d, u) {
      c.m(d, u), E(d, e, u), E(d, l, u), E(d, i, u), E(d, a, u);
    },
    p(d, u) {
      r === (r = o(d)) && c ? c.p(d, u) : (c.d(1), c = r(d), c && (c.c(), c.m(e.parentNode, e))), u[0] & /*progress*/
      128 && n !== (n = /*p*/
      d[38].unit + "") && be(l, n);
    },
    d(d) {
      d && (G(e), G(l), G(i), G(a)), c.d(d);
    }
  };
}
function Nd(t) {
  let e = nt(
    /*p*/
    t[38].index || 0
  ) + "", n;
  return {
    c() {
      n = j(e);
    },
    m(l, i) {
      E(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && e !== (e = nt(
        /*p*/
        l[38].index || 0
      ) + "") && be(n, e);
    },
    d(l) {
      l && G(n);
    }
  };
}
function Sd(t) {
  let e = nt(
    /*p*/
    t[38].index || 0
  ) + "", n, l, i = nt(
    /*p*/
    t[38].length
  ) + "", s;
  return {
    c() {
      n = j(e), l = j("/"), s = j(i);
    },
    m(a, o) {
      E(a, n, o), E(a, l, o), E(a, s, o);
    },
    p(a, o) {
      o[0] & /*progress*/
      128 && e !== (e = nt(
        /*p*/
        a[38].index || 0
      ) + "") && be(n, e), o[0] & /*progress*/
      128 && i !== (i = nt(
        /*p*/
        a[38].length
      ) + "") && be(s, i);
    },
    d(a) {
      a && (G(n), G(l), G(s));
    }
  };
}
function Ui(t) {
  let e, n = (
    /*p*/
    t[38].index != null && mi(t)
  );
  return {
    c() {
      n && n.c(), e = bt();
    },
    m(l, i) {
      n && n.m(l, i), E(l, e, i);
    },
    p(l, i) {
      /*p*/
      l[38].index != null ? n ? n.p(l, i) : (n = mi(l), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null);
    },
    d(l) {
      l && G(e), n && n.d(l);
    }
  };
}
function Fi(t) {
  let e, n = (
    /*eta*/
    t[0] ? `/${/*formatted_eta*/
    t[19]}` : ""
  ), l, i;
  return {
    c() {
      e = j(
        /*formatted_timer*/
        t[20]
      ), l = j(n), i = j("s");
    },
    m(s, a) {
      E(s, e, a), E(s, l, a), E(s, i, a);
    },
    p(s, a) {
      a[0] & /*formatted_timer*/
      1048576 && be(
        e,
        /*formatted_timer*/
        s[20]
      ), a[0] & /*eta, formatted_eta*/
      524289 && n !== (n = /*eta*/
      s[0] ? `/${/*formatted_eta*/
      s[19]}` : "") && be(l, n);
    },
    d(s) {
      s && (G(e), G(l), G(i));
    }
  };
}
function vd(t) {
  let e, n;
  return e = new dd({
    props: { margin: (
      /*variant*/
      t[8] === "default"
    ) }
  }), {
    c() {
      hd(e.$$.fragment);
    },
    m(l, i) {
      pd(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i[0] & /*variant*/
      256 && (s.margin = /*variant*/
      l[8] === "default"), e.$set(s);
    },
    i(l) {
      n || (ut(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ht(e.$$.fragment, l), n = !1;
    },
    d(l) {
      md(e, l);
    }
  };
}
function Gd(t) {
  let e, n, l, i, s, a = `${/*last_progress_level*/
  t[15] * 100}%`, o = (
    /*progress*/
    t[7] != null && bi(t)
  );
  return {
    c() {
      e = Ge("div"), n = Ge("div"), o && o.c(), l = Ne(), i = Ge("div"), s = Ge("div"), Je(n, "class", "progress-level-inner svelte-14miwb5"), Je(s, "class", "progress-bar svelte-14miwb5"), xe(s, "width", a), Je(i, "class", "progress-bar-wrap svelte-14miwb5"), Je(e, "class", "progress-level svelte-14miwb5");
    },
    m(r, c) {
      E(r, e, c), Le(e, n), o && o.m(n, null), Le(e, l), Le(e, i), Le(i, s), t[30](s);
    },
    p(r, c) {
      /*progress*/
      r[7] != null ? o ? o.p(r, c) : (o = bi(r), o.c(), o.m(n, null)) : o && (o.d(1), o = null), c[0] & /*last_progress_level*/
      32768 && a !== (a = `${/*last_progress_level*/
      r[15] * 100}%`) && xe(s, "width", a);
    },
    i: Pn,
    o: Pn,
    d(r) {
      r && G(e), o && o.d(), t[30](null);
    }
  };
}
function bi(t) {
  let e, n = Mt(
    /*progress*/
    t[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = Ri(ui(t, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      e = bt();
    },
    m(i, s) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, s);
      E(i, e, s);
    },
    p(i, s) {
      if (s[0] & /*progress_level, progress*/
      16512) {
        n = Mt(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const o = ui(i, n, a);
          l[a] ? l[a].p(o, s) : (l[a] = Ri(o), l[a].c(), l[a].m(e.parentNode, e));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && G(e), Fs(l, i);
    }
  };
}
function pi(t) {
  let e, n, l, i, s = (
    /*i*/
    t[40] !== 0 && Ed()
  ), a = (
    /*p*/
    t[38].desc != null && Vi(t)
  ), o = (
    /*p*/
    t[38].desc != null && /*progress_level*/
    t[14] && /*progress_level*/
    t[14][
      /*i*/
      t[40]
    ] != null && Zi()
  ), r = (
    /*progress_level*/
    t[14] != null && Qi(t)
  );
  return {
    c() {
      s && s.c(), e = Ne(), a && a.c(), n = Ne(), o && o.c(), l = Ne(), r && r.c(), i = bt();
    },
    m(c, d) {
      s && s.m(c, d), E(c, e, d), a && a.m(c, d), E(c, n, d), o && o.m(c, d), E(c, l, d), r && r.m(c, d), E(c, i, d);
    },
    p(c, d) {
      /*p*/
      c[38].desc != null ? a ? a.p(c, d) : (a = Vi(c), a.c(), a.m(n.parentNode, n)) : a && (a.d(1), a = null), /*p*/
      c[38].desc != null && /*progress_level*/
      c[14] && /*progress_level*/
      c[14][
        /*i*/
        c[40]
      ] != null ? o || (o = Zi(), o.c(), o.m(l.parentNode, l)) : o && (o.d(1), o = null), /*progress_level*/
      c[14] != null ? r ? r.p(c, d) : (r = Qi(c), r.c(), r.m(i.parentNode, i)) : r && (r.d(1), r = null);
    },
    d(c) {
      c && (G(e), G(n), G(l), G(i)), s && s.d(c), a && a.d(c), o && o.d(c), r && r.d(c);
    }
  };
}
function Ed(t) {
  let e;
  return {
    c() {
      e = j(" /");
    },
    m(n, l) {
      E(n, e, l);
    },
    d(n) {
      n && G(e);
    }
  };
}
function Vi(t) {
  let e = (
    /*p*/
    t[38].desc + ""
  ), n;
  return {
    c() {
      n = j(e);
    },
    m(l, i) {
      E(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && e !== (e = /*p*/
      l[38].desc + "") && be(n, e);
    },
    d(l) {
      l && G(n);
    }
  };
}
function Zi(t) {
  let e;
  return {
    c() {
      e = j("-");
    },
    m(n, l) {
      E(n, e, l);
    },
    d(n) {
      n && G(e);
    }
  };
}
function Qi(t) {
  let e = (100 * /*progress_level*/
  (t[14][
    /*i*/
    t[40]
  ] || 0)).toFixed(1) + "", n, l;
  return {
    c() {
      n = j(e), l = j("%");
    },
    m(i, s) {
      E(i, n, s), E(i, l, s);
    },
    p(i, s) {
      s[0] & /*progress_level*/
      16384 && e !== (e = (100 * /*progress_level*/
      (i[14][
        /*i*/
        i[40]
      ] || 0)).toFixed(1) + "") && be(n, e);
    },
    d(i) {
      i && (G(n), G(l));
    }
  };
}
function Ri(t) {
  let e, n = (
    /*p*/
    (t[38].desc != null || /*progress_level*/
    t[14] && /*progress_level*/
    t[14][
      /*i*/
      t[40]
    ] != null) && pi(t)
  );
  return {
    c() {
      n && n.c(), e = bt();
    },
    m(l, i) {
      n && n.m(l, i), E(l, e, i);
    },
    p(l, i) {
      /*p*/
      l[38].desc != null || /*progress_level*/
      l[14] && /*progress_level*/
      l[14][
        /*i*/
        l[40]
      ] != null ? n ? n.p(l, i) : (n = pi(l), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null);
    },
    d(l) {
      l && G(e), n && n.d(l);
    }
  };
}
function Bi(t) {
  let e, n;
  return {
    c() {
      e = Ge("p"), n = j(
        /*loading_text*/
        t[9]
      ), Je(e, "class", "loading svelte-14miwb5");
    },
    m(l, i) {
      E(l, e, i), Le(e, n);
    },
    p(l, i) {
      i[0] & /*loading_text*/
      512 && be(
        n,
        /*loading_text*/
        l[9]
      );
    },
    d(l) {
      l && G(e);
    }
  };
}
function kd(t) {
  let e, n, l, i, s;
  const a = [Wd, _d], o = [];
  function r(c, d) {
    return (
      /*status*/
      c[4] === "pending" ? 0 : (
        /*status*/
        c[4] === "error" ? 1 : -1
      )
    );
  }
  return ~(n = r(t)) && (l = o[n] = a[n](t)), {
    c() {
      e = Ge("div"), l && l.c(), Je(e, "class", i = "wrap " + /*variant*/
      t[8] + " " + /*show_progress*/
      t[6] + " svelte-14miwb5"), Fe(e, "hide", !/*status*/
      t[4] || /*status*/
      t[4] === "complete" || /*show_progress*/
      t[6] === "hidden"), Fe(
        e,
        "translucent",
        /*variant*/
        t[8] === "center" && /*status*/
        (t[4] === "pending" || /*status*/
        t[4] === "error") || /*translucent*/
        t[11] || /*show_progress*/
        t[6] === "minimal"
      ), Fe(
        e,
        "generating",
        /*status*/
        t[4] === "generating"
      ), Fe(
        e,
        "border",
        /*border*/
        t[12]
      ), xe(
        e,
        "position",
        /*absolute*/
        t[10] ? "absolute" : "static"
      ), xe(
        e,
        "padding",
        /*absolute*/
        t[10] ? "0" : "var(--size-8) 0"
      );
    },
    m(c, d) {
      E(c, e, d), ~n && o[n].m(e, null), t[31](e), s = !0;
    },
    p(c, d) {
      let u = n;
      n = r(c), n === u ? ~n && o[n].p(c, d) : (l && (bs(), ht(o[u], 1, 1, () => {
        o[u] = null;
      }), Us()), ~n ? (l = o[n], l ? l.p(c, d) : (l = o[n] = a[n](c), l.c()), ut(l, 1), l.m(e, null)) : l = null), (!s || d[0] & /*variant, show_progress*/
      320 && i !== (i = "wrap " + /*variant*/
      c[8] + " " + /*show_progress*/
      c[6] + " svelte-14miwb5")) && Je(e, "class", i), (!s || d[0] & /*variant, show_progress, status, show_progress*/
      336) && Fe(e, "hide", !/*status*/
      c[4] || /*status*/
      c[4] === "complete" || /*show_progress*/
      c[6] === "hidden"), (!s || d[0] & /*variant, show_progress, variant, status, translucent, show_progress*/
      2384) && Fe(
        e,
        "translucent",
        /*variant*/
        c[8] === "center" && /*status*/
        (c[4] === "pending" || /*status*/
        c[4] === "error") || /*translucent*/
        c[11] || /*show_progress*/
        c[6] === "minimal"
      ), (!s || d[0] & /*variant, show_progress, status*/
      336) && Fe(
        e,
        "generating",
        /*status*/
        c[4] === "generating"
      ), (!s || d[0] & /*variant, show_progress, border*/
      4416) && Fe(
        e,
        "border",
        /*border*/
        c[12]
      ), d[0] & /*absolute*/
      1024 && xe(
        e,
        "position",
        /*absolute*/
        c[10] ? "absolute" : "static"
      ), d[0] & /*absolute*/
      1024 && xe(
        e,
        "padding",
        /*absolute*/
        c[10] ? "0" : "var(--size-8) 0"
      );
    },
    i(c) {
      s || (ut(l), s = !0);
    },
    o(c) {
      ht(l), s = !1;
    },
    d(c) {
      c && G(e), ~n && o[n].d(), t[31](null);
    }
  };
}
let wt = [], gn = !1;
async function wd(t, e = !0) {
  if (!(window.__gradio_mode__ === "website" || window.__gradio_mode__ !== "app" && e !== !0)) {
    if (wt.push(t), !gn)
      gn = !0;
    else
      return;
    await Qd(), requestAnimationFrame(() => {
      let n = [0, 0];
      for (let l = 0; l < wt.length; l++) {
        const s = wt[l].getBoundingClientRect();
        (l === 0 || s.top + window.scrollY <= n[0]) && (n[0] = s.top + window.scrollY, n[1] = l);
      }
      window.scrollTo({ top: n[0] - 20, behavior: "smooth" }), gn = !1, wt = [];
    });
  }
}
function Td(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { i18n: a } = e, { eta: o = null } = e, { queue: r = !1 } = e, { queue_position: c } = e, { queue_size: d } = e, { status: u } = e, { scroll_to_output: f = !1 } = e, { timer: h = !0 } = e, { show_progress: m = "full" } = e, { message: V = null } = e, { progress: U = null } = e, { variant: Q = "default" } = e, { loading_text: R = "Loading..." } = e, { absolute: F = !0 } = e, { translucent: Z = !1 } = e, { border: p = !1 } = e, { autoscroll: X } = e, S, k = !1, J = 0, y = 0, q = null, w = 0, L = null, N, x = null, _ = !0;
  const B = () => {
    n(25, J = performance.now()), n(26, y = 0), k = !0, b();
  };
  function b() {
    requestAnimationFrame(() => {
      n(26, y = (performance.now() - J) / 1e3), k && b();
    });
  }
  function g() {
    n(26, y = 0), k && (k = !1);
  }
  Rd(() => {
    k && g();
  });
  let v = null;
  function M(W) {
    ci[W ? "unshift" : "push"](() => {
      x = W, n(16, x), n(7, U), n(14, L), n(15, N);
    });
  }
  function T(W) {
    ci[W ? "unshift" : "push"](() => {
      S = W, n(13, S);
    });
  }
  return t.$$set = (W) => {
    "i18n" in W && n(1, a = W.i18n), "eta" in W && n(0, o = W.eta), "queue" in W && n(21, r = W.queue), "queue_position" in W && n(2, c = W.queue_position), "queue_size" in W && n(3, d = W.queue_size), "status" in W && n(4, u = W.status), "scroll_to_output" in W && n(22, f = W.scroll_to_output), "timer" in W && n(5, h = W.timer), "show_progress" in W && n(6, m = W.show_progress), "message" in W && n(23, V = W.message), "progress" in W && n(7, U = W.progress), "variant" in W && n(8, Q = W.variant), "loading_text" in W && n(9, R = W.loading_text), "absolute" in W && n(10, F = W.absolute), "translucent" in W && n(11, Z = W.translucent), "border" in W && n(12, p = W.border), "autoscroll" in W && n(24, X = W.autoscroll), "$$scope" in W && n(28, s = W.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty[0] & /*eta, old_eta, queue, timer_start*/
    169869313 && (o === null ? n(0, o = q) : r && n(0, o = (performance.now() - J) / 1e3 + o), o != null && (n(19, v = o.toFixed(1)), n(27, q = o))), t.$$.dirty[0] & /*eta, timer_diff*/
    67108865 && n(17, w = o === null || o <= 0 || !y ? null : Math.min(y / o, 1)), t.$$.dirty[0] & /*progress*/
    128 && U != null && n(18, _ = !1), t.$$.dirty[0] & /*progress, progress_level, progress_bar, last_progress_level*/
    114816 && (U != null ? n(14, L = U.map((W) => {
      if (W.index != null && W.length != null)
        return W.index / W.length;
      if (W.progress != null)
        return W.progress;
    })) : n(14, L = null), L ? (n(15, N = L[L.length - 1]), x && (N === 0 ? n(16, x.style.transition = "0", x) : n(16, x.style.transition = "150ms", x))) : n(15, N = void 0)), t.$$.dirty[0] & /*status*/
    16 && (u === "pending" ? B() : g()), t.$$.dirty[0] & /*el, scroll_to_output, status, autoscroll*/
    20979728 && S && f && (u === "pending" || u === "complete") && wd(S, X), t.$$.dirty[0] & /*status, message*/
    8388624, t.$$.dirty[0] & /*timer_diff*/
    67108864 && n(20, l = y.toFixed(1));
  }, [
    o,
    a,
    c,
    d,
    u,
    h,
    m,
    U,
    Q,
    R,
    F,
    Z,
    p,
    S,
    L,
    N,
    x,
    w,
    _,
    v,
    l,
    r,
    f,
    V,
    X,
    J,
    y,
    q,
    s,
    i,
    M,
    T
  ];
}
class ps extends ud {
  constructor(e) {
    super(), bd(
      this,
      e,
      Td,
      kd,
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
  SvelteComponent: Xd,
  append: Id,
  attr: Cd,
  detach: Hd,
  element: Yd,
  init: xd,
  insert: Md,
  noop: _i,
  safe_not_equal: Dd,
  set_data: zd,
  text: Od,
  toggle_class: tt
} = window.__gradio__svelte__internal;
function Ad(t) {
  let e, n;
  return {
    c() {
      e = Yd("div"), n = Od(
        /*value*/
        t[0]
      ), Cd(e, "class", "svelte-1gecy8w"), tt(
        e,
        "table",
        /*type*/
        t[1] === "table"
      ), tt(
        e,
        "gallery",
        /*type*/
        t[1] === "gallery"
      ), tt(
        e,
        "selected",
        /*selected*/
        t[2]
      );
    },
    m(l, i) {
      Md(l, e, i), Id(e, n);
    },
    p(l, [i]) {
      i & /*value*/
      1 && zd(
        n,
        /*value*/
        l[0]
      ), i & /*type*/
      2 && tt(
        e,
        "table",
        /*type*/
        l[1] === "table"
      ), i & /*type*/
      2 && tt(
        e,
        "gallery",
        /*type*/
        l[1] === "gallery"
      ), i & /*selected*/
      4 && tt(
        e,
        "selected",
        /*selected*/
        l[2]
      );
    },
    i: _i,
    o: _i,
    d(l) {
      l && Hd(e);
    }
  };
}
function jd(t, e, n) {
  let { value: l } = e, { type: i } = e, { selected: s = !1 } = e;
  return t.$$set = (a) => {
    "value" in a && n(0, l = a.value), "type" in a && n(1, i = a.type), "selected" in a && n(2, s = a.selected);
  }, [l, i, s];
}
class mu extends Xd {
  constructor(e) {
    super(), xd(this, e, jd, Ad, Dd, { value: 0, type: 1, selected: 2 });
  }
}
const {
  SvelteComponent: Pd,
  assign: Vs,
  check_outros: Zs,
  create_component: _e,
  destroy_component: We,
  detach: ft,
  empty: Qs,
  get_spread_object: Rs,
  get_spread_update: Bs,
  group_outros: _s,
  init: Ld,
  insert: mt,
  mount_component: ge,
  safe_not_equal: Kd,
  space: Lt,
  transition_in: oe,
  transition_out: ce
} = window.__gradio__svelte__internal;
function qd(t) {
  let e, n;
  return e = new Ni({
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
      $$slots: { default: [tu] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      _e(e.$$.fragment);
    },
    m(l, i) {
      ge(e, l, i), n = !0;
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
      n || (oe(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ce(e.$$.fragment, l), n = !1;
    },
    d(l) {
      We(e, l);
    }
  };
}
function $d(t) {
  let e, n;
  return e = new Ni({
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
      $$slots: { default: [su] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      _e(e.$$.fragment);
    },
    m(l, i) {
      ge(e, l, i), n = !0;
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
      n || (oe(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ce(e.$$.fragment, l), n = !1;
    },
    d(l) {
      We(e, l);
    }
  };
}
function eu(t) {
  let e, n;
  return e = new jr({
    props: {
      i18n: (
        /*gradio*/
        t[11].i18n
      ),
      type: "file"
    }
  }), {
    c() {
      _e(e.$$.fragment);
    },
    m(l, i) {
      ge(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i & /*gradio*/
      2048 && (s.i18n = /*gradio*/
      l[11].i18n), e.$set(s);
    },
    i(l) {
      n || (oe(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ce(e.$$.fragment, l), n = !1;
    },
    d(l) {
      We(e, l);
    }
  };
}
function tu(t) {
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
  for (let o = 0; o < s.length; o += 1)
    a = Vs(a, s[o]);
  return e = new ps({ props: a }), l = new ed({
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
      $$slots: { default: [eu] },
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
      _e(e.$$.fragment), n = Lt(), _e(l.$$.fragment);
    },
    m(o, r) {
      ge(e, o, r), mt(o, n, r), ge(l, o, r), i = !0;
    },
    p(o, r) {
      const c = r & /*gradio, loading_status*/
      2080 ? Bs(s, [
        r & /*gradio*/
        2048 && {
          autoscroll: (
            /*gradio*/
            o[11].autoscroll
          )
        },
        r & /*gradio*/
        2048 && { i18n: (
          /*gradio*/
          o[11].i18n
        ) },
        r & /*loading_status*/
        32 && Rs(
          /*loading_status*/
          o[5]
        )
      ]) : {};
      e.$set(c);
      const d = {};
      r & /*label*/
      64 && (d.label = /*label*/
      o[6]), r & /*show_label*/
      128 && (d.show_label = /*show_label*/
      o[7]), r & /*root*/
      16 && (d.root = /*root*/
      o[4]), r & /*_value*/
      65536 && (d.value = /*_value*/
      o[16]), r & /*zoom_speed*/
      8192 && (d.zoom_speed = /*zoom_speed*/
      o[13]), r & /*pan_speed*/
      16384 && (d.pan_speed = /*pan_speed*/
      o[14]), r & /*gradio*/
      2048 && (d.i18n = /*gradio*/
      o[11].i18n), r & /*$$scope, gradio*/
      8390656 && (d.$$scope = { dirty: r, ctx: o }), l.$set(d);
    },
    i(o) {
      i || (oe(e.$$.fragment, o), oe(l.$$.fragment, o), i = !0);
    },
    o(o) {
      ce(e.$$.fragment, o), ce(l.$$.fragment, o), i = !1;
    },
    d(o) {
      o && ft(n), We(e, o), We(l, o);
    }
  };
}
function nu(t) {
  let e, n, l, i;
  return e = new Dt({
    props: {
      show_label: (
        /*show_label*/
        t[7]
      ),
      Icon: Wt,
      label: (
        /*label*/
        t[6] || "Splat"
      )
    }
  }), l = new Aa({
    props: {
      unpadded_box: !0,
      size: "large",
      $$slots: { default: [iu] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      _e(e.$$.fragment), n = Lt(), _e(l.$$.fragment);
    },
    m(s, a) {
      ge(e, s, a), mt(s, n, a), ge(l, s, a), i = !0;
    },
    p(s, a) {
      const o = {};
      a & /*show_label*/
      128 && (o.show_label = /*show_label*/
      s[7]), a & /*label*/
      64 && (o.label = /*label*/
      s[6] || "Splat"), e.$set(o);
      const r = {};
      a & /*$$scope*/
      8388608 && (r.$$scope = { dirty: a, ctx: s }), l.$set(r);
    },
    i(s) {
      i || (oe(e.$$.fragment, s), oe(l.$$.fragment, s), i = !0);
    },
    o(s) {
      ce(e.$$.fragment, s), ce(l.$$.fragment, s), i = !1;
    },
    d(s) {
      s && ft(n), We(e, s), We(l, s);
    }
  };
}
function lu(t) {
  let e, n, l, i;
  return e = new Dt({
    props: {
      show_label: (
        /*show_label*/
        t[7]
      ),
      Icon: Wt,
      label: (
        /*label*/
        t[6] || "Splat"
      )
    }
  }), l = new co({
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
      _e(e.$$.fragment), n = Lt(), _e(l.$$.fragment);
    },
    m(s, a) {
      ge(e, s, a), mt(s, n, a), ge(l, s, a), i = !0;
    },
    p(s, a) {
      const o = {};
      a & /*show_label*/
      128 && (o.show_label = /*show_label*/
      s[7]), a & /*label*/
      64 && (o.label = /*label*/
      s[6] || "Splat"), e.$set(o);
      const r = {};
      a & /*_value*/
      65536 && (r.value = /*_value*/
      s[16]), a & /*gradio*/
      2048 && (r.i18n = /*gradio*/
      s[11].i18n), a & /*label*/
      64 && (r.label = /*label*/
      s[6]), a & /*show_label*/
      128 && (r.show_label = /*show_label*/
      s[7]), a & /*zoom_speed*/
      8192 && (r.zoom_speed = /*zoom_speed*/
      s[13]), a & /*pan_speed*/
      16384 && (r.pan_speed = /*pan_speed*/
      s[14]), l.$set(r);
    },
    i(s) {
      i || (oe(e.$$.fragment, s), oe(l.$$.fragment, s), i = !0);
    },
    o(s) {
      ce(e.$$.fragment, s), ce(l.$$.fragment, s), i = !1;
    },
    d(s) {
      s && ft(n), We(e, s), We(l, s);
    }
  };
}
function iu(t) {
  let e, n;
  return e = new Wt({}), {
    c() {
      _e(e.$$.fragment);
    },
    m(l, i) {
      ge(e, l, i), n = !0;
    },
    i(l) {
      n || (oe(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ce(e.$$.fragment, l), n = !1;
    },
    d(l) {
      We(e, l);
    }
  };
}
function su(t) {
  let e, n, l, i, s, a;
  const o = [
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
  let r = {};
  for (let f = 0; f < o.length; f += 1)
    r = Vs(r, o[f]);
  e = new ps({ props: r });
  const c = [lu, nu], d = [];
  function u(f, h) {
    return (
      /*value*/
      f[0] ? 0 : 1
    );
  }
  return l = u(t), i = d[l] = c[l](t), {
    c() {
      _e(e.$$.fragment), n = Lt(), i.c(), s = Qs();
    },
    m(f, h) {
      ge(e, f, h), mt(f, n, h), d[l].m(f, h), mt(f, s, h), a = !0;
    },
    p(f, h) {
      const m = h & /*gradio, loading_status*/
      2080 ? Bs(o, [
        h & /*gradio*/
        2048 && {
          autoscroll: (
            /*gradio*/
            f[11].autoscroll
          )
        },
        h & /*gradio*/
        2048 && { i18n: (
          /*gradio*/
          f[11].i18n
        ) },
        h & /*loading_status*/
        32 && Rs(
          /*loading_status*/
          f[5]
        )
      ]) : {};
      e.$set(m);
      let V = l;
      l = u(f), l === V ? d[l].p(f, h) : (_s(), ce(d[V], 1, 1, () => {
        d[V] = null;
      }), Zs(), i = d[l], i ? i.p(f, h) : (i = d[l] = c[l](f), i.c()), oe(i, 1), i.m(s.parentNode, s));
    },
    i(f) {
      a || (oe(e.$$.fragment, f), oe(i), a = !0);
    },
    o(f) {
      ce(e.$$.fragment, f), ce(i), a = !1;
    },
    d(f) {
      f && (ft(n), ft(s)), We(e, f), d[l].d(f);
    }
  };
}
function au(t) {
  let e, n, l, i;
  const s = [$d, qd], a = [];
  function o(r, c) {
    return (
      /*interactive*/
      r[15] ? 1 : 0
    );
  }
  return e = o(t), n = a[e] = s[e](t), {
    c() {
      n.c(), l = Qs();
    },
    m(r, c) {
      a[e].m(r, c), mt(r, l, c), i = !0;
    },
    p(r, [c]) {
      let d = e;
      e = o(r), e === d ? a[e].p(r, c) : (_s(), ce(a[d], 1, 1, () => {
        a[d] = null;
      }), Zs(), n = a[e], n ? n.p(r, c) : (n = a[e] = s[e](r), n.c()), oe(n, 1), n.m(l.parentNode, l));
    },
    i(r) {
      i || (oe(n), i = !0);
    },
    o(r) {
      ce(n), i = !1;
    },
    d(r) {
      r && ft(l), a[e].d(r);
    }
  };
}
function ru(t, e, n) {
  let { elem_id: l = "" } = e, { elem_classes: i = [] } = e, { visible: s = !0 } = e, { value: a = null } = e, { root: o } = e, { proxy_url: r } = e, { loading_status: c } = e, { label: d } = e, { show_label: u } = e, { container: f = !0 } = e, { scale: h = null } = e, { min_width: m = void 0 } = e, { gradio: V } = e, { height: U = void 0 } = e, { zoom_speed: Q = 1 } = e, { pan_speed: R = 1 } = e, { interactive: F } = e, Z, p = !1;
  const X = ({ detail: y }) => n(0, a = y), S = ({ detail: y }) => n(17, p = y), k = ({ detail: y }) => V.dispatch("change", y), J = () => V.dispatch("clear");
  return t.$$set = (y) => {
    "elem_id" in y && n(1, l = y.elem_id), "elem_classes" in y && n(2, i = y.elem_classes), "visible" in y && n(3, s = y.visible), "value" in y && n(0, a = y.value), "root" in y && n(4, o = y.root), "proxy_url" in y && n(18, r = y.proxy_url), "loading_status" in y && n(5, c = y.loading_status), "label" in y && n(6, d = y.label), "show_label" in y && n(7, u = y.show_label), "container" in y && n(8, f = y.container), "scale" in y && n(9, h = y.scale), "min_width" in y && n(10, m = y.min_width), "gradio" in y && n(11, V = y.gradio), "height" in y && n(12, U = y.height), "zoom_speed" in y && n(13, Q = y.zoom_speed), "pan_speed" in y && n(14, R = y.pan_speed), "interactive" in y && n(15, F = y.interactive);
  }, t.$$.update = () => {
    t.$$.dirty & /*value, root, proxy_url*/
    262161 && n(16, Z = je(a, o, r));
  }, [
    a,
    l,
    i,
    s,
    o,
    c,
    d,
    u,
    f,
    h,
    m,
    V,
    U,
    Q,
    R,
    F,
    Z,
    p,
    r,
    X,
    S,
    k,
    J
  ];
}
class Uu extends Pd {
  constructor(e) {
    super(), Ld(this, e, ru, au, Kd, {
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
  mu as BaseExample,
  co as BaseModel3DGS,
  ed as BaseModel3DGSUpload,
  Uu as default
};
