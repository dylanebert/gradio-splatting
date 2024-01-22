var pn = new Intl.Collator(0, { numeric: 1 }).compare;
function Gl(t, e, n) {
  return t = t.split("."), e = e.split("."), pn(t[0], e[0]) || pn(t[1], e[1]) || (e[2] = e.slice(2).join("."), n = /[.-]/.test(t[2] = t.slice(2).join(".")), n == /[.-]/.test(e[2]) ? pn(t[2], e[2]) : n ? -1 : 1);
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
const Ki = /^[^\/]*\/[^\/]*$/, ns = /.*hf\.space\/{0,1}$/;
async function ls(t, e) {
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
  if (ns.test(l)) {
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
function is(t) {
  let e = {};
  return t.forEach(({ api_name: n }, l) => {
    n && (e[n] = l);
  }), e;
}
const as = /^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function Sl(t) {
  try {
    const n = (await fetch(
      `https://huggingface.co/api/spaces/${t}/discussions`,
      {
        method: "HEAD"
      }
    )).headers.get("x-error-message");
    return !(n && as.test(n));
  } catch {
    return !1;
  }
}
function Bt(t, e, n) {
  if (t == null)
    return null;
  if (Array.isArray(t)) {
    const l = [];
    for (const i of t)
      i == null ? l.push(null) : l.push(Bt(i, e, n));
    return l;
  }
  return t.is_stream ? n == null ? new It({
    ...t,
    url: e + "/stream/" + t.path
  }) : new It({
    ...t,
    url: "/proxy=" + n + "stream/" + t.path
  }) : new It({
    ...t,
    url: rs(t.path, e, n)
  });
}
function ss(t) {
  try {
    const e = new URL(t);
    return e.protocol === "http:" || e.protocol === "https:";
  } catch {
    return !1;
  }
}
function rs(t, e, n) {
  return t == null ? n ? `/proxy=${n}file=` : `${e}/file=` : ss(t) ? t : n ? `/proxy=${n}file=${t}` : `${e}/file=${t}`;
}
async function os(t, e, n = Fs) {
  let l = (Array.isArray(t) ? t : [t]).map(
    (i) => i.blob
  );
  return await Promise.all(
    await n(e, l).then(
      async (i) => {
        if (i.error)
          throw new Error(i.error);
        return i.files ? i.files.map((s, a) => {
          const o = new It({ ...t[a], path: s });
          return Bt(o, e, null);
        }) : [];
      }
    )
  );
}
async function ds(t, e) {
  return t.map(
    (n, l) => new It({
      path: n.name,
      orig_name: n.name,
      blob: n,
      size: n.size,
      mime_type: n.type,
      is_stream: e
    })
  );
}
class It {
  constructor({
    path: e,
    url: n,
    orig_name: l,
    size: i,
    blob: s,
    is_stream: a,
    mime_type: o,
    alt_text: d
  }) {
    this.path = e, this.url = n, this.orig_name = l, this.size = i, this.blob = n ? void 0 : s, this.is_stream = a, this.mime_type = o, this.alt_text = d;
  }
}
const cs = "This application is too busy. Keep trying!", Dt = "Connection errored out.";
let Oi;
function Us(t, e) {
  return { post_data: n, upload_files: l, client: i, handle_blob: s };
  async function n(a, o, d) {
    const r = { "Content-Type": "application/json" };
    d && (r.Authorization = `Bearer ${d}`);
    try {
      var c = await t(a, {
        method: "POST",
        body: JSON.stringify(o),
        headers: r
      });
    } catch {
      return [{ error: Dt }, 500];
    }
    return [await c.json(), c.status];
  }
  async function l(a, o, d) {
    const r = {};
    d && (r.Authorization = `Bearer ${d}`);
    const c = 1e3, U = [];
    for (let h = 0; h < o.length; h += c) {
      const Q = o.slice(h, h + c), R = new FormData();
      Q.forEach((p) => {
        R.append("files", p);
      });
      try {
        var F = await t(`${a}/upload`, {
          method: "POST",
          body: R,
          headers: r
        });
      } catch {
        return { error: Dt };
      }
      const V = await F.json();
      U.push(...V);
    }
    return { files: U };
  }
  async function i(a, o = { normalise_files: !0 }) {
    return new Promise(async (d) => {
      const { status_callback: r, hf_token: c, normalise_files: U } = o, F = {
        predict: J,
        submit: G,
        view_api: le,
        component_server: Be
      }, h = U ?? !0;
      if ((typeof window > "u" || !("WebSocket" in window)) && !global.Websocket) {
        const k = await import("./wrapper-98f94c21-f7f71f53.js");
        Oi = (await import("./__vite-browser-external-2447137e.js")).Blob, global.WebSocket = k.WebSocket;
      }
      const { ws_protocol: Q, http_protocol: R, host: V, space_id: p } = await ls(a, c), b = Math.random().toString(36).substring(2), m = {};
      let A, I = {}, x = !1;
      c && p && (x = await Qs(p, c));
      async function v(k) {
        if (A = k, I = is((k == null ? void 0 : k.dependencies) || []), A.auth_required)
          return {
            config: A,
            ...F
          };
        try {
          X = await le(A);
        } catch (H) {
          console.error(`Could not get api details: ${H.message}`);
        }
        return {
          config: A,
          ...F
        };
      }
      let X;
      async function N(k) {
        if (r && r(k), k.status === "running")
          try {
            A = await Tl(
              t,
              `${R}//${V}`,
              c
            );
            const H = await v(A);
            d(H);
          } catch (H) {
            console.error(H), r && r({
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
        const k = await v(A);
        d(k);
      } catch (k) {
        console.error(k), p ? $n(
          p,
          Ki.test(p) ? "space_name" : "subdomain",
          N
        ) : r && r({
          status: "error",
          message: "Could not load this space.",
          load_status: "error",
          detail: "NOT_FOUND"
        });
      }
      function J(k, H, B) {
        let g = !1, Y = !1, y;
        if (typeof k == "number")
          y = A.dependencies[k];
        else {
          const K = k.replace(/^\//, "");
          y = A.dependencies[I[K]];
        }
        if (y.types.continuous)
          throw new Error(
            "Cannot call predict on this function as it may run forever. Use submit instead"
          );
        return new Promise((K, oe) => {
          const T = G(k, H, B);
          let C;
          T.on("data", (ee) => {
            Y && (T.destroy(), K(ee)), g = !0, C = ee;
          }).on("status", (ee) => {
            ee.stage === "error" && oe(ee), ee.stage === "complete" && (Y = !0, g && (T.destroy(), K(C)));
          });
        });
      }
      function G(k, H, B) {
        let g, Y;
        if (typeof k == "number")
          g = k, Y = X.unnamed_endpoints[g];
        else {
          const Fe = k.replace(/^\//, "");
          g = I[Fe], Y = X.named_endpoints[k.trim()];
        }
        if (typeof g != "number")
          throw new Error(
            "There is no endpoint matching that name of fn_index matching that number."
          );
        let y, K, oe = A.protocol ?? "sse";
        const T = typeof k == "number" ? "/predict" : k;
        let C, ee = null, $ = !1;
        const Ce = {};
        let Ye = "";
        typeof window < "u" && (Ye = new URLSearchParams(window.location.search).toString()), s(
          `${R}//${at(V, A.path, !0)}`,
          H,
          Y,
          c
        ).then((Fe) => {
          if (C = { data: Fe || [], event_data: B, fn_index: g }, Bs(g, A))
            re({
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
                session_hash: b
              },
              c
            ).then(([ae, de]) => {
              const ze = h ? Jn(
                ae.data,
                Y,
                A.root,
                A.root_url
              ) : ae.data;
              de == 200 ? (re({
                type: "data",
                endpoint: T,
                fn_index: g,
                data: ze,
                time: /* @__PURE__ */ new Date()
              }), re({
                type: "status",
                endpoint: T,
                fn_index: g,
                stage: "complete",
                eta: ae.average_duration,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              })) : re({
                type: "status",
                stage: "error",
                endpoint: T,
                fn_index: g,
                message: ae.error,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            }).catch((ae) => {
              re({
                type: "status",
                stage: "error",
                message: ae.message,
                endpoint: T,
                fn_index: g,
                queue: !1,
                time: /* @__PURE__ */ new Date()
              });
            });
          else if (oe == "ws") {
            re({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: T,
              fn_index: g,
              time: /* @__PURE__ */ new Date()
            });
            let ae = new URL(`${Q}://${at(
              V,
              A.path,
              !0
            )}
							/queue/join${Ye ? "?" + Ye : ""}`);
            x && ae.searchParams.set("__sign", x), y = e(ae), y.onclose = (de) => {
              de.wasClean || re({
                type: "status",
                stage: "error",
                broken: !0,
                message: Dt,
                queue: !0,
                endpoint: T,
                fn_index: g,
                time: /* @__PURE__ */ new Date()
              });
            }, y.onmessage = function(de) {
              const ze = JSON.parse(de.data), { type: We, status: ce, data: fe } = _l(
                ze,
                m[g]
              );
              if (We === "update" && ce && !$)
                re({
                  type: "status",
                  endpoint: T,
                  fn_index: g,
                  time: /* @__PURE__ */ new Date(),
                  ...ce
                }), ce.stage === "error" && y.close();
              else if (We === "hash") {
                y.send(JSON.stringify({ fn_index: g, session_hash: b }));
                return;
              } else
                We === "data" ? y.send(JSON.stringify({ ...C, session_hash: b })) : We === "complete" ? $ = ce : We === "log" ? re({
                  type: "log",
                  log: fe.log,
                  level: fe.level,
                  endpoint: T,
                  fn_index: g
                }) : We === "generating" && re({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...ce,
                  stage: ce == null ? void 0 : ce.stage,
                  queue: !0,
                  endpoint: T,
                  fn_index: g
                });
              fe && (re({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: h ? Jn(
                  fe.data,
                  Y,
                  A.root,
                  A.root_url
                ) : fe.data,
                endpoint: T,
                fn_index: g
              }), $ && (re({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...$,
                stage: ce == null ? void 0 : ce.stage,
                queue: !0,
                endpoint: T,
                fn_index: g
              }), y.close()));
            }, Gl(A.version || "2.0.0", "3.6") < 0 && addEventListener(
              "open",
              () => y.send(JSON.stringify({ hash: b }))
            );
          } else {
            re({
              type: "status",
              stage: "pending",
              queue: !0,
              endpoint: T,
              fn_index: g,
              time: /* @__PURE__ */ new Date()
            });
            var me = new URLSearchParams({
              fn_index: g.toString(),
              session_hash: b
            }).toString();
            let ae = new URL(
              `${R}//${at(
                V,
                A.path,
                !0
              )}/queue/join?${Ye ? Ye + "&" : ""}${me}`
            );
            K = new EventSource(ae), K.onmessage = async function(de) {
              const ze = JSON.parse(de.data), { type: We, status: ce, data: fe } = _l(
                ze,
                m[g]
              );
              if (We === "update" && ce && !$)
                re({
                  type: "status",
                  endpoint: T,
                  fn_index: g,
                  time: /* @__PURE__ */ new Date(),
                  ...ce
                }), ce.stage === "error" && K.close();
              else if (We === "data") {
                ee = ze.event_id;
                let [El, Wn] = await n(
                  `${R}//${at(
                    V,
                    A.path,
                    !0
                  )}/queue/data`,
                  {
                    ...C,
                    session_hash: b,
                    event_id: ee
                  },
                  c
                );
                Wn !== 200 && (re({
                  type: "status",
                  stage: "error",
                  message: Dt,
                  queue: !0,
                  endpoint: T,
                  fn_index: g,
                  time: /* @__PURE__ */ new Date()
                }), K.close());
              } else
                We === "complete" ? $ = ce : We === "log" ? re({
                  type: "log",
                  log: fe.log,
                  level: fe.level,
                  endpoint: T,
                  fn_index: g
                }) : We === "generating" && re({
                  type: "status",
                  time: /* @__PURE__ */ new Date(),
                  ...ce,
                  stage: ce == null ? void 0 : ce.stage,
                  queue: !0,
                  endpoint: T,
                  fn_index: g
                });
              fe && (re({
                type: "data",
                time: /* @__PURE__ */ new Date(),
                data: h ? Jn(
                  fe.data,
                  Y,
                  A.root,
                  A.root_url
                ) : fe.data,
                endpoint: T,
                fn_index: g
              }), $ && (re({
                type: "status",
                time: /* @__PURE__ */ new Date(),
                ...$,
                stage: ce == null ? void 0 : ce.stage,
                queue: !0,
                endpoint: T,
                fn_index: g
              }), K.close()));
            };
          }
        });
        function re(Fe) {
          const ae = Ce[Fe.type] || [];
          ae == null || ae.forEach((de) => de(Fe));
        }
        function Rt(Fe, me) {
          const ae = Ce, de = ae[Fe] || [];
          return ae[Fe] = de, de == null || de.push(me), { on: Rt, off: bt, cancel: Ht, destroy: xt };
        }
        function bt(Fe, me) {
          const ae = Ce;
          let de = ae[Fe] || [];
          return de = de == null ? void 0 : de.filter((ze) => ze !== me), ae[Fe] = de, { on: Rt, off: bt, cancel: Ht, destroy: xt };
        }
        async function Ht() {
          const Fe = {
            stage: "complete",
            queue: !1,
            time: /* @__PURE__ */ new Date()
          };
          $ = Fe, re({
            ...Fe,
            type: "status",
            endpoint: T,
            fn_index: g
          });
          let me = {};
          oe === "ws" ? (y && y.readyState === 0 ? y.addEventListener("open", () => {
            y.close();
          }) : y.close(), me = { fn_index: g, session_hash: b }) : (K.close(), me = { event_id: ee });
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
                body: JSON.stringify(me)
              }
            );
          } catch {
            console.warn(
              "The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
            );
          }
        }
        function xt() {
          for (const Fe in Ce)
            Ce[Fe].forEach((me) => {
              bt(Fe, me);
            });
        }
        return {
          on: Rt,
          off: bt,
          cancel: Ht,
          destroy: xt
        };
      }
      async function Be(k, H, B) {
        var g;
        const Y = { "Content-Type": "application/json" };
        c && (Y.Authorization = `Bearer ${c}`);
        let y, K = A.components.find(
          (C) => C.id === k
        );
        (g = K == null ? void 0 : K.props) != null && g.root_url ? y = K.props.root_url : y = `${R}//${at(
          V,
          A.path,
          !0
        )}/`;
        const oe = await t(
          `${y}component_server/`,
          {
            method: "POST",
            body: JSON.stringify({
              data: B,
              component_id: k,
              fn_name: H,
              session_hash: b
            }),
            headers: Y
          }
        );
        if (!oe.ok)
          throw new Error(
            "Could not connect to component server: " + oe.statusText
          );
        return await oe.json();
      }
      async function le(k) {
        if (X)
          return X;
        const H = { "Content-Type": "application/json" };
        c && (H.Authorization = `Bearer ${c}`);
        let B;
        if (Gl(k.version || "2.0.0", "3.30") < 0 ? B = await t(
          "https://gradio-space-api-fetcher-v2.hf.space/api",
          {
            method: "POST",
            body: JSON.stringify({
              serialize: !1,
              config: JSON.stringify(k)
            }),
            headers: H
          }
        ) : B = await t(`${k.root}/info`, {
          headers: H
        }), !B.ok)
          throw new Error(Dt);
        let g = await B.json();
        return "api" in g && (g = g.api), g.named_endpoints["/predict"] && !g.unnamed_endpoints[0] && (g.unnamed_endpoints[0] = g.named_endpoints["/predict"]), hs(g, k, I);
      }
    });
  }
  async function s(a, o, d, r) {
    const c = await qn(
      o,
      void 0,
      [],
      !0,
      d
    );
    return Promise.all(
      c.map(async ({ path: U, blob: F, type: h }) => {
        if (F) {
          const Q = (await l(a, [F], r)).files[0];
          return { path: U, file_url: Q, type: h, name: F == null ? void 0 : F.name };
        }
        return { path: U, type: h };
      })
    ).then((U) => (U.forEach(({ path: F, file_url: h, type: Q, name: R }) => {
      if (Q === "Gallery")
        Yl(o, h, F);
      else if (h) {
        const V = new It({ path: h, orig_name: R });
        Yl(o, V, F);
      }
    }), o));
  }
}
const { post_data: MU, upload_files: Fs, client: zU, handle_blob: jU } = Us(
  fetch,
  (...t) => new WebSocket(...t)
);
function Jn(t, e, n, l) {
  return t.map((i, s) => {
    var a, o, d, r;
    return ((o = (a = e == null ? void 0 : e.returns) == null ? void 0 : a[s]) == null ? void 0 : o.component) === "File" ? Bt(i, n, l) : ((r = (d = e == null ? void 0 : e.returns) == null ? void 0 : d[s]) == null ? void 0 : r.component) === "Gallery" ? i.map((c) => Array.isArray(c) ? [Bt(c[0], n, l), c[1]] : [Bt(c, n, l), null]) : typeof i == "object" && i.path ? Bt(i, n, l) : i;
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
function hs(t, e, n) {
  const l = {
    named_endpoints: {},
    unnamed_endpoints: {}
  };
  for (const i in t) {
    const s = t[i];
    for (const a in s) {
      const o = e.dependencies[a] ? a : n[a.replace("/", "")], d = s[a];
      l[i][a] = {}, l[i][a].parameters = {}, l[i][a].returns = {}, l[i][a].type = e.dependencies[o].types, l[i][a].parameters = d.parameters.map(
        ({ label: r, component: c, type: U, serializer: F }) => ({
          label: r,
          component: c,
          type: Xl(U, c, F, "parameter"),
          description: kl(U, F)
        })
      ), l[i][a].returns = d.returns.map(
        ({ label: r, component: c, type: U, serializer: F }) => ({
          label: r,
          component: c,
          type: Xl(U, c, F, "return"),
          description: kl(U, F)
        })
      );
    }
  }
  return l;
}
async function Qs(t, e) {
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
async function qn(t, e = void 0, n = [], l = !1, i = void 0) {
  if (Array.isArray(t)) {
    let s = [];
    return await Promise.all(
      t.map(async (a, o) => {
        var d;
        let r = n.slice();
        r.push(o);
        const c = await qn(
          t[o],
          l ? ((d = i == null ? void 0 : i.parameters[o]) == null ? void 0 : d.component) || void 0 : e,
          r,
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
          let o = n.slice();
          o.push(a), s = s.concat(
            await qn(
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
function Bs(t, e) {
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
async function $n(t, e, n) {
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
        $n(t, e, n);
      }, 1e3);
      break;
    case "PAUSED":
      n({
        status: "paused",
        load_status: "error",
        message: "This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
        detail: a,
        discussions_enabled: await Sl(o)
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
        $n(t, e, n);
      }, 1e3);
      break;
    default:
      n({
        status: "space_error",
        load_status: "error",
        message: "This space is experiencing an issue.",
        detail: a,
        discussions_enabled: await Sl(o)
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
          message: cs,
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
  SvelteComponent: us,
  assign: As,
  create_slot: Vs,
  detach: Zs,
  element: ms,
  get_all_dirty_from_scope: Rs,
  get_slot_changes: bs,
  get_spread_update: gs,
  init: Ws,
  insert: fs,
  safe_not_equal: ps,
  set_dynamic_element_data: wl,
  set_style: pe,
  toggle_class: et,
  transition_in: Li,
  transition_out: Pi,
  update_slot_base: Is
} = window.__gradio__svelte__internal;
function Js(t) {
  let e, n, l;
  const i = (
    /*#slots*/
    t[17].default
  ), s = Vs(
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
  for (let d = 0; d < a.length; d += 1)
    o = As(o, a[d]);
  return {
    c() {
      e = ms(
        /*tag*/
        t[14]
      ), s && s.c(), wl(
        /*tag*/
        t[14]
      )(e, o), et(
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
    m(d, r) {
      fs(d, e, r), s && s.m(e, null), l = !0;
    },
    p(d, r) {
      s && s.p && (!l || r & /*$$scope*/
      65536) && Is(
        s,
        i,
        d,
        /*$$scope*/
        d[16],
        l ? bs(
          i,
          /*$$scope*/
          d[16],
          r,
          null
        ) : Rs(
          /*$$scope*/
          d[16]
        ),
        null
      ), wl(
        /*tag*/
        d[14]
      )(e, o = gs(a, [
        (!l || r & /*test_id*/
        128) && { "data-testid": (
          /*test_id*/
          d[7]
        ) },
        (!l || r & /*elem_id*/
        4) && { id: (
          /*elem_id*/
          d[2]
        ) },
        (!l || r & /*elem_classes*/
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
      d[9]), r & /*height*/
      1 && pe(e, "height", typeof /*height*/
      d[0] == "number" ? (
        /*height*/
        d[0] + "px"
      ) : void 0), r & /*width*/
      2 && pe(e, "width", typeof /*width*/
      d[1] == "number" ? `calc(min(${/*width*/
      d[1]}px, 100%))` : void 0), r & /*variant*/
      16 && pe(
        e,
        "border-style",
        /*variant*/
        d[4]
      ), r & /*allow_overflow*/
      2048 && pe(
        e,
        "overflow",
        /*allow_overflow*/
        d[11] ? "visible" : "hidden"
      ), r & /*scale*/
      4096 && pe(
        e,
        "flex-grow",
        /*scale*/
        d[12]
      ), r & /*min_width*/
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
      d && Zs(e), s && s.d(d);
    }
  };
}
function Cs(t) {
  let e, n = (
    /*tag*/
    t[14] && Js(t)
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
function Ns(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e, { height: s = void 0 } = e, { width: a = void 0 } = e, { elem_id: o = "" } = e, { elem_classes: d = [] } = e, { variant: r = "solid" } = e, { border_mode: c = "base" } = e, { padding: U = !0 } = e, { type: F = "normal" } = e, { test_id: h = void 0 } = e, { explicit_call: Q = !1 } = e, { container: R = !0 } = e, { visible: V = !0 } = e, { allow_overflow: p = !0 } = e, { scale: b = null } = e, { min_width: m = 0 } = e, A = F === "fieldset" ? "fieldset" : "div";
  return t.$$set = (I) => {
    "height" in I && n(0, s = I.height), "width" in I && n(1, a = I.width), "elem_id" in I && n(2, o = I.elem_id), "elem_classes" in I && n(3, d = I.elem_classes), "variant" in I && n(4, r = I.variant), "border_mode" in I && n(5, c = I.border_mode), "padding" in I && n(6, U = I.padding), "type" in I && n(15, F = I.type), "test_id" in I && n(7, h = I.test_id), "explicit_call" in I && n(8, Q = I.explicit_call), "container" in I && n(9, R = I.container), "visible" in I && n(10, V = I.visible), "allow_overflow" in I && n(11, p = I.allow_overflow), "scale" in I && n(12, b = I.scale), "min_width" in I && n(13, m = I.min_width), "$$scope" in I && n(16, i = I.$$scope);
  }, [
    s,
    a,
    o,
    d,
    r,
    c,
    U,
    h,
    Q,
    R,
    V,
    p,
    b,
    m,
    A,
    F,
    i,
    l
  ];
}
class qi extends us {
  constructor(e) {
    super(), Ws(this, e, Ns, Cs, ps, {
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
  SvelteComponent: Es,
  append: Cn,
  attr: nn,
  create_component: ys,
  destroy_component: Gs,
  detach: Ss,
  element: vl,
  init: Xs,
  insert: ks,
  mount_component: Ys,
  safe_not_equal: Ts,
  set_data: _s,
  space: ws,
  text: vs,
  toggle_class: tt,
  transition_in: Hs,
  transition_out: xs
} = window.__gradio__svelte__internal;
function Ds(t) {
  let e, n, l, i, s, a;
  return l = new /*Icon*/
  t[1]({}), {
    c() {
      e = vl("label"), n = vl("span"), ys(l.$$.fragment), i = ws(), s = vs(
        /*label*/
        t[0]
      ), nn(n, "class", "svelte-9gxdi0"), nn(e, "for", ""), nn(e, "data-testid", "block-label"), nn(e, "class", "svelte-9gxdi0"), tt(e, "hide", !/*show_label*/
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
    m(o, d) {
      ks(o, e, d), Cn(e, n), Ys(l, n, null), Cn(e, i), Cn(e, s), a = !0;
    },
    p(o, [d]) {
      (!a || d & /*label*/
      1) && _s(
        s,
        /*label*/
        o[0]
      ), (!a || d & /*show_label*/
      4) && tt(e, "hide", !/*show_label*/
      o[2]), (!a || d & /*show_label*/
      4) && tt(e, "sr-only", !/*show_label*/
      o[2]), (!a || d & /*float*/
      16) && tt(
        e,
        "float",
        /*float*/
        o[4]
      ), (!a || d & /*disable*/
      8) && tt(
        e,
        "hide-label",
        /*disable*/
        o[3]
      );
    },
    i(o) {
      a || (Hs(l.$$.fragment, o), a = !0);
    },
    o(o) {
      xs(l.$$.fragment, o), a = !1;
    },
    d(o) {
      o && Ss(e), Gs(l);
    }
  };
}
function Ms(t, e, n) {
  let { label: l = null } = e, { Icon: i } = e, { show_label: s = !0 } = e, { disable: a = !1 } = e, { float: o = !0 } = e;
  return t.$$set = (d) => {
    "label" in d && n(0, l = d.label), "Icon" in d && n(1, i = d.Icon), "show_label" in d && n(2, s = d.show_label), "disable" in d && n(3, a = d.disable), "float" in d && n(4, o = d.float);
  }, [l, i, s, a, o];
}
class An extends Es {
  constructor(e) {
    super(), Xs(this, e, Ms, Ds, Ts, {
      label: 0,
      Icon: 1,
      show_label: 2,
      disable: 3,
      float: 4
    });
  }
}
const {
  SvelteComponent: zs,
  append: el,
  attr: ht,
  bubble: js,
  create_component: Ks,
  destroy_component: Os,
  detach: $i,
  element: tl,
  init: Ls,
  insert: ea,
  listen: Ps,
  mount_component: qs,
  safe_not_equal: $s,
  set_data: er,
  space: tr,
  text: nr,
  toggle_class: nt,
  transition_in: lr,
  transition_out: ir
} = window.__gradio__svelte__internal;
function Hl(t) {
  let e, n;
  return {
    c() {
      e = tl("span"), n = nr(
        /*label*/
        t[1]
      ), ht(e, "class", "svelte-xtz2g8");
    },
    m(l, i) {
      ea(l, e, i), el(e, n);
    },
    p(l, i) {
      i & /*label*/
      2 && er(
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
function ar(t) {
  let e, n, l, i, s, a, o, d = (
    /*show_label*/
    t[2] && Hl(t)
  );
  return i = new /*Icon*/
  t[0]({}), {
    c() {
      e = tl("button"), d && d.c(), n = tr(), l = tl("div"), Ks(i.$$.fragment), ht(l, "class", "svelte-xtz2g8"), nt(
        l,
        "small",
        /*size*/
        t[4] === "small"
      ), nt(
        l,
        "large",
        /*size*/
        t[4] === "large"
      ), ht(
        e,
        "aria-label",
        /*label*/
        t[1]
      ), ht(
        e,
        "title",
        /*label*/
        t[1]
      ), ht(e, "class", "svelte-xtz2g8"), nt(
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
    m(r, c) {
      ea(r, e, c), d && d.m(e, null), el(e, n), el(e, l), qs(i, l, null), s = !0, a || (o = Ps(
        e,
        "click",
        /*click_handler*/
        t[6]
      ), a = !0);
    },
    p(r, [c]) {
      /*show_label*/
      r[2] ? d ? d.p(r, c) : (d = Hl(r), d.c(), d.m(e, n)) : d && (d.d(1), d = null), (!s || c & /*size*/
      16) && nt(
        l,
        "small",
        /*size*/
        r[4] === "small"
      ), (!s || c & /*size*/
      16) && nt(
        l,
        "large",
        /*size*/
        r[4] === "large"
      ), (!s || c & /*label*/
      2) && ht(
        e,
        "aria-label",
        /*label*/
        r[1]
      ), (!s || c & /*label*/
      2) && ht(
        e,
        "title",
        /*label*/
        r[1]
      ), (!s || c & /*pending*/
      8) && nt(
        e,
        "pending",
        /*pending*/
        r[3]
      ), (!s || c & /*padded*/
      32) && nt(
        e,
        "padded",
        /*padded*/
        r[5]
      );
    },
    i(r) {
      s || (lr(i.$$.fragment, r), s = !0);
    },
    o(r) {
      ir(i.$$.fragment, r), s = !1;
    },
    d(r) {
      r && $i(e), d && d.d(), Os(i), a = !1, o();
    }
  };
}
function sr(t, e, n) {
  let { Icon: l } = e, { label: i = "" } = e, { show_label: s = !1 } = e, { pending: a = !1 } = e, { size: o = "small" } = e, { padded: d = !0 } = e;
  function r(c) {
    js.call(this, t, c);
  }
  return t.$$set = (c) => {
    "Icon" in c && n(0, l = c.Icon), "label" in c && n(1, i = c.label), "show_label" in c && n(2, s = c.show_label), "pending" in c && n(3, a = c.pending), "size" in c && n(4, o = c.size), "padded" in c && n(5, d = c.padded);
  }, [l, i, s, a, o, d, r];
}
class Vn extends zs {
  constructor(e) {
    super(), Ls(this, e, sr, ar, $s, {
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
  SvelteComponent: rr,
  append: or,
  attr: Nn,
  binding_callbacks: dr,
  create_slot: cr,
  detach: Ur,
  element: xl,
  get_all_dirty_from_scope: Fr,
  get_slot_changes: hr,
  init: Qr,
  insert: Br,
  safe_not_equal: ur,
  toggle_class: lt,
  transition_in: Ar,
  transition_out: Vr,
  update_slot_base: Zr
} = window.__gradio__svelte__internal;
function mr(t) {
  let e, n, l;
  const i = (
    /*#slots*/
    t[5].default
  ), s = cr(
    i,
    t,
    /*$$scope*/
    t[4],
    null
  );
  return {
    c() {
      e = xl("div"), n = xl("div"), s && s.c(), Nn(n, "class", "icon svelte-3w3rth"), Nn(e, "class", "empty svelte-3w3rth"), Nn(e, "aria-label", "Empty value"), lt(
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
    m(a, o) {
      Br(a, e, o), or(e, n), s && s.m(n, null), t[6](e), l = !0;
    },
    p(a, [o]) {
      s && s.p && (!l || o & /*$$scope*/
      16) && Zr(
        s,
        i,
        a,
        /*$$scope*/
        a[4],
        l ? hr(
          i,
          /*$$scope*/
          a[4],
          o,
          null
        ) : Fr(
          /*$$scope*/
          a[4]
        ),
        null
      ), (!l || o & /*size*/
      1) && lt(
        e,
        "small",
        /*size*/
        a[0] === "small"
      ), (!l || o & /*size*/
      1) && lt(
        e,
        "large",
        /*size*/
        a[0] === "large"
      ), (!l || o & /*unpadded_box*/
      2) && lt(
        e,
        "unpadded_box",
        /*unpadded_box*/
        a[1]
      ), (!l || o & /*parent_height*/
      8) && lt(
        e,
        "small_parent",
        /*parent_height*/
        a[3]
      );
    },
    i(a) {
      l || (Ar(s, a), l = !0);
    },
    o(a) {
      Vr(s, a), l = !1;
    },
    d(a) {
      a && Ur(e), s && s.d(a), t[6](null);
    }
  };
}
function Rr(t) {
  let e, n = t[0], l = 1;
  for (; l < t.length; ) {
    const i = t[l], s = t[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (e = n, n = s(n)) : (i === "call" || i === "optionalCall") && (n = s((...a) => n.call(e, ...a)), e = void 0);
  }
  return n;
}
function br(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { size: a = "small" } = e, { unpadded_box: o = !1 } = e, d;
  function r(U) {
    if (!U)
      return !1;
    const { height: F } = U.getBoundingClientRect(), { height: h } = Rr([
      U,
      "access",
      (Q) => Q.parentElement,
      "optionalAccess",
      (Q) => Q.getBoundingClientRect,
      "call",
      (Q) => Q()
    ]) || { height: F };
    return F > h + 2;
  }
  function c(U) {
    dr[U ? "unshift" : "push"](() => {
      d = U, n(2, d);
    });
  }
  return t.$$set = (U) => {
    "size" in U && n(0, a = U.size), "unpadded_box" in U && n(1, o = U.unpadded_box), "$$scope" in U && n(4, s = U.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty & /*el*/
    4 && n(3, l = r(d));
  }, [a, o, d, l, s, i, c];
}
class gr extends rr {
  constructor(e) {
    super(), Qr(this, e, br, mr, ur, { size: 0, unpadded_box: 1 });
  }
}
const {
  SvelteComponent: Wr,
  append: En,
  attr: _e,
  detach: fr,
  init: pr,
  insert: Ir,
  noop: yn,
  safe_not_equal: Jr,
  set_style: je,
  svg_element: ln
} = window.__gradio__svelte__internal;
function Cr(t) {
  let e, n, l, i;
  return {
    c() {
      e = ln("svg"), n = ln("g"), l = ln("path"), i = ln("path"), _e(l, "d", "M18,6L6.087,17.913"), je(l, "fill", "none"), je(l, "fill-rule", "nonzero"), je(l, "stroke-width", "2px"), _e(n, "transform", "matrix(1.14096,-0.140958,-0.140958,1.14096,-0.0559523,0.0559523)"), _e(i, "d", "M4.364,4.364L19.636,19.636"), je(i, "fill", "none"), je(i, "fill-rule", "nonzero"), je(i, "stroke-width", "2px"), _e(e, "width", "100%"), _e(e, "height", "100%"), _e(e, "viewBox", "0 0 24 24"), _e(e, "version", "1.1"), _e(e, "xmlns", "http://www.w3.org/2000/svg"), _e(e, "xmlns:xlink", "http://www.w3.org/1999/xlink"), _e(e, "xml:space", "preserve"), _e(e, "stroke", "currentColor"), je(e, "fill-rule", "evenodd"), je(e, "clip-rule", "evenodd"), je(e, "stroke-linecap", "round"), je(e, "stroke-linejoin", "round");
    },
    m(s, a) {
      Ir(s, e, a), En(e, n), En(n, l), En(e, i);
    },
    p: yn,
    i: yn,
    o: yn,
    d(s) {
      s && fr(e);
    }
  };
}
class Nr extends Wr {
  constructor(e) {
    super(), pr(this, e, null, Cr, Jr, {});
  }
}
const {
  SvelteComponent: Er,
  append: yr,
  attr: gt,
  detach: Gr,
  init: Sr,
  insert: Xr,
  noop: Gn,
  safe_not_equal: kr,
  svg_element: Dl
} = window.__gradio__svelte__internal;
function Yr(t) {
  let e, n;
  return {
    c() {
      e = Dl("svg"), n = Dl("path"), gt(n, "fill", "currentColor"), gt(n, "d", "M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z"), gt(e, "xmlns", "http://www.w3.org/2000/svg"), gt(e, "width", "100%"), gt(e, "height", "100%"), gt(e, "viewBox", "0 0 32 32");
    },
    m(l, i) {
      Xr(l, e, i), yr(e, n);
    },
    p: Gn,
    i: Gn,
    o: Gn,
    d(l) {
      l && Gr(e);
    }
  };
}
class Tr extends Er {
  constructor(e) {
    super(), Sr(this, e, null, Yr, kr, {});
  }
}
const {
  SvelteComponent: _r,
  append: wr,
  attr: we,
  detach: vr,
  init: Hr,
  insert: xr,
  noop: Sn,
  safe_not_equal: Dr,
  svg_element: Ml
} = window.__gradio__svelte__internal;
function Mr(t) {
  let e, n;
  return {
    c() {
      e = Ml("svg"), n = Ml("path"), we(n, "d", "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"), we(e, "xmlns", "http://www.w3.org/2000/svg"), we(e, "width", "100%"), we(e, "height", "100%"), we(e, "viewBox", "0 0 24 24"), we(e, "fill", "none"), we(e, "stroke", "currentColor"), we(e, "stroke-width", "1.5"), we(e, "stroke-linecap", "round"), we(e, "stroke-linejoin", "round"), we(e, "class", "feather feather-edit-2");
    },
    m(l, i) {
      xr(l, e, i), wr(e, n);
    },
    p: Sn,
    i: Sn,
    o: Sn,
    d(l) {
      l && vr(e);
    }
  };
}
class zr extends _r {
  constructor(e) {
    super(), Hr(this, e, null, Mr, Dr, {});
  }
}
const {
  SvelteComponent: jr,
  append: zl,
  attr: Ne,
  detach: Kr,
  init: Or,
  insert: Lr,
  noop: Xn,
  safe_not_equal: Pr,
  svg_element: kn
} = window.__gradio__svelte__internal;
function qr(t) {
  let e, n, l;
  return {
    c() {
      e = kn("svg"), n = kn("path"), l = kn("polyline"), Ne(n, "d", "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"), Ne(l, "points", "13 2 13 9 20 9"), Ne(e, "xmlns", "http://www.w3.org/2000/svg"), Ne(e, "width", "100%"), Ne(e, "height", "100%"), Ne(e, "viewBox", "0 0 24 24"), Ne(e, "fill", "none"), Ne(e, "stroke", "currentColor"), Ne(e, "stroke-width", "1.5"), Ne(e, "stroke-linecap", "round"), Ne(e, "stroke-linejoin", "round"), Ne(e, "class", "feather feather-file");
    },
    m(i, s) {
      Lr(i, e, s), zl(e, n), zl(e, l);
    },
    p: Xn,
    i: Xn,
    o: Xn,
    d(i) {
      i && Kr(e);
    }
  };
}
let Lt = class extends jr {
  constructor(e) {
    super(), Or(this, e, null, qr, Pr, {});
  }
};
const {
  SvelteComponent: $r,
  append: jl,
  attr: Ee,
  detach: eo,
  init: to,
  insert: no,
  noop: Yn,
  safe_not_equal: lo,
  svg_element: Tn
} = window.__gradio__svelte__internal;
function io(t) {
  let e, n, l;
  return {
    c() {
      e = Tn("svg"), n = Tn("polyline"), l = Tn("path"), Ee(n, "points", "1 4 1 10 7 10"), Ee(l, "d", "M3.51 15a9 9 0 1 0 2.13-9.36L1 10"), Ee(e, "xmlns", "http://www.w3.org/2000/svg"), Ee(e, "width", "100%"), Ee(e, "height", "100%"), Ee(e, "viewBox", "0 0 24 24"), Ee(e, "fill", "none"), Ee(e, "stroke", "currentColor"), Ee(e, "stroke-width", "2"), Ee(e, "stroke-linecap", "round"), Ee(e, "stroke-linejoin", "round"), Ee(e, "class", "feather feather-rotate-ccw");
    },
    m(i, s) {
      no(i, e, s), jl(e, n), jl(e, l);
    },
    p: Yn,
    i: Yn,
    o: Yn,
    d(i) {
      i && eo(e);
    }
  };
}
class ao extends $r {
  constructor(e) {
    super(), to(this, e, null, io, lo, {});
  }
}
const {
  SvelteComponent: so,
  append: _n,
  attr: Ve,
  detach: ro,
  init: oo,
  insert: co,
  noop: wn,
  safe_not_equal: Uo,
  svg_element: an
} = window.__gradio__svelte__internal;
function Fo(t) {
  let e, n, l, i;
  return {
    c() {
      e = an("svg"), n = an("path"), l = an("polyline"), i = an("line"), Ve(n, "d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), Ve(l, "points", "17 8 12 3 7 8"), Ve(i, "x1", "12"), Ve(i, "y1", "3"), Ve(i, "x2", "12"), Ve(i, "y2", "15"), Ve(e, "xmlns", "http://www.w3.org/2000/svg"), Ve(e, "width", "90%"), Ve(e, "height", "90%"), Ve(e, "viewBox", "0 0 24 24"), Ve(e, "fill", "none"), Ve(e, "stroke", "currentColor"), Ve(e, "stroke-width", "2"), Ve(e, "stroke-linecap", "round"), Ve(e, "stroke-linejoin", "round"), Ve(e, "class", "feather feather-upload");
    },
    m(s, a) {
      co(s, e, a), _n(e, n), _n(e, l), _n(e, i);
    },
    p: wn,
    i: wn,
    o: wn,
    d(s) {
      s && ro(e);
    }
  };
}
let ho = class extends so {
  constructor(e) {
    super(), oo(this, e, null, Fo, Uo, {});
  }
};
const Qo = [
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
Qo.reduce(
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
  SvelteComponent: Bo,
  append: ut,
  attr: nl,
  create_component: uo,
  destroy_component: Ao,
  detach: dn,
  element: ll,
  init: Vo,
  insert: cn,
  mount_component: Zo,
  safe_not_equal: mo,
  set_data: il,
  space: al,
  text: zt,
  toggle_class: Ol,
  transition_in: Ro,
  transition_out: bo
} = window.__gradio__svelte__internal;
function Ll(t) {
  let e, n, l = (
    /*i18n*/
    t[1]("common.or") + ""
  ), i, s, a, o = (
    /*message*/
    (t[2] || /*i18n*/
    t[1]("upload_text.click_to_upload")) + ""
  ), d;
  return {
    c() {
      e = ll("span"), n = zt("- "), i = zt(l), s = zt(" -"), a = al(), d = zt(o), nl(e, "class", "or svelte-kzcjhc");
    },
    m(r, c) {
      cn(r, e, c), ut(e, n), ut(e, i), ut(e, s), cn(r, a, c), cn(r, d, c);
    },
    p(r, c) {
      c & /*i18n*/
      2 && l !== (l = /*i18n*/
      r[1]("common.or") + "") && il(i, l), c & /*message, i18n*/
      6 && o !== (o = /*message*/
      (r[2] || /*i18n*/
      r[1]("upload_text.click_to_upload")) + "") && il(d, o);
    },
    d(r) {
      r && (dn(e), dn(a), dn(d));
    }
  };
}
function go(t) {
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
  ), a, o, d;
  l = new ho({});
  let r = (
    /*mode*/
    t[3] !== "short" && Ll(t)
  );
  return {
    c() {
      e = ll("div"), n = ll("span"), uo(l.$$.fragment), i = al(), a = zt(s), o = al(), r && r.c(), nl(n, "class", "icon-wrap svelte-kzcjhc"), Ol(
        n,
        "hovered",
        /*hovered*/
        t[4]
      ), nl(e, "class", "wrap svelte-kzcjhc");
    },
    m(c, U) {
      cn(c, e, U), ut(e, n), Zo(l, n, null), ut(e, i), ut(e, a), ut(e, o), r && r.m(e, null), d = !0;
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
      ) + "") && il(a, s), /*mode*/
      c[3] !== "short" ? r ? r.p(c, U) : (r = Ll(c), r.c(), r.m(e, null)) : r && (r.d(1), r = null);
    },
    i(c) {
      d || (Ro(l.$$.fragment, c), d = !0);
    },
    o(c) {
      bo(l.$$.fragment, c), d = !1;
    },
    d(c) {
      c && dn(e), Ao(l), r && r.d();
    }
  };
}
function Wo(t, e, n) {
  let { type: l = "file" } = e, { i18n: i } = e, { message: s = void 0 } = e, { mode: a = "full" } = e, { hovered: o = !1 } = e;
  const d = {
    image: "upload_text.drop_image",
    video: "upload_text.drop_video",
    audio: "upload_text.drop_audio",
    file: "upload_text.drop_file",
    csv: "upload_text.drop_csv"
  };
  return t.$$set = (r) => {
    "type" in r && n(0, l = r.type), "i18n" in r && n(1, i = r.i18n), "message" in r && n(2, s = r.message), "mode" in r && n(3, a = r.mode), "hovered" in r && n(4, o = r.hovered);
  }, [l, i, s, a, o, d];
}
class fo extends Bo {
  constructor(e) {
    super(), Vo(this, e, Wo, go, mo, {
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
class Qe {
  constructor(e = 0, n = 0, l = 0, i = 1) {
    this.x = e, this.y = n, this.z = l, this.w = i;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z && this.w === e.w;
  }
  normalize() {
    const e = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    return new Qe(this.x / e, this.y / e, this.z / e, this.w / e);
  }
  multiply(e) {
    const n = this.w, l = this.x, i = this.y, s = this.z, a = e.w, o = e.x, d = e.y, r = e.z;
    return new Qe(n * o + l * a + i * r - s * d, n * d - l * r + i * a + s * o, n * r + l * d - i * o + s * a, n * a - l * o - i * d - s * r);
  }
  inverse() {
    const e = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    return new Qe(-this.x / e, -this.y / e, -this.z / e, this.w / e);
  }
  apply(e) {
    const n = new Qe(e.x, e.y, e.z, 0), l = new Qe(-this.x, -this.y, -this.z, this.w), i = this.multiply(n).multiply(l);
    return new j(i.x, i.y, i.z);
  }
  flat() {
    return [this.x, this.y, this.z, this.w];
  }
  clone() {
    return new Qe(this.x, this.y, this.z, this.w);
  }
  static FromEuler(e) {
    const n = e.x / 2, l = e.y / 2, i = e.z / 2, s = Math.cos(l), a = Math.sin(l), o = Math.cos(n), d = Math.sin(n), r = Math.cos(i), c = Math.sin(i);
    return new Qe(s * d * r + a * o * c, a * o * r - s * d * c, s * o * c - a * d * r, s * o * r + a * d * c);
  }
  toEuler() {
    const e = 2 * (this.w * this.x + this.y * this.z), n = 1 - 2 * (this.x * this.x + this.y * this.y), l = Math.atan2(e, n);
    let i;
    const s = 2 * (this.w * this.y - this.z * this.x);
    i = Math.abs(s) >= 1 ? Math.sign(s) * Math.PI / 2 : Math.asin(s);
    const a = 2 * (this.w * this.z + this.x * this.y), o = 1 - 2 * (this.y * this.y + this.z * this.z), d = Math.atan2(a, o);
    return new j(l, i, d);
  }
  static FromMatrix3(e) {
    const n = e.buffer, l = n[0] + n[4] + n[8];
    let i, s, a, o;
    if (l > 0) {
      const d = 0.5 / Math.sqrt(l + 1);
      o = 0.25 / d, i = (n[7] - n[5]) * d, s = (n[2] - n[6]) * d, a = (n[3] - n[1]) * d;
    } else if (n[0] > n[4] && n[0] > n[8]) {
      const d = 2 * Math.sqrt(1 + n[0] - n[4] - n[8]);
      o = (n[7] - n[5]) / d, i = 0.25 * d, s = (n[1] + n[3]) / d, a = (n[2] + n[6]) / d;
    } else if (n[4] > n[8]) {
      const d = 2 * Math.sqrt(1 + n[4] - n[0] - n[8]);
      o = (n[2] - n[6]) / d, i = (n[1] + n[3]) / d, s = 0.25 * d, a = (n[5] + n[7]) / d;
    } else {
      const d = 2 * Math.sqrt(1 + n[8] - n[0] - n[4]);
      o = (n[3] - n[1]) / d, i = (n[2] + n[6]) / d, s = (n[5] + n[7]) / d, a = 0.25 * d;
    }
    return new Qe(i, s, a, o);
  }
  static FromAxisAngle(e, n) {
    const l = n / 2, i = Math.sin(l), s = Math.cos(l);
    return new Qe(e.x * i, e.y * i, e.z * i, s);
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
  constructor(e = 1, n = 0, l = 0, i = 0, s = 0, a = 1, o = 0, d = 0, r = 0, c = 0, U = 1, F = 0, h = 0, Q = 0, R = 0, V = 1) {
    this.buffer = [e, n, l, i, s, a, o, d, r, c, U, F, h, Q, R, V];
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
    const i = n.x, s = n.y, a = n.z, o = n.w, d = i + i, r = s + s, c = a + a, U = i * d, F = i * r, h = i * c, Q = s * r, R = s * c, V = a * c, p = o * d, b = o * r, m = o * c, A = l.x, I = l.y, x = l.z;
    return new Xe((1 - (Q + V)) * A, (F + m) * A, (h - b) * A, 0, (F - m) * I, (1 - (U + V)) * I, (R + p) * I, 0, (h + b) * x, (R - p) * x, (1 - (U + Q)) * x, 0, e.x, e.y, e.z, 1);
  }
  toString() {
    return `[${this.buffer.join(", ")}]`;
  }
}
class po extends Event {
  constructor(e) {
    super("objectAdded"), this.object = e;
  }
}
class Io extends Event {
  constructor(e) {
    super("objectRemoved"), this.object = e;
  }
}
class Jo extends Event {
  constructor(e) {
    super("objectChanged"), this.object = e;
  }
}
class na extends ta {
  constructor() {
    super(), this.positionChanged = !1, this.rotationChanged = !1, this.scaleChanged = !1, this._position = new j(), this._rotation = new Qe(), this._scale = new j(1, 1, 1), this._transform = new Xe(), this._changeEvent = new Jo(this), this.update = () => {
    }, this.applyPosition = () => {
      this.position = new j();
    }, this.applyRotation = () => {
      this.rotation = new Qe();
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
  constructor(e = 1, n = 0, l = 0, i = 0, s = 1, a = 0, o = 0, d = 0, r = 1) {
    this.buffer = [e, n, l, i, s, a, o, d, r];
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
    const n = Math.cos(e.x), l = Math.sin(e.x), i = Math.cos(e.y), s = Math.sin(e.y), a = Math.cos(e.z), o = Math.sin(e.z);
    return new Se(i * a + s * l * o, -i * o + s * l * a, s * n, n * o, n * a, -l, -s * a + i * l * o, s * o + i * l * a, i * n);
  }
  toString() {
    return `[${this.buffer.join(", ")}]`;
  }
}
class Ze {
  constructor(e = 0, n = null, l = null, i = null, s = null) {
    this.changed = !1, this.detached = !1, this._vertexCount = e, this._positions = n || new Float32Array(0), this._rotations = l || new Float32Array(0), this._scales = i || new Float32Array(0), this._colors = s || new Uint8Array(0), this._selection = new Uint8Array(this.vertexCount), this.translate = (a) => {
      for (let o = 0; o < this.vertexCount; o++)
        this.positions[3 * o + 0] += a.x, this.positions[3 * o + 1] += a.y, this.positions[3 * o + 2] += a.z;
      this.changed = !0;
    }, this.rotate = (a) => {
      const o = Se.RotationFromQuaternion(a).buffer;
      for (let d = 0; d < this.vertexCount; d++) {
        const r = this.positions[3 * d + 0], c = this.positions[3 * d + 1], U = this.positions[3 * d + 2];
        this.positions[3 * d + 0] = o[0] * r + o[1] * c + o[2] * U, this.positions[3 * d + 1] = o[3] * r + o[4] * c + o[5] * U, this.positions[3 * d + 2] = o[6] * r + o[7] * c + o[8] * U;
        const F = new Qe(this.rotations[4 * d + 1], this.rotations[4 * d + 2], this.rotations[4 * d + 3], this.rotations[4 * d + 0]), h = a.multiply(F);
        this.rotations[4 * d + 1] = h.x, this.rotations[4 * d + 2] = h.y, this.rotations[4 * d + 3] = h.z, this.rotations[4 * d + 0] = h.w;
      }
      this.changed = !0;
    }, this.scale = (a) => {
      for (let o = 0; o < this.vertexCount; o++)
        this.positions[3 * o + 0] *= a.x, this.positions[3 * o + 1] *= a.y, this.positions[3 * o + 2] *= a.z, this.scales[3 * o + 0] *= a.x, this.scales[3 * o + 1] *= a.y, this.scales[3 * o + 2] *= a.z;
      this.changed = !0;
    }, this.serialize = () => {
      const a = new Uint8Array(this.vertexCount * Ze.RowLength), o = new Float32Array(a.buffer), d = new Uint8Array(a.buffer);
      for (let r = 0; r < this.vertexCount; r++)
        o[8 * r + 0] = this.positions[3 * r + 0], o[8 * r + 1] = this.positions[3 * r + 1], o[8 * r + 2] = this.positions[3 * r + 2], d[32 * r + 24 + 0] = this.colors[4 * r + 0], d[32 * r + 24 + 1] = this.colors[4 * r + 1], d[32 * r + 24 + 2] = this.colors[4 * r + 2], d[32 * r + 24 + 3] = this.colors[4 * r + 3], o[8 * r + 3 + 0] = this.scales[3 * r + 0], o[8 * r + 3 + 1] = this.scales[3 * r + 1], o[8 * r + 3 + 2] = this.scales[3 * r + 2], d[32 * r + 28 + 0] = 128 * this.rotations[4 * r + 0] + 128 & 255, d[32 * r + 28 + 1] = 128 * this.rotations[4 * r + 1] + 128 & 255, d[32 * r + 28 + 2] = 128 * this.rotations[4 * r + 2] + 128 & 255, d[32 * r + 28 + 3] = 128 * this.rotations[4 * r + 3] + 128 & 255;
      return a;
    }, this.reattach = (a, o, d, r, c) => {
      console.assert(a.byteLength === 3 * this.vertexCount * 4, `Expected ${3 * this.vertexCount * 4} bytes, got ${a.byteLength} bytes`), this._positions = new Float32Array(a), this._rotations = new Float32Array(o), this._scales = new Float32Array(d), this._colors = new Uint8Array(r), this._selection = new Uint8Array(c), this.detached = !1;
    };
  }
  static Deserialize(e) {
    const n = e.length / Ze.RowLength, l = new Float32Array(3 * n), i = new Float32Array(4 * n), s = new Float32Array(3 * n), a = new Uint8Array(4 * n), o = new Float32Array(e.buffer), d = new Uint8Array(e.buffer);
    for (let r = 0; r < n; r++)
      l[3 * r + 0] = o[8 * r + 0], l[3 * r + 1] = o[8 * r + 1], l[3 * r + 2] = o[8 * r + 2], i[4 * r + 0] = (d[32 * r + 28 + 0] - 128) / 128, i[4 * r + 1] = (d[32 * r + 28 + 1] - 128) / 128, i[4 * r + 2] = (d[32 * r + 28 + 2] - 128) / 128, i[4 * r + 3] = (d[32 * r + 28 + 3] - 128) / 128, s[3 * r + 0] = o[8 * r + 3 + 0], s[3 * r + 1] = o[8 * r + 3 + 1], s[3 * r + 2] = o[8 * r + 3 + 2], a[4 * r + 0] = d[32 * r + 24 + 0], a[4 * r + 1] = d[32 * r + 24 + 1], a[4 * r + 2] = d[32 * r + 24 + 2], a[4 * r + 3] = d[32 * r + 24 + 3];
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
class At {
  static SplatToPLY(e, n) {
    let l = `ply
format binary_little_endian 1.0
`;
    l += `element vertex ${n}
`;
    const i = ["x", "y", "z", "nx", "ny", "nz", "f_dc_0", "f_dc_1", "f_dc_2"];
    for (let Q = 0; Q < 45; Q++)
      i.push(`f_rest_${Q}`);
    i.push("opacity"), i.push("scale_0"), i.push("scale_1"), i.push("scale_2"), i.push("rot_0"), i.push("rot_1"), i.push("rot_2"), i.push("rot_3");
    for (const Q of i)
      l += `property float ${Q}
`;
    l += `end_header
`;
    const s = new TextEncoder().encode(l), a = 248, o = n * a, d = new DataView(new ArrayBuffer(s.length + o));
    new Uint8Array(d.buffer).set(s, 0);
    const r = new Float32Array(e), c = new Uint8Array(e), U = s.length, F = 220, h = 232;
    for (let Q = 0; Q < n; Q++) {
      const R = r[8 * Q + 0], V = r[8 * Q + 1], p = r[8 * Q + 2], b = (c[32 * Q + 24 + 0] / 255 - 0.5) / this.SH_C0, m = (c[32 * Q + 24 + 1] / 255 - 0.5) / this.SH_C0, A = (c[32 * Q + 24 + 2] / 255 - 0.5) / this.SH_C0, I = c[32 * Q + 24 + 3] / 255, x = Math.log(I / (1 - I)), v = Math.log(r[8 * Q + 3 + 0]), X = Math.log(r[8 * Q + 3 + 1]), N = Math.log(r[8 * Q + 3 + 2]);
      let J = new Qe((c[32 * Q + 28 + 1] - 128) / 128, (c[32 * Q + 28 + 2] - 128) / 128, (c[32 * Q + 28 + 3] - 128) / 128, (c[32 * Q + 28 + 0] - 128) / 128);
      J = J.normalize();
      const G = J.w, Be = J.x, le = J.y, k = J.z;
      d.setFloat32(U + a * Q + 0, R, !0), d.setFloat32(U + a * Q + 4, V, !0), d.setFloat32(U + a * Q + 8, p, !0), d.setFloat32(U + a * Q + 24 + 0, b, !0), d.setFloat32(U + a * Q + 24 + 4, m, !0), d.setFloat32(U + a * Q + 24 + 8, A, !0), d.setFloat32(U + a * Q + 216, x, !0), d.setFloat32(U + a * Q + F + 0, v, !0), d.setFloat32(U + a * Q + F + 4, X, !0), d.setFloat32(U + a * Q + F + 8, N, !0), d.setFloat32(U + a * Q + h + 0, G, !0), d.setFloat32(U + a * Q + h + 4, Be, !0), d.setFloat32(U + a * Q + h + 8, le, !0), d.setFloat32(U + a * Q + h + 12, k, !0);
    }
    return d.buffer;
  }
}
At.SH_C0 = 0.28209479177387814;
class Je extends na {
  constructor(e = void 0) {
    super(), this.selectedChanged = !1, this._selected = !1, this._data = e || new Ze(), this.applyPosition = () => {
      this.data.translate(this.position), this.position = new j();
    }, this.applyRotation = () => {
      this.data.rotate(this.rotation), this.rotation = new Qe();
    }, this.applyScale = () => {
      this.data.scale(this.scale), this.scale = new j(1, 1, 1);
    };
  }
  saveToFile(e = null, n = null) {
    if (!document)
      return;
    if (n) {
      if (n !== "splat" && n !== "ply")
        throw new Error("Invalid format. Must be 'splat' or 'ply'");
    } else
      n = "splat";
    if (!e) {
      const a = /* @__PURE__ */ new Date();
      e = `splat-${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}.${n}`;
    }
    this.applyRotation(), this.applyScale(), this.applyPosition();
    const l = this.data.serialize();
    let i;
    if (n === "ply") {
      const a = At.SplatToPLY(l.buffer, this.data.vertexCount);
      i = new Blob([a], { type: "application/octet-stream" });
    } else
      i = new Blob([l.buffer], { type: "application/octet-stream" });
    const s = document.createElement("a");
    s.download = e, s.href = URL.createObjectURL(i), s.click();
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
class Co {
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
class Ie {
  constructor(e = 0, n = 0, l = 0, i = 0) {
    this.x = e, this.y = n, this.z = l, this.w = i;
  }
  equals(e) {
    return this.x === e.x && this.y === e.y && this.z === e.z && this.w === e.w;
  }
  add(e) {
    return typeof e == "number" ? new Ie(this.x + e, this.y + e, this.z + e, this.w + e) : new Ie(this.x + e.x, this.y + e.y, this.z + e.z, this.w + e.w);
  }
  subtract(e) {
    return typeof e == "number" ? new Ie(this.x - e, this.y - e, this.z - e, this.w - e) : new Ie(this.x - e.x, this.y - e.y, this.z - e.z, this.w - e.w);
  }
  multiply(e) {
    return typeof e == "number" ? new Ie(this.x * e, this.y * e, this.z * e, this.w * e) : e instanceof Ie ? new Ie(this.x * e.x, this.y * e.y, this.z * e.z, this.w * e.w) : new Ie(this.x * e.buffer[0] + this.y * e.buffer[4] + this.z * e.buffer[8] + this.w * e.buffer[12], this.x * e.buffer[1] + this.y * e.buffer[5] + this.z * e.buffer[9] + this.w * e.buffer[13], this.x * e.buffer[2] + this.y * e.buffer[6] + this.z * e.buffer[10] + this.w * e.buffer[14], this.x * e.buffer[3] + this.y * e.buffer[7] + this.z * e.buffer[11] + this.w * e.buffer[15]);
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lerp(e, n) {
    return new Ie(this.x + (e.x - this.x) * n, this.y + (e.y - this.y) * n, this.z + (e.z - this.z) * n, this.w + (e.w - this.w) * n);
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  distanceTo(e) {
    return Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2 + (this.z - e.z) ** 2 + (this.w - e.w) ** 2);
  }
  normalize() {
    const e = this.magnitude();
    return new Ie(this.x / e, this.y / e, this.z / e, this.w / e);
  }
  flat() {
    return [this.x, this.y, this.z, this.w];
  }
  clone() {
    return new Ie(this.x, this.y, this.z, this.w);
  }
  toString() {
    return `[${this.flat().join(", ")}]`;
  }
}
class la extends na {
  constructor(e = void 0) {
    super(), this._data = e || new Co(), this._position = new j(0, 0, -5), this.update = () => {
      this.data.update(this.position, this.rotation);
    }, this.screenPointToRay = (n, l) => {
      const i = new Ie(n, l, -1, 1), s = this._data.projectionMatrix.invert(), a = i.multiply(s), o = this._data.viewMatrix.invert(), d = a.multiply(o);
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
      this.objects.push(e), this.dispatchEvent(new po(e));
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
  saveToFile(e = null, n = null) {
    if (!document)
      return;
    if (n) {
      if (n !== "splat" && n !== "ply")
        throw new Error("Invalid format. Must be 'splat' or 'ply'");
    } else
      n = "splat";
    if (!e) {
      const r = /* @__PURE__ */ new Date();
      e = `scene-${r.getFullYear()}-${r.getMonth() + 1}-${r.getDate()}.${n}`;
    }
    const l = [];
    let i = 0;
    for (const r of this.objects)
      if (r.applyRotation(), r.applyScale(), r.applyPosition(), r instanceof Je) {
        const c = r.data.serialize();
        l.push(c), i += r.data.vertexCount;
      }
    const s = new Uint8Array(i * Ze.RowLength);
    let a, o = 0;
    for (const r of l)
      s.set(r, o), o += r.length;
    if (n === "ply") {
      const r = At.SplatToPLY(s.buffer, i);
      a = new Blob([r], { type: "application/octet-stream" });
    } else
      a = new Blob([s.buffer], { type: "application/octet-stream" });
    const d = document.createElement("a");
    d.download = e, d.href = URL.createObjectURL(a), d.click();
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
    const a = s.body.getReader(), o = parseInt(s.headers.get("content-length")), d = new Uint8Array(o);
    let r = 0;
    for (; ; ) {
      const { done: F, value: h } = await a.read();
      if (F)
        break;
      d.set(h, r), r += h.length, l == null || l(r / o);
    }
    const c = Ze.Deserialize(d), U = new Je(c);
    return n.addObject(U), U;
  }
  static async LoadFromFileAsync(e, n, l) {
    const i = new FileReader();
    let s = new Je();
    return i.onload = (a) => {
      const o = new Uint8Array(a.target.result), d = Ze.Deserialize(o);
      s = new Je(d), n.addObject(s);
    }, i.onprogress = (a) => {
      l == null || l(a.loaded / a.total);
    }, i.readAsArrayBuffer(e), await new Promise((a) => {
      i.onloadend = () => {
        a();
      };
    }), s;
  }
}
class sa {
  static async LoadAsync(e, n, l, i = "", s = !1) {
    const a = await fetch(e, { mode: "cors", credentials: "omit", cache: s ? "force-cache" : "default" });
    if (a.status != 200)
      throw new Error(a.status + " Unable to load " + a.url);
    const o = a.body.getReader(), d = parseInt(a.headers.get("content-length")), r = new Uint8Array(d);
    let c = 0;
    for (; ; ) {
      const { done: Q, value: R } = await o.read();
      if (Q)
        break;
      r.set(R, c), c += R.length, l == null || l(c / d);
    }
    if (r[0] !== 112 || r[1] !== 108 || r[2] !== 121 || r[3] !== 10)
      throw new Error("Invalid PLY file");
    const U = new Uint8Array(this._ParsePLYBuffer(r.buffer, i)), F = Ze.Deserialize(U), h = new Je(F);
    return n.addObject(h), h;
  }
  static async LoadFromFileAsync(e, n, l, i = "") {
    const s = new FileReader();
    let a = new Je();
    return s.onload = (o) => {
      const d = new Uint8Array(this._ParsePLYBuffer(o.target.result, i)), r = Ze.Deserialize(d);
      a = new Je(r), n.addObject(a);
    }, s.onprogress = (o) => {
      l == null || l(o.loaded / o.total);
    }, s.readAsArrayBuffer(e), await new Promise((o) => {
      s.onloadend = () => {
        o();
      };
    }), a;
  }
  static _ParsePLYBuffer(e, n) {
    const l = new Uint8Array(e), i = new TextDecoder().decode(l.slice(0, 10240)), s = `end_header
`, a = i.indexOf(s);
    if (a < 0)
      throw new Error("Unable to read .ply file header");
    const o = parseInt(/element vertex (\d+)\n/.exec(i)[1]);
    let d = 0;
    const r = { double: 8, int: 4, uint: 4, float: 4, short: 2, ushort: 2, uchar: 1 }, c = [];
    for (const Q of i.slice(0, a).split(`
`).filter((R) => R.startsWith("property "))) {
      const [R, V, p] = Q.split(" ");
      if (c.push({ name: p, type: V, offset: d }), !r[V])
        throw new Error(`Unsupported property type: ${V}`);
      d += r[V];
    }
    const U = new DataView(e, a + 11), F = new ArrayBuffer(Ze.RowLength * o), h = Qe.FromEuler(new j(Math.PI / 2, 0, 0));
    for (let Q = 0; Q < o; Q++) {
      const R = new Float32Array(F, Q * Ze.RowLength, 3), V = new Float32Array(F, Q * Ze.RowLength + 12, 3), p = new Uint8ClampedArray(F, Q * Ze.RowLength + 24, 4), b = new Uint8ClampedArray(F, Q * Ze.RowLength + 28, 4);
      let m = 255, A = 0, I = 0, x = 0;
      c.forEach((X) => {
        let N;
        switch (X.type) {
          case "float":
            N = U.getFloat32(X.offset + Q * d, !0);
            break;
          case "int":
            N = U.getInt32(X.offset + Q * d, !0);
            break;
          default:
            throw new Error(`Unsupported property type: ${X.type}`);
        }
        switch (X.name) {
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
            p[0] = N;
            break;
          case "green":
            p[1] = N;
            break;
          case "blue":
            p[2] = N;
            break;
          case "f_dc_0":
            p[0] = 255 * (0.5 + At.SH_C0 * N);
            break;
          case "f_dc_1":
            p[1] = 255 * (0.5 + At.SH_C0 * N);
            break;
          case "f_dc_2":
            p[2] = 255 * (0.5 + At.SH_C0 * N);
            break;
          case "f_dc_3":
            p[3] = 255 * (0.5 + At.SH_C0 * N);
            break;
          case "opacity":
            p[3] = 1 / (1 + Math.exp(-N)) * 255;
            break;
          case "rot_0":
            m = N;
            break;
          case "rot_1":
            A = N;
            break;
          case "rot_2":
            I = N;
            break;
          case "rot_3":
            x = N;
        }
      });
      let v = new Qe(A, I, x, m);
      switch (n) {
        case "polycam": {
          const X = R[1];
          R[1] = -R[2], R[2] = X, v = h.multiply(v);
          break;
        }
        case "":
          break;
        default:
          throw new Error(`Unsupported format: ${n}`);
      }
      v = v.normalize(), b[0] = 128 * v.w + 128, b[1] = 128 * v.x + 128, b[2] = 128 * v.y + 128, b[3] = 128 * v.z + 128;
    }
    return F;
  }
}
function No(t, e, n) {
  var l = e === void 0 ? null : e, i = function(d, r) {
    var c = atob(d);
    if (r) {
      for (var U = new Uint8Array(c.length), F = 0, h = c.length; F < h; ++F)
        U[F] = c.charCodeAt(F);
      return String.fromCharCode.apply(null, new Uint16Array(U.buffer));
    }
    return c;
  }(t, n !== void 0 && n), s = i.indexOf(`
`, 10) + 1, a = i.substring(s) + (l ? "//# sourceMappingURL=" + l : ""), o = new Blob([a], { type: "application/javascript" });
  return URL.createObjectURL(o);
}
function ra(t, e, n) {
  var l;
  return function(i) {
    return l = l || No(t, e, n), new Worker(l, i);
  };
}
var Eo = ra("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgdmFyIGxvYWRXYXNtID0gKCgpID0+IHsKICAgIAogICAgcmV0dXJuICgKICBmdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkgewoKICB2YXIgTW9kdWxlPW1vZHVsZUFyZzt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdDt9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkQmluYXJ5O3t7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZjt9aWYoc2NyaXB0RGlyZWN0b3J5LmluZGV4T2YoImJsb2I6IikhPT0wKXtzY3JpcHREaXJlY3Rvcnk9c2NyaXB0RGlyZWN0b3J5LnN1YnN0cigwLHNjcmlwdERpcmVjdG9yeS5yZXBsYWNlKC9bPyNdLiovLCIiKS5sYXN0SW5kZXhPZigiLyIpKzEpO31lbHNlIHtzY3JpcHREaXJlY3Rvcnk9IiI7fXt7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX07fX19TW9kdWxlWyJwcmludCJdfHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO3ZhciBlcnI9TW9kdWxlWyJwcmludEVyciJdfHxjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlNb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIik7fWZ1bmN0aW9uIGludEFycmF5RnJvbUJhc2U2NChzKXt2YXIgZGVjb2RlZD1hdG9iKHMpO3ZhciBieXRlcz1uZXcgVWludDhBcnJheShkZWNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkZWNvZGVkLmxlbmd0aDsrK2kpe2J5dGVzW2ldPWRlY29kZWQuY2hhckNvZGVBdChpKTt9cmV0dXJuIGJ5dGVzfWZ1bmN0aW9uIHRyeVBhcnNlQXNEYXRhVVJJKGZpbGVuYW1lKXtpZighaXNEYXRhVVJJKGZpbGVuYW1lKSl7cmV0dXJufXJldHVybiBpbnRBcnJheUZyb21CYXNlNjQoZmlsZW5hbWUuc2xpY2UoZGF0YVVSSVByZWZpeC5sZW5ndGgpKX12YXIgd2FzbU1lbW9yeTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7ZnVuY3Rpb24gdXBkYXRlTWVtb3J5Vmlld3MoKXt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjtNb2R1bGVbIkhFQVA4Il09SEVBUDg9bmV3IEludDhBcnJheShiKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVBVOCJdPUhFQVBVOD1uZXcgVWludDhBcnJheShiKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBGMzIiXT1IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGIpO312YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO2Z1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpO319Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTt9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKTt9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKTt9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pO31mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpO31mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYik7fWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKTt9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXT8uKHJ1bkRlcGVuZGVuY2llcyk7fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdPy4ocnVuRGVwZW5kZW5jaWVzKTtpZihydW5EZXBlbmRlbmNpZXM9PTApe2lmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpO319fWZ1bmN0aW9uIGFib3J0KHdoYXQpe01vZHVsZVsib25BYm9ydCJdPy4od2hhdCk7d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO3doYXQrPSIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uIjt2YXIgZT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKHdoYXQpO3JlYWR5UHJvbWlzZVJlamVjdChlKTt0aHJvdyBlfXZhciBkYXRhVVJJUHJlZml4PSJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsIjt2YXIgaXNEYXRhVVJJPWZpbGVuYW1lPT5maWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpO3ZhciB3YXNtQmluYXJ5RmlsZTt3YXNtQmluYXJ5RmlsZT0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LEFHRnpiUUVBQUFBQld3MWdCSDkvZjM4QVlBTi9mMzhBWUFWL2YzOS9md0JnQm45L2YzOS9md0JnQVg4QmYyQUJmd0JnQTM5L2Z3Ri9ZQUovZndCZ0FBQmdBbjkvQVg5Z0IzOS9mMzkvZjM4QVlBUi9mMzUrQUdBS2YzOS9mMzkvZjM5L2Z3QUNQUW9CWVFGaEFBRUJZUUZpQUFJQllRRmpBQUVCWVFGa0FBY0JZUUZsQUFFQllRRm1BQW9CWVFGbkFBUUJZUUZvQUFVQllRRnBBQUFCWVFGcUFBY0RHUmdHQkFVSUJRVUpDd2dCQUFFRUJBTURBZ0lBQUFrR0Jnd0VCUUZ3QVJBUUJRY0JBWUFDZ0lBQ0JnZ0Jmd0ZCc0o0RUN3Y1pCZ0ZyQWdBQmJBQU5BVzBBSVFGdUFRQUJid0FYQVhBQUR3a1ZBUUJCQVFzUEVoWU1EZzRnREI4WUdoME1HUnNjQ3FwT0dIRUJBWDhnQWtVRVFDQUFLQUlFSUFFb0FnUkdEd3NnQUNBQlJnUkFRUUVQQ3dKQUlBQW9BZ1FpQWkwQUFDSUFSU0FBSUFFb0FnUWlBUzBBQUNJRFIzSU5BQU5BSUFFdEFBRWhBeUFDTFFBQklnQkZEUUVnQVVFQmFpRUJJQUpCQVdvaEFpQUFJQU5HRFFBTEN5QUFJQU5HQzA4QkFuOUJxQm9vQWdBaUFTQUFRUWRxUVhoeElnSnFJUUFDUUNBQ1FRQWdBQ0FCVFJ0RkJFQWdBRDhBUVJCMFRRMEJJQUFRQmcwQkMwRzRHa0V3TmdJQVFYOFBDMEdvR2lBQU5nSUFJQUVMQmdBZ0FCQVBDeWtBUWJBYVFRRTJBZ0JCdEJwQkFEWUNBQkFTUWJRYVFhd2FLQUlBTmdJQVFhd2FRYkFhTmdJQUN3SUFDOUlMQVFkL0FrQWdBRVVOQUNBQVFRaHJJZ0lnQUVFRWF5Z0NBQ0lCUVhoeElnQnFJUVVDUUNBQlFRRnhEUUFnQVVFQ2NVVU5BU0FDSUFJb0FnQWlBV3NpQWtITUdpZ0NBRWtOQVNBQUlBRnFJUUFDUUFKQVFkQWFLQUlBSUFKSEJFQWdBVUgvQVUwRVFDQUJRUU4ySVFRZ0FpZ0NEQ0lCSUFJb0FnZ2lBMFlFUUVHOEdrRzhHaWdDQUVGK0lBUjNjVFlDQUF3RkN5QURJQUUyQWd3Z0FTQUROZ0lJREFRTElBSW9BaGdoQmlBQ0lBSW9BZ3dpQVVjRVFDQUNLQUlJSWdNZ0FUWUNEQ0FCSUFNMkFnZ01Bd3NnQWtFVWFpSUVLQUlBSWdORkJFQWdBaWdDRUNJRFJRMENJQUpCRUdvaEJBc0RRQ0FFSVFjZ0F5SUJRUlJxSWdRb0FnQWlBdzBBSUFGQkVHb2hCQ0FCS0FJUUlnTU5BQXNnQjBFQU5nSUFEQUlMSUFVb0FnUWlBVUVEY1VFRFJ3MENRY1FhSUFBMkFnQWdCU0FCUVg1eE5nSUVJQUlnQUVFQmNqWUNCQ0FGSUFBMkFnQVBDMEVBSVFFTElBWkZEUUFDUUNBQ0tBSWNJZ05CQW5SQjdCeHFJZ1FvQWdBZ0FrWUVRQ0FFSUFFMkFnQWdBUTBCUWNBYVFjQWFLQUlBUVg0Z0EzZHhOZ0lBREFJTElBWkJFRUVVSUFZb0FoQWdBa1liYWlBQk5nSUFJQUZGRFFFTElBRWdCallDR0NBQ0tBSVFJZ01FUUNBQklBTTJBaEFnQXlBQk5nSVlDeUFDS0FJVUlnTkZEUUFnQVNBRE5nSVVJQU1nQVRZQ0dBc2dBaUFGVHcwQUlBVW9BZ1FpQVVFQmNVVU5BQUpBQWtBQ1FBSkFJQUZCQW5GRkJFQkIxQm9vQWdBZ0JVWUVRRUhVR2lBQ05nSUFRY2dhUWNnYUtBSUFJQUJxSWdBMkFnQWdBaUFBUVFGeU5nSUVJQUpCMEJvb0FnQkhEUVpCeEJwQkFEWUNBRUhRR2tFQU5nSUFEd3RCMEJvb0FnQWdCVVlFUUVIUUdpQUNOZ0lBUWNRYVFjUWFLQUlBSUFCcUlnQTJBZ0FnQWlBQVFRRnlOZ0lFSUFBZ0Ftb2dBRFlDQUE4TElBRkJlSEVnQUdvaEFDQUJRZjhCVFFSQUlBRkJBM1loQkNBRktBSU1JZ0VnQlNnQ0NDSURSZ1JBUWJ3YVFid2FLQUlBUVg0Z0JIZHhOZ0lBREFVTElBTWdBVFlDRENBQklBTTJBZ2dNQkFzZ0JTZ0NHQ0VHSUFVZ0JTZ0NEQ0lCUndSQVFjd2FLQUlBR2lBRktBSUlJZ01nQVRZQ0RDQUJJQU0yQWdnTUF3c2dCVUVVYWlJRUtBSUFJZ05GQkVBZ0JTZ0NFQ0lEUlEwQ0lBVkJFR29oQkFzRFFDQUVJUWNnQXlJQlFSUnFJZ1FvQWdBaUF3MEFJQUZCRUdvaEJDQUJLQUlRSWdNTkFBc2dCMEVBTmdJQURBSUxJQVVnQVVGK2NUWUNCQ0FDSUFCQkFYSTJBZ1FnQUNBQ2FpQUFOZ0lBREFNTFFRQWhBUXNnQmtVTkFBSkFJQVVvQWh3aUEwRUNkRUhzSEdvaUJDZ0NBQ0FGUmdSQUlBUWdBVFlDQUNBQkRRRkJ3QnBCd0Jvb0FnQkJmaUFEZDNFMkFnQU1BZ3NnQmtFUVFSUWdCaWdDRUNBRlJodHFJQUUyQWdBZ0FVVU5BUXNnQVNBR05nSVlJQVVvQWhBaUF3UkFJQUVnQXpZQ0VDQURJQUUyQWhnTElBVW9BaFFpQTBVTkFDQUJJQU0yQWhRZ0F5QUJOZ0lZQ3lBQ0lBQkJBWEkyQWdRZ0FDQUNhaUFBTmdJQUlBSkIwQm9vQWdCSERRQkJ4Qm9nQURZQ0FBOExJQUJCL3dGTkJFQWdBRUY0Y1VIa0dtb2hBUUovUWJ3YUtBSUFJZ05CQVNBQVFRTjJkQ0lBY1VVRVFFRzhHaUFBSUFOeU5nSUFJQUVNQVFzZ0FTZ0NDQXNoQUNBQklBSTJBZ2dnQUNBQ05nSU1JQUlnQVRZQ0RDQUNJQUEyQWdnUEMwRWZJUU1nQUVILy8vOEhUUVJBSUFCQkppQUFRUWgyWnlJQmEzWkJBWEVnQVVFQmRHdEJQbW9oQXdzZ0FpQUROZ0ljSUFKQ0FEY0NFQ0FEUVFKMFFld2NhaUVCQWtBQ1FBSkFRY0FhS0FJQUlnUkJBU0FEZENJSGNVVUVRRUhBR2lBRUlBZHlOZ0lBSUFFZ0FqWUNBQ0FDSUFFMkFoZ01BUXNnQUVFWklBTkJBWFpyUVFBZ0EwRWZSeHQwSVFNZ0FTZ0NBQ0VCQTBBZ0FTSUVLQUlFUVhoeElBQkdEUUlnQTBFZGRpRUJJQU5CQVhRaEF5QUVJQUZCQkhGcUlnZEJFR29vQWdBaUFRMEFDeUFISUFJMkFoQWdBaUFFTmdJWUN5QUNJQUkyQWd3Z0FpQUNOZ0lJREFFTElBUW9BZ2dpQUNBQ05nSU1JQVFnQWpZQ0NDQUNRUUEyQWhnZ0FpQUVOZ0lNSUFJZ0FEWUNDQXRCM0JwQjNCb29BZ0JCQVdzaUFFRi9JQUFiTmdJQUN3c3BBUUYvSUFFRVFDQUFJUUlEUUNBQ1FRQTZBQUFnQWtFQmFpRUNJQUZCQVdzaUFRMEFDd3NnQUFzY0FDQUFJQUZCQ0NBQ3B5QUNRaUNJcHlBRHB5QURRaUNJcHhBRkM5NERBRUhjRjBHS0NSQUpRZWdYUWJrSVFRRkJBQkFJUWZRWFFiUUlRUUZCZ0g5Qi93QVFBVUdNR0VHdENFRUJRWUIvUWY4QUVBRkJnQmhCcXdoQkFVRUFRZjhCRUFGQm1CaEJpUWhCQWtHQWdINUIvLzhCRUFGQnBCaEJnQWhCQWtFQVFmLy9BeEFCUWJBWVFaZ0lRUVJCZ0lDQWdIaEIvLy8vL3djUUFVRzhHRUdQQ0VFRVFRQkJmeEFCUWNnWVFjY0lRUVJCZ0lDQWdIaEIvLy8vL3djUUFVSFVHRUcrQ0VFRVFRQkJmeEFCUWVBWVFhTUlRb0NBZ0lDQWdJQ0FnSDlDLy8vLy8vLy8vLy8vQUJBUlFld1lRYUlJUWdCQ2Z4QVJRZmdZUVp3SVFRUVFCRUdFR1VHRENVRUlFQVJCOUE1QjJRZ1FBMEc4RDBHSERSQURRWVFRUVFSQnpBZ1FBa0hRRUVFQ1FlVUlFQUpCbkJGQkJFSDBDQkFDUWJnUkVBZEI0QkZCQUVIQ0RCQUFRWWdTUVFCQnFBMFFBRUd3RWtFQlFlQU1FQUJCMkJKQkFrR1BDUkFBUVlBVFFRTkJyZ2tRQUVHb0UwRUVRZFlKRUFCQjBCTkJCVUh6Q1JBQVFmZ1RRUVJCelEwUUFFR2dGRUVGUWVzTkVBQkJpQkpCQUVIWkNoQUFRYkFTUVFGQnVBb1FBRUhZRWtFQ1Fac0xFQUJCZ0JOQkEwSDVDaEFBUWFnVFFRUkJvUXdRQUVIUUUwRUZRZjhMRUFCQnlCUkJDRUhlQ3hBQVFmQVVRUWxCdkFzUUFFR1lGVUVHUVprS0VBQkJ3QlZCQjBHU0RoQUFDeUFBQWtBZ0FDZ0NCQ0FCUncwQUlBQW9BaHhCQVVZTkFDQUFJQUkyQWh3TEM1b0JBQ0FBUVFFNkFEVUNRQ0FBS0FJRUlBSkhEUUFnQUVFQk9nQTBBa0FnQUNnQ0VDSUNSUVJBSUFCQkFUWUNKQ0FBSUFNMkFoZ2dBQ0FCTmdJUUlBTkJBVWNOQWlBQUtBSXdRUUZHRFFFTUFnc2dBU0FDUmdSQUlBQW9BaGdpQWtFQ1JnUkFJQUFnQXpZQ0dDQURJUUlMSUFBb0FqQkJBVWNOQWlBQ1FRRkdEUUVNQWdzZ0FDQUFLQUlrUVFGcU5nSWtDeUFBUVFFNkFEWUxDMTBCQVg4Z0FDZ0NFQ0lEUlFSQUlBQkJBVFlDSkNBQUlBSTJBaGdnQUNBQk5nSVFEd3NDUUNBQklBTkdCRUFnQUNnQ0dFRUNSdzBCSUFBZ0FqWUNHQThMSUFCQkFUb0FOaUFBUVFJMkFoZ2dBQ0FBS0FJa1FRRnFOZ0lrQ3dzRUFDQUFDOFluQVF4L0l3QkJFR3NpQ2lRQUFrQUNRQUpBQWtBQ1FBSkFBa0FDUUFKQUlBQkI5QUZOQkVCQnZCb29BZ0FpQmtFUUlBQkJDMnBCK0FOeElBQkJDMGtiSWdWQkEzWWlBSFlpQVVFRGNRUkFBa0FnQVVGL2MwRUJjU0FBYWlJQ1FRTjBJZ0ZCNUJwcUlnQWdBVUhzR21vb0FnQWlBU2dDQ0NJRFJnUkFRYndhSUFaQmZpQUNkM0UyQWdBTUFRc2dBeUFBTmdJTUlBQWdBellDQ0FzZ0FVRUlhaUVBSUFFZ0FrRURkQ0lDUVFOeU5nSUVJQUVnQW1vaUFTQUJLQUlFUVFGeU5nSUVEQW9MSUFWQnhCb29BZ0FpQjAwTkFTQUJCRUFDUUVFQ0lBQjBJZ0pCQUNBQ2EzSWdBU0FBZEhGb0lnRkJBM1FpQUVIa0dtb2lBaUFBUWV3YWFpZ0NBQ0lBS0FJSUlnTkdCRUJCdkJvZ0JrRitJQUYzY1NJR05nSUFEQUVMSUFNZ0FqWUNEQ0FDSUFNMkFnZ0xJQUFnQlVFRGNqWUNCQ0FBSUFWcUlnUWdBVUVEZENJQklBVnJJZ05CQVhJMkFnUWdBQ0FCYWlBRE5nSUFJQWNFUUNBSFFYaHhRZVFhYWlFQlFkQWFLQUlBSVFJQ2Z5QUdRUUVnQjBFRGRuUWlCWEZGQkVCQnZCb2dCU0FHY2pZQ0FDQUJEQUVMSUFFb0FnZ0xJUVVnQVNBQ05nSUlJQVVnQWpZQ0RDQUNJQUUyQWd3Z0FpQUZOZ0lJQ3lBQVFRaHFJUUJCMEJvZ0JEWUNBRUhFR2lBRE5nSUFEQW9MUWNBYUtBSUFJZ3RGRFFFZ0MyaEJBblJCN0J4cUtBSUFJZ0lvQWdSQmVIRWdCV3NoQkNBQ0lRRURRQUpBSUFFb0FoQWlBRVVFUUNBQktBSVVJZ0JGRFFFTElBQW9BZ1JCZUhFZ0JXc2lBU0FFSUFFZ0JFa2lBUnNoQkNBQUlBSWdBUnNoQWlBQUlRRU1BUXNMSUFJb0FoZ2hDU0FDSUFJb0Fnd2lBMGNFUUVITUdpZ0NBQm9nQWlnQ0NDSUFJQU0yQWd3Z0F5QUFOZ0lJREFrTElBSkJGR29pQVNnQ0FDSUFSUVJBSUFJb0FoQWlBRVVOQXlBQ1FSQnFJUUVMQTBBZ0FTRUlJQUFpQTBFVWFpSUJLQUlBSWdBTkFDQURRUkJxSVFFZ0F5Z0NFQ0lBRFFBTElBaEJBRFlDQUF3SUMwRi9JUVVnQUVHL2Ywc05BQ0FBUVF0cUlnQkJlSEVoQlVIQUdpZ0NBQ0lJUlEwQVFRQWdCV3NoQkFKQUFrQUNRQUovUVFBZ0JVR0FBa2tOQUJwQkh5QUZRZi8vL3dkTERRQWFJQVZCSmlBQVFRaDJaeUlBYTNaQkFYRWdBRUVCZEd0QlBtb0xJZ2RCQW5SQjdCeHFLQUlBSWdGRkJFQkJBQ0VBREFFTFFRQWhBQ0FGUVJrZ0IwRUJkbXRCQUNBSFFSOUhHM1FoQWdOQUFrQWdBU2dDQkVGNGNTQUZheUlHSUFSUERRQWdBU0VESUFZaUJBMEFRUUFoQkNBQklRQU1Bd3NnQUNBQktBSVVJZ1lnQmlBQklBSkJIWFpCQkhGcUtBSVFJZ0ZHR3lBQUlBWWJJUUFnQWtFQmRDRUNJQUVOQUFzTElBQWdBM0pGQkVCQkFDRURRUUlnQjNRaUFFRUFJQUJyY2lBSWNTSUFSUTBESUFCb1FRSjBRZXdjYWlnQ0FDRUFDeUFBUlEwQkN3TkFJQUFvQWdSQmVIRWdCV3NpQWlBRVNTRUJJQUlnQkNBQkd5RUVJQUFnQXlBQkd5RURJQUFvQWhBaUFRUi9JQUVGSUFBb0FoUUxJZ0FOQUFzTElBTkZEUUFnQkVIRUdpZ0NBQ0FGYTA4TkFDQURLQUlZSVFjZ0F5QURLQUlNSWdKSEJFQkJ6Qm9vQWdBYUlBTW9BZ2dpQUNBQ05nSU1JQUlnQURZQ0NBd0hDeUFEUVJScUlnRW9BZ0FpQUVVRVFDQURLQUlRSWdCRkRRTWdBMEVRYWlFQkN3TkFJQUVoQmlBQUlnSkJGR29pQVNnQ0FDSUFEUUFnQWtFUWFpRUJJQUlvQWhBaUFBMEFDeUFHUVFBMkFnQU1CZ3NnQlVIRUdpZ0NBQ0lEVFFSQVFkQWFLQUlBSVFBQ1FDQURJQVZySWdGQkVFOEVRQ0FBSUFWcUlnSWdBVUVCY2pZQ0JDQUFJQU5xSUFFMkFnQWdBQ0FGUVFOeU5nSUVEQUVMSUFBZ0EwRURjallDQkNBQUlBTnFJZ0VnQVNnQ0JFRUJjallDQkVFQUlRSkJBQ0VCQzBIRUdpQUJOZ0lBUWRBYUlBSTJBZ0FnQUVFSWFpRUFEQWdMSUFWQnlCb29BZ0FpQWtrRVFFSElHaUFDSUFWcklnRTJBZ0JCMUJwQjFCb29BZ0FpQUNBRmFpSUNOZ0lBSUFJZ0FVRUJjallDQkNBQUlBVkJBM0kyQWdRZ0FFRUlhaUVBREFnTFFRQWhBQ0FGUVM5cUlnUUNmMEdVSGlnQ0FBUkFRWndlS0FJQURBRUxRYUFlUW44M0FnQkJtQjVDZ0tDQWdJQ0FCRGNDQUVHVUhpQUtRUXhxUVhCeFFkaXExYW9GY3pZQ0FFR29Ia0VBTmdJQVFmZ2RRUUEyQWdCQmdDQUxJZ0ZxSWdaQkFDQUJheUlJY1NJQklBVk5EUWRCOUIwb0FnQWlBd1JBUWV3ZEtBSUFJZ2NnQVdvaUNTQUhUU0FESUFsSmNnMElDd0pBUWZnZExRQUFRUVJ4UlFSQUFrQUNRQUpBQWtCQjFCb29BZ0FpQXdSQVFmd2RJUUFEUUNBRElBQW9BZ0FpQjA4RVFDQUhJQUFvQWdScUlBTkxEUU1MSUFBb0FnZ2lBQTBBQ3d0QkFCQUxJZ0pCZjBZTkF5QUJJUVpCbUI0b0FnQWlBRUVCYXlJRElBSnhCRUFnQVNBQ2F5QUNJQU5xUVFBZ0FHdHhhaUVHQ3lBRklBWlBEUU5COUIwb0FnQWlBQVJBUWV3ZEtBSUFJZ01nQm1vaUNDQURUU0FBSUFoSmNnMEVDeUFHRUFzaUFDQUNSdzBCREFVTElBWWdBbXNnQ0hFaUJoQUxJZ0lnQUNnQ0FDQUFLQUlFYWtZTkFTQUNJUUFMSUFCQmYwWU5BU0FGUVRCcUlBWk5CRUFnQUNFQ0RBUUxRWndlS0FJQUlnSWdCQ0FHYTJwQkFDQUNhM0VpQWhBTFFYOUdEUUVnQWlBR2FpRUdJQUFoQWd3REN5QUNRWDlIRFFJTFFmZ2RRZmdkS0FJQVFRUnlOZ0lBQ3lBQkVBc2lBa0YvUmtFQUVBc2lBRUYvUm5JZ0FDQUNUWElOQlNBQUlBSnJJZ1lnQlVFb2FrME5CUXRCN0IxQjdCMG9BZ0FnQm1vaUFEWUNBRUh3SFNnQ0FDQUFTUVJBUWZBZElBQTJBZ0FMQWtCQjFCb29BZ0FpQkFSQVFmd2RJUUFEUUNBQ0lBQW9BZ0FpQVNBQUtBSUVJZ05xUmcwQ0lBQW9BZ2dpQUEwQUN3d0VDMEhNR2lnQ0FDSUFRUUFnQUNBQ1RSdEZCRUJCekJvZ0FqWUNBQXRCQUNFQVFZQWVJQVkyQWdCQi9CMGdBallDQUVIY0drRi9OZ0lBUWVBYVFaUWVLQUlBTmdJQVFZZ2VRUUEyQWdBRFFDQUFRUU4wSWdGQjdCcHFJQUZCNUJwcUlnTTJBZ0FnQVVId0dtb2dBellDQUNBQVFRRnFJZ0JCSUVjTkFBdEJ5Qm9nQmtFb2F5SUFRWGdnQW10QkIzRWlBV3NpQXpZQ0FFSFVHaUFCSUFKcUlnRTJBZ0FnQVNBRFFRRnlOZ0lFSUFBZ0FtcEJLRFlDQkVIWUdrR2tIaWdDQURZQ0FBd0VDeUFDSUFSTklBRWdCRXR5RFFJZ0FDZ0NERUVJY1EwQ0lBQWdBeUFHYWpZQ0JFSFVHaUFFUVhnZ0JHdEJCM0VpQUdvaUFUWUNBRUhJR2tISUdpZ0NBQ0FHYWlJQ0lBQnJJZ0EyQWdBZ0FTQUFRUUZ5TmdJRUlBSWdCR3BCS0RZQ0JFSFlHa0drSGlnQ0FEWUNBQXdEQzBFQUlRTU1CUXRCQUNFQ0RBTUxRY3dhS0FJQUlBSkxCRUJCekJvZ0FqWUNBQXNnQWlBR2FpRUJRZndkSVFBQ1FBSkFBa0FEUUNBQklBQW9BZ0JIQkVBZ0FDZ0NDQ0lBRFFFTUFnc0xJQUF0QUF4QkNIRkZEUUVMUWZ3ZElRQURRQUpBSUFRZ0FDZ0NBQ0lCVHdSQUlBRWdBQ2dDQkdvaUF5QUVTdzBCQ3lBQUtBSUlJUUFNQVFzTFFjZ2FJQVpCS0dzaUFFRjRJQUpyUVFkeElnRnJJZ2cyQWdCQjFCb2dBU0FDYWlJQk5nSUFJQUVnQ0VFQmNqWUNCQ0FBSUFKcVFTZzJBZ1JCMkJwQnBCNG9BZ0EyQWdBZ0JDQURRU2NnQTJ0QkIzRnFRUzlySWdBZ0FDQUVRUkJxU1JzaUFVRWJOZ0lFSUFGQmhCNHBBZ0EzQWhBZ0FVSDhIU2tDQURjQ0NFR0VIaUFCUVFocU5nSUFRWUFlSUFZMkFnQkIvQjBnQWpZQ0FFR0lIa0VBTmdJQUlBRkJHR29oQUFOQUlBQkJCellDQkNBQVFRaHFJUXdnQUVFRWFpRUFJQXdnQTBrTkFBc2dBU0FFUmcwQ0lBRWdBU2dDQkVGK2NUWUNCQ0FFSUFFZ0JHc2lBa0VCY2pZQ0JDQUJJQUkyQWdBZ0FrSC9BVTBFUUNBQ1FYaHhRZVFhYWlFQUFuOUJ2Qm9vQWdBaUFVRUJJQUpCQTNaMElnSnhSUVJBUWJ3YUlBRWdBbkkyQWdBZ0FBd0JDeUFBS0FJSUN5RUJJQUFnQkRZQ0NDQUJJQVEyQWd3Z0JDQUFOZ0lNSUFRZ0FUWUNDQXdEQzBFZklRQWdBa0gvLy84SFRRUkFJQUpCSmlBQ1FRaDJaeUlBYTNaQkFYRWdBRUVCZEd0QlBtb2hBQXNnQkNBQU5nSWNJQVJDQURjQ0VDQUFRUUowUWV3Y2FpRUJBa0JCd0Jvb0FnQWlBMEVCSUFCMElnWnhSUVJBUWNBYUlBTWdCbkkyQWdBZ0FTQUVOZ0lBREFFTElBSkJHU0FBUVFGMmEwRUFJQUJCSDBjYmRDRUFJQUVvQWdBaEF3TkFJQU1pQVNnQ0JFRjRjU0FDUmcwRElBQkJIWFloQXlBQVFRRjBJUUFnQVNBRFFRUnhhaUlHS0FJUUlnTU5BQXNnQmlBRU5nSVFDeUFFSUFFMkFoZ2dCQ0FFTmdJTUlBUWdCRFlDQ0F3Q0N5QUFJQUkyQWdBZ0FDQUFLQUlFSUFacU5nSUVJQUpCZUNBQ2EwRUhjV29pQnlBRlFRTnlOZ0lFSUFGQmVDQUJhMEVIY1dvaUJDQUZJQWRxSWdWcklRWUNRRUhVR2lnQ0FDQUVSZ1JBUWRRYUlBVTJBZ0JCeUJwQnlCb29BZ0FnQm1vaUFEWUNBQ0FGSUFCQkFYSTJBZ1FNQVF0QjBCb29BZ0FnQkVZRVFFSFFHaUFGTmdJQVFjUWFRY1FhS0FJQUlBWnFJZ0EyQWdBZ0JTQUFRUUZ5TmdJRUlBQWdCV29nQURZQ0FBd0JDeUFFS0FJRUlnSkJBM0ZCQVVZRVFDQUNRWGh4SVFrQ1FDQUNRZjhCVFFSQUlBUW9BZ3dpQUNBRUtBSUlJZ0ZHQkVCQnZCcEJ2Qm9vQWdCQmZpQUNRUU4yZDNFMkFnQU1BZ3NnQVNBQU5nSU1JQUFnQVRZQ0NBd0JDeUFFS0FJWUlRZ0NRQ0FFSUFRb0Fnd2lBRWNFUUVITUdpZ0NBQm9nQkNnQ0NDSUJJQUEyQWd3Z0FDQUJOZ0lJREFFTEFrQWdCRUVVYWlJQktBSUFJZ0pGQkVBZ0JDZ0NFQ0lDUlEwQklBUkJFR29oQVFzRFFDQUJJUU1nQWlJQVFSUnFJZ0VvQWdBaUFnMEFJQUJCRUdvaEFTQUFLQUlRSWdJTkFBc2dBMEVBTmdJQURBRUxRUUFoQUFzZ0NFVU5BQUpBSUFRb0Fod2lBVUVDZEVIc0hHb2lBaWdDQUNBRVJnUkFJQUlnQURZQ0FDQUFEUUZCd0JwQndCb29BZ0JCZmlBQmQzRTJBZ0FNQWdzZ0NFRVFRUlFnQ0NnQ0VDQUVSaHRxSUFBMkFnQWdBRVVOQVFzZ0FDQUlOZ0lZSUFRb0FoQWlBUVJBSUFBZ0FUWUNFQ0FCSUFBMkFoZ0xJQVFvQWhRaUFVVU5BQ0FBSUFFMkFoUWdBU0FBTmdJWUN5QUdJQWxxSVFZZ0JDQUphaUlFS0FJRUlRSUxJQVFnQWtGK2NUWUNCQ0FGSUFaQkFYSTJBZ1FnQlNBR2FpQUdOZ0lBSUFaQi93Rk5CRUFnQmtGNGNVSGtHbW9oQUFKL1Fid2FLQUlBSWdGQkFTQUdRUU4yZENJQ2NVVUVRRUc4R2lBQklBSnlOZ0lBSUFBTUFRc2dBQ2dDQ0FzaEFTQUFJQVUyQWdnZ0FTQUZOZ0lNSUFVZ0FEWUNEQ0FGSUFFMkFnZ01BUXRCSHlFQ0lBWkIvLy8vQjAwRVFDQUdRU1lnQmtFSWRtY2lBR3QyUVFGeElBQkJBWFJyUVQ1cUlRSUxJQVVnQWpZQ0hDQUZRZ0EzQWhBZ0FrRUNkRUhzSEdvaEFRSkFBa0JCd0Jvb0FnQWlBRUVCSUFKMElnTnhSUVJBUWNBYUlBQWdBM0kyQWdBZ0FTQUZOZ0lBREFFTElBWkJHU0FDUVFGMmEwRUFJQUpCSDBjYmRDRUNJQUVvQWdBaEFBTkFJQUFpQVNnQ0JFRjRjU0FHUmcwQ0lBSkJIWFloQUNBQ1FRRjBJUUlnQVNBQVFRUnhhaUlES0FJUUlnQU5BQXNnQXlBRk5nSVFDeUFGSUFFMkFoZ2dCU0FGTmdJTUlBVWdCVFlDQ0F3QkN5QUJLQUlJSWdBZ0JUWUNEQ0FCSUFVMkFnZ2dCVUVBTmdJWUlBVWdBVFlDRENBRklBQTJBZ2dMSUFkQkNHb2hBQXdGQ3lBQktBSUlJZ0FnQkRZQ0RDQUJJQVEyQWdnZ0JFRUFOZ0lZSUFRZ0FUWUNEQ0FFSUFBMkFnZ0xRY2dhS0FJQUlnQWdCVTBOQUVISUdpQUFJQVZySWdFMkFnQkIxQnBCMUJvb0FnQWlBQ0FGYWlJQ05nSUFJQUlnQVVFQmNqWUNCQ0FBSUFWQkEzSTJBZ1FnQUVFSWFpRUFEQU1MUWJnYVFUQTJBZ0JCQUNFQURBSUxBa0FnQjBVTkFBSkFJQU1vQWh3aUFFRUNkRUhzSEdvaUFTZ0NBQ0FEUmdSQUlBRWdBallDQUNBQ0RRRkJ3Qm9nQ0VGK0lBQjNjU0lJTmdJQURBSUxJQWRCRUVFVUlBY29BaEFnQTBZYmFpQUNOZ0lBSUFKRkRRRUxJQUlnQnpZQ0dDQURLQUlRSWdBRVFDQUNJQUEyQWhBZ0FDQUNOZ0lZQ3lBREtBSVVJZ0JGRFFBZ0FpQUFOZ0lVSUFBZ0FqWUNHQXNDUUNBRVFROU5CRUFnQXlBRUlBVnFJZ0JCQTNJMkFnUWdBQ0FEYWlJQUlBQW9BZ1JCQVhJMkFnUU1BUXNnQXlBRlFRTnlOZ0lFSUFNZ0JXb2lBaUFFUVFGeU5nSUVJQUlnQkdvZ0JEWUNBQ0FFUWY4QlRRUkFJQVJCZUhGQjVCcHFJUUFDZjBHOEdpZ0NBQ0lCUVFFZ0JFRURkblFpQlhGRkJFQkJ2Qm9nQVNBRmNqWUNBQ0FBREFFTElBQW9BZ2dMSVFFZ0FDQUNOZ0lJSUFFZ0FqWUNEQ0FDSUFBMkFnd2dBaUFCTmdJSURBRUxRUjhoQUNBRVFmLy8vd2ROQkVBZ0JFRW1JQVJCQ0habklnQnJka0VCY1NBQVFRRjBhMEUrYWlFQUN5QUNJQUEyQWh3Z0FrSUFOd0lRSUFCQkFuUkI3QnhxSVFFQ1FBSkFJQWhCQVNBQWRDSUZjVVVFUUVIQUdpQUZJQWh5TmdJQUlBRWdBallDQUF3QkN5QUVRUmtnQUVFQmRtdEJBQ0FBUVI5SEczUWhBQ0FCS0FJQUlRVURRQ0FGSWdFb0FnUkJlSEVnQkVZTkFpQUFRUjEySVFVZ0FFRUJkQ0VBSUFFZ0JVRUVjV29pQmlnQ0VDSUZEUUFMSUFZZ0FqWUNFQXNnQWlBQk5nSVlJQUlnQWpZQ0RDQUNJQUkyQWdnTUFRc2dBU2dDQ0NJQUlBSTJBZ3dnQVNBQ05nSUlJQUpCQURZQ0dDQUNJQUUyQWd3Z0FpQUFOZ0lJQ3lBRFFRaHFJUUFNQVFzQ1FDQUpSUTBBQWtBZ0FpZ0NIQ0lBUVFKMFFld2NhaUlCS0FJQUlBSkdCRUFnQVNBRE5nSUFJQU1OQVVIQUdpQUxRWDRnQUhkeE5nSUFEQUlMSUFsQkVFRVVJQWtvQWhBZ0FrWWJhaUFETmdJQUlBTkZEUUVMSUFNZ0NUWUNHQ0FDS0FJUUlnQUVRQ0FESUFBMkFoQWdBQ0FETmdJWUN5QUNLQUlVSWdCRkRRQWdBeUFBTmdJVUlBQWdBellDR0FzQ1FDQUVRUTlOQkVBZ0FpQUVJQVZxSWdCQkEzSTJBZ1FnQUNBQ2FpSUFJQUFvQWdSQkFYSTJBZ1FNQVFzZ0FpQUZRUU55TmdJRUlBSWdCV29pQXlBRVFRRnlOZ0lFSUFNZ0JHb2dCRFlDQUNBSEJFQWdCMEY0Y1VIa0dtb2hBRUhRR2lnQ0FDRUJBbjlCQVNBSFFRTjJkQ0lGSUFaeFJRUkFRYndhSUFVZ0JuSTJBZ0FnQUF3QkN5QUFLQUlJQ3lFRklBQWdBVFlDQ0NBRklBRTJBZ3dnQVNBQU5nSU1JQUVnQlRZQ0NBdEIwQm9nQXpZQ0FFSEVHaUFFTmdJQUN5QUNRUWhxSVFBTElBcEJFR29rQUNBQUN4b0FJQUFnQVNnQ0NDQUZFQW9FUUNBQklBSWdBeUFFRUJRTEN6Y0FJQUFnQVNnQ0NDQUZFQW9FUUNBQklBSWdBeUFFRUJRUEN5QUFLQUlJSWdBZ0FTQUNJQU1nQkNBRklBQW9BZ0FvQWhRUkF3QUxrUUVBSUFBZ0FTZ0NDQ0FFRUFvRVFDQUJJQUlnQXhBVER3c0NRQ0FBSUFFb0FnQWdCQkFLUlEwQUFrQWdBaUFCS0FJUVJ3UkFJQUVvQWhRZ0FrY05BUXNnQTBFQlJ3MEJJQUZCQVRZQ0lBOExJQUVnQWpZQ0ZDQUJJQU0yQWlBZ0FTQUJLQUlvUVFGcU5nSW9Ba0FnQVNnQ0pFRUJSdzBBSUFFb0FoaEJBa2NOQUNBQlFRRTZBRFlMSUFGQkJEWUNMQXNMOGdFQUlBQWdBU2dDQ0NBRUVBb0VRQ0FCSUFJZ0F4QVREd3NDUUNBQUlBRW9BZ0FnQkJBS0JFQUNRQ0FDSUFFb0FoQkhCRUFnQVNnQ0ZDQUNSdzBCQ3lBRFFRRkhEUUlnQVVFQk5nSWdEd3NnQVNBRE5nSWdBa0FnQVNnQ0xFRUVSZzBBSUFGQkFEc0JOQ0FBS0FJSUlnQWdBU0FDSUFKQkFTQUVJQUFvQWdBb0FoUVJBd0FnQVMwQU5RUkFJQUZCQXpZQ0xDQUJMUUEwUlEwQkRBTUxJQUZCQkRZQ0xBc2dBU0FDTmdJVUlBRWdBU2dDS0VFQmFqWUNLQ0FCS0FJa1FRRkhEUUVnQVNnQ0dFRUNSdzBCSUFGQkFUb0FOZzhMSUFBb0FnZ2lBQ0FCSUFJZ0F5QUVJQUFvQWdBb0FoZ1JBZ0FMQ3pFQUlBQWdBU2dDQ0VFQUVBb0VRQ0FCSUFJZ0F4QVZEd3NnQUNnQ0NDSUFJQUVnQWlBRElBQW9BZ0FvQWh3UkFBQUxHQUFnQUNBQktBSUlRUUFRQ2dSQUlBRWdBaUFERUJVTEM0QURBUVIvSXdCQjhBQnJJZ0lrQUNBQUtBSUFJZ05CQkdzb0FnQWhCQ0FEUVFocktBSUFJUVVnQWtJQU53SlFJQUpDQURjQ1dDQUNRZ0EzQW1BZ0FrSUFOd0JuSUFKQ0FEY0NTQ0FDUVFBMkFrUWdBa0hzRlRZQ1FDQUNJQUEyQWp3Z0FpQUJOZ0k0SUFBZ0JXb2hBd0pBSUFRZ0FVRUFFQW9FUUVFQUlBTWdCUnNoQUF3QkN5QUFJQU5PQkVBZ0FrSUFOd0F2SUFKQ0FEY0NHQ0FDUWdBM0FpQWdBa0lBTndJb0lBSkNBRGNDRUNBQ1FRQTJBZ3dnQWlBQk5nSUlJQUlnQURZQ0JDQUNJQVEyQWdBZ0FrRUJOZ0l3SUFRZ0FpQURJQU5CQVVFQUlBUW9BZ0FvQWhRUkF3QWdBaWdDR0EwQkMwRUFJUUFnQkNBQ1FUaHFJQU5CQVVFQUlBUW9BZ0FvQWhnUkFnQUNRQUpBSUFJb0Fsd09BZ0FCQWdzZ0FpZ0NURUVBSUFJb0FsaEJBVVliUVFBZ0FpZ0NWRUVCUmh0QkFDQUNLQUpnUVFGR0d5RUFEQUVMSUFJb0FsQkJBVWNFUUNBQ0tBSmdEUUVnQWlnQ1ZFRUJSdzBCSUFJb0FsaEJBVWNOQVFzZ0FpZ0NTQ0VBQ3lBQ1FmQUFhaVFBSUFBTG1nRUJBbjhqQUVGQWFpSURKQUFDZjBFQklBQWdBVUVBRUFvTkFCcEJBQ0FCUlEwQUdrRUFJQUZCbkJZUUhpSUJSUTBBR2lBRFFReHFRVFFRRUJvZ0EwRUJOZ0k0SUFOQmZ6WUNGQ0FESUFBMkFoQWdBeUFCTmdJSUlBRWdBMEVJYWlBQ0tBSUFRUUVnQVNnQ0FDZ0NIQkVBQUNBREtBSWdJZ0JCQVVZRVFDQUNJQU1vQWhnMkFnQUxJQUJCQVVZTElRUWdBMEZBYXlRQUlBUUxDZ0FnQUNBQlFRQVFDZ3VBQ2dJSWZ5SjlRZi8vLy84SElRNUJnSUNBZ0hnaEQwRi9JUW9EUUNBRElBeEdCRUJCQUNFQUlBbEJnSUFRRUJBaEFVTUFBSUJISUE4Z0RtdXlsU0VkQTBBZ0FDQURSZ1JBUVFBaEFDQUlRUUEyQWdBZ0FVRUVheUVCUVFBaERFRUJJUXNEUUNBTFFZQ0FCRVpGQkVBZ0NDQUxRUUowSWdKcUlBRWdBbW9vQWdBZ0RHb2lERFlDQUNBTFFRRnFJUXNNQVFzTEEwQWdBQ0FEUmtVRVFDQUlJQVlnQUVFQ2RHb29BZ0JCQW5ScUlnRWdBU2dDQUNJQlFRRnFOZ0lBSUFjZ0FVRUNkR29nQURZQ0FDQUFRUUZxSVFBTUFRc0xCUUovSUIwZ0JpQUFRUUowYWlJQ0tBSUFJQTVyczVRaUVrTUFBSUJQWFNBU1F3QUFBQUJnY1FSQUlCS3BEQUVMUVFBTElRc2dBaUFMTmdJQUlBRWdDMEVDZEdvaUFpQUNLQUlBUVFGcU5nSUFJQUJCQVdvaEFBd0JDd3NGSUFRZ0RFRU1iR29pQ3lvQ0FDRVNJQXNxQWdnaEhTQUxLZ0lFSVNFZ0NpQUNJQXhCQW5RaURXb29BZ0FpQzBjRVFDQUJJQXRCMEFCc2FpSUtLZ0k4SWhRZ0FDb0NQQ0lWbENBS0tnSTRJaFlnQUNvQ0xDSVlsQ0FLS2dJd0loa2dBQ29DRENJYWxDQUFLZ0ljSWg0Z0Npb0NOQ0lUbEpLU2tpRXBJQlFnQUNvQ09DSWZsQ0FXSUFBcUFpZ2lJSlFnR1NBQUtnSUlJaUtVSUFBcUFoZ2lJeUFUbEpLU2tpRXFJQlFnQUNvQ05DSWtsQ0FXSUFBcUFpUWlKWlFnR1NBQUtnSUVJaWFVSUFBcUFoUWlKeUFUbEpLU2tpRXJJQlFnQUNvQ01DSVVsQ0FXSUFBcUFpQWlGcFFnR1NBQUtnSUFJaG1VSUFBcUFoQWlLQ0FUbEpLU2tpRXNJQW9xQWl3aUV5QVZsQ0FLS2dJb0loY2dHSlFnQ2lvQ0lDSWJJQnFVSUI0Z0Npb0NKQ0ljbEpLU2tpRXRJQk1nSDVRZ0Z5QWdsQ0FiSUNLVUlDTWdISlNTa3BJaExpQVRJQ1NVSUJjZ0paUWdHeUFtbENBbklCeVVrcEtTSVM4Z0V5QVVsQ0FYSUJhVUlCc2dHWlFnS0NBY2xKS1NraUV3SUFvcUFod2lFeUFWbENBS0tnSVlJaGNnR0pRZ0Npb0NFQ0liSUJxVUlCNGdDaW9DRkNJY2xKS1NraUV4SUJNZ0g1UWdGeUFnbENBYklDS1VJQ01nSEpTU2twSWhNaUFUSUNTVUlCY2dKWlFnR3lBbWxDQW5JQnlVa3BLU0lUTWdFeUFVbENBWElCYVVJQnNnR1pRZ0tDQWNsSktTa2lFWElBb3FBZ3dpRXlBVmxDQUtLZ0lJSWhVZ0dKUWdDaW9DQUNJWUlCcVVJQW9xQWdRaUdpQWVsSktTa2lFZUlCTWdINVFnRlNBZ2xDQVlJQ0tVSUJvZ0k1U1NrcEloSHlBVElDU1VJQlVnSlpRZ0dDQW1sQ0FhSUNlVWtwS1NJU0FnRXlBVWxDQVZJQmFVSUJnZ0daUWdHaUFvbEpLU2tpRVdJQXNoQ2dzZ0JpQU5hZ0ovSUM0Z0haUWdIeUFTbENBaElES1VrcElnS3BKREFBQ0FSWlFpRkl0REFBQUFUMTBFUUNBVXFBd0JDMEdBZ0lDQWVBc2lDellDQUNBTElBNUtJUkFnQ3lBUFNDRVJRZjhCSVEwQ1FDQXRJQjJVSUI0Z0VwUWdJU0F4bEpLU0lDbVNJaFJEQUFBQUFGc05BQ0F3SUIyVUlCWWdFcFFnSVNBWGxKS1NJQ3lTSUJTVlF3QUFnRCtTUXdBQUFEK1VJaFZEQUFBQUFHQkZJQlZEQUFDQVAxMUZjZzBBSUM4Z0haUWdJQ0FTbENBaElET1VrcElnSzVJZ0ZKVkRBQUNBUDVKREFBQUFQNVFpRWtNQUFBQUFZRVVnRWtNQUFJQS9YVVZ5RFFBQ2Z5QVNRd0FBY0VHVUloSkRBQUNBVDEwZ0VrTUFBQUFBWUhFRVFDQVNxUXdCQzBFQUMwRVBiQ0VOQW44Z0ZVTUFBSEJCbENJU1F3QUFnRTlkSUJKREFBQUFBR0J4QkVBZ0Vxa01BUXRCQUFzZ0RXb2hEUXNnRGlBTElCQWJJUTRnRHlBTElCRWJJUThnQlNBTWFpQU5PZ0FBSUF4QkFXb2hEQXdCQ3dzTEM3Y1NBZ0JCZ0FnTHBoSjFibk5wWjI1bFpDQnphRzl5ZEFCMWJuTnBaMjVsWkNCcGJuUUFabXh2WVhRQWRXbHVkRFkwWDNRQWRXNXphV2R1WldRZ1kyaGhjZ0JpYjI5c0FIVnVjMmxuYm1Wa0lHeHZibWNBYzNSa09qcDNjM1J5YVc1bkFITjBaRG82YzNSeWFXNW5BSE4wWkRvNmRURTJjM1J5YVc1bkFITjBaRG82ZFRNeWMzUnlhVzVuQUdSdmRXSnNaUUIyYjJsa0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEhOb2IzSjBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eDFibk5wWjI1bFpDQnphRzl5ZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4YVc1MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4MWJuTnBaMjVsWkNCcGJuUStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BHWnNiMkYwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYVc1ME9GOTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eHBiblE0WDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEhWcGJuUXhObDkwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenhwYm5ReE5sOTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eDFhVzUwTmpSZmRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGFXNTBOalJmZEQ0QVpXMXpZM0pwY0hSbGJqbzZiV1Z0YjNKNVgzWnBaWGM4ZFdsdWRETXlYM1ErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQR2x1ZERNeVgzUStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BHTm9ZWEkrQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQSFZ1YzJsbmJtVmtJR05vWVhJK0FITjBaRG82WW1GemFXTmZjM1J5YVc1blBIVnVjMmxuYm1Wa0lHTm9ZWEkrQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQSE5wWjI1bFpDQmphR0Z5UGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenhzYjI1blBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4MWJuTnBaMjVsWkNCc2IyNW5QZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eGtiM1ZpYkdVK0FFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGxqVGxOZk1URmphR0Z5WDNSeVlXbDBjMGxqUlVWT1UxODVZV3hzYjJOaGRHOXlTV05GUlVWRkFBQUFBSlFNQUFBeUJ3QUFUbE4wTTE5Zk1qRXlZbUZ6YVdOZmMzUnlhVzVuU1doT1UxOHhNV05vWVhKZmRISmhhWFJ6U1doRlJVNVRYemxoYkd4dlkyRjBiM0pKYUVWRlJVVUFBSlFNQUFCOEJ3QUFUbE4wTTE5Zk1qRXlZbUZ6YVdOZmMzUnlhVzVuU1hkT1UxOHhNV05vWVhKZmRISmhhWFJ6U1hkRlJVNVRYemxoYkd4dlkyRjBiM0pKZDBWRlJVVUFBSlFNQUFERUJ3QUFUbE4wTTE5Zk1qRXlZbUZ6YVdOZmMzUnlhVzVuU1VSelRsTmZNVEZqYUdGeVgzUnlZV2wwYzBsRWMwVkZUbE5mT1dGc2JHOWpZWFJ2Y2tsRWMwVkZSVVVBQUFDVURBQUFEQWdBQUU1VGRETmZYekl4TW1KaGMybGpYM04wY21sdVowbEVhVTVUWHpFeFkyaGhjbDkwY21GcGRITkpSR2xGUlU1VFh6bGhiR3h2WTJGMGIzSkpSR2xGUlVWRkFBQUFsQXdBQUZnSUFBQk9NVEJsYlhOamNtbHdkR1Z1TTNaaGJFVUFBSlFNQUFDa0NBQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEpZMFZGQUFDVURBQUF3QWdBQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1dGRlJRQUFsQXdBQU9nSUFBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbG9SVVVBQUpRTUFBQVFDUUFBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKYzBWRkFBQ1VEQUFBT0FrQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NYUkZSUUFBbEF3QUFHQUpBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGxwUlVVQUFKUU1BQUNJQ1FBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSmFrVkZBQUNVREFBQXNBa0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTV3hGUlFBQWxBd0FBTmdKQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBsdFJVVUFBSlFNQUFBQUNnQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEplRVZGQUFDVURBQUFLQW9BQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1hsRlJRQUFsQXdBQUZBS0FBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbG1SVVVBQUpRTUFBQjRDZ0FBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKWkVWRkFBQ1VEQUFBb0FvQUFFNHhNRjlmWTNoNFlXSnBkakV4Tmw5ZmMyaHBiVjkwZVhCbFgybHVabTlGQUFBQUFMd01BQURJQ2dBQUlBMEFBRTR4TUY5ZlkzaDRZV0pwZGpFeE4xOWZZMnhoYzNOZmRIbHdaVjlwYm1adlJRQUFBTHdNQUFENENnQUE3QW9BQUU0eE1GOWZZM2g0WVdKcGRqRXhOMTlmY0dKaGMyVmZkSGx3WlY5cGJtWnZSUUFBQUx3TUFBQW9Dd0FBN0FvQUFFNHhNRjlmWTNoNFlXSnBkakV4T1Y5ZmNHOXBiblJsY2w5MGVYQmxYMmx1Wm05RkFMd01BQUJZQ3dBQVRBc0FBQUFBQUFETUN3QUFBZ0FBQUFNQUFBQUVBQUFBQlFBQUFBWUFBQUJPTVRCZlgyTjRlR0ZpYVhZeE1qTmZYMloxYm1SaGJXVnVkR0ZzWDNSNWNHVmZhVzVtYjBVQXZBd0FBS1FMQUFEc0NnQUFkZ0FBQUpBTEFBRFlDd0FBWWdBQUFKQUxBQURrQ3dBQVl3QUFBSkFMQUFEd0N3QUFhQUFBQUpBTEFBRDhDd0FBWVFBQUFKQUxBQUFJREFBQWN3QUFBSkFMQUFBVURBQUFkQUFBQUpBTEFBQWdEQUFBYVFBQUFKQUxBQUFzREFBQWFnQUFBSkFMQUFBNERBQUFiQUFBQUpBTEFBQkVEQUFBYlFBQUFKQUxBQUJRREFBQWVBQUFBSkFMQUFCY0RBQUFlUUFBQUpBTEFBQm9EQUFBWmdBQUFKQUxBQUIwREFBQVpBQUFBSkFMQUFDQURBQUFBQUFBQUJ3TEFBQUNBQUFBQndBQUFBUUFBQUFGQUFBQUNBQUFBQWtBQUFBS0FBQUFDd0FBQUFBQUFBQUVEUUFBQWdBQUFBd0FBQUFFQUFBQUJRQUFBQWdBQUFBTkFBQUFEZ0FBQUE4QUFBQk9NVEJmWDJONGVHRmlhWFl4TWpCZlgzTnBYMk5zWVhOelgzUjVjR1ZmYVc1bWIwVUFBQUFBdkF3QUFOd01BQUFjQ3dBQVUzUTVkSGx3WlY5cGJtWnZBQUFBQUpRTUFBQVFEUUJCcUJvTEF6QVBBUT09IjtpZighaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSl7d2FzbUJpbmFyeUZpbGU9bG9jYXRlRmlsZSh3YXNtQmluYXJ5RmlsZSk7fWZ1bmN0aW9uIGdldEJpbmFyeVN5bmMoZmlsZSl7aWYoZmlsZT09d2FzbUJpbmFyeUZpbGUmJndhc21CaW5hcnkpe3JldHVybiBuZXcgVWludDhBcnJheSh3YXNtQmluYXJ5KX12YXIgYmluYXJ5PXRyeVBhcnNlQXNEYXRhVVJJKGZpbGUpO2lmKGJpbmFyeSl7cmV0dXJuIGJpbmFyeX1pZihyZWFkQmluYXJ5KXtyZXR1cm4gcmVhZEJpbmFyeShmaWxlKX10aHJvdyAiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWQifWZ1bmN0aW9uIGdldEJpbmFyeVByb21pc2UoYmluYXJ5RmlsZSl7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9PmdldEJpbmFyeVN5bmMoYmluYXJ5RmlsZSkpfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIoYmluYXJ5RmlsZSxpbXBvcnRzLHJlY2VpdmVyKXtyZXR1cm4gZ2V0QmluYXJ5UHJvbWlzZShiaW5hcnlGaWxlKS50aGVuKGJpbmFyeT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LGltcG9ydHMpKS50aGVuKGluc3RhbmNlPT5pbnN0YW5jZSkudGhlbihyZWNlaXZlcixyZWFzb249PntlcnIoYGZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICR7cmVhc29ufWApO2Fib3J0KHJlYXNvbik7fSl9ZnVuY3Rpb24gaW5zdGFudGlhdGVBc3luYyhiaW5hcnksYmluYXJ5RmlsZSxpbXBvcnRzLGNhbGxiYWNrKXtyZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLGltcG9ydHMsY2FsbGJhY2spfWZ1bmN0aW9uIGNyZWF0ZVdhc20oKXt2YXIgaW5mbz17ImEiOndhc21JbXBvcnRzfTtmdW5jdGlvbiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UsbW9kdWxlKXt3YXNtRXhwb3J0cz1pbnN0YW5jZS5leHBvcnRzO3dhc21NZW1vcnk9d2FzbUV4cG9ydHNbImsiXTt1cGRhdGVNZW1vcnlWaWV3cygpO2FkZE9uSW5pdCh3YXNtRXhwb3J0c1sibCJdKTtyZW1vdmVSdW5EZXBlbmRlbmN5KCk7cmV0dXJuIHdhc21FeHBvcnRzfWFkZFJ1bkRlcGVuZGVuY3koKTtmdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpe3JlY2VpdmVJbnN0YW5jZShyZXN1bHRbImluc3RhbmNlIl0pO31pZihNb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKXt0cnl7cmV0dXJuIE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0oaW5mbyxyZWNlaXZlSW5zdGFuY2UpfWNhdGNoKGUpe2VycihgTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogJHtlfWApO3JlYWR5UHJvbWlzZVJlamVjdChlKTt9fWluc3RhbnRpYXRlQXN5bmMod2FzbUJpbmFyeSx3YXNtQmluYXJ5RmlsZSxpbmZvLHJlY2VpdmVJbnN0YW50aWF0aW9uUmVzdWx0KS5jYXRjaChyZWFkeVByb21pc2VSZWplY3QpO3JldHVybiB7fX12YXIgY2FsbFJ1bnRpbWVDYWxsYmFja3M9Y2FsbGJhY2tzPT57d2hpbGUoY2FsbGJhY2tzLmxlbmd0aD4wKXtjYWxsYmFja3Muc2hpZnQoKShNb2R1bGUpO319O01vZHVsZVsibm9FeGl0UnVudGltZSJdfHx0cnVlO3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQ9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e307dmFyIGVtYmluZF9pbml0X2NoYXJDb2Rlcz0oKT0+e3ZhciBjb2Rlcz1uZXcgQXJyYXkoMjU2KTtmb3IodmFyIGk9MDtpPDI1NjsrK2kpe2NvZGVzW2ldPVN0cmluZy5mcm9tQ2hhckNvZGUoaSk7fWVtYmluZF9jaGFyQ29kZXM9Y29kZXM7fTt2YXIgZW1iaW5kX2NoYXJDb2Rlczt2YXIgcmVhZExhdGluMVN0cmluZz1wdHI9Pnt2YXIgcmV0PSIiO3ZhciBjPXB0cjt3aGlsZShIRUFQVThbY10pe3JldCs9ZW1iaW5kX2NoYXJDb2Rlc1tIRUFQVThbYysrXV07fXJldHVybiByZXR9O3ZhciBhd2FpdGluZ0RlcGVuZGVuY2llcz17fTt2YXIgcmVnaXN0ZXJlZFR5cGVzPXt9O3ZhciBCaW5kaW5nRXJyb3I7dmFyIHRocm93QmluZGluZ0Vycm9yPW1lc3NhZ2U9Pnt0aHJvdyBuZXcgQmluZGluZ0Vycm9yKG1lc3NhZ2UpfTtmdW5jdGlvbiBzaGFyZWRSZWdpc3RlclR5cGUocmF3VHlwZSxyZWdpc3RlcmVkSW5zdGFuY2Usb3B0aW9ucz17fSl7dmFyIG5hbWU9cmVnaXN0ZXJlZEluc3RhbmNlLm5hbWU7aWYoIXJhd1R5cGUpe3Rocm93QmluZGluZ0Vycm9yKGB0eXBlICIke25hbWV9IiBtdXN0IGhhdmUgYSBwb3NpdGl2ZSBpbnRlZ2VyIHR5cGVpZCBwb2ludGVyYCk7fWlmKHJlZ2lzdGVyZWRUeXBlcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7aWYob3B0aW9ucy5pZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zKXtyZXR1cm59ZWxzZSB7dGhyb3dCaW5kaW5nRXJyb3IoYENhbm5vdCByZWdpc3RlciB0eXBlICcke25hbWV9JyB0d2ljZWApO319cmVnaXN0ZXJlZFR5cGVzW3Jhd1R5cGVdPXJlZ2lzdGVyZWRJbnN0YW5jZTtpZihhd2FpdGluZ0RlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eShyYXdUeXBlKSl7dmFyIGNhbGxiYWNrcz1hd2FpdGluZ0RlcGVuZGVuY2llc1tyYXdUeXBlXTtkZWxldGUgYXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07Y2FsbGJhY2tzLmZvckVhY2goY2I9PmNiKCkpO319ZnVuY3Rpb24gcmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe2lmKCEoImFyZ1BhY2tBZHZhbmNlImluIHJlZ2lzdGVyZWRJbnN0YW5jZSkpe3Rocm93IG5ldyBUeXBlRXJyb3IoInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2UiKX1yZXR1cm4gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnMpfXZhciBHZW5lcmljV2lyZVR5cGVTaXplPTg7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2w9KHJhd1R5cGUsbmFtZSx0cnVlVmFsdWUsZmFsc2VWYWx1ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmdW5jdGlvbih3dCl7cmV0dXJuICEhd3R9LCJ0b1dpcmVUeXBlIjpmdW5jdGlvbihkZXN0cnVjdG9ycyxvKXtyZXR1cm4gbz90cnVlVmFsdWU6ZmFsc2VWYWx1ZX0sImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBVOFtwb2ludGVyXSl9LGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTtjbGFzcyBIYW5kbGVBbGxvY2F0b3J7Y29uc3RydWN0b3IoKXt0aGlzLmFsbG9jYXRlZD1bdW5kZWZpbmVkXTt0aGlzLmZyZWVsaXN0PVtdO31nZXQoaWQpe3JldHVybiB0aGlzLmFsbG9jYXRlZFtpZF19aGFzKGlkKXtyZXR1cm4gdGhpcy5hbGxvY2F0ZWRbaWRdIT09dW5kZWZpbmVkfWFsbG9jYXRlKGhhbmRsZSl7dmFyIGlkPXRoaXMuZnJlZWxpc3QucG9wKCl8fHRoaXMuYWxsb2NhdGVkLmxlbmd0aDt0aGlzLmFsbG9jYXRlZFtpZF09aGFuZGxlO3JldHVybiBpZH1mcmVlKGlkKXt0aGlzLmFsbG9jYXRlZFtpZF09dW5kZWZpbmVkO3RoaXMuZnJlZWxpc3QucHVzaChpZCk7fX12YXIgZW12YWxfaGFuZGxlcz1uZXcgSGFuZGxlQWxsb2NhdG9yO3ZhciBfX2VtdmFsX2RlY3JlZj1oYW5kbGU9PntpZihoYW5kbGU+PWVtdmFsX2hhbmRsZXMucmVzZXJ2ZWQmJjA9PT0tLWVtdmFsX2hhbmRsZXMuZ2V0KGhhbmRsZSkucmVmY291bnQpe2VtdmFsX2hhbmRsZXMuZnJlZShoYW5kbGUpO319O3ZhciBjb3VudF9lbXZhbF9oYW5kbGVzPSgpPT57dmFyIGNvdW50PTA7Zm9yKHZhciBpPWVtdmFsX2hhbmRsZXMucmVzZXJ2ZWQ7aTxlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGg7KytpKXtpZihlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZFtpXSE9PXVuZGVmaW5lZCl7Kytjb3VudDt9fXJldHVybiBjb3VudH07dmFyIGluaXRfZW12YWw9KCk9PntlbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5wdXNoKHt2YWx1ZTp1bmRlZmluZWR9LHt2YWx1ZTpudWxsfSx7dmFsdWU6dHJ1ZX0se3ZhbHVlOmZhbHNlfSk7T2JqZWN0LmFzc2lnbihlbXZhbF9oYW5kbGVzLHtyZXNlcnZlZDplbXZhbF9oYW5kbGVzLmFsbG9jYXRlZC5sZW5ndGh9KSxNb2R1bGVbImNvdW50X2VtdmFsX2hhbmRsZXMiXT1jb3VudF9lbXZhbF9oYW5kbGVzO307dmFyIEVtdmFsPXt0b1ZhbHVlOmhhbmRsZT0+e2lmKCFoYW5kbGUpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSAiK2hhbmRsZSk7fXJldHVybiBlbXZhbF9oYW5kbGVzLmdldChoYW5kbGUpLnZhbHVlfSx0b0hhbmRsZTp2YWx1ZT0+e3N3aXRjaCh2YWx1ZSl7Y2FzZSB1bmRlZmluZWQ6cmV0dXJuIDE7Y2FzZSBudWxsOnJldHVybiAyO2Nhc2UgdHJ1ZTpyZXR1cm4gMztjYXNlIGZhbHNlOnJldHVybiA0O2RlZmF1bHQ6e3JldHVybiBlbXZhbF9oYW5kbGVzLmFsbG9jYXRlKHtyZWZjb3VudDoxLHZhbHVlOnZhbHVlfSl9fX19O2Z1bmN0aW9uIHNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQMzJbcG9pbnRlcj4+Ml0pfXZhciBFbVZhbFR5cGU9e25hbWU6ImVtc2NyaXB0ZW46OnZhbCIsImZyb21XaXJlVHlwZSI6aGFuZGxlPT57dmFyIHJ2PUVtdmFsLnRvVmFsdWUoaGFuZGxlKTtfX2VtdmFsX2RlY3JlZihoYW5kbGUpO3JldHVybiBydn0sInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PkVtdmFsLnRvSGFuZGxlKHZhbHVlKSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsPXJhd1R5cGU9PnJlZ2lzdGVyVHlwZShyYXdUeXBlLEVtVmFsVHlwZSk7dmFyIGZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXI9KG5hbWUsd2lkdGgpPT57c3dpdGNoKHdpZHRoKXtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQRjMyW3BvaW50ZXI+PjJdKX07Y2FzZSA4OnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEY2NFtwb2ludGVyPj4zXSl9O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBmbG9hdCB3aWR0aCAoJHt3aWR0aH0pOiAke25hbWV9YCl9fTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQ9KHJhd1R5cGUsbmFtZSxzaXplKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOnZhbHVlPT52YWx1ZSwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLHZhbHVlKT0+dmFsdWUsImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6ZmxvYXRSZWFkVmFsdWVGcm9tUG9pbnRlcihuYW1lLHNpemUpLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTt2YXIgaW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyPShuYW1lLHdpZHRoLHNpZ25lZCk9Pntzd2l0Y2god2lkdGgpe2Nhc2UgMTpyZXR1cm4gc2lnbmVkP3BvaW50ZXI9PkhFQVA4W3BvaW50ZXI+PjBdOnBvaW50ZXI9PkhFQVBVOFtwb2ludGVyPj4wXTtjYXNlIDI6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQMTZbcG9pbnRlcj4+MV06cG9pbnRlcj0+SEVBUFUxNltwb2ludGVyPj4xXTtjYXNlIDQ6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQMzJbcG9pbnRlcj4+Ml06cG9pbnRlcj0+SEVBUFUzMltwb2ludGVyPj4yXTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgaW50ZWdlciB3aWR0aCAoJHt3aWR0aH0pOiAke25hbWV9YCl9fTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcj0ocHJpbWl0aXZlVHlwZSxuYW1lLHNpemUsbWluUmFuZ2UsbWF4UmFuZ2UpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3ZhciBmcm9tV2lyZVR5cGU9dmFsdWU9PnZhbHVlO2lmKG1pblJhbmdlPT09MCl7dmFyIGJpdHNoaWZ0PTMyLTgqc2l6ZTtmcm9tV2lyZVR5cGU9dmFsdWU9PnZhbHVlPDxiaXRzaGlmdD4+PmJpdHNoaWZ0O312YXIgaXNVbnNpZ25lZFR5cGU9bmFtZS5pbmNsdWRlcygidW5zaWduZWQiKTt2YXIgY2hlY2tBc3NlcnRpb25zPSh2YWx1ZSx0b1R5cGVOYW1lKT0+e307dmFyIHRvV2lyZVR5cGU7aWYoaXNVbnNpZ25lZFR5cGUpe3RvV2lyZVR5cGU9ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsdmFsdWUpe2NoZWNrQXNzZXJ0aW9ucyh2YWx1ZSx0aGlzLm5hbWUpO3JldHVybiB2YWx1ZT4+PjB9O31lbHNlIHt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWV9O31yZWdpc3RlclR5cGUocHJpbWl0aXZlVHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiOmZyb21XaXJlVHlwZSwidG9XaXJlVHlwZSI6dG9XaXJlVHlwZSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjppbnRlZ2VyUmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaXplLG1pblJhbmdlIT09MCksZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9KTt9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldz0ocmF3VHlwZSxkYXRhVHlwZUluZGV4LG5hbWUpPT57dmFyIHR5cGVNYXBwaW5nPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheV07dmFyIFRBPXR5cGVNYXBwaW5nW2RhdGFUeXBlSW5kZXhdO2Z1bmN0aW9uIGRlY29kZU1lbW9yeVZpZXcoaGFuZGxlKXt2YXIgc2l6ZT1IRUFQVTMyW2hhbmRsZT4+Ml07dmFyIGRhdGE9SEVBUFUzMltoYW5kbGUrND4+Ml07cmV0dXJuIG5ldyBUQShIRUFQOC5idWZmZXIsZGF0YSxzaXplKX1uYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpkZWNvZGVNZW1vcnlWaWV3LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmRlY29kZU1lbW9yeVZpZXd9LHtpZ25vcmVEdXBsaWNhdGVSZWdpc3RyYXRpb25zOnRydWV9KTt9O2Z1bmN0aW9uIHJlYWRQb2ludGVyKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQVTMyW3BvaW50ZXI+PjJdKX12YXIgc3RyaW5nVG9VVEY4QXJyYXk9KHN0cixoZWFwLG91dElkeCxtYXhCeXRlc1RvV3JpdGUpPT57aWYoIShtYXhCeXRlc1RvV3JpdGU+MCkpcmV0dXJuIDA7dmFyIHN0YXJ0SWR4PW91dElkeDt2YXIgZW5kSWR4PW91dElkeCttYXhCeXRlc1RvV3JpdGUtMTtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgdT1zdHIuY2hhckNvZGVBdChpKTtpZih1Pj01NTI5NiYmdTw9NTczNDMpe3ZhciB1MT1zdHIuY2hhckNvZGVBdCgrK2kpO3U9NjU1MzYrKCh1JjEwMjMpPDwxMCl8dTEmMTAyMzt9aWYodTw9MTI3KXtpZihvdXRJZHg+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT11O31lbHNlIGlmKHU8PTIwNDcpe2lmKG91dElkeCsxPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MTkyfHU+PjY7aGVhcFtvdXRJZHgrK109MTI4fHUmNjM7fWVsc2UgaWYodTw9NjU1MzUpe2lmKG91dElkeCsyPj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109MjI0fHU+PjEyO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzO31lbHNlIHtpZihvdXRJZHgrMz49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTI0MHx1Pj4xODtoZWFwW291dElkeCsrXT0xMjh8dT4+MTImNjM7aGVhcFtvdXRJZHgrK109MTI4fHU+PjYmNjM7aGVhcFtvdXRJZHgrK109MTI4fHUmNjM7fX1oZWFwW291dElkeF09MDtyZXR1cm4gb3V0SWR4LXN0YXJ0SWR4fTt2YXIgc3RyaW5nVG9VVEY4PShzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk9PnN0cmluZ1RvVVRGOEFycmF5KHN0cixIRUFQVTgsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk7dmFyIGxlbmd0aEJ5dGVzVVRGOD1zdHI9Pnt2YXIgbGVuPTA7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGM9c3RyLmNoYXJDb2RlQXQoaSk7aWYoYzw9MTI3KXtsZW4rKzt9ZWxzZSBpZihjPD0yMDQ3KXtsZW4rPTI7fWVsc2UgaWYoYz49NTUyOTYmJmM8PTU3MzQzKXtsZW4rPTQ7KytpO31lbHNlIHtsZW4rPTM7fX1yZXR1cm4gbGVufTt2YXIgVVRGOERlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0ZjgiKTp1bmRlZmluZWQ7dmFyIFVURjhBcnJheVRvU3RyaW5nPShoZWFwT3JBcnJheSxpZHgsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGVuZElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQ7dmFyIGVuZFB0cj1pZHg7d2hpbGUoaGVhcE9yQXJyYXlbZW5kUHRyXSYmIShlbmRQdHI+PWVuZElkeCkpKytlbmRQdHI7aWYoZW5kUHRyLWlkeD4xNiYmaGVhcE9yQXJyYXkuYnVmZmVyJiZVVEY4RGVjb2Rlcil7cmV0dXJuIFVURjhEZWNvZGVyLmRlY29kZShoZWFwT3JBcnJheS5zdWJhcnJheShpZHgsZW5kUHRyKSl9dmFyIHN0cj0iIjt3aGlsZShpZHg8ZW5kUHRyKXt2YXIgdTA9aGVhcE9yQXJyYXlbaWR4KytdO2lmKCEodTAmMTI4KSl7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTtjb250aW51ZX12YXIgdTE9aGVhcE9yQXJyYXlbaWR4KytdJjYzO2lmKCh1MCYyMjQpPT0xOTIpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSgodTAmMzEpPDw2fHUxKTtjb250aW51ZX12YXIgdTI9aGVhcE9yQXJyYXlbaWR4KytdJjYzO2lmKCh1MCYyNDApPT0yMjQpe3UwPSh1MCYxNSk8PDEyfHUxPDw2fHUyO31lbHNlIHt1MD0odTAmNyk8PDE4fHUxPDwxMnx1Mjw8NnxoZWFwT3JBcnJheVtpZHgrK10mNjM7fWlmKHUwPDY1NTM2KXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodTApO31lbHNlIHt2YXIgY2g9dTAtNjU1MzY7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGNoPj4xMCw1NjMyMHxjaCYxMDIzKTt9fXJldHVybiBzdHJ9O3ZhciBVVEY4VG9TdHJpbmc9KHB0cixtYXhCeXRlc1RvUmVhZCk9PnB0cj9VVEY4QXJyYXlUb1N0cmluZyhIRUFQVTgscHRyLG1heEJ5dGVzVG9SZWFkKToiIjt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZz0ocmF3VHlwZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgc3RkU3RyaW5nSXNVVEY4PW5hbWU9PT0ic3RkOjpzdHJpbmciO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSIodmFsdWUpe3ZhciBsZW5ndGg9SEVBUFUzMlt2YWx1ZT4+Ml07dmFyIHBheWxvYWQ9dmFsdWUrNDt2YXIgc3RyO2lmKHN0ZFN0cmluZ0lzVVRGOCl7dmFyIGRlY29kZVN0YXJ0UHRyPXBheWxvYWQ7Zm9yKHZhciBpPTA7aTw9bGVuZ3RoOysraSl7dmFyIGN1cnJlbnRCeXRlUHRyPXBheWxvYWQraTtpZihpPT1sZW5ndGh8fEhFQVBVOFtjdXJyZW50Qnl0ZVB0cl09PTApe3ZhciBtYXhSZWFkPWN1cnJlbnRCeXRlUHRyLWRlY29kZVN0YXJ0UHRyO3ZhciBzdHJpbmdTZWdtZW50PVVURjhUb1N0cmluZyhkZWNvZGVTdGFydFB0cixtYXhSZWFkKTtpZihzdHI9PT11bmRlZmluZWQpe3N0cj1zdHJpbmdTZWdtZW50O31lbHNlIHtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50O31kZWNvZGVTdGFydFB0cj1jdXJyZW50Qnl0ZVB0cisxO319fWVsc2Uge3ZhciBhPW5ldyBBcnJheShsZW5ndGgpO2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7YVtpXT1TdHJpbmcuZnJvbUNoYXJDb2RlKEhFQVBVOFtwYXlsb2FkK2ldKTt9c3RyPWEuam9pbigiIik7fV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSIoZGVzdHJ1Y3RvcnMsdmFsdWUpe2lmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3ZhbHVlPW5ldyBVaW50OEFycmF5KHZhbHVlKTt9dmFyIGxlbmd0aDt2YXIgdmFsdWVJc09mVHlwZVN0cmluZz10eXBlb2YgdmFsdWU9PSJzdHJpbmciO2lmKCEodmFsdWVJc09mVHlwZVN0cmluZ3x8dmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHx2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4Q2xhbXBlZEFycmF5fHx2YWx1ZSBpbnN0YW5jZW9mIEludDhBcnJheSkpe3Rocm93QmluZGluZ0Vycm9yKCJDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIHN0ZDo6c3RyaW5nIik7fWlmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7bGVuZ3RoPWxlbmd0aEJ5dGVzVVRGOCh2YWx1ZSk7fWVsc2Uge2xlbmd0aD12YWx1ZS5sZW5ndGg7fXZhciBiYXNlPV9tYWxsb2MoNCtsZW5ndGgrMSk7dmFyIHB0cj1iYXNlKzQ7SEVBUFUzMltiYXNlPj4yXT1sZW5ndGg7aWYoc3RkU3RyaW5nSXNVVEY4JiZ2YWx1ZUlzT2ZUeXBlU3RyaW5nKXtzdHJpbmdUb1VURjgodmFsdWUscHRyLGxlbmd0aCsxKTt9ZWxzZSB7aWYodmFsdWVJc09mVHlwZVN0cmluZyl7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXt2YXIgY2hhckNvZGU9dmFsdWUuY2hhckNvZGVBdChpKTtpZihjaGFyQ29kZT4yNTUpe19mcmVlKHB0cik7dGhyb3dCaW5kaW5nRXJyb3IoIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0cyIpO31IRUFQVThbcHRyK2ldPWNoYXJDb2RlO319ZWxzZSB7Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXtIRUFQVThbcHRyK2ldPXZhbHVlW2ldO319fWlmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaChfZnJlZSxiYXNlKTt9cmV0dXJuIGJhc2V9LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnJlYWRQb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbihwdHIpe19mcmVlKHB0cik7fX0pO307dmFyIFVURjE2RGVjb2Rlcj10eXBlb2YgVGV4dERlY29kZXIhPSJ1bmRlZmluZWQiP25ldyBUZXh0RGVjb2RlcigidXRmLTE2bGUiKTp1bmRlZmluZWQ7dmFyIFVURjE2VG9TdHJpbmc9KHB0cixtYXhCeXRlc1RvUmVhZCk9Pnt2YXIgZW5kUHRyPXB0cjt2YXIgaWR4PWVuZFB0cj4+MTt2YXIgbWF4SWR4PWlkeCttYXhCeXRlc1RvUmVhZC8yO3doaWxlKCEoaWR4Pj1tYXhJZHgpJiZIRUFQVTE2W2lkeF0pKytpZHg7ZW5kUHRyPWlkeDw8MTtpZihlbmRQdHItcHRyPjMyJiZVVEYxNkRlY29kZXIpcmV0dXJuIFVURjE2RGVjb2Rlci5kZWNvZGUoSEVBUFU4LnN1YmFycmF5KHB0cixlbmRQdHIpKTt2YXIgc3RyPSIiO2Zvcih2YXIgaT0wOyEoaT49bWF4Qnl0ZXNUb1JlYWQvMik7KytpKXt2YXIgY29kZVVuaXQ9SEVBUDE2W3B0citpKjI+PjFdO2lmKGNvZGVVbml0PT0wKWJyZWFrO3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZShjb2RlVW5pdCk7fXJldHVybiBzdHJ9O3ZhciBzdHJpbmdUb1VURjE2PShzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk9PnttYXhCeXRlc1RvV3JpdGU/Pz0yMTQ3NDgzNjQ3O2lmKG1heEJ5dGVzVG9Xcml0ZTwyKXJldHVybiAwO21heEJ5dGVzVG9Xcml0ZS09Mjt2YXIgc3RhcnRQdHI9b3V0UHRyO3ZhciBudW1DaGFyc1RvV3JpdGU9bWF4Qnl0ZXNUb1dyaXRlPHN0ci5sZW5ndGgqMj9tYXhCeXRlc1RvV3JpdGUvMjpzdHIubGVuZ3RoO2Zvcih2YXIgaT0wO2k8bnVtQ2hhcnNUb1dyaXRlOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO0hFQVAxNltvdXRQdHI+PjFdPWNvZGVVbml0O291dFB0cis9Mjt9SEVBUDE2W291dFB0cj4+MV09MDtyZXR1cm4gb3V0UHRyLXN0YXJ0UHRyfTt2YXIgbGVuZ3RoQnl0ZXNVVEYxNj1zdHI9PnN0ci5sZW5ndGgqMjt2YXIgVVRGMzJUb1N0cmluZz0ocHRyLG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBpPTA7dmFyIHN0cj0iIjt3aGlsZSghKGk+PW1heEJ5dGVzVG9SZWFkLzQpKXt2YXIgdXRmMzI9SEVBUDMyW3B0citpKjQ+PjJdO2lmKHV0ZjMyPT0wKWJyZWFrOysraTtpZih1dGYzMj49NjU1MzYpe3ZhciBjaD11dGYzMi02NTUzNjtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8Y2g+PjEwLDU2MzIwfGNoJjEwMjMpO31lbHNlIHtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUodXRmMzIpO319cmV0dXJuIHN0cn07dmFyIHN0cmluZ1RvVVRGMzI9KHN0cixvdXRQdHIsbWF4Qnl0ZXNUb1dyaXRlKT0+e21heEJ5dGVzVG9Xcml0ZT8/PTIxNDc0ODM2NDc7aWYobWF4Qnl0ZXNUb1dyaXRlPDQpcmV0dXJuIDA7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgZW5kUHRyPXN0YXJ0UHRyK21heEJ5dGVzVG9Xcml0ZS00O2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0Myl7dmFyIHRyYWlsU3Vycm9nYXRlPXN0ci5jaGFyQ29kZUF0KCsraSk7Y29kZVVuaXQ9NjU1MzYrKChjb2RlVW5pdCYxMDIzKTw8MTApfHRyYWlsU3Vycm9nYXRlJjEwMjM7fUhFQVAzMltvdXRQdHI+PjJdPWNvZGVVbml0O291dFB0cis9NDtpZihvdXRQdHIrND5lbmRQdHIpYnJlYWt9SEVBUDMyW291dFB0cj4+Ml09MDtyZXR1cm4gb3V0UHRyLXN0YXJ0UHRyfTt2YXIgbGVuZ3RoQnl0ZXNVVEYzMj1zdHI9Pnt2YXIgbGVuPTA7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIGNvZGVVbml0PXN0ci5jaGFyQ29kZUF0KGkpO2lmKGNvZGVVbml0Pj01NTI5NiYmY29kZVVuaXQ8PTU3MzQzKSsraTtsZW4rPTQ7fXJldHVybiBsZW59O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZz0ocmF3VHlwZSxjaGFyU2l6ZSxuYW1lKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgZGVjb2RlU3RyaW5nLGVuY29kZVN0cmluZyxnZXRIZWFwLGxlbmd0aEJ5dGVzVVRGLHNoaWZ0O2lmKGNoYXJTaXplPT09Mil7ZGVjb2RlU3RyaW5nPVVURjE2VG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMTY7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYxNjtnZXRIZWFwPSgpPT5IRUFQVTE2O3NoaWZ0PTE7fWVsc2UgaWYoY2hhclNpemU9PT00KXtkZWNvZGVTdHJpbmc9VVRGMzJUb1N0cmluZztlbmNvZGVTdHJpbmc9c3RyaW5nVG9VVEYzMjtsZW5ndGhCeXRlc1VURj1sZW5ndGhCeXRlc1VURjMyO2dldEhlYXA9KCk9PkhFQVBVMzI7c2hpZnQ9Mjt9cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjp2YWx1ZT0+e3ZhciBsZW5ndGg9SEVBUFUzMlt2YWx1ZT4+Ml07dmFyIEhFQVA9Z2V0SGVhcCgpO3ZhciBzdHI7dmFyIGRlY29kZVN0YXJ0UHRyPXZhbHVlKzQ7Zm9yKHZhciBpPTA7aTw9bGVuZ3RoOysraSl7dmFyIGN1cnJlbnRCeXRlUHRyPXZhbHVlKzQraSpjaGFyU2l6ZTtpZihpPT1sZW5ndGh8fEhFQVBbY3VycmVudEJ5dGVQdHI+PnNoaWZ0XT09MCl7dmFyIG1heFJlYWRCeXRlcz1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1kZWNvZGVTdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZEJ5dGVzKTtpZihzdHI9PT11bmRlZmluZWQpe3N0cj1zdHJpbmdTZWdtZW50O31lbHNlIHtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCk7c3RyKz1zdHJpbmdTZWdtZW50O31kZWNvZGVTdGFydFB0cj1jdXJyZW50Qnl0ZVB0citjaGFyU2l6ZTt9fV9mcmVlKHZhbHVlKTtyZXR1cm4gc3RyfSwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLHZhbHVlKT0+e2lmKCEodHlwZW9mIHZhbHVlPT0ic3RyaW5nIikpe3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIEMrKyBzdHJpbmcgdHlwZSAke25hbWV9YCk7fXZhciBsZW5ndGg9bGVuZ3RoQnl0ZXNVVEYodmFsdWUpO3ZhciBwdHI9X21hbGxvYyg0K2xlbmd0aCtjaGFyU2l6ZSk7SEVBUFUzMltwdHI+PjJdPWxlbmd0aD4+c2hpZnQ7ZW5jb2RlU3RyaW5nKHZhbHVlLHB0cis0LGxlbmd0aCtjaGFyU2l6ZSk7aWYoZGVzdHJ1Y3RvcnMhPT1udWxsKXtkZXN0cnVjdG9ycy5wdXNoKF9mcmVlLHB0cik7fXJldHVybiBwdHJ9LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOnNpbXBsZVJlYWRWYWx1ZUZyb21Qb2ludGVyLGRlc3RydWN0b3JGdW5jdGlvbihwdHIpe19mcmVlKHB0cik7fX0pO307dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQ9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse2lzVm9pZDp0cnVlLG5hbWU6bmFtZSwiYXJnUGFja0FkdmFuY2UiOjAsImZyb21XaXJlVHlwZSI6KCk9PnVuZGVmaW5lZCwidG9XaXJlVHlwZSI6KGRlc3RydWN0b3JzLG8pPT51bmRlZmluZWR9KTt9O3ZhciBnZXRIZWFwTWF4PSgpPT4yMTQ3NDgzNjQ4O3ZhciBncm93TWVtb3J5PXNpemU9Pnt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjt2YXIgcGFnZXM9KHNpemUtYi5ieXRlTGVuZ3RoKzY1NTM1KS82NTUzNjt0cnl7d2FzbU1lbW9yeS5ncm93KHBhZ2VzKTt1cGRhdGVNZW1vcnlWaWV3cygpO3JldHVybiAxfWNhdGNoKGUpe319O3ZhciBfZW1zY3JpcHRlbl9yZXNpemVfaGVhcD1yZXF1ZXN0ZWRTaXplPT57dmFyIG9sZFNpemU9SEVBUFU4Lmxlbmd0aDtyZXF1ZXN0ZWRTaXplPj4+PTA7dmFyIG1heEhlYXBTaXplPWdldEhlYXBNYXgoKTtpZihyZXF1ZXN0ZWRTaXplPm1heEhlYXBTaXplKXtyZXR1cm4gZmFsc2V9dmFyIGFsaWduVXA9KHgsbXVsdGlwbGUpPT54KyhtdWx0aXBsZS14JW11bHRpcGxlKSVtdWx0aXBsZTtmb3IodmFyIGN1dERvd249MTtjdXREb3duPD00O2N1dERvd24qPTIpe3ZhciBvdmVyR3Jvd25IZWFwU2l6ZT1vbGRTaXplKigxKy4yL2N1dERvd24pO292ZXJHcm93bkhlYXBTaXplPU1hdGgubWluKG92ZXJHcm93bkhlYXBTaXplLHJlcXVlc3RlZFNpemUrMTAwNjYzMjk2KTt2YXIgbmV3U2l6ZT1NYXRoLm1pbihtYXhIZWFwU2l6ZSxhbGlnblVwKE1hdGgubWF4KHJlcXVlc3RlZFNpemUsb3Zlckdyb3duSGVhcFNpemUpLDY1NTM2KSk7dmFyIHJlcGxhY2VtZW50PWdyb3dNZW1vcnkobmV3U2l6ZSk7aWYocmVwbGFjZW1lbnQpe3JldHVybiB0cnVlfX1yZXR1cm4gZmFsc2V9O2VtYmluZF9pbml0X2NoYXJDb2RlcygpO0JpbmRpbmdFcnJvcj1Nb2R1bGVbIkJpbmRpbmdFcnJvciJdPWNsYXNzIEJpbmRpbmdFcnJvciBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKG1lc3NhZ2Upe3N1cGVyKG1lc3NhZ2UpO3RoaXMubmFtZT0iQmluZGluZ0Vycm9yIjt9fTtNb2R1bGVbIkludGVybmFsRXJyb3IiXT1jbGFzcyBJbnRlcm5hbEVycm9yIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3IobWVzc2FnZSl7c3VwZXIobWVzc2FnZSk7dGhpcy5uYW1lPSJJbnRlcm5hbEVycm9yIjt9fTtpbml0X2VtdmFsKCk7dmFyIHdhc21JbXBvcnRzPXtmOl9fZW1iaW5kX3JlZ2lzdGVyX2JpZ2ludCxpOl9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wsaDpfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbCxlOl9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0LGI6X19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcixhOl9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3LGQ6X19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZyxjOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nLGo6X19lbWJpbmRfcmVnaXN0ZXJfdm9pZCxnOl9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwfTt2YXIgd2FzbUV4cG9ydHM9Y3JlYXRlV2FzbSgpO01vZHVsZVsiX3NvcnQiXT0oYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTkpPT4oTW9kdWxlWyJfc29ydCJdPXdhc21FeHBvcnRzWyJtIl0pKGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5KTt2YXIgX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1hMD0+KF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09d2FzbUV4cG9ydHNbIm8iXSkoYTApO3ZhciBfZnJlZT1Nb2R1bGVbIl9mcmVlIl09YTA9PihfZnJlZT1Nb2R1bGVbIl9mcmVlIl09d2FzbUV4cG9ydHNbInAiXSkoYTApO3ZhciBjYWxsZWRSdW47ZGVwZW5kZW5jaWVzRnVsZmlsbGVkPWZ1bmN0aW9uIHJ1bkNhbGxlcigpe2lmKCFjYWxsZWRSdW4pcnVuKCk7aWYoIWNhbGxlZFJ1bilkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9cnVuQ2FsbGVyO307ZnVuY3Rpb24gcnVuKCl7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1wcmVSdW4oKTtpZihydW5EZXBlbmRlbmNpZXM+MCl7cmV0dXJufWZ1bmN0aW9uIGRvUnVuKCl7aWYoY2FsbGVkUnVuKXJldHVybjtjYWxsZWRSdW49dHJ1ZTtNb2R1bGVbImNhbGxlZFJ1biJdPXRydWU7aWYoQUJPUlQpcmV0dXJuO2luaXRSdW50aW1lKCk7cmVhZHlQcm9taXNlUmVzb2x2ZShNb2R1bGUpO2lmKE1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSlNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0oKTtwb3N0UnVuKCk7fWlmKE1vZHVsZVsic2V0U3RhdHVzIl0pe01vZHVsZVsic2V0U3RhdHVzIl0oIlJ1bm5pbmcuLi4iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe01vZHVsZVsic2V0U3RhdHVzIl0oIiIpO30sMSk7ZG9SdW4oKTt9LDEpO31lbHNlIHtkb1J1bigpO319aWYoTW9kdWxlWyJwcmVJbml0Il0pe2lmKHR5cGVvZiBNb2R1bGVbInByZUluaXQiXT09ImZ1bmN0aW9uIilNb2R1bGVbInByZUluaXQiXT1bTW9kdWxlWyJwcmVJbml0Il1dO3doaWxlKE1vZHVsZVsicHJlSW5pdCJdLmxlbmd0aD4wKXtNb2R1bGVbInByZUluaXQiXS5wb3AoKSgpO319cnVuKCk7CgoKICAgIHJldHVybiBtb2R1bGVBcmcucmVhZHkKICB9CiAgKTsKICB9KSgpOwoKICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueQogIGxldCB3YXNtTW9kdWxlOwogIGFzeW5jIGZ1bmN0aW9uIGluaXRXYXNtKCkgewogICAgICB3YXNtTW9kdWxlID0gYXdhaXQgbG9hZFdhc20oKTsKICB9CiAgbGV0IHNvcnREYXRhOwogIGxldCB2aWV3UHJvalB0cjsKICBsZXQgdHJhbnNmb3Jtc1B0cjsKICBsZXQgdHJhbnNmb3JtSW5kaWNlc1B0cjsKICBsZXQgcG9zaXRpb25zUHRyOwogIGxldCBjaHVua3NQdHI7CiAgbGV0IGRlcHRoQnVmZmVyUHRyOwogIGxldCBkZXB0aEluZGV4UHRyOwogIGxldCBzdGFydHNQdHI7CiAgbGV0IGNvdW50c1B0cjsKICBsZXQgYWxsb2NhdGVkVmVydGV4Q291bnQgPSAwOwogIGxldCBhbGxvY2F0ZWRUcmFuc2Zvcm1Db3VudCA9IDA7CiAgbGV0IHZpZXdQcm9qID0gbmV3IEZsb2F0MzJBcnJheSgxNik7CiAgbGV0IGxvY2sgPSBmYWxzZTsKICBsZXQgYWxsb2NhdGlvblBlbmRpbmcgPSBmYWxzZTsKICBsZXQgc29ydGluZyA9IGZhbHNlOwogIGNvbnN0IGFsbG9jYXRlQnVmZmVycyA9IGFzeW5jICgpID0+IHsKICAgICAgaWYgKGxvY2spIHsKICAgICAgICAgIGFsbG9jYXRpb25QZW5kaW5nID0gdHJ1ZTsKICAgICAgICAgIHJldHVybjsKICAgICAgfQogICAgICBsb2NrID0gdHJ1ZTsKICAgICAgYWxsb2NhdGlvblBlbmRpbmcgPSBmYWxzZTsKICAgICAgaWYgKCF3YXNtTW9kdWxlKQogICAgICAgICAgYXdhaXQgaW5pdFdhc20oKTsKICAgICAgY29uc3QgdGFyZ2V0QWxsb2NhdGVkVmVydGV4Q291bnQgPSBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2cyKHNvcnREYXRhLnZlcnRleENvdW50KSkpOwogICAgICBpZiAoYWxsb2NhdGVkVmVydGV4Q291bnQgPCB0YXJnZXRBbGxvY2F0ZWRWZXJ0ZXhDb3VudCkgewogICAgICAgICAgaWYgKGFsbG9jYXRlZFZlcnRleENvdW50ID4gMCkgewogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUodmlld1Byb2pQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUodHJhbnNmb3JtSW5kaWNlc1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShwb3NpdGlvbnNQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUoY2h1bmtzUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKGRlcHRoQnVmZmVyUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKGRlcHRoSW5kZXhQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUoc3RhcnRzUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKGNvdW50c1B0cik7CiAgICAgICAgICB9CiAgICAgICAgICBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCA9IHRhcmdldEFsbG9jYXRlZFZlcnRleENvdW50OwogICAgICAgICAgdmlld1Byb2pQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoMTYgKiA0KTsKICAgICAgICAgIHRyYW5zZm9ybUluZGljZXNQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIHBvc2l0aW9uc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYygzICogYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIGNodW5rc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhhbGxvY2F0ZWRWZXJ0ZXhDb3VudCk7CiAgICAgICAgICBkZXB0aEJ1ZmZlclB0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgZGVwdGhJbmRleFB0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgc3RhcnRzUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKGFsbG9jYXRlZFZlcnRleENvdW50ICogNCk7CiAgICAgICAgICBjb3VudHNQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgfQogICAgICBpZiAoYWxsb2NhdGVkVHJhbnNmb3JtQ291bnQgPCBzb3J0RGF0YS50cmFuc2Zvcm1zLmxlbmd0aCkgewogICAgICAgICAgaWYgKGFsbG9jYXRlZFRyYW5zZm9ybUNvdW50ID4gMCkgewogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUodHJhbnNmb3Jtc1B0cik7CiAgICAgICAgICB9CiAgICAgICAgICBhbGxvY2F0ZWRUcmFuc2Zvcm1Db3VudCA9IHNvcnREYXRhLnRyYW5zZm9ybXMubGVuZ3RoOwogICAgICAgICAgdHJhbnNmb3Jtc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyhhbGxvY2F0ZWRUcmFuc2Zvcm1Db3VudCAqIDQpOwogICAgICB9CiAgICAgIGxvY2sgPSBmYWxzZTsKICAgICAgaWYgKGFsbG9jYXRpb25QZW5kaW5nKSB7CiAgICAgICAgICBhbGxvY2F0aW9uUGVuZGluZyA9IGZhbHNlOwogICAgICAgICAgYXdhaXQgYWxsb2NhdGVCdWZmZXJzKCk7CiAgICAgIH0KICB9OwogIGNvbnN0IHJ1blNvcnQgPSAoKSA9PiB7CiAgICAgIGlmIChsb2NrIHx8IGFsbG9jYXRpb25QZW5kaW5nIHx8ICF3YXNtTW9kdWxlKQogICAgICAgICAgcmV0dXJuOwogICAgICBsb2NrID0gdHJ1ZTsKICAgICAgd2FzbU1vZHVsZS5IRUFQRjMyLnNldChzb3J0RGF0YS5wb3NpdGlvbnMsIHBvc2l0aW9uc1B0ciAvIDQpOwogICAgICB3YXNtTW9kdWxlLkhFQVBGMzIuc2V0KHNvcnREYXRhLnRyYW5zZm9ybXMsIHRyYW5zZm9ybXNQdHIgLyA0KTsKICAgICAgd2FzbU1vZHVsZS5IRUFQVTMyLnNldChzb3J0RGF0YS50cmFuc2Zvcm1JbmRpY2VzLCB0cmFuc2Zvcm1JbmRpY2VzUHRyIC8gNCk7CiAgICAgIHdhc21Nb2R1bGUuSEVBUEYzMi5zZXQodmlld1Byb2osIHZpZXdQcm9qUHRyIC8gNCk7CiAgICAgIHdhc21Nb2R1bGUuX3NvcnQodmlld1Byb2pQdHIsIHRyYW5zZm9ybXNQdHIsIHRyYW5zZm9ybUluZGljZXNQdHIsIHNvcnREYXRhLnZlcnRleENvdW50LCBwb3NpdGlvbnNQdHIsIGNodW5rc1B0ciwgZGVwdGhCdWZmZXJQdHIsIGRlcHRoSW5kZXhQdHIsIHN0YXJ0c1B0ciwgY291bnRzUHRyKTsKICAgICAgY29uc3QgZGVwdGhJbmRleCA9IG5ldyBVaW50MzJBcnJheSh3YXNtTW9kdWxlLkhFQVBVMzIuYnVmZmVyLCBkZXB0aEluZGV4UHRyLCBzb3J0RGF0YS52ZXJ0ZXhDb3VudCk7CiAgICAgIGNvbnN0IGRldGFjaGVkRGVwdGhJbmRleCA9IG5ldyBVaW50MzJBcnJheShkZXB0aEluZGV4LnNsaWNlKCkuYnVmZmVyKTsKICAgICAgY29uc3QgY2h1bmtzID0gbmV3IFVpbnQ4QXJyYXkod2FzbU1vZHVsZS5IRUFQVTguYnVmZmVyLCBjaHVua3NQdHIsIHNvcnREYXRhLnZlcnRleENvdW50KTsKICAgICAgY29uc3QgZGV0YWNoZWRDaHVua3MgPSBuZXcgVWludDhBcnJheShjaHVua3Muc2xpY2UoKS5idWZmZXIpOwogICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgZGVwdGhJbmRleDogZGV0YWNoZWREZXB0aEluZGV4LCBjaHVua3M6IGRldGFjaGVkQ2h1bmtzIH0sIFsKICAgICAgICAgIGRldGFjaGVkRGVwdGhJbmRleC5idWZmZXIsCiAgICAgICAgICBkZXRhY2hlZENodW5rcy5idWZmZXIsCiAgICAgIF0pOwogICAgICBsb2NrID0gZmFsc2U7CiAgfTsKICBjb25zdCB0aHJvdHRsZWRTb3J0ID0gKCkgPT4gewogICAgICBpZiAoIXNvcnRpbmcpIHsKICAgICAgICAgIHNvcnRpbmcgPSB0cnVlOwogICAgICAgICAgcnVuU29ydCgpOwogICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7CiAgICAgICAgICAgICAgc29ydGluZyA9IGZhbHNlOwogICAgICAgICAgICAgIHRocm90dGxlZFNvcnQoKTsKICAgICAgICAgIH0pOwogICAgICB9CiAgfTsKICBzZWxmLm9ubWVzc2FnZSA9IChlKSA9PiB7CiAgICAgIGlmIChlLmRhdGEuc29ydERhdGEpIHsKICAgICAgICAgIHNvcnREYXRhID0gewogICAgICAgICAgICAgIHBvc2l0aW9uczogRmxvYXQzMkFycmF5LmZyb20oZS5kYXRhLnNvcnREYXRhLnBvc2l0aW9ucyksCiAgICAgICAgICAgICAgdHJhbnNmb3JtczogRmxvYXQzMkFycmF5LmZyb20oZS5kYXRhLnNvcnREYXRhLnRyYW5zZm9ybXMpLAogICAgICAgICAgICAgIHRyYW5zZm9ybUluZGljZXM6IFVpbnQzMkFycmF5LmZyb20oZS5kYXRhLnNvcnREYXRhLnRyYW5zZm9ybUluZGljZXMpLAogICAgICAgICAgICAgIHZlcnRleENvdW50OiBlLmRhdGEuc29ydERhdGEudmVydGV4Q291bnQsCiAgICAgICAgICB9OwogICAgICAgICAgYWxsb2NhdGVCdWZmZXJzKCk7CiAgICAgIH0KICAgICAgaWYgKGUuZGF0YS52aWV3UHJvaikgewogICAgICAgICAgdmlld1Byb2ogPSBGbG9hdDMyQXJyYXkuZnJvbShlLmRhdGEudmlld1Byb2opOwogICAgICAgICAgdGhyb3R0bGVkU29ydCgpOwogICAgICB9CiAgfTsKCn0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPVNvcnRXb3JrZXIuanMubWFwCgo=", null, !1);
class yo {
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
    }, this.render = (a, o) => {
      l.useProgram(this._program), this._scene === a && this._camera === o || (this.dispose(), this._scene = a, this._camera = o, this.initialize());
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
var Go = ra("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgdmFyIGxvYWRXYXNtID0gKCgpID0+IHsKICAgIAogICAgcmV0dXJuICgKICBmdW5jdGlvbihtb2R1bGVBcmcgPSB7fSkgewoKICB2YXIgTW9kdWxlPW1vZHVsZUFyZzt2YXIgcmVhZHlQcm9taXNlUmVzb2x2ZSxyZWFkeVByb21pc2VSZWplY3Q7TW9kdWxlWyJyZWFkeSJdPW5ldyBQcm9taXNlKChyZXNvbHZlLHJlamVjdCk9PntyZWFkeVByb21pc2VSZXNvbHZlPXJlc29sdmU7cmVhZHlQcm9taXNlUmVqZWN0PXJlamVjdDt9KTt2YXIgbW9kdWxlT3ZlcnJpZGVzPU9iamVjdC5hc3NpZ24oe30sTW9kdWxlKTt2YXIgc2NyaXB0RGlyZWN0b3J5PSIiO2Z1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCl7aWYoTW9kdWxlWyJsb2NhdGVGaWxlIl0pe3JldHVybiBNb2R1bGVbImxvY2F0ZUZpbGUiXShwYXRoLHNjcmlwdERpcmVjdG9yeSl9cmV0dXJuIHNjcmlwdERpcmVjdG9yeStwYXRofXZhciByZWFkQmluYXJ5O3t7c2NyaXB0RGlyZWN0b3J5PXNlbGYubG9jYXRpb24uaHJlZjt9aWYoc2NyaXB0RGlyZWN0b3J5LmluZGV4T2YoImJsb2I6IikhPT0wKXtzY3JpcHREaXJlY3Rvcnk9c2NyaXB0RGlyZWN0b3J5LnN1YnN0cigwLHNjcmlwdERpcmVjdG9yeS5yZXBsYWNlKC9bPyNdLiovLCIiKS5sYXN0SW5kZXhPZigiLyIpKzEpO31lbHNlIHtzY3JpcHREaXJlY3Rvcnk9IiI7fXt7cmVhZEJpbmFyeT11cmw9Pnt2YXIgeGhyPW5ldyBYTUxIdHRwUmVxdWVzdDt4aHIub3BlbigiR0VUIix1cmwsZmFsc2UpO3hoci5yZXNwb25zZVR5cGU9ImFycmF5YnVmZmVyIjt4aHIuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoeGhyLnJlc3BvbnNlKX07fX19TW9kdWxlWyJwcmludCJdfHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO3ZhciBlcnI9TW9kdWxlWyJwcmludEVyciJdfHxjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihNb2R1bGUsbW9kdWxlT3ZlcnJpZGVzKTttb2R1bGVPdmVycmlkZXM9bnVsbDtpZihNb2R1bGVbImFyZ3VtZW50cyJdKU1vZHVsZVsiYXJndW1lbnRzIl07aWYoTW9kdWxlWyJ0aGlzUHJvZ3JhbSJdKU1vZHVsZVsidGhpc1Byb2dyYW0iXTtpZihNb2R1bGVbInF1aXQiXSlNb2R1bGVbInF1aXQiXTt2YXIgd2FzbUJpbmFyeTtpZihNb2R1bGVbIndhc21CaW5hcnkiXSl3YXNtQmluYXJ5PU1vZHVsZVsid2FzbUJpbmFyeSJdO2lmKHR5cGVvZiBXZWJBc3NlbWJseSE9Im9iamVjdCIpe2Fib3J0KCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkIik7fWZ1bmN0aW9uIGludEFycmF5RnJvbUJhc2U2NChzKXt2YXIgZGVjb2RlZD1hdG9iKHMpO3ZhciBieXRlcz1uZXcgVWludDhBcnJheShkZWNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkZWNvZGVkLmxlbmd0aDsrK2kpe2J5dGVzW2ldPWRlY29kZWQuY2hhckNvZGVBdChpKTt9cmV0dXJuIGJ5dGVzfWZ1bmN0aW9uIHRyeVBhcnNlQXNEYXRhVVJJKGZpbGVuYW1lKXtpZighaXNEYXRhVVJJKGZpbGVuYW1lKSl7cmV0dXJufXJldHVybiBpbnRBcnJheUZyb21CYXNlNjQoZmlsZW5hbWUuc2xpY2UoZGF0YVVSSVByZWZpeC5sZW5ndGgpKX12YXIgd2FzbU1lbW9yeTt2YXIgQUJPUlQ9ZmFsc2U7dmFyIEhFQVA4LEhFQVBVOCxIRUFQMTYsSEVBUFUxNixIRUFQMzIsSEVBUFUzMixIRUFQRjMyLEhFQVBGNjQ7ZnVuY3Rpb24gdXBkYXRlTWVtb3J5Vmlld3MoKXt2YXIgYj13YXNtTWVtb3J5LmJ1ZmZlcjtNb2R1bGVbIkhFQVA4Il09SEVBUDg9bmV3IEludDhBcnJheShiKTtNb2R1bGVbIkhFQVAxNiJdPUhFQVAxNj1uZXcgSW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVBVOCJdPUhFQVBVOD1uZXcgVWludDhBcnJheShiKTtNb2R1bGVbIkhFQVBVMTYiXT1IRUFQVTE2PW5ldyBVaW50MTZBcnJheShiKTtNb2R1bGVbIkhFQVAzMiJdPUhFQVAzMj1uZXcgSW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBVMzIiXT1IRUFQVTMyPW5ldyBVaW50MzJBcnJheShiKTtNb2R1bGVbIkhFQVBGMzIiXT1IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYik7TW9kdWxlWyJIRUFQRjY0Il09SEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGIpO312YXIgX19BVFBSRVJVTl9fPVtdO3ZhciBfX0FUSU5JVF9fPVtdO3ZhciBfX0FUUE9TVFJVTl9fPVtdO2Z1bmN0aW9uIHByZVJ1bigpe2lmKE1vZHVsZVsicHJlUnVuIl0pe2lmKHR5cGVvZiBNb2R1bGVbInByZVJ1biJdPT0iZnVuY3Rpb24iKU1vZHVsZVsicHJlUnVuIl09W01vZHVsZVsicHJlUnVuIl1dO3doaWxlKE1vZHVsZVsicHJlUnVuIl0ubGVuZ3RoKXthZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpO319Y2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTt9ZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKXtjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKTt9ZnVuY3Rpb24gcG9zdFJ1bigpe2lmKE1vZHVsZVsicG9zdFJ1biJdKXtpZih0eXBlb2YgTW9kdWxlWyJwb3N0UnVuIl09PSJmdW5jdGlvbiIpTW9kdWxlWyJwb3N0UnVuIl09W01vZHVsZVsicG9zdFJ1biJdXTt3aGlsZShNb2R1bGVbInBvc3RSdW4iXS5sZW5ndGgpe2FkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKTt9fWNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pO31mdW5jdGlvbiBhZGRPblByZVJ1bihjYil7X19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpO31mdW5jdGlvbiBhZGRPbkluaXQoY2Ipe19fQVRJTklUX18udW5zaGlmdChjYik7fWZ1bmN0aW9uIGFkZE9uUG9zdFJ1bihjYil7X19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKTt9dmFyIHJ1bkRlcGVuZGVuY2llcz0wO3ZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtmdW5jdGlvbiBhZGRSdW5EZXBlbmRlbmN5KGlkKXtydW5EZXBlbmRlbmNpZXMrKztNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXT8uKHJ1bkRlcGVuZGVuY2llcyk7fWZ1bmN0aW9uIHJlbW92ZVJ1bkRlcGVuZGVuY3koaWQpe3J1bkRlcGVuZGVuY2llcy0tO01vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdPy4ocnVuRGVwZW5kZW5jaWVzKTtpZihydW5EZXBlbmRlbmNpZXM9PTApe2lmKGRlcGVuZGVuY2llc0Z1bGZpbGxlZCl7dmFyIGNhbGxiYWNrPWRlcGVuZGVuY2llc0Z1bGZpbGxlZDtkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9bnVsbDtjYWxsYmFjaygpO319fWZ1bmN0aW9uIGFib3J0KHdoYXQpe01vZHVsZVsib25BYm9ydCJdPy4od2hhdCk7d2hhdD0iQWJvcnRlZCgiK3doYXQrIikiO2Vycih3aGF0KTtBQk9SVD10cnVlO3doYXQrPSIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uIjt2YXIgZT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKHdoYXQpO3JlYWR5UHJvbWlzZVJlamVjdChlKTt0aHJvdyBlfXZhciBkYXRhVVJJUHJlZml4PSJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsIjt2YXIgaXNEYXRhVVJJPWZpbGVuYW1lPT5maWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpO3ZhciB3YXNtQmluYXJ5RmlsZTt3YXNtQmluYXJ5RmlsZT0iZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LEFHRnpiUUVBQUFBQlp3OWdCSDkvZjM4QVlBTi9mMzhBWUFWL2YzOS9md0JnQm45L2YzOS9md0JnQVg4QmYyQUJmd0JnQW45L0FHQURmMzkvQVg5Z0FBQmdCMzkvZjM5L2YzOEFZQUo5ZlFGL1lBUi9mMzUrQUdBQmZRRi9ZQXQvZjM5L2YzOS9mMzkvZndCZ0FuOS9BWDhDUFFvQllRRmhBQUVCWVFGaUFBSUJZUUZqQUFFQllRRmtBQVlCWVFGbEFBRUJZUUZtQUFrQllRRm5BQVFCWVFGb0FBVUJZUUZwQUFBQllRRnFBQVlER3hvSEJBb0ZDQVVHQ0FzQkFBRUZEQVFFRFFNREFnSUFBQTRIQndRRkFYQUJFQkFGQndFQmdBS0FnQUlHQ0FGL0FVR3duZ1FMQnhrR0FXc0NBQUZzQUE0QmJRQWFBVzRCQUFGdkFCa0JjQUFQQ1JVQkFFRUJDdzhSR0EwV0ZpTU5JaHNkSUEwY0hoOEswVkFhY1FFQmZ5QUNSUVJBSUFBb0FnUWdBU2dDQkVZUEN5QUFJQUZHQkVCQkFROExBa0FnQUNnQ0JDSUNMUUFBSWdCRklBQWdBU2dDQkNJQkxRQUFJZ05IY2cwQUEwQWdBUzBBQVNFRElBSXRBQUVpQUVVTkFTQUJRUUZxSVFFZ0FrRUJhaUVDSUFBZ0EwWU5BQXNMSUFBZ0EwWUxUd0VDZjBHb0dpZ0NBQ0lCSUFCQkIycEJlSEVpQW1vaEFBSkFJQUpCQUNBQUlBRk5HMFVFUUNBQVB3QkJFSFJORFFFZ0FCQUdEUUVMUWJnYVFUQTJBZ0JCZnc4TFFhZ2FJQUEyQWdBZ0FRc09BQ0FBRUJjZ0FSQVhRUkIwY2dzR0FDQUFFQThMS1FCQnNCcEJBVFlDQUVHMEdrRUFOZ0lBRUJGQnRCcEJyQm9vQWdBMkFnQkJyQnBCc0JvMkFnQUwwZ3NCQjM4Q1FDQUFSUTBBSUFCQkNHc2lBaUFBUVFScktBSUFJZ0ZCZUhFaUFHb2hCUUpBSUFGQkFYRU5BQ0FCUVFKeFJRMEJJQUlnQWlnQ0FDSUJheUlDUWN3YUtBSUFTUTBCSUFBZ0FXb2hBQUpBQWtCQjBCb29BZ0FnQWtjRVFDQUJRZjhCVFFSQUlBRkJBM1loQkNBQ0tBSU1JZ0VnQWlnQ0NDSURSZ1JBUWJ3YVFid2FLQUlBUVg0Z0JIZHhOZ0lBREFVTElBTWdBVFlDRENBQklBTTJBZ2dNQkFzZ0FpZ0NHQ0VHSUFJZ0FpZ0NEQ0lCUndSQUlBSW9BZ2dpQXlBQk5nSU1JQUVnQXpZQ0NBd0RDeUFDUVJScUlnUW9BZ0FpQTBVRVFDQUNLQUlRSWdORkRRSWdBa0VRYWlFRUN3TkFJQVFoQnlBRElnRkJGR29pQkNnQ0FDSUREUUFnQVVFUWFpRUVJQUVvQWhBaUF3MEFDeUFIUVFBMkFnQU1BZ3NnQlNnQ0JDSUJRUU54UVFOSERRSkJ4Qm9nQURZQ0FDQUZJQUZCZm5FMkFnUWdBaUFBUVFGeU5nSUVJQVVnQURZQ0FBOExRUUFoQVFzZ0JrVU5BQUpBSUFJb0Fod2lBMEVDZEVIc0hHb2lCQ2dDQUNBQ1JnUkFJQVFnQVRZQ0FDQUJEUUZCd0JwQndCb29BZ0JCZmlBRGQzRTJBZ0FNQWdzZ0JrRVFRUlFnQmlnQ0VDQUNSaHRxSUFFMkFnQWdBVVVOQVFzZ0FTQUdOZ0lZSUFJb0FoQWlBd1JBSUFFZ0F6WUNFQ0FESUFFMkFoZ0xJQUlvQWhRaUEwVU5BQ0FCSUFNMkFoUWdBeUFCTmdJWUN5QUNJQVZQRFFBZ0JTZ0NCQ0lCUVFGeFJRMEFBa0FDUUFKQUFrQWdBVUVDY1VVRVFFSFVHaWdDQUNBRlJnUkFRZFFhSUFJMkFnQkJ5QnBCeUJvb0FnQWdBR29pQURZQ0FDQUNJQUJCQVhJMkFnUWdBa0hRR2lnQ0FFY05Ca0hFR2tFQU5nSUFRZEFhUVFBMkFnQVBDMEhRR2lnQ0FDQUZSZ1JBUWRBYUlBSTJBZ0JCeEJwQnhCb29BZ0FnQUdvaUFEWUNBQ0FDSUFCQkFYSTJBZ1FnQUNBQ2FpQUFOZ0lBRHdzZ0FVRjRjU0FBYWlFQUlBRkIvd0ZOQkVBZ0FVRURkaUVFSUFVb0Fnd2lBU0FGS0FJSUlnTkdCRUJCdkJwQnZCb29BZ0JCZmlBRWQzRTJBZ0FNQlFzZ0F5QUJOZ0lNSUFFZ0F6WUNDQXdFQ3lBRktBSVlJUVlnQlNBRktBSU1JZ0ZIQkVCQnpCb29BZ0FhSUFVb0FnZ2lBeUFCTmdJTUlBRWdBellDQ0F3REN5QUZRUlJxSWdRb0FnQWlBMFVFUUNBRktBSVFJZ05GRFFJZ0JVRVFhaUVFQ3dOQUlBUWhCeUFESWdGQkZHb2lCQ2dDQUNJRERRQWdBVUVRYWlFRUlBRW9BaEFpQXcwQUN5QUhRUUEyQWdBTUFnc2dCU0FCUVg1eE5nSUVJQUlnQUVFQmNqWUNCQ0FBSUFKcUlBQTJBZ0FNQXd0QkFDRUJDeUFHUlEwQUFrQWdCU2dDSENJRFFRSjBRZXdjYWlJRUtBSUFJQVZHQkVBZ0JDQUJOZ0lBSUFFTkFVSEFHa0hBR2lnQ0FFRitJQU4zY1RZQ0FBd0NDeUFHUVJCQkZDQUdLQUlRSUFWR0cyb2dBVFlDQUNBQlJRMEJDeUFCSUFZMkFoZ2dCU2dDRUNJREJFQWdBU0FETmdJUUlBTWdBVFlDR0FzZ0JTZ0NGQ0lEUlEwQUlBRWdBellDRkNBRElBRTJBaGdMSUFJZ0FFRUJjallDQkNBQUlBSnFJQUEyQWdBZ0FrSFFHaWdDQUVjTkFFSEVHaUFBTmdJQUR3c2dBRUgvQVUwRVFDQUFRWGh4UWVRYWFpRUJBbjlCdkJvb0FnQWlBMEVCSUFCQkEzWjBJZ0J4UlFSQVFid2FJQUFnQTNJMkFnQWdBUXdCQ3lBQktBSUlDeUVBSUFFZ0FqWUNDQ0FBSUFJMkFnd2dBaUFCTmdJTUlBSWdBRFlDQ0E4TFFSOGhBeUFBUWYvLy93ZE5CRUFnQUVFbUlBQkJDSFpuSWdGcmRrRUJjU0FCUVFGMGEwRSthaUVEQ3lBQ0lBTTJBaHdnQWtJQU53SVFJQU5CQW5SQjdCeHFJUUVDUUFKQUFrQkJ3Qm9vQWdBaUJFRUJJQU4wSWdkeFJRUkFRY0FhSUFRZ0IzSTJBZ0FnQVNBQ05nSUFJQUlnQVRZQ0dBd0JDeUFBUVJrZ0EwRUJkbXRCQUNBRFFSOUhHM1FoQXlBQktBSUFJUUVEUUNBQklnUW9BZ1JCZUhFZ0FFWU5BaUFEUVIxMklRRWdBMEVCZENFRElBUWdBVUVFY1dvaUIwRVFhaWdDQUNJQkRRQUxJQWNnQWpZQ0VDQUNJQVEyQWhnTElBSWdBallDRENBQ0lBSTJBZ2dNQVFzZ0JDZ0NDQ0lBSUFJMkFnd2dCQ0FDTmdJSUlBSkJBRFlDR0NBQ0lBUTJBZ3dnQWlBQU5nSUlDMEhjR2tIY0dpZ0NBRUVCYXlJQVFYOGdBQnMyQWdBTEN5RUFJQUVFUUFOQUlBQkJBRG9BQUNBQVFRRnFJUUFnQVVFQmF5SUJEUUFMQ3d2ZUF3QkIzQmRCaWdrUUNVSG9GMEc1Q0VFQlFRQVFDRUgwRjBHMENFRUJRWUIvUWY4QUVBRkJqQmhCclFoQkFVR0FmMEgvQUJBQlFZQVlRYXNJUVFGQkFFSC9BUkFCUVpnWVFZa0lRUUpCZ0lCK1FmLy9BUkFCUWFRWVFZQUlRUUpCQUVILy93TVFBVUd3R0VHWUNFRUVRWUNBZ0lCNFFmLy8vLzhIRUFGQnZCaEJqd2hCQkVFQVFYOFFBVUhJR0VISENFRUVRWUNBZ0lCNFFmLy8vLzhIRUFGQjFCaEJ2Z2hCQkVFQVFYOFFBVUhnR0VHakNFS0FnSUNBZ0lDQWdJQi9Rdi8vLy8vLy8vLy8vd0FRRWtIc0dFR2lDRUlBUW44UUVrSDRHRUdjQ0VFRUVBUkJoQmxCZ3dsQkNCQUVRZlFPUWRrSUVBTkJ2QTlCaHcwUUEwR0VFRUVFUWN3SUVBSkIwQkJCQWtIbENCQUNRWndSUVFSQjlBZ1FBa0c0RVJBSFFlQVJRUUJCd2d3UUFFR0lFa0VBUWFnTkVBQkJzQkpCQVVIZ0RCQUFRZGdTUVFKQmp3a1FBRUdBRTBFRFFhNEpFQUJCcUJOQkJFSFdDUkFBUWRBVFFRVkI4d2tRQUVINEUwRUVRYzBORUFCQm9CUkJCVUhyRFJBQVFZZ1NRUUJCMlFvUUFFR3dFa0VCUWJnS0VBQkIyQkpCQWtHYkN4QUFRWUFUUVFOQitRb1FBRUdvRTBFRVFhRU1FQUJCMEJOQkJVSC9DeEFBUWNnVVFRaEIzZ3NRQUVId0ZFRUpRYndMRUFCQm1CVkJCa0daQ2hBQVFjQVZRUWRCa2c0UUFBc2NBQ0FBSUFGQkNDQUNweUFDUWlDSXB5QURweUFEUWlDSXB4QUZDeUFBQWtBZ0FDZ0NCQ0FCUncwQUlBQW9BaHhCQVVZTkFDQUFJQUkyQWh3TEM1b0JBQ0FBUVFFNkFEVUNRQ0FBS0FJRUlBSkhEUUFnQUVFQk9nQTBBa0FnQUNnQ0VDSUNSUVJBSUFCQkFUWUNKQ0FBSUFNMkFoZ2dBQ0FCTmdJUUlBTkJBVWNOQWlBQUtBSXdRUUZHRFFFTUFnc2dBU0FDUmdSQUlBQW9BaGdpQWtFQ1JnUkFJQUFnQXpZQ0dDQURJUUlMSUFBb0FqQkJBVWNOQWlBQ1FRRkdEUUVNQWdzZ0FDQUFLQUlrUVFGcU5nSWtDeUFBUVFFNkFEWUxDMTBCQVg4Z0FDZ0NFQ0lEUlFSQUlBQkJBVFlDSkNBQUlBSTJBaGdnQUNBQk5nSVFEd3NDUUNBQklBTkdCRUFnQUNnQ0dFRUNSdzBCSUFBZ0FqWUNHQThMSUFCQkFUb0FOaUFBUVFJMkFoZ2dBQ0FBS0FJa1FRRnFOZ0lrQ3dzQ0FBdDNBUVIvSUFDOElnUkIvLy8vQTNFaEFRSkFJQVJCRjNaQi93RnhJZ0pGRFFBZ0FrSHdBRTBFUUNBQlFZQ0FnQVJ5UWZFQUlBSnJkaUVCREFFTElBSkJqUUZMQkVCQmdQZ0JJUU5CQUNFQkRBRUxJQUpCQ25SQmdJQUhheUVEQ3lBRElBUkJFSFpCZ0lBQ2NYSWdBVUVOZG5KQi8vOERjUXNFQUNBQUM4WW5BUXgvSXdCQkVHc2lDaVFBQWtBQ1FBSkFBa0FDUUFKQUFrQUNRQUpBSUFCQjlBRk5CRUJCdkJvb0FnQWlCa0VRSUFCQkMycEIrQU54SUFCQkMwa2JJZ1ZCQTNZaUFIWWlBVUVEY1FSQUFrQWdBVUYvYzBFQmNTQUFhaUlDUVFOMElnRkI1QnBxSWdBZ0FVSHNHbW9vQWdBaUFTZ0NDQ0lEUmdSQVFid2FJQVpCZmlBQ2QzRTJBZ0FNQVFzZ0F5QUFOZ0lNSUFBZ0F6WUNDQXNnQVVFSWFpRUFJQUVnQWtFRGRDSUNRUU55TmdJRUlBRWdBbW9pQVNBQktBSUVRUUZ5TmdJRURBb0xJQVZCeEJvb0FnQWlCMDBOQVNBQkJFQUNRRUVDSUFCMElnSkJBQ0FDYTNJZ0FTQUFkSEZvSWdGQkEzUWlBRUhrR21vaUFpQUFRZXdhYWlnQ0FDSUFLQUlJSWdOR0JFQkJ2Qm9nQmtGK0lBRjNjU0lHTmdJQURBRUxJQU1nQWpZQ0RDQUNJQU0yQWdnTElBQWdCVUVEY2pZQ0JDQUFJQVZxSWdRZ0FVRURkQ0lCSUFWcklnTkJBWEkyQWdRZ0FDQUJhaUFETmdJQUlBY0VRQ0FIUVhoeFFlUWFhaUVCUWRBYUtBSUFJUUlDZnlBR1FRRWdCMEVEZG5RaUJYRkZCRUJCdkJvZ0JTQUdjallDQUNBQkRBRUxJQUVvQWdnTElRVWdBU0FDTmdJSUlBVWdBallDRENBQ0lBRTJBZ3dnQWlBRk5nSUlDeUFBUVFocUlRQkIwQm9nQkRZQ0FFSEVHaUFETmdJQURBb0xRY0FhS0FJQUlndEZEUUVnQzJoQkFuUkI3QnhxS0FJQUlnSW9BZ1JCZUhFZ0JXc2hCQ0FDSVFFRFFBSkFJQUVvQWhBaUFFVUVRQ0FCS0FJVUlnQkZEUUVMSUFBb0FnUkJlSEVnQldzaUFTQUVJQUVnQkVraUFSc2hCQ0FBSUFJZ0FSc2hBaUFBSVFFTUFRc0xJQUlvQWhnaENTQUNJQUlvQWd3aUEwY0VRRUhNR2lnQ0FCb2dBaWdDQ0NJQUlBTTJBZ3dnQXlBQU5nSUlEQWtMSUFKQkZHb2lBU2dDQUNJQVJRUkFJQUlvQWhBaUFFVU5BeUFDUVJCcUlRRUxBMEFnQVNFSUlBQWlBMEVVYWlJQktBSUFJZ0FOQUNBRFFSQnFJUUVnQXlnQ0VDSUFEUUFMSUFoQkFEWUNBQXdJQzBGL0lRVWdBRUcvZjBzTkFDQUFRUXRxSWdCQmVIRWhCVUhBR2lnQ0FDSUlSUTBBUVFBZ0JXc2hCQUpBQWtBQ1FBSi9RUUFnQlVHQUFra05BQnBCSHlBRlFmLy8vd2RMRFFBYUlBVkJKaUFBUVFoMlp5SUFhM1pCQVhFZ0FFRUJkR3RCUG1vTElnZEJBblJCN0J4cUtBSUFJZ0ZGQkVCQkFDRUFEQUVMUVFBaEFDQUZRUmtnQjBFQmRtdEJBQ0FIUVI5SEczUWhBZ05BQWtBZ0FTZ0NCRUY0Y1NBRmF5SUdJQVJQRFFBZ0FTRURJQVlpQkEwQVFRQWhCQ0FCSVFBTUF3c2dBQ0FCS0FJVUlnWWdCaUFCSUFKQkhYWkJCSEZxS0FJUUlnRkdHeUFBSUFZYklRQWdBa0VCZENFQ0lBRU5BQXNMSUFBZ0EzSkZCRUJCQUNFRFFRSWdCM1FpQUVFQUlBQnJjaUFJY1NJQVJRMERJQUJvUVFKMFFld2NhaWdDQUNFQUN5QUFSUTBCQ3dOQUlBQW9BZ1JCZUhFZ0JXc2lBaUFFU1NFQklBSWdCQ0FCR3lFRUlBQWdBeUFCR3lFRElBQW9BaEFpQVFSL0lBRUZJQUFvQWhRTElnQU5BQXNMSUFORkRRQWdCRUhFR2lnQ0FDQUZhMDhOQUNBREtBSVlJUWNnQXlBREtBSU1JZ0pIQkVCQnpCb29BZ0FhSUFNb0FnZ2lBQ0FDTmdJTUlBSWdBRFlDQ0F3SEN5QURRUlJxSWdFb0FnQWlBRVVFUUNBREtBSVFJZ0JGRFFNZ0EwRVFhaUVCQ3dOQUlBRWhCaUFBSWdKQkZHb2lBU2dDQUNJQURRQWdBa0VRYWlFQklBSW9BaEFpQUEwQUN5QUdRUUEyQWdBTUJnc2dCVUhFR2lnQ0FDSURUUVJBUWRBYUtBSUFJUUFDUUNBRElBVnJJZ0ZCRUU4RVFDQUFJQVZxSWdJZ0FVRUJjallDQkNBQUlBTnFJQUUyQWdBZ0FDQUZRUU55TmdJRURBRUxJQUFnQTBFRGNqWUNCQ0FBSUFOcUlnRWdBU2dDQkVFQmNqWUNCRUVBSVFKQkFDRUJDMEhFR2lBQk5nSUFRZEFhSUFJMkFnQWdBRUVJYWlFQURBZ0xJQVZCeUJvb0FnQWlBa2tFUUVISUdpQUNJQVZySWdFMkFnQkIxQnBCMUJvb0FnQWlBQ0FGYWlJQ05nSUFJQUlnQVVFQmNqWUNCQ0FBSUFWQkEzSTJBZ1FnQUVFSWFpRUFEQWdMUVFBaEFDQUZRUzlxSWdRQ2YwR1VIaWdDQUFSQVFad2VLQUlBREFFTFFhQWVRbjgzQWdCQm1CNUNnS0NBZ0lDQUJEY0NBRUdVSGlBS1FReHFRWEJ4UWRpcTFhb0ZjellDQUVHb0hrRUFOZ0lBUWZnZFFRQTJBZ0JCZ0NBTElnRnFJZ1pCQUNBQmF5SUljU0lCSUFWTkRRZEI5QjBvQWdBaUF3UkFRZXdkS0FJQUlnY2dBV29pQ1NBSFRTQURJQWxKY2cwSUN3SkFRZmdkTFFBQVFRUnhSUVJBQWtBQ1FBSkFBa0JCMUJvb0FnQWlBd1JBUWZ3ZElRQURRQ0FESUFBb0FnQWlCMDhFUUNBSElBQW9BZ1JxSUFOTERRTUxJQUFvQWdnaUFBMEFDd3RCQUJBTElnSkJmMFlOQXlBQklRWkJtQjRvQWdBaUFFRUJheUlESUFKeEJFQWdBU0FDYXlBQ0lBTnFRUUFnQUd0eGFpRUdDeUFGSUFaUERRTkI5QjBvQWdBaUFBUkFRZXdkS0FJQUlnTWdCbW9pQ0NBRFRTQUFJQWhKY2cwRUN5QUdFQXNpQUNBQ1J3MEJEQVVMSUFZZ0Ftc2dDSEVpQmhBTElnSWdBQ2dDQUNBQUtBSUVha1lOQVNBQ0lRQUxJQUJCZjBZTkFTQUZRVEJxSUFaTkJFQWdBQ0VDREFRTFFad2VLQUlBSWdJZ0JDQUdhMnBCQUNBQ2EzRWlBaEFMUVg5R0RRRWdBaUFHYWlFR0lBQWhBZ3dEQ3lBQ1FYOUhEUUlMUWZnZFFmZ2RLQUlBUVFSeU5nSUFDeUFCRUFzaUFrRi9Sa0VBRUFzaUFFRi9SbklnQUNBQ1RYSU5CU0FBSUFKcklnWWdCVUVvYWswTkJRdEI3QjFCN0Iwb0FnQWdCbW9pQURZQ0FFSHdIU2dDQUNBQVNRUkFRZkFkSUFBMkFnQUxBa0JCMUJvb0FnQWlCQVJBUWZ3ZElRQURRQ0FDSUFBb0FnQWlBU0FBS0FJRUlnTnFSZzBDSUFBb0FnZ2lBQTBBQ3d3RUMwSE1HaWdDQUNJQVFRQWdBQ0FDVFJ0RkJFQkJ6Qm9nQWpZQ0FBdEJBQ0VBUVlBZUlBWTJBZ0JCL0IwZ0FqWUNBRUhjR2tGL05nSUFRZUFhUVpRZUtBSUFOZ0lBUVlnZVFRQTJBZ0FEUUNBQVFRTjBJZ0ZCN0JwcUlBRkI1QnBxSWdNMkFnQWdBVUh3R21vZ0F6WUNBQ0FBUVFGcUlnQkJJRWNOQUF0QnlCb2dCa0VvYXlJQVFYZ2dBbXRCQjNFaUFXc2lBellDQUVIVUdpQUJJQUpxSWdFMkFnQWdBU0FEUVFGeU5nSUVJQUFnQW1wQktEWUNCRUhZR2tHa0hpZ0NBRFlDQUF3RUN5QUNJQVJOSUFFZ0JFdHlEUUlnQUNnQ0RFRUljUTBDSUFBZ0F5QUdhallDQkVIVUdpQUVRWGdnQkd0QkIzRWlBR29pQVRZQ0FFSElHa0hJR2lnQ0FDQUdhaUlDSUFCcklnQTJBZ0FnQVNBQVFRRnlOZ0lFSUFJZ0JHcEJLRFlDQkVIWUdrR2tIaWdDQURZQ0FBd0RDMEVBSVFNTUJRdEJBQ0VDREFNTFFjd2FLQUlBSUFKTEJFQkJ6Qm9nQWpZQ0FBc2dBaUFHYWlFQlFmd2RJUUFDUUFKQUFrQURRQ0FCSUFBb0FnQkhCRUFnQUNnQ0NDSUFEUUVNQWdzTElBQXRBQXhCQ0hGRkRRRUxRZndkSVFBRFFBSkFJQVFnQUNnQ0FDSUJUd1JBSUFFZ0FDZ0NCR29pQXlBRVN3MEJDeUFBS0FJSUlRQU1BUXNMUWNnYUlBWkJLR3NpQUVGNElBSnJRUWR4SWdGcklnZzJBZ0JCMUJvZ0FTQUNhaUlCTmdJQUlBRWdDRUVCY2pZQ0JDQUFJQUpxUVNnMkFnUkIyQnBCcEI0b0FnQTJBZ0FnQkNBRFFTY2dBMnRCQjNGcVFTOXJJZ0FnQUNBRVFSQnFTUnNpQVVFYk5nSUVJQUZCaEI0cEFnQTNBaEFnQVVIOEhTa0NBRGNDQ0VHRUhpQUJRUWhxTmdJQVFZQWVJQVkyQWdCQi9CMGdBallDQUVHSUhrRUFOZ0lBSUFGQkdHb2hBQU5BSUFCQkJ6WUNCQ0FBUVFocUlRd2dBRUVFYWlFQUlBd2dBMGtOQUFzZ0FTQUVSZzBDSUFFZ0FTZ0NCRUYrY1RZQ0JDQUVJQUVnQkdzaUFrRUJjallDQkNBQklBSTJBZ0FnQWtIL0FVMEVRQ0FDUVhoeFFlUWFhaUVBQW45QnZCb29BZ0FpQVVFQklBSkJBM1owSWdKeFJRUkFRYndhSUFFZ0FuSTJBZ0FnQUF3QkN5QUFLQUlJQ3lFQklBQWdCRFlDQ0NBQklBUTJBZ3dnQkNBQU5nSU1JQVFnQVRZQ0NBd0RDMEVmSVFBZ0FrSC8vLzhIVFFSQUlBSkJKaUFDUVFoMlp5SUFhM1pCQVhFZ0FFRUJkR3RCUG1vaEFBc2dCQ0FBTmdJY0lBUkNBRGNDRUNBQVFRSjBRZXdjYWlFQkFrQkJ3Qm9vQWdBaUEwRUJJQUIwSWdaeFJRUkFRY0FhSUFNZ0JuSTJBZ0FnQVNBRU5nSUFEQUVMSUFKQkdTQUFRUUYyYTBFQUlBQkJIMGNiZENFQUlBRW9BZ0FoQXdOQUlBTWlBU2dDQkVGNGNTQUNSZzBESUFCQkhYWWhBeUFBUVFGMElRQWdBU0FEUVFSeGFpSUdLQUlRSWdNTkFBc2dCaUFFTmdJUUN5QUVJQUUyQWhnZ0JDQUVOZ0lNSUFRZ0JEWUNDQXdDQ3lBQUlBSTJBZ0FnQUNBQUtBSUVJQVpxTmdJRUlBSkJlQ0FDYTBFSGNXb2lCeUFGUVFOeU5nSUVJQUZCZUNBQmEwRUhjV29pQkNBRklBZHFJZ1ZySVFZQ1FFSFVHaWdDQUNBRVJnUkFRZFFhSUFVMkFnQkJ5QnBCeUJvb0FnQWdCbW9pQURZQ0FDQUZJQUJCQVhJMkFnUU1BUXRCMEJvb0FnQWdCRVlFUUVIUUdpQUZOZ0lBUWNRYVFjUWFLQUlBSUFacUlnQTJBZ0FnQlNBQVFRRnlOZ0lFSUFBZ0JXb2dBRFlDQUF3QkN5QUVLQUlFSWdKQkEzRkJBVVlFUUNBQ1FYaHhJUWtDUUNBQ1FmOEJUUVJBSUFRb0Fnd2lBQ0FFS0FJSUlnRkdCRUJCdkJwQnZCb29BZ0JCZmlBQ1FRTjJkM0UyQWdBTUFnc2dBU0FBTmdJTUlBQWdBVFlDQ0F3QkN5QUVLQUlZSVFnQ1FDQUVJQVFvQWd3aUFFY0VRRUhNR2lnQ0FCb2dCQ2dDQ0NJQklBQTJBZ3dnQUNBQk5nSUlEQUVMQWtBZ0JFRVVhaUlCS0FJQUlnSkZCRUFnQkNnQ0VDSUNSUTBCSUFSQkVHb2hBUXNEUUNBQklRTWdBaUlBUVJScUlnRW9BZ0FpQWcwQUlBQkJFR29oQVNBQUtBSVFJZ0lOQUFzZ0EwRUFOZ0lBREFFTFFRQWhBQXNnQ0VVTkFBSkFJQVFvQWh3aUFVRUNkRUhzSEdvaUFpZ0NBQ0FFUmdSQUlBSWdBRFlDQUNBQURRRkJ3QnBCd0Jvb0FnQkJmaUFCZDNFMkFnQU1BZ3NnQ0VFUVFSUWdDQ2dDRUNBRVJodHFJQUEyQWdBZ0FFVU5BUXNnQUNBSU5nSVlJQVFvQWhBaUFRUkFJQUFnQVRZQ0VDQUJJQUEyQWhnTElBUW9BaFFpQVVVTkFDQUFJQUUyQWhRZ0FTQUFOZ0lZQ3lBR0lBbHFJUVlnQkNBSmFpSUVLQUlFSVFJTElBUWdBa0YrY1RZQ0JDQUZJQVpCQVhJMkFnUWdCU0FHYWlBR05nSUFJQVpCL3dGTkJFQWdCa0Y0Y1VIa0dtb2hBQUovUWJ3YUtBSUFJZ0ZCQVNBR1FRTjJkQ0lDY1VVRVFFRzhHaUFCSUFKeU5nSUFJQUFNQVFzZ0FDZ0NDQXNoQVNBQUlBVTJBZ2dnQVNBRk5nSU1JQVVnQURZQ0RDQUZJQUUyQWdnTUFRdEJIeUVDSUFaQi8vLy9CMDBFUUNBR1FTWWdCa0VJZG1jaUFHdDJRUUZ4SUFCQkFYUnJRVDVxSVFJTElBVWdBallDSENBRlFnQTNBaEFnQWtFQ2RFSHNIR29oQVFKQUFrQkJ3Qm9vQWdBaUFFRUJJQUowSWdOeFJRUkFRY0FhSUFBZ0EzSTJBZ0FnQVNBRk5nSUFEQUVMSUFaQkdTQUNRUUYyYTBFQUlBSkJIMGNiZENFQ0lBRW9BZ0FoQUFOQUlBQWlBU2dDQkVGNGNTQUdSZzBDSUFKQkhYWWhBQ0FDUVFGMElRSWdBU0FBUVFSeGFpSURLQUlRSWdBTkFBc2dBeUFGTmdJUUN5QUZJQUUyQWhnZ0JTQUZOZ0lNSUFVZ0JUWUNDQXdCQ3lBQktBSUlJZ0FnQlRZQ0RDQUJJQVUyQWdnZ0JVRUFOZ0lZSUFVZ0FUWUNEQ0FGSUFBMkFnZ0xJQWRCQ0dvaEFBd0ZDeUFCS0FJSUlnQWdCRFlDRENBQklBUTJBZ2dnQkVFQU5nSVlJQVFnQVRZQ0RDQUVJQUEyQWdnTFFjZ2FLQUlBSWdBZ0JVME5BRUhJR2lBQUlBVnJJZ0UyQWdCQjFCcEIxQm9vQWdBaUFDQUZhaUlDTmdJQUlBSWdBVUVCY2pZQ0JDQUFJQVZCQTNJMkFnUWdBRUVJYWlFQURBTUxRYmdhUVRBMkFnQkJBQ0VBREFJTEFrQWdCMFVOQUFKQUlBTW9BaHdpQUVFQ2RFSHNIR29pQVNnQ0FDQURSZ1JBSUFFZ0FqWUNBQ0FDRFFGQndCb2dDRUYrSUFCM2NTSUlOZ0lBREFJTElBZEJFRUVVSUFjb0FoQWdBMFliYWlBQ05nSUFJQUpGRFFFTElBSWdCellDR0NBREtBSVFJZ0FFUUNBQ0lBQTJBaEFnQUNBQ05nSVlDeUFES0FJVUlnQkZEUUFnQWlBQU5nSVVJQUFnQWpZQ0dBc0NRQ0FFUVE5TkJFQWdBeUFFSUFWcUlnQkJBM0kyQWdRZ0FDQURhaUlBSUFBb0FnUkJBWEkyQWdRTUFRc2dBeUFGUVFOeU5nSUVJQU1nQldvaUFpQUVRUUZ5TmdJRUlBSWdCR29nQkRZQ0FDQUVRZjhCVFFSQUlBUkJlSEZCNUJwcUlRQUNmMEc4R2lnQ0FDSUJRUUVnQkVFRGRuUWlCWEZGQkVCQnZCb2dBU0FGY2pZQ0FDQUFEQUVMSUFBb0FnZ0xJUUVnQUNBQ05nSUlJQUVnQWpZQ0RDQUNJQUEyQWd3Z0FpQUJOZ0lJREFFTFFSOGhBQ0FFUWYvLy93ZE5CRUFnQkVFbUlBUkJDSFpuSWdCcmRrRUJjU0FBUVFGMGEwRSthaUVBQ3lBQ0lBQTJBaHdnQWtJQU53SVFJQUJCQW5SQjdCeHFJUUVDUUFKQUlBaEJBU0FBZENJRmNVVUVRRUhBR2lBRklBaHlOZ0lBSUFFZ0FqWUNBQXdCQ3lBRVFSa2dBRUVCZG10QkFDQUFRUjlIRzNRaEFDQUJLQUlBSVFVRFFDQUZJZ0VvQWdSQmVIRWdCRVlOQWlBQVFSMTJJUVVnQUVFQmRDRUFJQUVnQlVFRWNXb2lCaWdDRUNJRkRRQUxJQVlnQWpZQ0VBc2dBaUFCTmdJWUlBSWdBallDRENBQ0lBSTJBZ2dNQVFzZ0FTZ0NDQ0lBSUFJMkFnd2dBU0FDTmdJSUlBSkJBRFlDR0NBQ0lBRTJBZ3dnQWlBQU5nSUlDeUFEUVFocUlRQU1BUXNDUUNBSlJRMEFBa0FnQWlnQ0hDSUFRUUowUWV3Y2FpSUJLQUlBSUFKR0JFQWdBU0FETmdJQUlBTU5BVUhBR2lBTFFYNGdBSGR4TmdJQURBSUxJQWxCRUVFVUlBa29BaEFnQWtZYmFpQUROZ0lBSUFORkRRRUxJQU1nQ1RZQ0dDQUNLQUlRSWdBRVFDQURJQUEyQWhBZ0FDQUROZ0lZQ3lBQ0tBSVVJZ0JGRFFBZ0F5QUFOZ0lVSUFBZ0F6WUNHQXNDUUNBRVFROU5CRUFnQWlBRUlBVnFJZ0JCQTNJMkFnUWdBQ0FDYWlJQUlBQW9BZ1JCQVhJMkFnUU1BUXNnQWlBRlFRTnlOZ0lFSUFJZ0JXb2lBeUFFUVFGeU5nSUVJQU1nQkdvZ0JEWUNBQ0FIQkVBZ0IwRjRjVUhrR21vaEFFSFFHaWdDQUNFQkFuOUJBU0FIUVFOMmRDSUZJQVp4UlFSQVFid2FJQVVnQm5JMkFnQWdBQXdCQ3lBQUtBSUlDeUVGSUFBZ0FUWUNDQ0FGSUFFMkFnd2dBU0FBTmdJTUlBRWdCVFlDQ0F0QjBCb2dBellDQUVIRUdpQUVOZ0lBQ3lBQ1FRaHFJUUFMSUFwQkVHb2tBQ0FBQzZrTEFndC9DWDBqQUVHZ0FXc2lDeVFBSUF0Qk1HcEJKQkFRQTBBZ0FTQU5Sd1JBSUFJZ0RVRURiQ0lNUVFKcVFRSjBJZzVxS2dJQUlSY2dBaUFNUVFGcVFRSjBJZzlxS2dJQUlSZ2dDQ0FNUVFKMEloQnFJQUlnRUdvcUFnQWlHVGdDQUNBSUlBOXFJQmc0QWdBZ0NDQU9haUFYT0FJQUlBY2dEVUVGZEdvaURDQVlPQUlFSUF3Z0dUZ0NBQ0FNSUJjNEFnZ2dERUVBTmdJTUFrQWdBRVVFUUNBR0lBMXFMUUFBUlEwQkN5QU1RWUNBZ0FnMkFnd0xJQWNnRFVFRmRHb2lFU0FGSUExQkFuUWlERUVCY2lJU2FpMEFBRUVJZENBRklBeHFMUUFBY2lBRklBeEJBbklpRTJvdEFBQkJFSFJ5SUFVZ0RFRURjaUlNYWkwQUFFRVlkSEkyQWh3Z0N5QURJQkpCQW5RaUVtb3FBZ0FpRnpnQ2tBRWdDeUFESUJOQkFuUWlFMm9xQWdBaUdEZ0NsQUVnQ3lBRElBeEJBblFpRkdvcUFnQWlHVGdDbUFFZ0N5QURJQTFCQkhRaUZXb3FBZ0NNSWhvNEFwd0JJQXRCNEFCcUlnd2dDeW9DbUFFaUZrTUFBQURBbENBV2xDQUxLZ0tVQVNJV1F3QUFBTUNVSUJhVVF3QUFnRCtTa2pnQ0FDQU1JQXNxQXBBQkloWWdGcElnQ3lvQ2xBR1VJQXNxQXBnQlF3QUFBTUNVSUFzcUFwd0JsSkk0QWdRZ0RDQUxLZ0tRQVNJV0lCYVNJQXNxQXBnQmxDQUxLZ0tVQVNJV0lCYVNJQXNxQXB3QmxKSTRBZ2dnRENBTEtnS1FBU0lXSUJhU0lBc3FBcFFCbENBTEtnS1lBU0lXSUJhU0lBc3FBcHdCbEpJNEFnd2dEQ0FMS2dLWUFTSVdRd0FBQU1DVUlCYVVJQXNxQXBBQkloWkRBQUFBd0pRZ0ZwUkRBQUNBUDVLU09BSVFJQXdnQ3lvQ2xBRWlGaUFXa2lBTEtnS1lBWlFnQ3lvQ2tBRkRBQUFBd0pRZ0N5b0NuQUdVa2pnQ0ZDQU1JQXNxQXBBQkloWWdGcElnQ3lvQ21BR1VJQXNxQXBRQlF3QUFBTUNVSUFzcUFwd0JsSkk0QWhnZ0RDQUxLZ0tVQVNJV0lCYVNJQXNxQXBnQmxDQUxLZ0tRQVNJV0lCYVNJQXNxQXB3QmxKSTRBaHdnRENBTEtnS1VBU0lXUXdBQUFNQ1VJQmFVSUFzcUFwQUJJaFpEQUFBQXdKUWdGcFJEQUFDQVA1S1NPQUlnSUFrZ0ZXb2dGemdDQUNBSklCSnFJQmc0QWdBZ0NTQVRhaUFaT0FJQUlBa2dGR29nR2pnQ0FDQUxJQVFnRUdvcUFnQWlGemdDTUNBTElBUWdEMm9xQWdBaUdEZ0NRQ0FMSUFRZ0Rtb3FBZ0FpR1RnQ1VDQUtJQkJxSUJjNEFnQWdDaUFQYWlBWU9BSUFJQW9nRG1vZ0dUZ0NBQ0FMSUF3cUFoZ2dDeW9DT0pRZ0RDb0NBQ0FMS2dJd2xDQU1LZ0lNSUFzcUFqU1VrcEk0QWdBZ0N5QU1LZ0ljSUFzcUFqaVVJQXdxQWdRZ0N5b0NNSlFnRENvQ0VDQUxLZ0kwbEpLU09BSUVJQXNnRENvQ0lDQUxLZ0k0bENBTUtnSUlJQXNxQWpDVUlBd3FBaFFnQ3lvQ05KU1NramdDQ0NBTElBd3FBaGdnQ3lvQ1JKUWdEQ29DQUNBTEtnSThsQ0FNS2dJTUlBc3FBa0NVa3BJNEFnd2dDeUFNS2dJY0lBc3FBa1NVSUF3cUFnUWdDeW9DUEpRZ0RDb0NFQ0FMS2dKQWxKS1NPQUlRSUFzZ0RDb0NJQ0FMS2dKRWxDQU1LZ0lJSUFzcUFqeVVJQXdxQWhRZ0N5b0NRSlNTa2pnQ0ZDQUxJQXdxQWhnZ0N5b0NVSlFnRENvQ0FDQUxLZ0pJbENBTUtnSU1JQXNxQWt5VWtwSTRBaGdnQ3lBTUtnSWNJQXNxQWxDVUlBd3FBZ1FnQ3lvQ1NKUWdEQ29DRUNBTEtnSk1sSktTT0FJY0lBc2dEQ29DSUNBTEtnSlFsQ0FNS2dJSUlBc3FBa2lVSUF3cUFoUWdDeW9DVEpTU2tqZ0NJQ0FMS2dJZ0lSY2dDeW9DQ0NFWUlBc3FBaFFoR1NBUklBc3FBaGdpR2lBYWxDQUxLZ0lBSWhZZ0ZwUWdDeW9DRENJYklCdVVrcEpEQUFDQVFKUWdHaUFMS2dJY0loeVVJQllnQ3lvQ0JDSWRsQ0FiSUFzcUFoQWlIcFNTa2tNQUFJQkFsQkFNTmdJUUlCRWdHaUFYbENBV0lCaVVJQnNnR1pTU2trTUFBSUJBbENBY0lCeVVJQjBnSFpRZ0hpQWVsSktTUXdBQWdFQ1VFQXcyQWhRZ0VTQWNJQmVVSUIwZ0dKUWdIaUFabEpLU1F3QUFnRUNVSUJjZ0Y1UWdHQ0FZbENBWklCbVVrcEpEQUFDQVFKUVFERFlDR0NBTlFRRnFJUTBNQVFzTElBdEJvQUZxSkFBTEdnQWdBQ0FCS0FJSUlBVVFDZ1JBSUFFZ0FpQURJQVFRRkFzTE53QWdBQ0FCS0FJSUlBVVFDZ1JBSUFFZ0FpQURJQVFRRkE4TElBQW9BZ2dpQUNBQklBSWdBeUFFSUFVZ0FDZ0NBQ2dDRkJFREFBdVJBUUFnQUNBQktBSUlJQVFRQ2dSQUlBRWdBaUFERUJNUEN3SkFJQUFnQVNnQ0FDQUVFQXBGRFFBQ1FDQUNJQUVvQWhCSEJFQWdBU2dDRkNBQ1J3MEJDeUFEUVFGSERRRWdBVUVCTmdJZ0R3c2dBU0FDTmdJVUlBRWdBellDSUNBQklBRW9BaWhCQVdvMkFpZ0NRQ0FCS0FJa1FRRkhEUUFnQVNnQ0dFRUNSdzBBSUFGQkFUb0FOZ3NnQVVFRU5nSXNDd3Z5QVFBZ0FDQUJLQUlJSUFRUUNnUkFJQUVnQWlBREVCTVBDd0pBSUFBZ0FTZ0NBQ0FFRUFvRVFBSkFJQUlnQVNnQ0VFY0VRQ0FCS0FJVUlBSkhEUUVMSUFOQkFVY05BaUFCUVFFMkFpQVBDeUFCSUFNMkFpQUNRQ0FCS0FJc1FRUkdEUUFnQVVFQU93RTBJQUFvQWdnaUFDQUJJQUlnQWtFQklBUWdBQ2dDQUNnQ0ZCRURBQ0FCTFFBMUJFQWdBVUVETmdJc0lBRXRBRFJGRFFFTUF3c2dBVUVFTmdJc0N5QUJJQUkyQWhRZ0FTQUJLQUlvUVFGcU5nSW9JQUVvQWlSQkFVY05BU0FCS0FJWVFRSkhEUUVnQVVFQk9nQTJEd3NnQUNnQ0NDSUFJQUVnQWlBRElBUWdBQ2dDQUNnQ0dCRUNBQXNMTVFBZ0FDQUJLQUlJUVFBUUNnUkFJQUVnQWlBREVCVVBDeUFBS0FJSUlnQWdBU0FDSUFNZ0FDZ0NBQ2dDSEJFQUFBc1lBQ0FBSUFFb0FnaEJBQkFLQkVBZ0FTQUNJQU1RRlFzTGdBTUJCSDhqQUVId0FHc2lBaVFBSUFBb0FnQWlBMEVFYXlnQ0FDRUVJQU5CQ0dzb0FnQWhCU0FDUWdBM0FsQWdBa0lBTndKWUlBSkNBRGNDWUNBQ1FnQTNBR2NnQWtJQU53SklJQUpCQURZQ1JDQUNRZXdWTmdKQUlBSWdBRFlDUENBQ0lBRTJBamdnQUNBRmFpRURBa0FnQkNBQlFRQVFDZ1JBUVFBZ0F5QUZHeUVBREFFTElBQWdBMDRFUUNBQ1FnQTNBQzhnQWtJQU53SVlJQUpDQURjQ0lDQUNRZ0EzQWlnZ0FrSUFOd0lRSUFKQkFEWUNEQ0FDSUFFMkFnZ2dBaUFBTmdJRUlBSWdCRFlDQUNBQ1FRRTJBakFnQkNBQ0lBTWdBMEVCUVFBZ0JDZ0NBQ2dDRkJFREFDQUNLQUlZRFFFTFFRQWhBQ0FFSUFKQk9Hb2dBMEVCUVFBZ0JDZ0NBQ2dDR0JFQ0FBSkFBa0FnQWlnQ1hBNENBQUVDQ3lBQ0tBSk1RUUFnQWlnQ1dFRUJSaHRCQUNBQ0tBSlVRUUZHRzBFQUlBSW9BbUJCQVVZYklRQU1BUXNnQWlnQ1VFRUJSd1JBSUFJb0FtQU5BU0FDS0FKVVFRRkhEUUVnQWlnQ1dFRUJSdzBCQ3lBQ0tBSklJUUFMSUFKQjhBQnFKQUFnQUF1WkFRRUNmeU1BUVVCcUlnTWtBQUovUVFFZ0FDQUJRUUFRQ2cwQUdrRUFJQUZGRFFBYVFRQWdBVUdjRmhBaElnRkZEUUFhSUFOQkRHcEJOQkFRSUFOQkFUWUNPQ0FEUVg4MkFoUWdBeUFBTmdJUUlBTWdBVFlDQ0NBQklBTkJDR29nQWlnQ0FFRUJJQUVvQWdBb0Fod1JBQUFnQXlnQ0lDSUFRUUZHQkVBZ0FpQURLQUlZTmdJQUN5QUFRUUZHQ3lFRUlBTkJRR3NrQUNBRUN3b0FJQUFnQVVFQUVBb0xDN2NTQWdCQmdBZ0xwaEoxYm5OcFoyNWxaQ0J6YUc5eWRBQjFibk5wWjI1bFpDQnBiblFBWm14dllYUUFkV2x1ZERZMFgzUUFkVzV6YVdkdVpXUWdZMmhoY2dCaWIyOXNBSFZ1YzJsbmJtVmtJR3h2Ym1jQWMzUmtPanAzYzNSeWFXNW5BSE4wWkRvNmMzUnlhVzVuQUhOMFpEbzZkVEUyYzNSeWFXNW5BSE4wWkRvNmRUTXljM1J5YVc1bkFHUnZkV0pzWlFCMmIybGtBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BITm9iM0owUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYm5OcFoyNWxaQ0J6YUc5eWRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGFXNTBQZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eDFibk5wWjI1bFpDQnBiblErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQR1pzYjJGMFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4MWFXNTBPRjkwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenhwYm5RNFgzUStBR1Z0YzJOeWFYQjBaVzQ2T20xbGJXOXllVjkyYVdWM1BIVnBiblF4Tmw5MFBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4cGJuUXhObDkwUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkengxYVc1ME5qUmZkRDRBWlcxelkzSnBjSFJsYmpvNmJXVnRiM0o1WDNacFpYYzhhVzUwTmpSZmRENEFaVzF6WTNKcGNIUmxiam82YldWdGIzSjVYM1pwWlhjOGRXbHVkRE15WDNRK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEdsdWRETXlYM1ErQUdWdGMyTnlhWEIwWlc0Nk9tMWxiVzl5ZVY5MmFXVjNQR05vWVhJK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEhWdWMybG5ibVZrSUdOb1lYSStBSE4wWkRvNlltRnphV05mYzNSeWFXNW5QSFZ1YzJsbmJtVmtJR05vWVhJK0FHVnRjMk55YVhCMFpXNDZPbTFsYlc5eWVWOTJhV1YzUEhOcFoyNWxaQ0JqYUdGeVBnQmxiWE5qY21sd2RHVnVPanB0WlcxdmNubGZkbWxsZHp4c2IyNW5QZ0JsYlhOamNtbHdkR1Z1T2pwdFpXMXZjbmxmZG1sbGR6eDFibk5wWjI1bFpDQnNiMjVuUGdCbGJYTmpjbWx3ZEdWdU9qcHRaVzF2Y25sZmRtbGxkenhrYjNWaWJHVStBRTVUZEROZlh6SXhNbUpoYzJsalgzTjBjbWx1WjBsalRsTmZNVEZqYUdGeVgzUnlZV2wwYzBsalJVVk9VMTg1WVd4c2IyTmhkRzl5U1dORlJVVkZBQUFBQUpRTUFBQXlCd0FBVGxOME0xOWZNakV5WW1GemFXTmZjM1J5YVc1blNXaE9VMTh4TVdOb1lYSmZkSEpoYVhSelNXaEZSVTVUWHpsaGJHeHZZMkYwYjNKSmFFVkZSVVVBQUpRTUFBQjhCd0FBVGxOME0xOWZNakV5WW1GemFXTmZjM1J5YVc1blNYZE9VMTh4TVdOb1lYSmZkSEpoYVhSelNYZEZSVTVUWHpsaGJHeHZZMkYwYjNKSmQwVkZSVVVBQUpRTUFBREVCd0FBVGxOME0xOWZNakV5WW1GemFXTmZjM1J5YVc1blNVUnpUbE5mTVRGamFHRnlYM1J5WVdsMGMwbEVjMFZGVGxOZk9XRnNiRzlqWVhSdmNrbEVjMFZGUlVVQUFBQ1VEQUFBREFnQUFFNVRkRE5mWHpJeE1tSmhjMmxqWDNOMGNtbHVaMGxFYVU1VFh6RXhZMmhoY2w5MGNtRnBkSE5KUkdsRlJVNVRYemxoYkd4dlkyRjBiM0pKUkdsRlJVVkZBQUFBbEF3QUFGZ0lBQUJPTVRCbGJYTmpjbWx3ZEdWdU0zWmhiRVVBQUpRTUFBQ2tDQUFBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKWTBWRkFBQ1VEQUFBd0FnQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NXRkZSUUFBbEF3QUFPZ0lBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGxvUlVVQUFKUU1BQUFRQ1FBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSmMwVkZBQUNVREFBQU9Ba0FBRTR4TUdWdGMyTnlhWEIwWlc0eE1XMWxiVzl5ZVY5MmFXVjNTWFJGUlFBQWxBd0FBR0FKQUFCT01UQmxiWE5qY21sd2RHVnVNVEZ0WlcxdmNubGZkbWxsZDBscFJVVUFBSlFNQUFDSUNRQUFUakV3WlcxelkzSnBjSFJsYmpFeGJXVnRiM0o1WDNacFpYZEpha1ZGQUFDVURBQUFzQWtBQUU0eE1HVnRjMk55YVhCMFpXNHhNVzFsYlc5eWVWOTJhV1YzU1d4RlJRQUFsQXdBQU5nSkFBQk9NVEJsYlhOamNtbHdkR1Z1TVRGdFpXMXZjbmxmZG1sbGQwbHRSVVVBQUpRTUFBQUFDZ0FBVGpFd1pXMXpZM0pwY0hSbGJqRXhiV1Z0YjNKNVgzWnBaWGRKZUVWRkFBQ1VEQUFBS0FvQUFFNHhNR1Z0YzJOeWFYQjBaVzR4TVcxbGJXOXllVjkyYVdWM1NYbEZSUUFBbEF3QUFGQUtBQUJPTVRCbGJYTmpjbWx3ZEdWdU1URnRaVzF2Y25sZmRtbGxkMGxtUlVVQUFKUU1BQUI0Q2dBQVRqRXdaVzF6WTNKcGNIUmxiakV4YldWdGIzSjVYM1pwWlhkSlpFVkZBQUNVREFBQW9Bb0FBRTR4TUY5ZlkzaDRZV0pwZGpFeE5sOWZjMmhwYlY5MGVYQmxYMmx1Wm05RkFBQUFBTHdNQUFESUNnQUFJQTBBQUU0eE1GOWZZM2g0WVdKcGRqRXhOMTlmWTJ4aGMzTmZkSGx3WlY5cGJtWnZSUUFBQUx3TUFBRDRDZ0FBN0FvQUFFNHhNRjlmWTNoNFlXSnBkakV4TjE5ZmNHSmhjMlZmZEhsd1pWOXBibVp2UlFBQUFMd01BQUFvQ3dBQTdBb0FBRTR4TUY5ZlkzaDRZV0pwZGpFeE9WOWZjRzlwYm5SbGNsOTBlWEJsWDJsdVptOUZBTHdNQUFCWUN3QUFUQXNBQUFBQUFBRE1Dd0FBQWdBQUFBTUFBQUFFQUFBQUJRQUFBQVlBQUFCT01UQmZYMk40ZUdGaWFYWXhNak5mWDJaMWJtUmhiV1Z1ZEdGc1gzUjVjR1ZmYVc1bWIwVUF2QXdBQUtRTEFBRHNDZ0FBZGdBQUFKQUxBQURZQ3dBQVlnQUFBSkFMQUFEa0N3QUFZd0FBQUpBTEFBRHdDd0FBYUFBQUFKQUxBQUQ4Q3dBQVlRQUFBSkFMQUFBSURBQUFjd0FBQUpBTEFBQVVEQUFBZEFBQUFKQUxBQUFnREFBQWFRQUFBSkFMQUFBc0RBQUFhZ0FBQUpBTEFBQTREQUFBYkFBQUFKQUxBQUJFREFBQWJRQUFBSkFMQUFCUURBQUFlQUFBQUpBTEFBQmNEQUFBZVFBQUFKQUxBQUJvREFBQVpnQUFBSkFMQUFCMERBQUFaQUFBQUpBTEFBQ0FEQUFBQUFBQUFCd0xBQUFDQUFBQUJ3QUFBQVFBQUFBRkFBQUFDQUFBQUFrQUFBQUtBQUFBQ3dBQUFBQUFBQUFFRFFBQUFnQUFBQXdBQUFBRUFBQUFCUUFBQUFnQUFBQU5BQUFBRGdBQUFBOEFBQUJPTVRCZlgyTjRlR0ZpYVhZeE1qQmZYM05wWDJOc1lYTnpYM1I1Y0dWZmFXNW1iMFVBQUFBQXZBd0FBTndNQUFBY0N3QUFVM1E1ZEhsd1pWOXBibVp2QUFBQUFKUU1BQUFRRFFCQnFCb0xBekFQQVE9PSI7aWYoIWlzRGF0YVVSSSh3YXNtQmluYXJ5RmlsZSkpe3dhc21CaW5hcnlGaWxlPWxvY2F0ZUZpbGUod2FzbUJpbmFyeUZpbGUpO31mdW5jdGlvbiBnZXRCaW5hcnlTeW5jKGZpbGUpe2lmKGZpbGU9PXdhc21CaW5hcnlGaWxlJiZ3YXNtQmluYXJ5KXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkod2FzbUJpbmFyeSl9dmFyIGJpbmFyeT10cnlQYXJzZUFzRGF0YVVSSShmaWxlKTtpZihiaW5hcnkpe3JldHVybiBiaW5hcnl9aWYocmVhZEJpbmFyeSl7cmV0dXJuIHJlYWRCaW5hcnkoZmlsZSl9dGhyb3cgImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkIn1mdW5jdGlvbiBnZXRCaW5hcnlQcm9taXNlKGJpbmFyeUZpbGUpe3JldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5nZXRCaW5hcnlTeW5jKGJpbmFyeUZpbGUpKX1mdW5jdGlvbiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKGJpbmFyeUZpbGUsaW1wb3J0cyxyZWNlaXZlcil7cmV0dXJuIGdldEJpbmFyeVByb21pc2UoYmluYXJ5RmlsZSkudGhlbihiaW5hcnk9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGJpbmFyeSxpbXBvcnRzKSkudGhlbihpbnN0YW5jZT0+aW5zdGFuY2UpLnRoZW4ocmVjZWl2ZXIscmVhc29uPT57ZXJyKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke3JlYXNvbn1gKTthYm9ydChyZWFzb24pO30pfWZ1bmN0aW9uIGluc3RhbnRpYXRlQXN5bmMoYmluYXJ5LGJpbmFyeUZpbGUsaW1wb3J0cyxjYWxsYmFjayl7cmV0dXJuIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIoYmluYXJ5RmlsZSxpbXBvcnRzLGNhbGxiYWNrKX1mdW5jdGlvbiBjcmVhdGVXYXNtKCl7dmFyIGluZm89eyJhIjp3YXNtSW1wb3J0c307ZnVuY3Rpb24gcmVjZWl2ZUluc3RhbmNlKGluc3RhbmNlLG1vZHVsZSl7d2FzbUV4cG9ydHM9aW5zdGFuY2UuZXhwb3J0czt3YXNtTWVtb3J5PXdhc21FeHBvcnRzWyJrIl07dXBkYXRlTWVtb3J5Vmlld3MoKTthZGRPbkluaXQod2FzbUV4cG9ydHNbImwiXSk7cmVtb3ZlUnVuRGVwZW5kZW5jeSgpO3JldHVybiB3YXNtRXhwb3J0c31hZGRSdW5EZXBlbmRlbmN5KCk7ZnVuY3Rpb24gcmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQocmVzdWx0KXtyZWNlaXZlSW5zdGFuY2UocmVzdWx0WyJpbnN0YW5jZSJdKTt9aWYoTW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXSl7dHJ5e3JldHVybiBNb2R1bGVbImluc3RhbnRpYXRlV2FzbSJdKGluZm8scmVjZWl2ZUluc3RhbmNlKX1jYXRjaChlKXtlcnIoYE1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6ICR7ZX1gKTtyZWFkeVByb21pc2VSZWplY3QoZSk7fX1pbnN0YW50aWF0ZUFzeW5jKHdhc21CaW5hcnksd2FzbUJpbmFyeUZpbGUsaW5mbyxyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCkuY2F0Y2gocmVhZHlQcm9taXNlUmVqZWN0KTtyZXR1cm4ge319dmFyIGNhbGxSdW50aW1lQ2FsbGJhY2tzPWNhbGxiYWNrcz0+e3doaWxlKGNhbGxiYWNrcy5sZW5ndGg+MCl7Y2FsbGJhY2tzLnNoaWZ0KCkoTW9kdWxlKTt9fTtNb2R1bGVbIm5vRXhpdFJ1bnRpbWUiXXx8dHJ1ZTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfYmlnaW50PShwcmltaXRpdmVUeXBlLG5hbWUsc2l6ZSxtaW5SYW5nZSxtYXhSYW5nZSk9Pnt9O3ZhciBlbWJpbmRfaW5pdF9jaGFyQ29kZXM9KCk9Pnt2YXIgY29kZXM9bmV3IEFycmF5KDI1Nik7Zm9yKHZhciBpPTA7aTwyNTY7KytpKXtjb2Rlc1tpXT1TdHJpbmcuZnJvbUNoYXJDb2RlKGkpO31lbWJpbmRfY2hhckNvZGVzPWNvZGVzO307dmFyIGVtYmluZF9jaGFyQ29kZXM7dmFyIHJlYWRMYXRpbjFTdHJpbmc9cHRyPT57dmFyIHJldD0iIjt2YXIgYz1wdHI7d2hpbGUoSEVBUFU4W2NdKXtyZXQrPWVtYmluZF9jaGFyQ29kZXNbSEVBUFU4W2MrK11dO31yZXR1cm4gcmV0fTt2YXIgYXdhaXRpbmdEZXBlbmRlbmNpZXM9e307dmFyIHJlZ2lzdGVyZWRUeXBlcz17fTt2YXIgQmluZGluZ0Vycm9yO3ZhciB0aHJvd0JpbmRpbmdFcnJvcj1tZXNzYWdlPT57dGhyb3cgbmV3IEJpbmRpbmdFcnJvcihtZXNzYWdlKX07ZnVuY3Rpb24gc2hhcmVkUmVnaXN0ZXJUeXBlKHJhd1R5cGUscmVnaXN0ZXJlZEluc3RhbmNlLG9wdGlvbnM9e30pe3ZhciBuYW1lPXJlZ2lzdGVyZWRJbnN0YW5jZS5uYW1lO2lmKCFyYXdUeXBlKXt0aHJvd0JpbmRpbmdFcnJvcihgdHlwZSAiJHtuYW1lfSIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcmApO31pZihyZWdpc3RlcmVkVHlwZXMuaGFzT3duUHJvcGVydHkocmF3VHlwZSkpe2lmKG9wdGlvbnMuaWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9ucyl7cmV0dXJufWVsc2Uge3Rocm93QmluZGluZ0Vycm9yKGBDYW5ub3QgcmVnaXN0ZXIgdHlwZSAnJHtuYW1lfScgdHdpY2VgKTt9fXJlZ2lzdGVyZWRUeXBlc1tyYXdUeXBlXT1yZWdpc3RlcmVkSW5zdGFuY2U7aWYoYXdhaXRpbmdEZXBlbmRlbmNpZXMuaGFzT3duUHJvcGVydHkocmF3VHlwZSkpe3ZhciBjYWxsYmFja3M9YXdhaXRpbmdEZXBlbmRlbmNpZXNbcmF3VHlwZV07ZGVsZXRlIGF3YWl0aW5nRGVwZW5kZW5jaWVzW3Jhd1R5cGVdO2NhbGxiYWNrcy5mb3JFYWNoKGNiPT5jYigpKTt9fWZ1bmN0aW9uIHJlZ2lzdGVyVHlwZShyYXdUeXBlLHJlZ2lzdGVyZWRJbnN0YW5jZSxvcHRpb25zPXt9KXtpZighKCJhcmdQYWNrQWR2YW5jZSJpbiByZWdpc3RlcmVkSW5zdGFuY2UpKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJyZWdpc3RlclR5cGUgcmVnaXN0ZXJlZEluc3RhbmNlIHJlcXVpcmVzIGFyZ1BhY2tBZHZhbmNlIil9cmV0dXJuIHNoYXJlZFJlZ2lzdGVyVHlwZShyYXdUeXBlLHJlZ2lzdGVyZWRJbnN0YW5jZSxvcHRpb25zKX12YXIgR2VuZXJpY1dpcmVUeXBlU2l6ZT04O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9ib29sPShyYXdUeXBlLG5hbWUsdHJ1ZVZhbHVlLGZhbHNlVmFsdWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZnVuY3Rpb24od3Qpe3JldHVybiAhIXd0fSwidG9XaXJlVHlwZSI6ZnVuY3Rpb24oZGVzdHJ1Y3RvcnMsbyl7cmV0dXJuIG8/dHJ1ZVZhbHVlOmZhbHNlVmFsdWV9LCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZ1bmN0aW9uKHBvaW50ZXIpe3JldHVybiB0aGlzWyJmcm9tV2lyZVR5cGUiXShIRUFQVThbcG9pbnRlcl0pfSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pO307Y2xhc3MgSGFuZGxlQWxsb2NhdG9ye2NvbnN0cnVjdG9yKCl7dGhpcy5hbGxvY2F0ZWQ9W3VuZGVmaW5lZF07dGhpcy5mcmVlbGlzdD1bXTt9Z2V0KGlkKXtyZXR1cm4gdGhpcy5hbGxvY2F0ZWRbaWRdfWhhcyhpZCl7cmV0dXJuIHRoaXMuYWxsb2NhdGVkW2lkXSE9PXVuZGVmaW5lZH1hbGxvY2F0ZShoYW5kbGUpe3ZhciBpZD10aGlzLmZyZWVsaXN0LnBvcCgpfHx0aGlzLmFsbG9jYXRlZC5sZW5ndGg7dGhpcy5hbGxvY2F0ZWRbaWRdPWhhbmRsZTtyZXR1cm4gaWR9ZnJlZShpZCl7dGhpcy5hbGxvY2F0ZWRbaWRdPXVuZGVmaW5lZDt0aGlzLmZyZWVsaXN0LnB1c2goaWQpO319dmFyIGVtdmFsX2hhbmRsZXM9bmV3IEhhbmRsZUFsbG9jYXRvcjt2YXIgX19lbXZhbF9kZWNyZWY9aGFuZGxlPT57aWYoaGFuZGxlPj1lbXZhbF9oYW5kbGVzLnJlc2VydmVkJiYwPT09LS1lbXZhbF9oYW5kbGVzLmdldChoYW5kbGUpLnJlZmNvdW50KXtlbXZhbF9oYW5kbGVzLmZyZWUoaGFuZGxlKTt9fTt2YXIgY291bnRfZW12YWxfaGFuZGxlcz0oKT0+e3ZhciBjb3VudD0wO2Zvcih2YXIgaT1lbXZhbF9oYW5kbGVzLnJlc2VydmVkO2k8ZW12YWxfaGFuZGxlcy5hbGxvY2F0ZWQubGVuZ3RoOysraSl7aWYoZW12YWxfaGFuZGxlcy5hbGxvY2F0ZWRbaV0hPT11bmRlZmluZWQpeysrY291bnQ7fX1yZXR1cm4gY291bnR9O3ZhciBpbml0X2VtdmFsPSgpPT57ZW12YWxfaGFuZGxlcy5hbGxvY2F0ZWQucHVzaCh7dmFsdWU6dW5kZWZpbmVkfSx7dmFsdWU6bnVsbH0se3ZhbHVlOnRydWV9LHt2YWx1ZTpmYWxzZX0pO09iamVjdC5hc3NpZ24oZW12YWxfaGFuZGxlcyx7cmVzZXJ2ZWQ6ZW12YWxfaGFuZGxlcy5hbGxvY2F0ZWQubGVuZ3RofSksTW9kdWxlWyJjb3VudF9lbXZhbF9oYW5kbGVzIl09Y291bnRfZW12YWxfaGFuZGxlczt9O3ZhciBFbXZhbD17dG9WYWx1ZTpoYW5kbGU9PntpZighaGFuZGxlKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHVzZSBkZWxldGVkIHZhbC4gaGFuZGxlID0gIitoYW5kbGUpO31yZXR1cm4gZW12YWxfaGFuZGxlcy5nZXQoaGFuZGxlKS52YWx1ZX0sdG9IYW5kbGU6dmFsdWU9Pntzd2l0Y2godmFsdWUpe2Nhc2UgdW5kZWZpbmVkOnJldHVybiAxO2Nhc2UgbnVsbDpyZXR1cm4gMjtjYXNlIHRydWU6cmV0dXJuIDM7Y2FzZSBmYWxzZTpyZXR1cm4gNDtkZWZhdWx0OntyZXR1cm4gZW12YWxfaGFuZGxlcy5hbGxvY2F0ZSh7cmVmY291bnQ6MSx2YWx1ZTp2YWx1ZX0pfX19fTtmdW5jdGlvbiBzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUDMyW3BvaW50ZXI+PjJdKX12YXIgRW1WYWxUeXBlPXtuYW1lOiJlbXNjcmlwdGVuOjp2YWwiLCJmcm9tV2lyZVR5cGUiOmhhbmRsZT0+e3ZhciBydj1FbXZhbC50b1ZhbHVlKGhhbmRsZSk7X19lbXZhbF9kZWNyZWYoaGFuZGxlKTtyZXR1cm4gcnZ9LCJ0b1dpcmVUeXBlIjooZGVzdHJ1Y3RvcnMsdmFsdWUpPT5FbXZhbC50b0hhbmRsZSh2YWx1ZSksImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6c2ltcGxlUmVhZFZhbHVlRnJvbVBvaW50ZXIsZGVzdHJ1Y3RvckZ1bmN0aW9uOm51bGx9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbD1yYXdUeXBlPT5yZWdpc3RlclR5cGUocmF3VHlwZSxFbVZhbFR5cGUpO3ZhciBmbG9hdFJlYWRWYWx1ZUZyb21Qb2ludGVyPShuYW1lLHdpZHRoKT0+e3N3aXRjaCh3aWR0aCl7Y2FzZSA0OnJldHVybiBmdW5jdGlvbihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUEYzMltwb2ludGVyPj4yXSl9O2Nhc2UgODpyZXR1cm4gZnVuY3Rpb24ocG9pbnRlcil7cmV0dXJuIHRoaXNbImZyb21XaXJlVHlwZSJdKEhFQVBGNjRbcG9pbnRlcj4+M10pfTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgZmxvYXQgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0PShyYXdUeXBlLG5hbWUsc2l6ZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7cmVnaXN0ZXJUeXBlKHJhd1R5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjp2YWx1ZT0+dmFsdWUsInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PnZhbHVlLCJhcmdQYWNrQWR2YW5jZSI6R2VuZXJpY1dpcmVUeXBlU2l6ZSwicmVhZFZhbHVlRnJvbVBvaW50ZXIiOmZsb2F0UmVhZFZhbHVlRnJvbVBvaW50ZXIobmFtZSxzaXplKSxkZXN0cnVjdG9yRnVuY3Rpb246bnVsbH0pO307dmFyIGludGVnZXJSZWFkVmFsdWVGcm9tUG9pbnRlcj0obmFtZSx3aWR0aCxzaWduZWQpPT57c3dpdGNoKHdpZHRoKXtjYXNlIDE6cmV0dXJuIHNpZ25lZD9wb2ludGVyPT5IRUFQOFtwb2ludGVyPj4wXTpwb2ludGVyPT5IRUFQVThbcG9pbnRlcj4+MF07Y2FzZSAyOnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDE2W3BvaW50ZXI+PjFdOnBvaW50ZXI9PkhFQVBVMTZbcG9pbnRlcj4+MV07Y2FzZSA0OnJldHVybiBzaWduZWQ/cG9pbnRlcj0+SEVBUDMyW3BvaW50ZXI+PjJdOnBvaW50ZXI9PkhFQVBVMzJbcG9pbnRlcj4+Ml07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGludGVnZXIgd2lkdGggKCR7d2lkdGh9KTogJHtuYW1lfWApfX07dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXI9KHByaW1pdGl2ZVR5cGUsbmFtZSxzaXplLG1pblJhbmdlLG1heFJhbmdlKT0+e25hbWU9cmVhZExhdGluMVN0cmluZyhuYW1lKTt2YXIgZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTtpZihtaW5SYW5nZT09PTApe3ZhciBiaXRzaGlmdD0zMi04KnNpemU7ZnJvbVdpcmVUeXBlPXZhbHVlPT52YWx1ZTw8Yml0c2hpZnQ+Pj5iaXRzaGlmdDt9dmFyIGlzVW5zaWduZWRUeXBlPW5hbWUuaW5jbHVkZXMoInVuc2lnbmVkIik7dmFyIGNoZWNrQXNzZXJ0aW9ucz0odmFsdWUsdG9UeXBlTmFtZSk9Pnt9O3ZhciB0b1dpcmVUeXBlO2lmKGlzVW5zaWduZWRUeXBlKXt0b1dpcmVUeXBlPWZ1bmN0aW9uKGRlc3RydWN0b3JzLHZhbHVlKXtjaGVja0Fzc2VydGlvbnModmFsdWUsdGhpcy5uYW1lKTtyZXR1cm4gdmFsdWU+Pj4wfTt9ZWxzZSB7dG9XaXJlVHlwZT1mdW5jdGlvbihkZXN0cnVjdG9ycyx2YWx1ZSl7Y2hlY2tBc3NlcnRpb25zKHZhbHVlLHRoaXMubmFtZSk7cmV0dXJuIHZhbHVlfTt9cmVnaXN0ZXJUeXBlKHByaW1pdGl2ZVR5cGUse25hbWU6bmFtZSwiZnJvbVdpcmVUeXBlIjpmcm9tV2lyZVR5cGUsInRvV2lyZVR5cGUiOnRvV2lyZVR5cGUsImFyZ1BhY2tBZHZhbmNlIjpHZW5lcmljV2lyZVR5cGVTaXplLCJyZWFkVmFsdWVGcm9tUG9pbnRlciI6aW50ZWdlclJlYWRWYWx1ZUZyb21Qb2ludGVyKG5hbWUsc2l6ZSxtaW5SYW5nZSE9PTApLGRlc3RydWN0b3JGdW5jdGlvbjpudWxsfSk7fTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXc9KHJhd1R5cGUsZGF0YVR5cGVJbmRleCxuYW1lKT0+e3ZhciB0eXBlTWFwcGluZz1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXldO3ZhciBUQT10eXBlTWFwcGluZ1tkYXRhVHlwZUluZGV4XTtmdW5jdGlvbiBkZWNvZGVNZW1vcnlWaWV3KGhhbmRsZSl7dmFyIHNpemU9SEVBUFUzMltoYW5kbGU+PjJdO3ZhciBkYXRhPUhFQVBVMzJbaGFuZGxlKzQ+PjJdO3JldHVybiBuZXcgVEEoSEVBUDguYnVmZmVyLGRhdGEsc2l6ZSl9bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6ZGVjb2RlTWVtb3J5VmlldywiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpkZWNvZGVNZW1vcnlWaWV3fSx7aWdub3JlRHVwbGljYXRlUmVnaXN0cmF0aW9uczp0cnVlfSk7fTtmdW5jdGlvbiByZWFkUG9pbnRlcihwb2ludGVyKXtyZXR1cm4gdGhpc1siZnJvbVdpcmVUeXBlIl0oSEVBUFUzMltwb2ludGVyPj4yXSl9dmFyIHN0cmluZ1RvVVRGOEFycmF5PShzdHIsaGVhcCxvdXRJZHgsbWF4Qnl0ZXNUb1dyaXRlKT0+e2lmKCEobWF4Qnl0ZXNUb1dyaXRlPjApKXJldHVybiAwO3ZhciBzdGFydElkeD1vdXRJZHg7dmFyIGVuZElkeD1vdXRJZHgrbWF4Qnl0ZXNUb1dyaXRlLTE7Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7dmFyIHU9c3RyLmNoYXJDb2RlQXQoaSk7aWYodT49NTUyOTYmJnU8PTU3MzQzKXt2YXIgdTE9c3RyLmNoYXJDb2RlQXQoKytpKTt1PTY1NTM2KygodSYxMDIzKTw8MTApfHUxJjEwMjM7fWlmKHU8PTEyNyl7aWYob3V0SWR4Pj1lbmRJZHgpYnJlYWs7aGVhcFtvdXRJZHgrK109dTt9ZWxzZSBpZih1PD0yMDQ3KXtpZihvdXRJZHgrMT49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTE5Mnx1Pj42O2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzO31lbHNlIGlmKHU8PTY1NTM1KXtpZihvdXRJZHgrMj49ZW5kSWR4KWJyZWFrO2hlYXBbb3V0SWR4KytdPTIyNHx1Pj4xMjtoZWFwW291dElkeCsrXT0xMjh8dT4+NiY2MztoZWFwW291dElkeCsrXT0xMjh8dSY2Mzt9ZWxzZSB7aWYob3V0SWR4KzM+PWVuZElkeClicmVhaztoZWFwW291dElkeCsrXT0yNDB8dT4+MTg7aGVhcFtvdXRJZHgrK109MTI4fHU+PjEyJjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1Pj42JjYzO2hlYXBbb3V0SWR4KytdPTEyOHx1JjYzO319aGVhcFtvdXRJZHhdPTA7cmV0dXJuIG91dElkeC1zdGFydElkeH07dmFyIHN0cmluZ1RvVVRGOD0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT5zdHJpbmdUb1VURjhBcnJheShzdHIsSEVBUFU4LG91dFB0cixtYXhCeXRlc1RvV3JpdGUpO3ZhciBsZW5ndGhCeXRlc1VURjg9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjPXN0ci5jaGFyQ29kZUF0KGkpO2lmKGM8PTEyNyl7bGVuKys7fWVsc2UgaWYoYzw9MjA0Nyl7bGVuKz0yO31lbHNlIGlmKGM+PTU1Mjk2JiZjPD01NzM0Myl7bGVuKz00OysraTt9ZWxzZSB7bGVuKz0zO319cmV0dXJuIGxlbn07dmFyIFVURjhEZWNvZGVyPXR5cGVvZiBUZXh0RGVjb2RlciE9InVuZGVmaW5lZCI/bmV3IFRleHREZWNvZGVyKCJ1dGY4Iik6dW5kZWZpbmVkO3ZhciBVVEY4QXJyYXlUb1N0cmluZz0oaGVhcE9yQXJyYXksaWR4LG1heEJ5dGVzVG9SZWFkKT0+e3ZhciBlbmRJZHg9aWR4K21heEJ5dGVzVG9SZWFkO3ZhciBlbmRQdHI9aWR4O3doaWxlKGhlYXBPckFycmF5W2VuZFB0cl0mJiEoZW5kUHRyPj1lbmRJZHgpKSsrZW5kUHRyO2lmKGVuZFB0ci1pZHg+MTYmJmhlYXBPckFycmF5LmJ1ZmZlciYmVVRGOERlY29kZXIpe3JldHVybiBVVEY4RGVjb2Rlci5kZWNvZGUoaGVhcE9yQXJyYXkuc3ViYXJyYXkoaWR4LGVuZFB0cikpfXZhciBzdHI9IiI7d2hpbGUoaWR4PGVuZFB0cil7dmFyIHUwPWhlYXBPckFycmF5W2lkeCsrXTtpZighKHUwJjEyOCkpe3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSh1MCk7Y29udGludWV9dmFyIHUxPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjI0KT09MTkyKXtzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoKHUwJjMxKTw8Nnx1MSk7Y29udGludWV9dmFyIHUyPWhlYXBPckFycmF5W2lkeCsrXSY2MztpZigodTAmMjQwKT09MjI0KXt1MD0odTAmMTUpPDwxMnx1MTw8Nnx1Mjt9ZWxzZSB7dTA9KHUwJjcpPDwxOHx1MTw8MTJ8dTI8PDZ8aGVhcE9yQXJyYXlbaWR4KytdJjYzO31pZih1MDw2NTUzNil7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTt9ZWxzZSB7dmFyIGNoPXUwLTY1NTM2O3N0cis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxjaD4+MTAsNTYzMjB8Y2gmMTAyMyk7fX1yZXR1cm4gc3RyfTt2YXIgVVRGOFRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT5wdHI/VVRGOEFycmF5VG9TdHJpbmcoSEVBUFU4LHB0cixtYXhCeXRlc1RvUmVhZCk6IiI7dmFyIF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmc9KHJhd1R5cGUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIHN0ZFN0cmluZ0lzVVRGOD1uYW1lPT09InN0ZDo6c3RyaW5nIjtyZWdpc3RlclR5cGUocmF3VHlwZSx7bmFtZTpuYW1lLCJmcm9tV2lyZVR5cGUiKHZhbHVlKXt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBwYXlsb2FkPXZhbHVlKzQ7dmFyIHN0cjtpZihzdGRTdHJpbmdJc1VURjgpe3ZhciBkZWNvZGVTdGFydFB0cj1wYXlsb2FkO2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj1wYXlsb2FkK2k7aWYoaT09bGVuZ3RofHxIRUFQVThbY3VycmVudEJ5dGVQdHJdPT0wKXt2YXIgbWF4UmVhZD1jdXJyZW50Qnl0ZVB0ci1kZWNvZGVTdGFydFB0cjt2YXIgc3RyaW5nU2VnbWVudD1VVEY4VG9TdHJpbmcoZGVjb2RlU3RhcnRQdHIsbWF4UmVhZCk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudDt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudDt9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrMTt9fX1lbHNlIHt2YXIgYT1uZXcgQXJyYXkobGVuZ3RoKTtmb3IodmFyIGk9MDtpPGxlbmd0aDsrK2kpe2FbaV09U3RyaW5nLmZyb21DaGFyQ29kZShIRUFQVThbcGF5bG9hZCtpXSk7fXN0cj1hLmpvaW4oIiIpO31fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiKGRlc3RydWN0b3JzLHZhbHVlKXtpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXt2YWx1ZT1uZXcgVWludDhBcnJheSh2YWx1ZSk7fXZhciBsZW5ndGg7dmFyIHZhbHVlSXNPZlR5cGVTdHJpbmc9dHlwZW9mIHZhbHVlPT0ic3RyaW5nIjtpZighKHZhbHVlSXNPZlR5cGVTdHJpbmd8fHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8dmFsdWUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXt0aHJvd0JpbmRpbmdFcnJvcigiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZyIpO31pZihzdGRTdHJpbmdJc1VURjgmJnZhbHVlSXNPZlR5cGVTdHJpbmcpe2xlbmd0aD1sZW5ndGhCeXRlc1VURjgodmFsdWUpO31lbHNlIHtsZW5ndGg9dmFsdWUubGVuZ3RoO312YXIgYmFzZT1fbWFsbG9jKDQrbGVuZ3RoKzEpO3ZhciBwdHI9YmFzZSs0O0hFQVBVMzJbYmFzZT4+Ml09bGVuZ3RoO2lmKHN0ZFN0cmluZ0lzVVRGOCYmdmFsdWVJc09mVHlwZVN0cmluZyl7c3RyaW5nVG9VVEY4KHZhbHVlLHB0cixsZW5ndGgrMSk7fWVsc2Uge2lmKHZhbHVlSXNPZlR5cGVTdHJpbmcpe2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7dmFyIGNoYXJDb2RlPXZhbHVlLmNoYXJDb2RlQXQoaSk7aWYoY2hhckNvZGU+MjU1KXtfZnJlZShwdHIpO3Rocm93QmluZGluZ0Vycm9yKCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHMiKTt9SEVBUFU4W3B0citpXT1jaGFyQ29kZTt9fWVsc2Uge2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7SEVBUFU4W3B0citpXT12YWx1ZVtpXTt9fX1pZihkZXN0cnVjdG9ycyE9PW51bGwpe2Rlc3RydWN0b3JzLnB1c2goX2ZyZWUsYmFzZSk7fXJldHVybiBiYXNlfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpyZWFkUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpO319KTt9O3ZhciBVVEYxNkRlY29kZXI9dHlwZW9mIFRleHREZWNvZGVyIT0idW5kZWZpbmVkIj9uZXcgVGV4dERlY29kZXIoInV0Zi0xNmxlIik6dW5kZWZpbmVkO3ZhciBVVEYxNlRvU3RyaW5nPShwdHIsbWF4Qnl0ZXNUb1JlYWQpPT57dmFyIGVuZFB0cj1wdHI7dmFyIGlkeD1lbmRQdHI+PjE7dmFyIG1heElkeD1pZHgrbWF4Qnl0ZXNUb1JlYWQvMjt3aGlsZSghKGlkeD49bWF4SWR4KSYmSEVBUFUxNltpZHhdKSsraWR4O2VuZFB0cj1pZHg8PDE7aWYoZW5kUHRyLXB0cj4zMiYmVVRGMTZEZWNvZGVyKXJldHVybiBVVEYxNkRlY29kZXIuZGVjb2RlKEhFQVBVOC5zdWJhcnJheShwdHIsZW5kUHRyKSk7dmFyIHN0cj0iIjtmb3IodmFyIGk9MDshKGk+PW1heEJ5dGVzVG9SZWFkLzIpOysraSl7dmFyIGNvZGVVbml0PUhFQVAxNltwdHIraSoyPj4xXTtpZihjb2RlVW5pdD09MClicmVhaztzdHIrPVN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVVuaXQpO31yZXR1cm4gc3RyfTt2YXIgc3RyaW5nVG9VVEYxNj0oc3RyLG91dFB0cixtYXhCeXRlc1RvV3JpdGUpPT57bWF4Qnl0ZXNUb1dyaXRlPz89MjE0NzQ4MzY0NztpZihtYXhCeXRlc1RvV3JpdGU8MilyZXR1cm4gMDttYXhCeXRlc1RvV3JpdGUtPTI7dmFyIHN0YXJ0UHRyPW91dFB0cjt2YXIgbnVtQ2hhcnNUb1dyaXRlPW1heEJ5dGVzVG9Xcml0ZTxzdHIubGVuZ3RoKjI/bWF4Qnl0ZXNUb1dyaXRlLzI6c3RyLmxlbmd0aDtmb3IodmFyIGk9MDtpPG51bUNoYXJzVG9Xcml0ZTsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtIRUFQMTZbb3V0UHRyPj4xXT1jb2RlVW5pdDtvdXRQdHIrPTI7fUhFQVAxNltvdXRQdHI+PjFdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn07dmFyIGxlbmd0aEJ5dGVzVVRGMTY9c3RyPT5zdHIubGVuZ3RoKjI7dmFyIFVURjMyVG9TdHJpbmc9KHB0cixtYXhCeXRlc1RvUmVhZCk9Pnt2YXIgaT0wO3ZhciBzdHI9IiI7d2hpbGUoIShpPj1tYXhCeXRlc1RvUmVhZC80KSl7dmFyIHV0ZjMyPUhFQVAzMltwdHIraSo0Pj4yXTtpZih1dGYzMj09MClicmVhazsrK2k7aWYodXRmMzI+PTY1NTM2KXt2YXIgY2g9dXRmMzItNjU1MzY7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGNoPj4xMCw1NjMyMHxjaCYxMDIzKTt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKHV0ZjMyKTt9fXJldHVybiBzdHJ9O3ZhciBzdHJpbmdUb1VURjMyPShzdHIsb3V0UHRyLG1heEJ5dGVzVG9Xcml0ZSk9PnttYXhCeXRlc1RvV3JpdGU/Pz0yMTQ3NDgzNjQ3O2lmKG1heEJ5dGVzVG9Xcml0ZTw0KXJldHVybiAwO3ZhciBzdGFydFB0cj1vdXRQdHI7dmFyIGVuZFB0cj1zdGFydFB0cittYXhCeXRlc1RvV3JpdGUtNDtmb3IodmFyIGk9MDtpPHN0ci5sZW5ndGg7KytpKXt2YXIgY29kZVVuaXQ9c3RyLmNoYXJDb2RlQXQoaSk7aWYoY29kZVVuaXQ+PTU1Mjk2JiZjb2RlVW5pdDw9NTczNDMpe3ZhciB0cmFpbFN1cnJvZ2F0ZT1zdHIuY2hhckNvZGVBdCgrK2kpO2NvZGVVbml0PTY1NTM2KygoY29kZVVuaXQmMTAyMyk8PDEwKXx0cmFpbFN1cnJvZ2F0ZSYxMDIzO31IRUFQMzJbb3V0UHRyPj4yXT1jb2RlVW5pdDtvdXRQdHIrPTQ7aWYob3V0UHRyKzQ+ZW5kUHRyKWJyZWFrfUhFQVAzMltvdXRQdHI+PjJdPTA7cmV0dXJuIG91dFB0ci1zdGFydFB0cn07dmFyIGxlbmd0aEJ5dGVzVVRGMzI9c3RyPT57dmFyIGxlbj0wO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe3ZhciBjb2RlVW5pdD1zdHIuY2hhckNvZGVBdChpKTtpZihjb2RlVW5pdD49NTUyOTYmJmNvZGVVbml0PD01NzM0MykrK2k7bGVuKz00O31yZXR1cm4gbGVufTt2YXIgX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmc9KHJhd1R5cGUsY2hhclNpemUsbmFtZSk9PntuYW1lPXJlYWRMYXRpbjFTdHJpbmcobmFtZSk7dmFyIGRlY29kZVN0cmluZyxlbmNvZGVTdHJpbmcsZ2V0SGVhcCxsZW5ndGhCeXRlc1VURixzaGlmdDtpZihjaGFyU2l6ZT09PTIpe2RlY29kZVN0cmluZz1VVEYxNlRvU3RyaW5nO2VuY29kZVN0cmluZz1zdHJpbmdUb1VURjE2O2xlbmd0aEJ5dGVzVVRGPWxlbmd0aEJ5dGVzVVRGMTY7Z2V0SGVhcD0oKT0+SEVBUFUxNjtzaGlmdD0xO31lbHNlIGlmKGNoYXJTaXplPT09NCl7ZGVjb2RlU3RyaW5nPVVURjMyVG9TdHJpbmc7ZW5jb2RlU3RyaW5nPXN0cmluZ1RvVVRGMzI7bGVuZ3RoQnl0ZXNVVEY9bGVuZ3RoQnl0ZXNVVEYzMjtnZXRIZWFwPSgpPT5IRUFQVTMyO3NoaWZ0PTI7fXJlZ2lzdGVyVHlwZShyYXdUeXBlLHtuYW1lOm5hbWUsImZyb21XaXJlVHlwZSI6dmFsdWU9Pnt2YXIgbGVuZ3RoPUhFQVBVMzJbdmFsdWU+PjJdO3ZhciBIRUFQPWdldEhlYXAoKTt2YXIgc3RyO3ZhciBkZWNvZGVTdGFydFB0cj12YWx1ZSs0O2Zvcih2YXIgaT0wO2k8PWxlbmd0aDsrK2kpe3ZhciBjdXJyZW50Qnl0ZVB0cj12YWx1ZSs0K2kqY2hhclNpemU7aWYoaT09bGVuZ3RofHxIRUFQW2N1cnJlbnRCeXRlUHRyPj5zaGlmdF09PTApe3ZhciBtYXhSZWFkQnl0ZXM9Y3VycmVudEJ5dGVQdHItZGVjb2RlU3RhcnRQdHI7dmFyIHN0cmluZ1NlZ21lbnQ9ZGVjb2RlU3RyaW5nKGRlY29kZVN0YXJ0UHRyLG1heFJlYWRCeXRlcyk7aWYoc3RyPT09dW5kZWZpbmVkKXtzdHI9c3RyaW5nU2VnbWVudDt9ZWxzZSB7c3RyKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApO3N0cis9c3RyaW5nU2VnbWVudDt9ZGVjb2RlU3RhcnRQdHI9Y3VycmVudEJ5dGVQdHIrY2hhclNpemU7fX1fZnJlZSh2YWx1ZSk7cmV0dXJuIHN0cn0sInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyx2YWx1ZSk9PntpZighKHR5cGVvZiB2YWx1ZT09InN0cmluZyIpKXt0aHJvd0JpbmRpbmdFcnJvcihgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHtuYW1lfWApO312YXIgbGVuZ3RoPWxlbmd0aEJ5dGVzVVRGKHZhbHVlKTt2YXIgcHRyPV9tYWxsb2MoNCtsZW5ndGgrY2hhclNpemUpO0hFQVBVMzJbcHRyPj4yXT1sZW5ndGg+PnNoaWZ0O2VuY29kZVN0cmluZyh2YWx1ZSxwdHIrNCxsZW5ndGgrY2hhclNpemUpO2lmKGRlc3RydWN0b3JzIT09bnVsbCl7ZGVzdHJ1Y3RvcnMucHVzaChfZnJlZSxwdHIpO31yZXR1cm4gcHRyfSwiYXJnUGFja0FkdmFuY2UiOkdlbmVyaWNXaXJlVHlwZVNpemUsInJlYWRWYWx1ZUZyb21Qb2ludGVyIjpzaW1wbGVSZWFkVmFsdWVGcm9tUG9pbnRlcixkZXN0cnVjdG9yRnVuY3Rpb24ocHRyKXtfZnJlZShwdHIpO319KTt9O3ZhciBfX2VtYmluZF9yZWdpc3Rlcl92b2lkPShyYXdUeXBlLG5hbWUpPT57bmFtZT1yZWFkTGF0aW4xU3RyaW5nKG5hbWUpO3JlZ2lzdGVyVHlwZShyYXdUeXBlLHtpc1ZvaWQ6dHJ1ZSxuYW1lOm5hbWUsImFyZ1BhY2tBZHZhbmNlIjowLCJmcm9tV2lyZVR5cGUiOigpPT51bmRlZmluZWQsInRvV2lyZVR5cGUiOihkZXN0cnVjdG9ycyxvKT0+dW5kZWZpbmVkfSk7fTt2YXIgZ2V0SGVhcE1heD0oKT0+MjE0NzQ4MzY0ODt2YXIgZ3Jvd01lbW9yeT1zaXplPT57dmFyIGI9d2FzbU1lbW9yeS5idWZmZXI7dmFyIHBhZ2VzPShzaXplLWIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e3dhc21NZW1vcnkuZ3JvdyhwYWdlcyk7dXBkYXRlTWVtb3J5Vmlld3MoKTtyZXR1cm4gMX1jYXRjaChlKXt9fTt2YXIgX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXA9cmVxdWVzdGVkU2l6ZT0+e3ZhciBvbGRTaXplPUhFQVBVOC5sZW5ndGg7cmVxdWVzdGVkU2l6ZT4+Pj0wO3ZhciBtYXhIZWFwU2l6ZT1nZXRIZWFwTWF4KCk7aWYocmVxdWVzdGVkU2l6ZT5tYXhIZWFwU2l6ZSl7cmV0dXJuIGZhbHNlfXZhciBhbGlnblVwPSh4LG11bHRpcGxlKT0+eCsobXVsdGlwbGUteCVtdWx0aXBsZSklbXVsdGlwbGU7Zm9yKHZhciBjdXREb3duPTE7Y3V0RG93bjw9NDtjdXREb3duKj0yKXt2YXIgb3Zlckdyb3duSGVhcFNpemU9b2xkU2l6ZSooMSsuMi9jdXREb3duKTtvdmVyR3Jvd25IZWFwU2l6ZT1NYXRoLm1pbihvdmVyR3Jvd25IZWFwU2l6ZSxyZXF1ZXN0ZWRTaXplKzEwMDY2MzI5Nik7dmFyIG5ld1NpemU9TWF0aC5taW4obWF4SGVhcFNpemUsYWxpZ25VcChNYXRoLm1heChyZXF1ZXN0ZWRTaXplLG92ZXJHcm93bkhlYXBTaXplKSw2NTUzNikpO3ZhciByZXBsYWNlbWVudD1ncm93TWVtb3J5KG5ld1NpemUpO2lmKHJlcGxhY2VtZW50KXtyZXR1cm4gdHJ1ZX19cmV0dXJuIGZhbHNlfTtlbWJpbmRfaW5pdF9jaGFyQ29kZXMoKTtCaW5kaW5nRXJyb3I9TW9kdWxlWyJCaW5kaW5nRXJyb3IiXT1jbGFzcyBCaW5kaW5nRXJyb3IgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihtZXNzYWdlKXtzdXBlcihtZXNzYWdlKTt0aGlzLm5hbWU9IkJpbmRpbmdFcnJvciI7fX07TW9kdWxlWyJJbnRlcm5hbEVycm9yIl09Y2xhc3MgSW50ZXJuYWxFcnJvciBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKG1lc3NhZ2Upe3N1cGVyKG1lc3NhZ2UpO3RoaXMubmFtZT0iSW50ZXJuYWxFcnJvciI7fX07aW5pdF9lbXZhbCgpO3ZhciB3YXNtSW1wb3J0cz17ZjpfX2VtYmluZF9yZWdpc3Rlcl9iaWdpbnQsaTpfX2VtYmluZF9yZWdpc3Rlcl9ib29sLGg6X19lbWJpbmRfcmVnaXN0ZXJfZW12YWwsZTpfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdCxiOl9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXIsYTpfX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldyxkOl9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcsYzpfX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZyxqOl9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQsZzpfZW1zY3JpcHRlbl9yZXNpemVfaGVhcH07dmFyIHdhc21FeHBvcnRzPWNyZWF0ZVdhc20oKTtNb2R1bGVbIl9wYWNrIl09KGEwLGExLGEyLGEzLGE0LGE1LGE2LGE3LGE4LGE5LGExMCk9PihNb2R1bGVbIl9wYWNrIl09d2FzbUV4cG9ydHNbIm0iXSkoYTAsYTEsYTIsYTMsYTQsYTUsYTYsYTcsYTgsYTksYTEwKTt2YXIgX21hbGxvYz1Nb2R1bGVbIl9tYWxsb2MiXT1hMD0+KF9tYWxsb2M9TW9kdWxlWyJfbWFsbG9jIl09d2FzbUV4cG9ydHNbIm8iXSkoYTApO3ZhciBfZnJlZT1Nb2R1bGVbIl9mcmVlIl09YTA9PihfZnJlZT1Nb2R1bGVbIl9mcmVlIl09d2FzbUV4cG9ydHNbInAiXSkoYTApO3ZhciBjYWxsZWRSdW47ZGVwZW5kZW5jaWVzRnVsZmlsbGVkPWZ1bmN0aW9uIHJ1bkNhbGxlcigpe2lmKCFjYWxsZWRSdW4pcnVuKCk7aWYoIWNhbGxlZFJ1bilkZXBlbmRlbmNpZXNGdWxmaWxsZWQ9cnVuQ2FsbGVyO307ZnVuY3Rpb24gcnVuKCl7aWYocnVuRGVwZW5kZW5jaWVzPjApe3JldHVybn1wcmVSdW4oKTtpZihydW5EZXBlbmRlbmNpZXM+MCl7cmV0dXJufWZ1bmN0aW9uIGRvUnVuKCl7aWYoY2FsbGVkUnVuKXJldHVybjtjYWxsZWRSdW49dHJ1ZTtNb2R1bGVbImNhbGxlZFJ1biJdPXRydWU7aWYoQUJPUlQpcmV0dXJuO2luaXRSdW50aW1lKCk7cmVhZHlQcm9taXNlUmVzb2x2ZShNb2R1bGUpO2lmKE1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSlNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0oKTtwb3N0UnVuKCk7fWlmKE1vZHVsZVsic2V0U3RhdHVzIl0pe01vZHVsZVsic2V0U3RhdHVzIl0oIlJ1bm5pbmcuLi4iKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe01vZHVsZVsic2V0U3RhdHVzIl0oIiIpO30sMSk7ZG9SdW4oKTt9LDEpO31lbHNlIHtkb1J1bigpO319aWYoTW9kdWxlWyJwcmVJbml0Il0pe2lmKHR5cGVvZiBNb2R1bGVbInByZUluaXQiXT09ImZ1bmN0aW9uIilNb2R1bGVbInByZUluaXQiXT1bTW9kdWxlWyJwcmVJbml0Il1dO3doaWxlKE1vZHVsZVsicHJlSW5pdCJdLmxlbmd0aD4wKXtNb2R1bGVbInByZUluaXQiXS5wb3AoKSgpO319cnVuKCk7CgoKICAgIHJldHVybiBtb2R1bGVBcmcucmVhZHkKICB9CiAgKTsKICB9KSgpOwoKICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueQogIGxldCB3YXNtTW9kdWxlOwogIGFzeW5jIGZ1bmN0aW9uIGluaXRXYXNtKCkgewogICAgICB3YXNtTW9kdWxlID0gYXdhaXQgbG9hZFdhc20oKTsKICB9CiAgbGV0IGFsbG9jYXRlZFZlcnRleENvdW50ID0gMDsKICBjb25zdCB1cGRhdGVRdWV1ZSA9IG5ldyBBcnJheSgpOwogIGxldCBydW5uaW5nID0gZmFsc2U7CiAgbGV0IGxvYWRpbmcgPSBmYWxzZTsKICBsZXQgcG9zaXRpb25zUHRyOwogIGxldCByb3RhdGlvbnNQdHI7CiAgbGV0IHNjYWxlc1B0cjsKICBsZXQgY29sb3JzUHRyOwogIGxldCBzZWxlY3Rpb25QdHI7CiAgbGV0IGRhdGFQdHI7CiAgbGV0IHdvcmxkUG9zaXRpb25zUHRyOwogIGxldCB3b3JsZFJvdGF0aW9uc1B0cjsKICBsZXQgd29ybGRTY2FsZXNQdHI7CiAgY29uc3QgcGFjayA9IGFzeW5jIChzcGxhdCkgPT4gewogICAgICB3aGlsZSAobG9hZGluZykgewogICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMCkpOwogICAgICB9CiAgICAgIGlmICghd2FzbU1vZHVsZSkgewogICAgICAgICAgbG9hZGluZyA9IHRydWU7CiAgICAgICAgICBhd2FpdCBpbml0V2FzbSgpOwogICAgICAgICAgbG9hZGluZyA9IGZhbHNlOwogICAgICB9CiAgICAgIGNvbnN0IHRhcmdldEFsbG9jYXRlZFZlcnRleENvdW50ID0gTWF0aC5wb3coMiwgTWF0aC5jZWlsKE1hdGgubG9nMihzcGxhdC52ZXJ0ZXhDb3VudCkpKTsKICAgICAgaWYgKHRhcmdldEFsbG9jYXRlZFZlcnRleENvdW50ID4gYWxsb2NhdGVkVmVydGV4Q291bnQpIHsKICAgICAgICAgIGlmIChhbGxvY2F0ZWRWZXJ0ZXhDb3VudCA+IDApIHsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKHBvc2l0aW9uc1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShyb3RhdGlvbnNQdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUoc2NhbGVzUHRyKTsKICAgICAgICAgICAgICB3YXNtTW9kdWxlLl9mcmVlKGNvbG9yc1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZShzZWxlY3Rpb25QdHIpOwogICAgICAgICAgICAgIHdhc21Nb2R1bGUuX2ZyZWUoZGF0YVB0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZSh3b3JsZFBvc2l0aW9uc1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZSh3b3JsZFJvdGF0aW9uc1B0cik7CiAgICAgICAgICAgICAgd2FzbU1vZHVsZS5fZnJlZSh3b3JsZFNjYWxlc1B0cik7CiAgICAgICAgICB9CiAgICAgICAgICBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCA9IHRhcmdldEFsbG9jYXRlZFZlcnRleENvdW50OwogICAgICAgICAgcG9zaXRpb25zUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKDMgKiBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgcm90YXRpb25zUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKDQgKiBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgc2NhbGVzUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKDMgKiBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgY29sb3JzUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKDQgKiBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCk7CiAgICAgICAgICBzZWxlY3Rpb25QdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoYWxsb2NhdGVkVmVydGV4Q291bnQpOwogICAgICAgICAgZGF0YVB0ciA9IHdhc21Nb2R1bGUuX21hbGxvYyg4ICogYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgICAgIHdvcmxkUG9zaXRpb25zUHRyID0gd2FzbU1vZHVsZS5fbWFsbG9jKDMgKiBhbGxvY2F0ZWRWZXJ0ZXhDb3VudCAqIDQpOwogICAgICAgICAgd29ybGRSb3RhdGlvbnNQdHIgPSB3YXNtTW9kdWxlLl9tYWxsb2MoNCAqIGFsbG9jYXRlZFZlcnRleENvdW50ICogNCk7CiAgICAgICAgICB3b3JsZFNjYWxlc1B0ciA9IHdhc21Nb2R1bGUuX21hbGxvYygzICogYWxsb2NhdGVkVmVydGV4Q291bnQgKiA0KTsKICAgICAgfQogICAgICB3YXNtTW9kdWxlLkhFQVBGMzIuc2V0KHNwbGF0LnBvc2l0aW9ucywgcG9zaXRpb25zUHRyIC8gNCk7CiAgICAgIHdhc21Nb2R1bGUuSEVBUEYzMi5zZXQoc3BsYXQucm90YXRpb25zLCByb3RhdGlvbnNQdHIgLyA0KTsKICAgICAgd2FzbU1vZHVsZS5IRUFQRjMyLnNldChzcGxhdC5zY2FsZXMsIHNjYWxlc1B0ciAvIDQpOwogICAgICB3YXNtTW9kdWxlLkhFQVBVOC5zZXQoc3BsYXQuY29sb3JzLCBjb2xvcnNQdHIpOwogICAgICB3YXNtTW9kdWxlLkhFQVBVOC5zZXQoc3BsYXQuc2VsZWN0aW9uLCBzZWxlY3Rpb25QdHIpOwogICAgICB3YXNtTW9kdWxlLl9wYWNrKHNwbGF0LnNlbGVjdGVkLCBzcGxhdC52ZXJ0ZXhDb3VudCwgcG9zaXRpb25zUHRyLCByb3RhdGlvbnNQdHIsIHNjYWxlc1B0ciwgY29sb3JzUHRyLCBzZWxlY3Rpb25QdHIsIGRhdGFQdHIsIHdvcmxkUG9zaXRpb25zUHRyLCB3b3JsZFJvdGF0aW9uc1B0ciwgd29ybGRTY2FsZXNQdHIpOwogICAgICBjb25zdCBvdXREYXRhID0gbmV3IFVpbnQzMkFycmF5KHdhc21Nb2R1bGUuSEVBUFUzMi5idWZmZXIsIGRhdGFQdHIsIHNwbGF0LnZlcnRleENvdW50ICogOCk7CiAgICAgIGNvbnN0IGRldGFjaGVkRGF0YSA9IG5ldyBVaW50MzJBcnJheShvdXREYXRhLnNsaWNlKCkuYnVmZmVyKTsKICAgICAgY29uc3Qgd29ybGRQb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHdhc21Nb2R1bGUuSEVBUEYzMi5idWZmZXIsIHdvcmxkUG9zaXRpb25zUHRyLCBzcGxhdC52ZXJ0ZXhDb3VudCAqIDMpOwogICAgICBjb25zdCBkZXRhY2hlZFdvcmxkUG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSh3b3JsZFBvc2l0aW9ucy5zbGljZSgpLmJ1ZmZlcik7CiAgICAgIGNvbnN0IHdvcmxkUm90YXRpb25zID0gbmV3IEZsb2F0MzJBcnJheSh3YXNtTW9kdWxlLkhFQVBGMzIuYnVmZmVyLCB3b3JsZFJvdGF0aW9uc1B0ciwgc3BsYXQudmVydGV4Q291bnQgKiA0KTsKICAgICAgY29uc3QgZGV0YWNoZWRXb3JsZFJvdGF0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkod29ybGRSb3RhdGlvbnMuc2xpY2UoKS5idWZmZXIpOwogICAgICBjb25zdCB3b3JsZFNjYWxlcyA9IG5ldyBGbG9hdDMyQXJyYXkod2FzbU1vZHVsZS5IRUFQRjMyLmJ1ZmZlciwgd29ybGRTY2FsZXNQdHIsIHNwbGF0LnZlcnRleENvdW50ICogMyk7CiAgICAgIGNvbnN0IGRldGFjaGVkV29ybGRTY2FsZXMgPSBuZXcgRmxvYXQzMkFycmF5KHdvcmxkU2NhbGVzLnNsaWNlKCkuYnVmZmVyKTsKICAgICAgY29uc3QgcmVzcG9uc2UgPSB7CiAgICAgICAgICBkYXRhOiBkZXRhY2hlZERhdGEsCiAgICAgICAgICB3b3JsZFBvc2l0aW9uczogZGV0YWNoZWRXb3JsZFBvc2l0aW9ucywKICAgICAgICAgIHdvcmxkUm90YXRpb25zOiBkZXRhY2hlZFdvcmxkUm90YXRpb25zLAogICAgICAgICAgd29ybGRTY2FsZXM6IGRldGFjaGVkV29ybGRTY2FsZXMsCiAgICAgICAgICBvZmZzZXQ6IHNwbGF0Lm9mZnNldCwKICAgICAgICAgIHZlcnRleENvdW50OiBzcGxhdC52ZXJ0ZXhDb3VudCwKICAgICAgICAgIHBvc2l0aW9uczogc3BsYXQucG9zaXRpb25zLmJ1ZmZlciwKICAgICAgICAgIHJvdGF0aW9uczogc3BsYXQucm90YXRpb25zLmJ1ZmZlciwKICAgICAgICAgIHNjYWxlczogc3BsYXQuc2NhbGVzLmJ1ZmZlciwKICAgICAgICAgIGNvbG9yczogc3BsYXQuY29sb3JzLmJ1ZmZlciwKICAgICAgICAgIHNlbGVjdGlvbjogc3BsYXQuc2VsZWN0aW9uLmJ1ZmZlciwKICAgICAgfTsKICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IHJlc3BvbnNlOiByZXNwb25zZSB9LCBbCiAgICAgICAgICByZXNwb25zZS5kYXRhLmJ1ZmZlciwKICAgICAgICAgIHJlc3BvbnNlLndvcmxkUG9zaXRpb25zLmJ1ZmZlciwKICAgICAgICAgIHJlc3BvbnNlLndvcmxkUm90YXRpb25zLmJ1ZmZlciwKICAgICAgICAgIHJlc3BvbnNlLndvcmxkU2NhbGVzLmJ1ZmZlciwKICAgICAgICAgIHJlc3BvbnNlLnBvc2l0aW9ucywKICAgICAgICAgIHJlc3BvbnNlLnJvdGF0aW9ucywKICAgICAgICAgIHJlc3BvbnNlLnNjYWxlcywKICAgICAgICAgIHJlc3BvbnNlLmNvbG9ycywKICAgICAgICAgIHJlc3BvbnNlLnNlbGVjdGlvbiwKICAgICAgXSk7CiAgICAgIHJ1bm5pbmcgPSBmYWxzZTsKICB9OwogIGNvbnN0IHBhY2tUaHJvdHRsZWQgPSAoKSA9PiB7CiAgICAgIGlmICh1cGRhdGVRdWV1ZS5sZW5ndGggPT09IDApCiAgICAgICAgICByZXR1cm47CiAgICAgIGlmICghcnVubmluZykgewogICAgICAgICAgcnVubmluZyA9IHRydWU7CiAgICAgICAgICBjb25zdCBzcGxhdCA9IHVwZGF0ZVF1ZXVlLnNoaWZ0KCk7CiAgICAgICAgICBwYWNrKHNwbGF0KTsKICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTsKICAgICAgICAgICAgICBwYWNrVGhyb3R0bGVkKCk7CiAgICAgICAgICB9LCAwKTsKICAgICAgfQogIH07CiAgc2VsZi5vbm1lc3NhZ2UgPSAoZSkgPT4gewogICAgICBpZiAoZS5kYXRhLnNwbGF0KSB7CiAgICAgICAgICBjb25zdCBzcGxhdCA9IGUuZGF0YS5zcGxhdDsKICAgICAgICAgIGZvciAoY29uc3QgW2luZGV4LCBleGlzdGluZ10gb2YgdXBkYXRlUXVldWUuZW50cmllcygpKSB7CiAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nLm9mZnNldCA9PT0gc3BsYXQub2Zmc2V0KSB7CiAgICAgICAgICAgICAgICAgIHVwZGF0ZVF1ZXVlW2luZGV4XSA9IHNwbGF0OwogICAgICAgICAgICAgICAgICByZXR1cm47CiAgICAgICAgICAgICAgfQogICAgICAgICAgfQogICAgICAgICAgdXBkYXRlUXVldWUucHVzaChzcGxhdCk7CiAgICAgICAgICBwYWNrVGhyb3R0bGVkKCk7CiAgICAgIH0KICB9OwoKfSkoKTsKLy8jIHNvdXJjZU1hcHBpbmdVUkw9RGF0YVdvcmtlci5qcy5tYXAKCg==", null, !1), So = function(t = {}) {
  var e, n, l = t;
  l.ready = new Promise((u, Z) => {
    e = u, n = Z;
  });
  var i, s = Object.assign({}, l), a = "";
  a = (a = self.location.href).indexOf("blob:") !== 0 ? a.substr(0, a.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "", i = (u) => {
    var Z = new XMLHttpRequest();
    return Z.open("GET", u, !1), Z.responseType = "arraybuffer", Z.send(null), new Uint8Array(Z.response);
  }, l.print || console.log.bind(console);
  var o, d, r = l.printErr || console.error.bind(console);
  function c(u) {
    if (k(u))
      return function(Z) {
        for (var W = atob(Z), f = new Uint8Array(W.length), E = 0; E < W.length; ++E)
          f[E] = W.charCodeAt(E);
        return f;
      }(u.slice(le.length));
  }
  Object.assign(l, s), s = null, l.arguments && l.arguments, l.thisProgram && l.thisProgram, l.quit && l.quit, l.wasmBinary && (o = l.wasmBinary), typeof WebAssembly != "object" && J("no native wasm support detected");
  var U, F, h, Q, R, V, p, b, m = !1;
  function A() {
    var u = d.buffer;
    l.HEAP8 = U = new Int8Array(u), l.HEAP16 = h = new Int16Array(u), l.HEAPU8 = F = new Uint8Array(u), l.HEAPU16 = Q = new Uint16Array(u), l.HEAP32 = R = new Int32Array(u), l.HEAPU32 = V = new Uint32Array(u), l.HEAPF32 = p = new Float32Array(u), l.HEAPF64 = b = new Float64Array(u);
  }
  var I = [], x = [], v = [], X = 0, N = null;
  function J(u) {
    var W;
    (W = l.onAbort) == null || W.call(l, u), r(u = "Aborted(" + u + ")"), m = !0, u += ". Build with -sASSERTIONS for more info.";
    var Z = new WebAssembly.RuntimeError(u);
    throw n(Z), Z;
  }
  var G, Be, le = "data:application/octet-stream;base64,", k = (u) => u.startsWith(le);
  function H(u) {
    return Promise.resolve().then(() => function(Z) {
      if (Z == G && o)
        return new Uint8Array(o);
      var W = c(Z);
      if (W)
        return W;
      if (i)
        return i(Z);
      throw "both async and sync fetching of the wasm failed";
    }(u));
  }
  function B(u, Z, W, f) {
    return function(E, S, _) {
      return H(E).then((D) => WebAssembly.instantiate(D, S)).then((D) => D).then(_, (D) => {
        r(`failed to asynchronously prepare wasm: ${D}`), J(D);
      });
    }(Z, W, f);
  }
  k(G = "data:application/octet-stream;base64,AGFzbQEAAAABZw9gBH9/f38AYAN/f38AYAV/f39/fwBgBn9/f39/fwBgAX8Bf2ABfwBgAn9/AGADf39/AX9gAABgB39/f39/f38AYAJ9fQF/YAR/f35+AGABfQF/YAt/f39/f39/f39/fwBgAn9/AX8CPQoBYQFhAAEBYQFiAAIBYQFjAAEBYQFkAAYBYQFlAAEBYQFmAAkBYQFnAAQBYQFoAAUBYQFpAAABYQFqAAYDGxoHBAoFCAUGCAsBAAEFDAQEDQMDAgIAAA4HBwQFAXABEBAFBwEBgAKAgAIGCAF/AUGwngQLBxkGAWsCAAFsAA4BbQAaAW4BAAFvABkBcAAPCRUBAEEBCw8RGA0WFiMNIhsdIA0cHh8K0VAacQEBfyACRQRAIAAoAgQgASgCBEYPCyAAIAFGBEBBAQ8LAkAgACgCBCICLQAAIgBFIAAgASgCBCIBLQAAIgNHcg0AA0AgAS0AASEDIAItAAEiAEUNASABQQFqIQEgAkEBaiECIAAgA0YNAAsLIAAgA0YLTwECf0GoGigCACIBIABBB2pBeHEiAmohAAJAIAJBACAAIAFNG0UEQCAAPwBBEHRNDQEgABAGDQELQbgaQTA2AgBBfw8LQagaIAA2AgAgAQsOACAAEBcgARAXQRB0cgsGACAAEA8LKQBBsBpBATYCAEG0GkEANgIAEBFBtBpBrBooAgA2AgBBrBpBsBo2AgAL0gsBB38CQCAARQ0AIABBCGsiAiAAQQRrKAIAIgFBeHEiAGohBQJAIAFBAXENACABQQJxRQ0BIAIgAigCACIBayICQcwaKAIASQ0BIAAgAWohAAJAAkBB0BooAgAgAkcEQCABQf8BTQRAIAFBA3YhBCACKAIMIgEgAigCCCIDRgRAQbwaQbwaKAIAQX4gBHdxNgIADAULIAMgATYCDCABIAM2AggMBAsgAigCGCEGIAIgAigCDCIBRwRAIAIoAggiAyABNgIMIAEgAzYCCAwDCyACQRRqIgQoAgAiA0UEQCACKAIQIgNFDQIgAkEQaiEECwNAIAQhByADIgFBFGoiBCgCACIDDQAgAUEQaiEEIAEoAhAiAw0ACyAHQQA2AgAMAgsgBSgCBCIBQQNxQQNHDQJBxBogADYCACAFIAFBfnE2AgQgAiAAQQFyNgIEIAUgADYCAA8LQQAhAQsgBkUNAAJAIAIoAhwiA0ECdEHsHGoiBCgCACACRgRAIAQgATYCACABDQFBwBpBwBooAgBBfiADd3E2AgAMAgsgBkEQQRQgBigCECACRhtqIAE2AgAgAUUNAQsgASAGNgIYIAIoAhAiAwRAIAEgAzYCECADIAE2AhgLIAIoAhQiA0UNACABIAM2AhQgAyABNgIYCyACIAVPDQAgBSgCBCIBQQFxRQ0AAkACQAJAAkAgAUECcUUEQEHUGigCACAFRgRAQdQaIAI2AgBByBpByBooAgAgAGoiADYCACACIABBAXI2AgQgAkHQGigCAEcNBkHEGkEANgIAQdAaQQA2AgAPC0HQGigCACAFRgRAQdAaIAI2AgBBxBpBxBooAgAgAGoiADYCACACIABBAXI2AgQgACACaiAANgIADwsgAUF4cSAAaiEAIAFB/wFNBEAgAUEDdiEEIAUoAgwiASAFKAIIIgNGBEBBvBpBvBooAgBBfiAEd3E2AgAMBQsgAyABNgIMIAEgAzYCCAwECyAFKAIYIQYgBSAFKAIMIgFHBEBBzBooAgAaIAUoAggiAyABNgIMIAEgAzYCCAwDCyAFQRRqIgQoAgAiA0UEQCAFKAIQIgNFDQIgBUEQaiEECwNAIAQhByADIgFBFGoiBCgCACIDDQAgAUEQaiEEIAEoAhAiAw0ACyAHQQA2AgAMAgsgBSABQX5xNgIEIAIgAEEBcjYCBCAAIAJqIAA2AgAMAwtBACEBCyAGRQ0AAkAgBSgCHCIDQQJ0QewcaiIEKAIAIAVGBEAgBCABNgIAIAENAUHAGkHAGigCAEF+IAN3cTYCAAwCCyAGQRBBFCAGKAIQIAVGG2ogATYCACABRQ0BCyABIAY2AhggBSgCECIDBEAgASADNgIQIAMgATYCGAsgBSgCFCIDRQ0AIAEgAzYCFCADIAE2AhgLIAIgAEEBcjYCBCAAIAJqIAA2AgAgAkHQGigCAEcNAEHEGiAANgIADwsgAEH/AU0EQCAAQXhxQeQaaiEBAn9BvBooAgAiA0EBIABBA3Z0IgBxRQRAQbwaIAAgA3I2AgAgAQwBCyABKAIICyEAIAEgAjYCCCAAIAI2AgwgAiABNgIMIAIgADYCCA8LQR8hAyAAQf///wdNBEAgAEEmIABBCHZnIgFrdkEBcSABQQF0a0E+aiEDCyACIAM2AhwgAkIANwIQIANBAnRB7BxqIQECQAJAAkBBwBooAgAiBEEBIAN0IgdxRQRAQcAaIAQgB3I2AgAgASACNgIAIAIgATYCGAwBCyAAQRkgA0EBdmtBACADQR9HG3QhAyABKAIAIQEDQCABIgQoAgRBeHEgAEYNAiADQR12IQEgA0EBdCEDIAQgAUEEcWoiB0EQaigCACIBDQALIAcgAjYCECACIAQ2AhgLIAIgAjYCDCACIAI2AggMAQsgBCgCCCIAIAI2AgwgBCACNgIIIAJBADYCGCACIAQ2AgwgAiAANgIIC0HcGkHcGigCAEEBayIAQX8gABs2AgALCyEAIAEEQANAIABBADoAACAAQQFqIQAgAUEBayIBDQALCwveAwBB3BdBigkQCUHoF0G5CEEBQQAQCEH0F0G0CEEBQYB/Qf8AEAFBjBhBrQhBAUGAf0H/ABABQYAYQasIQQFBAEH/ARABQZgYQYkIQQJBgIB+Qf//ARABQaQYQYAIQQJBAEH//wMQAUGwGEGYCEEEQYCAgIB4Qf////8HEAFBvBhBjwhBBEEAQX8QAUHIGEHHCEEEQYCAgIB4Qf////8HEAFB1BhBvghBBEEAQX8QAUHgGEGjCEKAgICAgICAgIB/Qv///////////wAQEkHsGEGiCEIAQn8QEkH4GEGcCEEEEARBhBlBgwlBCBAEQfQOQdkIEANBvA9Bhw0QA0GEEEEEQcwIEAJB0BBBAkHlCBACQZwRQQRB9AgQAkG4ERAHQeARQQBBwgwQAEGIEkEAQagNEABBsBJBAUHgDBAAQdgSQQJBjwkQAEGAE0EDQa4JEABBqBNBBEHWCRAAQdATQQVB8wkQAEH4E0EEQc0NEABBoBRBBUHrDRAAQYgSQQBB2QoQAEGwEkEBQbgKEABB2BJBAkGbCxAAQYATQQNB+QoQAEGoE0EEQaEMEABB0BNBBUH/CxAAQcgUQQhB3gsQAEHwFEEJQbwLEABBmBVBBkGZChAAQcAVQQdBkg4QAAscACAAIAFBCCACpyACQiCIpyADpyADQiCIpxAFCyAAAkAgACgCBCABRw0AIAAoAhxBAUYNACAAIAI2AhwLC5oBACAAQQE6ADUCQCAAKAIEIAJHDQAgAEEBOgA0AkAgACgCECICRQRAIABBATYCJCAAIAM2AhggACABNgIQIANBAUcNAiAAKAIwQQFGDQEMAgsgASACRgRAIAAoAhgiAkECRgRAIAAgAzYCGCADIQILIAAoAjBBAUcNAiACQQFGDQEMAgsgACAAKAIkQQFqNgIkCyAAQQE6ADYLC10BAX8gACgCECIDRQRAIABBATYCJCAAIAI2AhggACABNgIQDwsCQCABIANGBEAgACgCGEECRw0BIAAgAjYCGA8LIABBAToANiAAQQI2AhggACAAKAIkQQFqNgIkCwsCAAt3AQR/IAC8IgRB////A3EhAQJAIARBF3ZB/wFxIgJFDQAgAkHwAE0EQCABQYCAgARyQfEAIAJrdiEBDAELIAJBjQFLBEBBgPgBIQNBACEBDAELIAJBCnRBgIAHayEDCyADIARBEHZBgIACcXIgAUENdnJB//8DcQsEACAAC8YnAQx/IwBBEGsiCiQAAkACQAJAAkACQAJAAkACQAJAIABB9AFNBEBBvBooAgAiBkEQIABBC2pB+ANxIABBC0kbIgVBA3YiAHYiAUEDcQRAAkAgAUF/c0EBcSAAaiICQQN0IgFB5BpqIgAgAUHsGmooAgAiASgCCCIDRgRAQbwaIAZBfiACd3E2AgAMAQsgAyAANgIMIAAgAzYCCAsgAUEIaiEAIAEgAkEDdCICQQNyNgIEIAEgAmoiASABKAIEQQFyNgIEDAoLIAVBxBooAgAiB00NASABBEACQEECIAB0IgJBACACa3IgASAAdHFoIgFBA3QiAEHkGmoiAiAAQewaaigCACIAKAIIIgNGBEBBvBogBkF+IAF3cSIGNgIADAELIAMgAjYCDCACIAM2AggLIAAgBUEDcjYCBCAAIAVqIgQgAUEDdCIBIAVrIgNBAXI2AgQgACABaiADNgIAIAcEQCAHQXhxQeQaaiEBQdAaKAIAIQICfyAGQQEgB0EDdnQiBXFFBEBBvBogBSAGcjYCACABDAELIAEoAggLIQUgASACNgIIIAUgAjYCDCACIAE2AgwgAiAFNgIICyAAQQhqIQBB0BogBDYCAEHEGiADNgIADAoLQcAaKAIAIgtFDQEgC2hBAnRB7BxqKAIAIgIoAgRBeHEgBWshBCACIQEDQAJAIAEoAhAiAEUEQCABKAIUIgBFDQELIAAoAgRBeHEgBWsiASAEIAEgBEkiARshBCAAIAIgARshAiAAIQEMAQsLIAIoAhghCSACIAIoAgwiA0cEQEHMGigCABogAigCCCIAIAM2AgwgAyAANgIIDAkLIAJBFGoiASgCACIARQRAIAIoAhAiAEUNAyACQRBqIQELA0AgASEIIAAiA0EUaiIBKAIAIgANACADQRBqIQEgAygCECIADQALIAhBADYCAAwIC0F/IQUgAEG/f0sNACAAQQtqIgBBeHEhBUHAGigCACIIRQ0AQQAgBWshBAJAAkACQAJ/QQAgBUGAAkkNABpBHyAFQf///wdLDQAaIAVBJiAAQQh2ZyIAa3ZBAXEgAEEBdGtBPmoLIgdBAnRB7BxqKAIAIgFFBEBBACEADAELQQAhACAFQRkgB0EBdmtBACAHQR9HG3QhAgNAAkAgASgCBEF4cSAFayIGIARPDQAgASEDIAYiBA0AQQAhBCABIQAMAwsgACABKAIUIgYgBiABIAJBHXZBBHFqKAIQIgFGGyAAIAYbIQAgAkEBdCECIAENAAsLIAAgA3JFBEBBACEDQQIgB3QiAEEAIABrciAIcSIARQ0DIABoQQJ0QewcaigCACEACyAARQ0BCwNAIAAoAgRBeHEgBWsiAiAESSEBIAIgBCABGyEEIAAgAyABGyEDIAAoAhAiAQR/IAEFIAAoAhQLIgANAAsLIANFDQAgBEHEGigCACAFa08NACADKAIYIQcgAyADKAIMIgJHBEBBzBooAgAaIAMoAggiACACNgIMIAIgADYCCAwHCyADQRRqIgEoAgAiAEUEQCADKAIQIgBFDQMgA0EQaiEBCwNAIAEhBiAAIgJBFGoiASgCACIADQAgAkEQaiEBIAIoAhAiAA0ACyAGQQA2AgAMBgsgBUHEGigCACIDTQRAQdAaKAIAIQACQCADIAVrIgFBEE8EQCAAIAVqIgIgAUEBcjYCBCAAIANqIAE2AgAgACAFQQNyNgIEDAELIAAgA0EDcjYCBCAAIANqIgEgASgCBEEBcjYCBEEAIQJBACEBC0HEGiABNgIAQdAaIAI2AgAgAEEIaiEADAgLIAVByBooAgAiAkkEQEHIGiACIAVrIgE2AgBB1BpB1BooAgAiACAFaiICNgIAIAIgAUEBcjYCBCAAIAVBA3I2AgQgAEEIaiEADAgLQQAhACAFQS9qIgQCf0GUHigCAARAQZweKAIADAELQaAeQn83AgBBmB5CgKCAgICABDcCAEGUHiAKQQxqQXBxQdiq1aoFczYCAEGoHkEANgIAQfgdQQA2AgBBgCALIgFqIgZBACABayIIcSIBIAVNDQdB9B0oAgAiAwRAQewdKAIAIgcgAWoiCSAHTSADIAlJcg0ICwJAQfgdLQAAQQRxRQRAAkACQAJAAkBB1BooAgAiAwRAQfwdIQADQCADIAAoAgAiB08EQCAHIAAoAgRqIANLDQMLIAAoAggiAA0ACwtBABALIgJBf0YNAyABIQZBmB4oAgAiAEEBayIDIAJxBEAgASACayACIANqQQAgAGtxaiEGCyAFIAZPDQNB9B0oAgAiAARAQewdKAIAIgMgBmoiCCADTSAAIAhJcg0ECyAGEAsiACACRw0BDAULIAYgAmsgCHEiBhALIgIgACgCACAAKAIEakYNASACIQALIABBf0YNASAFQTBqIAZNBEAgACECDAQLQZweKAIAIgIgBCAGa2pBACACa3EiAhALQX9GDQEgAiAGaiEGIAAhAgwDCyACQX9HDQILQfgdQfgdKAIAQQRyNgIACyABEAsiAkF/RkEAEAsiAEF/RnIgACACTXINBSAAIAJrIgYgBUEoak0NBQtB7B1B7B0oAgAgBmoiADYCAEHwHSgCACAASQRAQfAdIAA2AgALAkBB1BooAgAiBARAQfwdIQADQCACIAAoAgAiASAAKAIEIgNqRg0CIAAoAggiAA0ACwwEC0HMGigCACIAQQAgACACTRtFBEBBzBogAjYCAAtBACEAQYAeIAY2AgBB/B0gAjYCAEHcGkF/NgIAQeAaQZQeKAIANgIAQYgeQQA2AgADQCAAQQN0IgFB7BpqIAFB5BpqIgM2AgAgAUHwGmogAzYCACAAQQFqIgBBIEcNAAtByBogBkEoayIAQXggAmtBB3EiAWsiAzYCAEHUGiABIAJqIgE2AgAgASADQQFyNgIEIAAgAmpBKDYCBEHYGkGkHigCADYCAAwECyACIARNIAEgBEtyDQIgACgCDEEIcQ0CIAAgAyAGajYCBEHUGiAEQXggBGtBB3EiAGoiATYCAEHIGkHIGigCACAGaiICIABrIgA2AgAgASAAQQFyNgIEIAIgBGpBKDYCBEHYGkGkHigCADYCAAwDC0EAIQMMBQtBACECDAMLQcwaKAIAIAJLBEBBzBogAjYCAAsgAiAGaiEBQfwdIQACQAJAAkADQCABIAAoAgBHBEAgACgCCCIADQEMAgsLIAAtAAxBCHFFDQELQfwdIQADQAJAIAQgACgCACIBTwRAIAEgACgCBGoiAyAESw0BCyAAKAIIIQAMAQsLQcgaIAZBKGsiAEF4IAJrQQdxIgFrIgg2AgBB1BogASACaiIBNgIAIAEgCEEBcjYCBCAAIAJqQSg2AgRB2BpBpB4oAgA2AgAgBCADQScgA2tBB3FqQS9rIgAgACAEQRBqSRsiAUEbNgIEIAFBhB4pAgA3AhAgAUH8HSkCADcCCEGEHiABQQhqNgIAQYAeIAY2AgBB/B0gAjYCAEGIHkEANgIAIAFBGGohAANAIABBBzYCBCAAQQhqIQwgAEEEaiEAIAwgA0kNAAsgASAERg0CIAEgASgCBEF+cTYCBCAEIAEgBGsiAkEBcjYCBCABIAI2AgAgAkH/AU0EQCACQXhxQeQaaiEAAn9BvBooAgAiAUEBIAJBA3Z0IgJxRQRAQbwaIAEgAnI2AgAgAAwBCyAAKAIICyEBIAAgBDYCCCABIAQ2AgwgBCAANgIMIAQgATYCCAwDC0EfIQAgAkH///8HTQRAIAJBJiACQQh2ZyIAa3ZBAXEgAEEBdGtBPmohAAsgBCAANgIcIARCADcCECAAQQJ0QewcaiEBAkBBwBooAgAiA0EBIAB0IgZxRQRAQcAaIAMgBnI2AgAgASAENgIADAELIAJBGSAAQQF2a0EAIABBH0cbdCEAIAEoAgAhAwNAIAMiASgCBEF4cSACRg0DIABBHXYhAyAAQQF0IQAgASADQQRxaiIGKAIQIgMNAAsgBiAENgIQCyAEIAE2AhggBCAENgIMIAQgBDYCCAwCCyAAIAI2AgAgACAAKAIEIAZqNgIEIAJBeCACa0EHcWoiByAFQQNyNgIEIAFBeCABa0EHcWoiBCAFIAdqIgVrIQYCQEHUGigCACAERgRAQdQaIAU2AgBByBpByBooAgAgBmoiADYCACAFIABBAXI2AgQMAQtB0BooAgAgBEYEQEHQGiAFNgIAQcQaQcQaKAIAIAZqIgA2AgAgBSAAQQFyNgIEIAAgBWogADYCAAwBCyAEKAIEIgJBA3FBAUYEQCACQXhxIQkCQCACQf8BTQRAIAQoAgwiACAEKAIIIgFGBEBBvBpBvBooAgBBfiACQQN2d3E2AgAMAgsgASAANgIMIAAgATYCCAwBCyAEKAIYIQgCQCAEIAQoAgwiAEcEQEHMGigCABogBCgCCCIBIAA2AgwgACABNgIIDAELAkAgBEEUaiIBKAIAIgJFBEAgBCgCECICRQ0BIARBEGohAQsDQCABIQMgAiIAQRRqIgEoAgAiAg0AIABBEGohASAAKAIQIgINAAsgA0EANgIADAELQQAhAAsgCEUNAAJAIAQoAhwiAUECdEHsHGoiAigCACAERgRAIAIgADYCACAADQFBwBpBwBooAgBBfiABd3E2AgAMAgsgCEEQQRQgCCgCECAERhtqIAA2AgAgAEUNAQsgACAINgIYIAQoAhAiAQRAIAAgATYCECABIAA2AhgLIAQoAhQiAUUNACAAIAE2AhQgASAANgIYCyAGIAlqIQYgBCAJaiIEKAIEIQILIAQgAkF+cTYCBCAFIAZBAXI2AgQgBSAGaiAGNgIAIAZB/wFNBEAgBkF4cUHkGmohAAJ/QbwaKAIAIgFBASAGQQN2dCICcUUEQEG8GiABIAJyNgIAIAAMAQsgACgCCAshASAAIAU2AgggASAFNgIMIAUgADYCDCAFIAE2AggMAQtBHyECIAZB////B00EQCAGQSYgBkEIdmciAGt2QQFxIABBAXRrQT5qIQILIAUgAjYCHCAFQgA3AhAgAkECdEHsHGohAQJAAkBBwBooAgAiAEEBIAJ0IgNxRQRAQcAaIAAgA3I2AgAgASAFNgIADAELIAZBGSACQQF2a0EAIAJBH0cbdCECIAEoAgAhAANAIAAiASgCBEF4cSAGRg0CIAJBHXYhACACQQF0IQIgASAAQQRxaiIDKAIQIgANAAsgAyAFNgIQCyAFIAE2AhggBSAFNgIMIAUgBTYCCAwBCyABKAIIIgAgBTYCDCABIAU2AgggBUEANgIYIAUgATYCDCAFIAA2AggLIAdBCGohAAwFCyABKAIIIgAgBDYCDCABIAQ2AgggBEEANgIYIAQgATYCDCAEIAA2AggLQcgaKAIAIgAgBU0NAEHIGiAAIAVrIgE2AgBB1BpB1BooAgAiACAFaiICNgIAIAIgAUEBcjYCBCAAIAVBA3I2AgQgAEEIaiEADAMLQbgaQTA2AgBBACEADAILAkAgB0UNAAJAIAMoAhwiAEECdEHsHGoiASgCACADRgRAIAEgAjYCACACDQFBwBogCEF+IAB3cSIINgIADAILIAdBEEEUIAcoAhAgA0YbaiACNgIAIAJFDQELIAIgBzYCGCADKAIQIgAEQCACIAA2AhAgACACNgIYCyADKAIUIgBFDQAgAiAANgIUIAAgAjYCGAsCQCAEQQ9NBEAgAyAEIAVqIgBBA3I2AgQgACADaiIAIAAoAgRBAXI2AgQMAQsgAyAFQQNyNgIEIAMgBWoiAiAEQQFyNgIEIAIgBGogBDYCACAEQf8BTQRAIARBeHFB5BpqIQACf0G8GigCACIBQQEgBEEDdnQiBXFFBEBBvBogASAFcjYCACAADAELIAAoAggLIQEgACACNgIIIAEgAjYCDCACIAA2AgwgAiABNgIIDAELQR8hACAEQf///wdNBEAgBEEmIARBCHZnIgBrdkEBcSAAQQF0a0E+aiEACyACIAA2AhwgAkIANwIQIABBAnRB7BxqIQECQAJAIAhBASAAdCIFcUUEQEHAGiAFIAhyNgIAIAEgAjYCAAwBCyAEQRkgAEEBdmtBACAAQR9HG3QhACABKAIAIQUDQCAFIgEoAgRBeHEgBEYNAiAAQR12IQUgAEEBdCEAIAEgBUEEcWoiBigCECIFDQALIAYgAjYCEAsgAiABNgIYIAIgAjYCDCACIAI2AggMAQsgASgCCCIAIAI2AgwgASACNgIIIAJBADYCGCACIAE2AgwgAiAANgIICyADQQhqIQAMAQsCQCAJRQ0AAkAgAigCHCIAQQJ0QewcaiIBKAIAIAJGBEAgASADNgIAIAMNAUHAGiALQX4gAHdxNgIADAILIAlBEEEUIAkoAhAgAkYbaiADNgIAIANFDQELIAMgCTYCGCACKAIQIgAEQCADIAA2AhAgACADNgIYCyACKAIUIgBFDQAgAyAANgIUIAAgAzYCGAsCQCAEQQ9NBEAgAiAEIAVqIgBBA3I2AgQgACACaiIAIAAoAgRBAXI2AgQMAQsgAiAFQQNyNgIEIAIgBWoiAyAEQQFyNgIEIAMgBGogBDYCACAHBEAgB0F4cUHkGmohAEHQGigCACEBAn9BASAHQQN2dCIFIAZxRQRAQbwaIAUgBnI2AgAgAAwBCyAAKAIICyEFIAAgATYCCCAFIAE2AgwgASAANgIMIAEgBTYCCAtB0BogAzYCAEHEGiAENgIACyACQQhqIQALIApBEGokACAAC6kLAgt/CX0jAEGgAWsiCyQAIAtBMGpBJBAQA0AgASANRwRAIAIgDUEDbCIMQQJqQQJ0Ig5qKgIAIRcgAiAMQQFqQQJ0Ig9qKgIAIRggCCAMQQJ0IhBqIAIgEGoqAgAiGTgCACAIIA9qIBg4AgAgCCAOaiAXOAIAIAcgDUEFdGoiDCAYOAIEIAwgGTgCACAMIBc4AgggDEEANgIMAkAgAEUEQCAGIA1qLQAARQ0BCyAMQYCAgAg2AgwLIAcgDUEFdGoiESAFIA1BAnQiDEEBciISai0AAEEIdCAFIAxqLQAAciAFIAxBAnIiE2otAABBEHRyIAUgDEEDciIMai0AAEEYdHI2AhwgCyADIBJBAnQiEmoqAgAiFzgCkAEgCyADIBNBAnQiE2oqAgAiGDgClAEgCyADIAxBAnQiFGoqAgAiGTgCmAEgCyADIA1BBHQiFWoqAgCMIho4ApwBIAtB4ABqIgwgCyoCmAEiFkMAAADAlCAWlCALKgKUASIWQwAAAMCUIBaUQwAAgD+SkjgCACAMIAsqApABIhYgFpIgCyoClAGUIAsqApgBQwAAAMCUIAsqApwBlJI4AgQgDCALKgKQASIWIBaSIAsqApgBlCALKgKUASIWIBaSIAsqApwBlJI4AgggDCALKgKQASIWIBaSIAsqApQBlCALKgKYASIWIBaSIAsqApwBlJI4AgwgDCALKgKYASIWQwAAAMCUIBaUIAsqApABIhZDAAAAwJQgFpRDAACAP5KSOAIQIAwgCyoClAEiFiAWkiALKgKYAZQgCyoCkAFDAAAAwJQgCyoCnAGUkjgCFCAMIAsqApABIhYgFpIgCyoCmAGUIAsqApQBQwAAAMCUIAsqApwBlJI4AhggDCALKgKUASIWIBaSIAsqApgBlCALKgKQASIWIBaSIAsqApwBlJI4AhwgDCALKgKUASIWQwAAAMCUIBaUIAsqApABIhZDAAAAwJQgFpRDAACAP5KSOAIgIAkgFWogFzgCACAJIBJqIBg4AgAgCSATaiAZOAIAIAkgFGogGjgCACALIAQgEGoqAgAiFzgCMCALIAQgD2oqAgAiGDgCQCALIAQgDmoqAgAiGTgCUCAKIBBqIBc4AgAgCiAPaiAYOAIAIAogDmogGTgCACALIAwqAhggCyoCOJQgDCoCACALKgIwlCAMKgIMIAsqAjSUkpI4AgAgCyAMKgIcIAsqAjiUIAwqAgQgCyoCMJQgDCoCECALKgI0lJKSOAIEIAsgDCoCICALKgI4lCAMKgIIIAsqAjCUIAwqAhQgCyoCNJSSkjgCCCALIAwqAhggCyoCRJQgDCoCACALKgI8lCAMKgIMIAsqAkCUkpI4AgwgCyAMKgIcIAsqAkSUIAwqAgQgCyoCPJQgDCoCECALKgJAlJKSOAIQIAsgDCoCICALKgJElCAMKgIIIAsqAjyUIAwqAhQgCyoCQJSSkjgCFCALIAwqAhggCyoCUJQgDCoCACALKgJIlCAMKgIMIAsqAkyUkpI4AhggCyAMKgIcIAsqAlCUIAwqAgQgCyoCSJQgDCoCECALKgJMlJKSOAIcIAsgDCoCICALKgJQlCAMKgIIIAsqAkiUIAwqAhQgCyoCTJSSkjgCICALKgIgIRcgCyoCCCEYIAsqAhQhGSARIAsqAhgiGiAalCALKgIAIhYgFpQgCyoCDCIbIBuUkpJDAACAQJQgGiALKgIcIhyUIBYgCyoCBCIdlCAbIAsqAhAiHpSSkkMAAIBAlBAMNgIQIBEgGiAXlCAWIBiUIBsgGZSSkkMAAIBAlCAcIByUIB0gHZQgHiAelJKSQwAAgECUEAw2AhQgESAcIBeUIB0gGJQgHiAZlJKSQwAAgECUIBcgF5QgGCAYlCAZIBmUkpJDAACAQJQQDDYCGCANQQFqIQ0MAQsLIAtBoAFqJAALGgAgACABKAIIIAUQCgRAIAEgAiADIAQQFAsLNwAgACABKAIIIAUQCgRAIAEgAiADIAQQFA8LIAAoAggiACABIAIgAyAEIAUgACgCACgCFBEDAAuRAQAgACABKAIIIAQQCgRAIAEgAiADEBMPCwJAIAAgASgCACAEEApFDQACQCACIAEoAhBHBEAgASgCFCACRw0BCyADQQFHDQEgAUEBNgIgDwsgASACNgIUIAEgAzYCICABIAEoAihBAWo2AigCQCABKAIkQQFHDQAgASgCGEECRw0AIAFBAToANgsgAUEENgIsCwvyAQAgACABKAIIIAQQCgRAIAEgAiADEBMPCwJAIAAgASgCACAEEAoEQAJAIAIgASgCEEcEQCABKAIUIAJHDQELIANBAUcNAiABQQE2AiAPCyABIAM2AiACQCABKAIsQQRGDQAgAUEAOwE0IAAoAggiACABIAIgAkEBIAQgACgCACgCFBEDACABLQA1BEAgAUEDNgIsIAEtADRFDQEMAwsgAUEENgIsCyABIAI2AhQgASABKAIoQQFqNgIoIAEoAiRBAUcNASABKAIYQQJHDQEgAUEBOgA2DwsgACgCCCIAIAEgAiADIAQgACgCACgCGBECAAsLMQAgACABKAIIQQAQCgRAIAEgAiADEBUPCyAAKAIIIgAgASACIAMgACgCACgCHBEAAAsYACAAIAEoAghBABAKBEAgASACIAMQFQsLgAMBBH8jAEHwAGsiAiQAIAAoAgAiA0EEaygCACEEIANBCGsoAgAhBSACQgA3AlAgAkIANwJYIAJCADcCYCACQgA3AGcgAkIANwJIIAJBADYCRCACQewVNgJAIAIgADYCPCACIAE2AjggACAFaiEDAkAgBCABQQAQCgRAQQAgAyAFGyEADAELIAAgA04EQCACQgA3AC8gAkIANwIYIAJCADcCICACQgA3AiggAkIANwIQIAJBADYCDCACIAE2AgggAiAANgIEIAIgBDYCACACQQE2AjAgBCACIAMgA0EBQQAgBCgCACgCFBEDACACKAIYDQELQQAhACAEIAJBOGogA0EBQQAgBCgCACgCGBECAAJAAkAgAigCXA4CAAECCyACKAJMQQAgAigCWEEBRhtBACACKAJUQQFGG0EAIAIoAmBBAUYbIQAMAQsgAigCUEEBRwRAIAIoAmANASACKAJUQQFHDQEgAigCWEEBRw0BCyACKAJIIQALIAJB8ABqJAAgAAuZAQECfyMAQUBqIgMkAAJ/QQEgACABQQAQCg0AGkEAIAFFDQAaQQAgAUGcFhAhIgFFDQAaIANBDGpBNBAQIANBATYCOCADQX82AhQgAyAANgIQIAMgATYCCCABIANBCGogAigCAEEBIAEoAgAoAhwRAAAgAygCICIAQQFGBEAgAiADKAIYNgIACyAAQQFGCyEEIANBQGskACAECwoAIAAgAUEAEAoLC7cSAgBBgAgLphJ1bnNpZ25lZCBzaG9ydAB1bnNpZ25lZCBpbnQAZmxvYXQAdWludDY0X3QAdW5zaWduZWQgY2hhcgBib29sAHVuc2lnbmVkIGxvbmcAc3RkOjp3c3RyaW5nAHN0ZDo6c3RyaW5nAHN0ZDo6dTE2c3RyaW5nAHN0ZDo6dTMyc3RyaW5nAGRvdWJsZQB2b2lkAGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50NjRfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50NjRfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAAAAAJQMAAAyBwAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAAJQMAAB8BwAATlN0M19fMjEyYmFzaWNfc3RyaW5nSXdOU18xMWNoYXJfdHJhaXRzSXdFRU5TXzlhbGxvY2F0b3JJd0VFRUUAAJQMAADEBwAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURzTlNfMTFjaGFyX3RyYWl0c0lEc0VFTlNfOWFsbG9jYXRvcklEc0VFRUUAAACUDAAADAgAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEaU5TXzExY2hhcl90cmFpdHNJRGlFRU5TXzlhbGxvY2F0b3JJRGlFRUVFAAAAlAwAAFgIAABOMTBlbXNjcmlwdGVuM3ZhbEUAAJQMAACkCAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJY0VFAACUDAAAwAgAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQAAlAwAAOgIAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0loRUUAAJQMAAAQCQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAACUDAAAOAkAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXRFRQAAlAwAAGAJAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lpRUUAAJQMAACICQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAACUDAAAsAkAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWxFRQAAlAwAANgJAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ltRUUAAJQMAAAACgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJeEVFAACUDAAAKAoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXlFRQAAlAwAAFAKAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lmRUUAAJQMAAB4CgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZEVFAACUDAAAoAoAAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAALwMAADICgAAIA0AAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAALwMAAD4CgAA7AoAAE4xMF9fY3h4YWJpdjExN19fcGJhc2VfdHlwZV9pbmZvRQAAALwMAAAoCwAA7AoAAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FALwMAABYCwAATAsAAAAAAADMCwAAAgAAAAMAAAAEAAAABQAAAAYAAABOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UAvAwAAKQLAADsCgAAdgAAAJALAADYCwAAYgAAAJALAADkCwAAYwAAAJALAADwCwAAaAAAAJALAAD8CwAAYQAAAJALAAAIDAAAcwAAAJALAAAUDAAAdAAAAJALAAAgDAAAaQAAAJALAAAsDAAAagAAAJALAAA4DAAAbAAAAJALAABEDAAAbQAAAJALAABQDAAAeAAAAJALAABcDAAAeQAAAJALAABoDAAAZgAAAJALAAB0DAAAZAAAAJALAACADAAAAAAAABwLAAACAAAABwAAAAQAAAAFAAAACAAAAAkAAAAKAAAACwAAAAAAAAAEDQAAAgAAAAwAAAAEAAAABQAAAAgAAAANAAAADgAAAA8AAABOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UAAAAAvAwAANwMAAAcCwAAU3Q5dHlwZV9pbmZvAAAAAJQMAAAQDQBBqBoLAzAPAQ==") || (Be = G, G = l.locateFile ? l.locateFile(Be, a) : a + Be);
  var g = (u) => {
    for (; u.length > 0; )
      u.shift()(l);
  };
  l.noExitRuntime;
  var Y, y, K = (u) => {
    for (var Z = "", W = u; F[W]; )
      Z += Y[F[W++]];
    return Z;
  }, oe = {}, T = {}, C = (u) => {
    throw new y(u);
  };
  function ee(u, Z, W = {}) {
    if (!("argPackAdvance" in Z))
      throw new TypeError("registerType registeredInstance requires argPackAdvance");
    return function(f, E, S = {}) {
      var _ = E.name;
      if (f || C(`type "${_}" must have a positive integer typeid pointer`), T.hasOwnProperty(f)) {
        if (S.ignoreDuplicateRegistrations)
          return;
        C(`Cannot register type '${_}' twice`);
      }
      if (T[f] = E, oe.hasOwnProperty(f)) {
        var D = oe[f];
        delete oe[f], D.forEach((w) => w());
      }
    }(u, Z, W);
  }
  var $ = new class {
    constructor() {
      this.allocated = [void 0], this.freelist = [];
    }
    get(u) {
      return this.allocated[u];
    }
    has(u) {
      return this.allocated[u] !== void 0;
    }
    allocate(u) {
      var Z = this.freelist.pop() || this.allocated.length;
      return this.allocated[Z] = u, Z;
    }
    free(u) {
      this.allocated[u] = void 0, this.freelist.push(u);
    }
  }(), Ce = () => {
    for (var u = 0, Z = $.reserved; Z < $.allocated.length; ++Z)
      $.allocated[Z] !== void 0 && ++u;
    return u;
  }, Ye = (u) => (u || C("Cannot use deleted val. handle = " + u), $.get(u).value), re = (u) => {
    switch (u) {
      case void 0:
        return 1;
      case null:
        return 2;
      case !0:
        return 3;
      case !1:
        return 4;
      default:
        return $.allocate({ refcount: 1, value: u });
    }
  };
  function Rt(u) {
    return this.fromWireType(R[u >> 2]);
  }
  var bt = { name: "emscripten::val", fromWireType: (u) => {
    var Z = Ye(u);
    return ((W) => {
      W >= $.reserved && --$.get(W).refcount == 0 && $.free(W);
    })(u), Z;
  }, toWireType: (u, Z) => re(Z), argPackAdvance: 8, readValueFromPointer: Rt, destructorFunction: null }, Ht = (u, Z) => {
    switch (Z) {
      case 4:
        return function(W) {
          return this.fromWireType(p[W >> 2]);
        };
      case 8:
        return function(W) {
          return this.fromWireType(b[W >> 3]);
        };
      default:
        throw new TypeError(`invalid float width (${Z}): ${u}`);
    }
  }, xt = (u, Z, W) => {
    switch (Z) {
      case 1:
        return W ? (f) => U[f >> 0] : (f) => F[f >> 0];
      case 2:
        return W ? (f) => h[f >> 1] : (f) => Q[f >> 1];
      case 4:
        return W ? (f) => R[f >> 2] : (f) => V[f >> 2];
      default:
        throw new TypeError(`invalid integer width (${Z}): ${u}`);
    }
  };
  function Fe(u) {
    return this.fromWireType(V[u >> 2]);
  }
  var me = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, ae = (u, Z) => u ? ((W, f, E) => {
    for (var S = f + E, _ = f; W[_] && !(_ >= S); )
      ++_;
    if (_ - f > 16 && W.buffer && me)
      return me.decode(W.subarray(f, _));
    for (var D = ""; f < _; ) {
      var w = W[f++];
      if (128 & w) {
        var P = 63 & W[f++];
        if ((224 & w) != 192) {
          var ue = 63 & W[f++];
          if ((w = (240 & w) == 224 ? (15 & w) << 12 | P << 6 | ue : (7 & w) << 18 | P << 12 | ue << 6 | 63 & W[f++]) < 65536)
            D += String.fromCharCode(w);
          else {
            var he = w - 65536;
            D += String.fromCharCode(55296 | he >> 10, 56320 | 1023 & he);
          }
        } else
          D += String.fromCharCode((31 & w) << 6 | P);
      } else
        D += String.fromCharCode(w);
    }
    return D;
  })(F, u, Z) : "", de = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, ze = (u, Z) => {
    for (var W = u, f = W >> 1, E = f + Z / 2; !(f >= E) && Q[f]; )
      ++f;
    if ((W = f << 1) - u > 32 && de)
      return de.decode(F.subarray(u, W));
    for (var S = "", _ = 0; !(_ >= Z / 2); ++_) {
      var D = h[u + 2 * _ >> 1];
      if (D == 0)
        break;
      S += String.fromCharCode(D);
    }
    return S;
  }, We = (u, Z, W) => {
    if (W ?? (W = 2147483647), W < 2)
      return 0;
    for (var f = Z, E = (W -= 2) < 2 * u.length ? W / 2 : u.length, S = 0; S < E; ++S) {
      var _ = u.charCodeAt(S);
      h[Z >> 1] = _, Z += 2;
    }
    return h[Z >> 1] = 0, Z - f;
  }, ce = (u) => 2 * u.length, fe = (u, Z) => {
    for (var W = 0, f = ""; !(W >= Z / 4); ) {
      var E = R[u + 4 * W >> 2];
      if (E == 0)
        break;
      if (++W, E >= 65536) {
        var S = E - 65536;
        f += String.fromCharCode(55296 | S >> 10, 56320 | 1023 & S);
      } else
        f += String.fromCharCode(E);
    }
    return f;
  }, El = (u, Z, W) => {
    if (W ?? (W = 2147483647), W < 4)
      return 0;
    for (var f = Z, E = f + W - 4, S = 0; S < u.length; ++S) {
      var _ = u.charCodeAt(S);
      if (_ >= 55296 && _ <= 57343 && (_ = 65536 + ((1023 & _) << 10) | 1023 & u.charCodeAt(++S)), R[Z >> 2] = _, (Z += 4) + 4 > E)
        break;
    }
    return R[Z >> 2] = 0, Z - f;
  }, Wn = (u) => {
    for (var Z = 0, W = 0; W < u.length; ++W) {
      var f = u.charCodeAt(W);
      f >= 55296 && f <= 57343 && ++W, Z += 4;
    }
    return Z;
  }, es = (u) => {
    var Z = (u - d.buffer.byteLength + 65535) / 65536;
    try {
      return d.grow(Z), A(), 1;
    } catch {
    }
  };
  (() => {
    for (var u = new Array(256), Z = 0; Z < 256; ++Z)
      u[Z] = String.fromCharCode(Z);
    Y = u;
  })(), y = l.BindingError = class extends Error {
    constructor(u) {
      super(u), this.name = "BindingError";
    }
  }, l.InternalError = class extends Error {
    constructor(u) {
      super(u), this.name = "InternalError";
    }
  }, $.allocated.push({ value: void 0 }, { value: null }, { value: !0 }, { value: !1 }), Object.assign($, { reserved: $.allocated.length }), l.count_emval_handles = Ce;
  var ts = { f: (u, Z, W, f, E) => {
  }, i: (u, Z, W, f) => {
    ee(u, { name: Z = K(Z), fromWireType: function(E) {
      return !!E;
    }, toWireType: function(E, S) {
      return S ? W : f;
    }, argPackAdvance: 8, readValueFromPointer: function(E) {
      return this.fromWireType(F[E]);
    }, destructorFunction: null });
  }, h: (u) => ee(u, bt), e: (u, Z, W) => {
    ee(u, { name: Z = K(Z), fromWireType: (f) => f, toWireType: (f, E) => E, argPackAdvance: 8, readValueFromPointer: Ht(Z, W), destructorFunction: null });
  }, b: (u, Z, W, f, E) => {
    Z = K(Z);
    var S = (w) => w;
    if (f === 0) {
      var _ = 32 - 8 * W;
      S = (w) => w << _ >>> _;
    }
    var D = Z.includes("unsigned");
    ee(u, { name: Z, fromWireType: S, toWireType: D ? function(w, P) {
      return this.name, P >>> 0;
    } : function(w, P) {
      return this.name, P;
    }, argPackAdvance: 8, readValueFromPointer: xt(Z, W, f !== 0), destructorFunction: null });
  }, a: (u, Z, W) => {
    var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][Z];
    function E(S) {
      var _ = V[S >> 2], D = V[S + 4 >> 2];
      return new f(U.buffer, D, _);
    }
    ee(u, { name: W = K(W), fromWireType: E, argPackAdvance: 8, readValueFromPointer: E }, { ignoreDuplicateRegistrations: !0 });
  }, d: (u, Z) => {
    var W = (Z = K(Z)) === "std::string";
    ee(u, { name: Z, fromWireType(f) {
      var E, S = V[f >> 2], _ = f + 4;
      if (W)
        for (var D = _, w = 0; w <= S; ++w) {
          var P = _ + w;
          if (w == S || F[P] == 0) {
            var ue = ae(D, P - D);
            E === void 0 ? E = ue : (E += String.fromCharCode(0), E += ue), D = P + 1;
          }
        }
      else {
        var he = new Array(S);
        for (w = 0; w < S; ++w)
          he[w] = String.fromCharCode(F[_ + w]);
        E = he.join("");
      }
      return $e(f), E;
    }, toWireType(f, E) {
      var S;
      E instanceof ArrayBuffer && (E = new Uint8Array(E));
      var _ = typeof E == "string";
      _ || E instanceof Uint8Array || E instanceof Uint8ClampedArray || E instanceof Int8Array || C("Cannot pass non-string to std::string"), S = W && _ ? ((he) => {
        for (var Ue = 0, ne = 0; ne < he.length; ++ne) {
          var Te = he.charCodeAt(ne);
          Te <= 127 ? Ue++ : Te <= 2047 ? Ue += 2 : Te >= 55296 && Te <= 57343 ? (Ue += 4, ++ne) : Ue += 3;
        }
        return Ue;
      })(E) : E.length;
      var D = fn(4 + S + 1), w = D + 4;
      if (V[D >> 2] = S, W && _)
        ((he, Ue, ne, Te) => {
          if (!(Te > 0))
            return 0;
          for (var dt = ne + Te - 1, tn = 0; tn < he.length; ++tn) {
            var Ae = he.charCodeAt(tn);
            if (Ae >= 55296 && Ae <= 57343 && (Ae = 65536 + ((1023 & Ae) << 10) | 1023 & he.charCodeAt(++tn)), Ae <= 127) {
              if (ne >= dt)
                break;
              Ue[ne++] = Ae;
            } else if (Ae <= 2047) {
              if (ne + 1 >= dt)
                break;
              Ue[ne++] = 192 | Ae >> 6, Ue[ne++] = 128 | 63 & Ae;
            } else if (Ae <= 65535) {
              if (ne + 2 >= dt)
                break;
              Ue[ne++] = 224 | Ae >> 12, Ue[ne++] = 128 | Ae >> 6 & 63, Ue[ne++] = 128 | 63 & Ae;
            } else {
              if (ne + 3 >= dt)
                break;
              Ue[ne++] = 240 | Ae >> 18, Ue[ne++] = 128 | Ae >> 12 & 63, Ue[ne++] = 128 | Ae >> 6 & 63, Ue[ne++] = 128 | 63 & Ae;
            }
          }
          Ue[ne] = 0;
        })(E, F, w, S + 1);
      else if (_)
        for (var P = 0; P < S; ++P) {
          var ue = E.charCodeAt(P);
          ue > 255 && ($e(w), C("String has UTF-16 code units that do not fit in 8 bits")), F[w + P] = ue;
        }
      else
        for (P = 0; P < S; ++P)
          F[w + P] = E[P];
      return f !== null && f.push($e, D), D;
    }, argPackAdvance: 8, readValueFromPointer: Fe, destructorFunction(f) {
      $e(f);
    } });
  }, c: (u, Z, W) => {
    var f, E, S, _, D;
    W = K(W), Z === 2 ? (f = ze, E = We, _ = ce, S = () => Q, D = 1) : Z === 4 && (f = fe, E = El, _ = Wn, S = () => V, D = 2), ee(u, { name: W, fromWireType: (w) => {
      for (var P, ue = V[w >> 2], he = S(), Ue = w + 4, ne = 0; ne <= ue; ++ne) {
        var Te = w + 4 + ne * Z;
        if (ne == ue || he[Te >> D] == 0) {
          var dt = f(Ue, Te - Ue);
          P === void 0 ? P = dt : (P += String.fromCharCode(0), P += dt), Ue = Te + Z;
        }
      }
      return $e(w), P;
    }, toWireType: (w, P) => {
      typeof P != "string" && C(`Cannot pass non-string to C++ string type ${W}`);
      var ue = _(P), he = fn(4 + ue + Z);
      return V[he >> 2] = ue >> D, E(P, he + 4, ue + Z), w !== null && w.push($e, he), he;
    }, argPackAdvance: 8, readValueFromPointer: Rt, destructorFunction(w) {
      $e(w);
    } });
  }, j: (u, Z) => {
    ee(u, { isVoid: !0, name: Z = K(Z), argPackAdvance: 0, fromWireType: () => {
    }, toWireType: (W, f) => {
    } });
  }, g: (u) => {
    var Z = F.length, W = 2147483648;
    if ((u >>>= 0) > W)
      return !1;
    for (var f, E, S = 1; S <= 4; S *= 2) {
      var _ = Z * (1 + 0.2 / S);
      _ = Math.min(_, u + 100663296);
      var D = Math.min(W, (f = Math.max(u, _)) + ((E = 65536) - f % E) % E);
      if (es(D))
        return !0;
    }
    return !1;
  } }, ot = function() {
    var W;
    var u = { a: ts };
    function Z(f, E) {
      var S;
      return ot = f.exports, d = ot.k, A(), S = ot.l, x.unshift(S), function(_) {
        var w;
        if (X--, (w = l.monitorRunDependencies) == null || w.call(l, X), X == 0 && N) {
          var D = N;
          N = null, D();
        }
      }(), ot;
    }
    if (X++, (W = l.monitorRunDependencies) == null || W.call(l, X), l.instantiateWasm)
      try {
        return l.instantiateWasm(u, Z);
      } catch (f) {
        r(`Module.instantiateWasm callback failed with error: ${f}`), n(f);
      }
    return B(0, G, u, function(f) {
      Z(f.instance);
    }).catch(n), {};
  }();
  l._pack = (u, Z, W, f, E, S, _, D, w, P, ue) => (l._pack = ot.m)(u, Z, W, f, E, S, _, D, w, P, ue);
  var en, fn = l._malloc = (u) => (fn = l._malloc = ot.o)(u), $e = l._free = (u) => ($e = l._free = ot.p)(u);
  function yl() {
    function u() {
      en || (en = !0, l.calledRun = !0, m || (g(x), e(l), l.onRuntimeInitialized && l.onRuntimeInitialized(), function() {
        if (l.postRun)
          for (typeof l.postRun == "function" && (l.postRun = [l.postRun]); l.postRun.length; )
            Z = l.postRun.shift(), v.unshift(Z);
        var Z;
        g(v);
      }()));
    }
    X > 0 || (function() {
      if (l.preRun)
        for (typeof l.preRun == "function" && (l.preRun = [l.preRun]); l.preRun.length; )
          Z = l.preRun.shift(), I.unshift(Z);
      var Z;
      g(I);
    }(), X > 0 || (l.setStatus ? (l.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        l.setStatus("");
      }, 1), u();
    }, 1)) : u()));
  }
  if (N = function u() {
    en || yl(), en || (N = u);
  }, l.preInit)
    for (typeof l.preInit == "function" && (l.preInit = [l.preInit]); l.preInit.length > 0; )
      l.preInit.pop()();
  return yl(), t.ready;
};
class Xo {
  constructor(e) {
    this.dataChanged = !1, this.transformsChanged = !1, this._updating = /* @__PURE__ */ new Set(), this._dirty = /* @__PURE__ */ new Set();
    let n = 0, l = 0;
    this._splatIndices = /* @__PURE__ */ new Map(), this._offsets = /* @__PURE__ */ new Map();
    const i = /* @__PURE__ */ new Map();
    for (const r of e.objects)
      r instanceof Je && (this._splatIndices.set(r, l), this._offsets.set(r, n), i.set(n, r), n += r.data.vertexCount, l++);
    this._vertexCount = n, this._width = 2048, this._height = Math.ceil(2 * this.vertexCount / this.width), this._data = new Uint32Array(this.width * this.height * 4), this._transformsWidth = 5, this._transformsHeight = i.size, this._transforms = new Float32Array(this._transformsWidth * this._transformsHeight * 4), this._transformIndicesWidth = 1024, this._transformIndicesHeight = Math.ceil(this.vertexCount / this._transformIndicesWidth), this._transformIndices = new Uint32Array(this._transformIndicesWidth * this._transformIndicesHeight), this._positions = new Float32Array(3 * this.vertexCount), this._rotations = new Float32Array(4 * this.vertexCount), this._scales = new Float32Array(3 * this.vertexCount), this._worker = new Go();
    const s = (r) => {
      const c = this._splatIndices.get(r);
      this._transforms.set(r.transform.buffer, 20 * c), this._transforms[20 * c + 16] = r.selected ? 1 : 0, r.positionChanged = !1, r.rotationChanged = !1, r.scaleChanged = !1, r.selectedChanged = !1, this.transformsChanged = !0;
    };
    let a;
    this._worker.onmessage = (r) => {
      if (r.data.response) {
        const c = r.data.response, U = i.get(c.offset);
        s(U);
        const F = this._splatIndices.get(U);
        for (let h = 0; h < U.data.vertexCount; h++)
          this._transformIndices[c.offset + h] = F;
        this._data.set(c.data, 8 * c.offset), U.data.reattach(c.positions, c.rotations, c.scales, c.colors, c.selection), this._positions.set(c.worldPositions, 3 * c.offset), this._rotations.set(c.worldRotations, 4 * c.offset), this._scales.set(c.worldScales, 3 * c.offset), this._updating.delete(U), U.selectedChanged = !1, this.dataChanged = !0;
      }
    }, async function() {
      a = await So();
    }();
    const o = (r) => {
      if (!a)
        return void async function() {
          for (; !a; )
            await new Promise((N) => setTimeout(N, 0));
        }().then(() => {
          o(r);
        });
      s(r);
      const c = a._malloc(3 * r.data.vertexCount * 4), U = a._malloc(4 * r.data.vertexCount * 4), F = a._malloc(3 * r.data.vertexCount * 4), h = a._malloc(4 * r.data.vertexCount), Q = a._malloc(r.data.vertexCount), R = a._malloc(8 * r.data.vertexCount * 4), V = a._malloc(3 * r.data.vertexCount * 4), p = a._malloc(4 * r.data.vertexCount * 4), b = a._malloc(3 * r.data.vertexCount * 4);
      a.HEAPF32.set(r.data.positions, c / 4), a.HEAPF32.set(r.data.rotations, U / 4), a.HEAPF32.set(r.data.scales, F / 4), a.HEAPU8.set(r.data.colors, h), a.HEAPU8.set(r.data.selection, Q), a._pack(r.selected, r.data.vertexCount, c, U, F, h, Q, R, V, p, b);
      const m = new Uint32Array(a.HEAPU32.buffer, R, 8 * r.data.vertexCount), A = new Float32Array(a.HEAPF32.buffer, V, 3 * r.data.vertexCount), I = new Float32Array(a.HEAPF32.buffer, p, 4 * r.data.vertexCount), x = new Float32Array(a.HEAPF32.buffer, b, 3 * r.data.vertexCount), v = this._splatIndices.get(r), X = this._offsets.get(r);
      for (let N = 0; N < r.data.vertexCount; N++)
        this._transformIndices[X + N] = v;
      this._data.set(m, 8 * X), this._positions.set(A, 3 * X), this._rotations.set(I, 4 * X), this._scales.set(x, 3 * X), a._free(c), a._free(U), a._free(F), a._free(h), a._free(Q), a._free(R), a._free(V), a._free(p), a._free(b), this.dataChanged = !0;
    }, d = (r) => {
      if ((r.positionChanged || r.rotationChanged || r.scaleChanged || r.selectedChanged) && s(r), !r.data.changed || r.data.detached)
        return;
      const c = { position: new Float32Array(r.position.flat()), rotation: new Float32Array(r.rotation.flat()), scale: new Float32Array(r.scale.flat()), selected: r.selected, vertexCount: r.data.vertexCount, positions: r.data.positions, rotations: r.data.rotations, scales: r.data.scales, colors: r.data.colors, selection: r.data.selection, offset: this._offsets.get(r) };
      this._worker.postMessage({ splat: c }, [c.position.buffer, c.rotation.buffer, c.scale.buffer, c.positions.buffer, c.rotations.buffer, c.scales.buffer, c.colors.buffer, c.selection.buffer]), this._updating.add(r), r.data.detached = !0;
    };
    this.getSplat = (r) => {
      let c = null;
      for (const [U, F] of this._offsets) {
        if (!(r >= F))
          break;
        c = U;
      }
      return c;
    }, this.getLocalIndex = (r, c) => c - this._offsets.get(r), this.markDirty = (r) => {
      this._dirty.add(r);
    }, this.rebuild = () => {
      for (const r of this._dirty)
        d(r);
      this._dirty.clear();
    }, this.dispose = () => {
      this._worker.terminate();
    };
    for (const r of this._splatIndices.keys())
      o(r);
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
class oa {
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
class da extends yo {
  constructor(e, n) {
    super(e, n), this._outlineThickness = 10, this._outlineColor = new oa(255, 165, 0, 255), this._renderData = null, this._depthIndex = new Uint32Array(), this._chunks = null, this._splatTexture = null;
    const l = e.canvas, i = e.gl;
    let s, a, o, d, r, c, U, F, h, Q, R, V, p, b, m, A;
    this._resize = () => {
      this._camera && (this._camera.data.setSize(l.width, l.height), this._camera.update(), a = i.getUniformLocation(this.program, "projection"), i.uniformMatrix4fv(a, !1, this._camera.data.projectionMatrix.buffer), o = i.getUniformLocation(this.program, "viewport"), i.uniform2fv(o, new Float32Array([l.width, l.height])));
    };
    const I = () => {
      s = new Eo(), s.onmessage = (N) => {
        if (N.data.depthIndex) {
          const { depthIndex: J, chunks: G } = N.data;
          this._depthIndex = J, this._chunks = G, i.bindBuffer(i.ARRAY_BUFFER, A), i.bufferData(i.ARRAY_BUFFER, J, i.STATIC_DRAW);
        }
      };
    };
    this._initialize = () => {
      if (this._scene && this._camera) {
        this._resize(), this._scene.addEventListener("objectAdded", x), this._scene.addEventListener("objectRemoved", v);
        for (const N of this._scene.objects)
          N instanceof Je && N.addEventListener("objectChanged", X);
        this._renderData = new Xo(this._scene), d = i.getUniformLocation(this.program, "focal"), i.uniform2fv(d, new Float32Array([this._camera.data.fx, this._camera.data.fy])), r = i.getUniformLocation(this.program, "view"), i.uniformMatrix4fv(r, !1, this._camera.data.viewMatrix.buffer), h = i.getUniformLocation(this.program, "outlineThickness"), i.uniform1f(h, this.outlineThickness), Q = i.getUniformLocation(this.program, "outlineColor"), i.uniform4fv(Q, new Float32Array(this.outlineColor.flatNorm())), this._splatTexture = i.createTexture(), c = i.getUniformLocation(this.program, "u_texture"), i.uniform1i(c, 0), p = i.createTexture(), U = i.getUniformLocation(this.program, "u_transforms"), i.uniform1i(U, 1), b = i.createTexture(), F = i.getUniformLocation(this.program, "u_transformIndices"), i.uniform1i(F, 2), m = i.createBuffer(), i.bindBuffer(i.ARRAY_BUFFER, m), i.bufferData(i.ARRAY_BUFFER, new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]), i.STATIC_DRAW), R = i.getAttribLocation(this.program, "position"), i.enableVertexAttribArray(R), i.vertexAttribPointer(R, 2, i.FLOAT, !1, 0, 0), A = i.createBuffer(), V = i.getAttribLocation(this.program, "index"), i.enableVertexAttribArray(V), i.bindBuffer(i.ARRAY_BUFFER, A), I();
      } else
        console.error("Cannot render without scene and camera");
    };
    const x = (N) => {
      const J = N;
      J.object instanceof Je && J.object.addEventListener("objectChanged", X), this.dispose();
    }, v = (N) => {
      const J = N;
      J.object instanceof Je && J.object.removeEventListener("objectChanged", X), this.dispose();
    }, X = (N) => {
      const J = N;
      J.object instanceof Je && this._renderData && this._renderData.markDirty(J.object);
    };
    this._render = () => {
      if (this._scene && this._camera && this.renderData) {
        if (this.renderData.needsRebuild && this.renderData.rebuild(), this.renderData.dataChanged || this.renderData.transformsChanged) {
          this.renderData.dataChanged && (i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, this.splatTexture), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA32UI, this.renderData.width, this.renderData.height, 0, i.RGBA_INTEGER, i.UNSIGNED_INT, this.renderData.data)), this.renderData.transformsChanged && (i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, p), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA32F, this.renderData.transformsWidth, this.renderData.transformsHeight, 0, i.RGBA, i.FLOAT, this.renderData.transforms), i.activeTexture(i.TEXTURE2), i.bindTexture(i.TEXTURE_2D, b), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texImage2D(i.TEXTURE_2D, 0, i.R32UI, this.renderData.transformIndicesWidth, this.renderData.transformIndicesHeight, 0, i.RED_INTEGER, i.UNSIGNED_INT, this.renderData.transformIndices));
          const N = new Float32Array(this.renderData.positions.slice().buffer), J = new Float32Array(this.renderData.transforms.slice().buffer), G = new Uint32Array(this.renderData.transformIndices.slice().buffer);
          s.postMessage({ sortData: { positions: N, transforms: J, transformIndices: G, vertexCount: this.renderData.vertexCount } }, [N.buffer, J.buffer, G.buffer]), this.renderData.dataChanged = !1, this.renderData.transformsChanged = !1;
        }
        this._camera.update(), s.postMessage({ viewProj: this._camera.data.viewProj.buffer }), i.viewport(0, 0, l.width, l.height), i.clearColor(0, 0, 0, 0), i.clear(i.COLOR_BUFFER_BIT), i.disable(i.DEPTH_TEST), i.enable(i.BLEND), i.blendFuncSeparate(i.ONE_MINUS_DST_ALPHA, i.ONE, i.ONE_MINUS_DST_ALPHA, i.ONE), i.blendEquationSeparate(i.FUNC_ADD, i.FUNC_ADD), i.uniformMatrix4fv(a, !1, this._camera.data.projectionMatrix.buffer), i.uniformMatrix4fv(r, !1, this._camera.data.viewMatrix.buffer), i.bindBuffer(i.ARRAY_BUFFER, m), i.vertexAttribPointer(R, 2, i.FLOAT, !1, 0, 0), i.bindBuffer(i.ARRAY_BUFFER, A), i.bufferData(i.ARRAY_BUFFER, this.depthIndex, i.STATIC_DRAW), i.vertexAttribIPointer(V, 1, i.INT, 0, 0), i.vertexAttribDivisor(V, 1), i.drawArraysInstanced(i.TRIANGLE_FAN, 0, 4, this.renderData.vertexCount);
      } else
        console.error("Cannot render without scene and camera");
    }, this._dispose = () => {
      if (this._scene && this._camera && this.renderData) {
        this._scene.removeEventListener("objectAdded", x), this._scene.removeEventListener("objectRemoved", v);
        for (const N of this._scene.objects)
          N instanceof Je && N.removeEventListener("objectChanged", X);
        s.terminate(), this.renderData.dispose(), i.deleteTexture(this.splatTexture), i.deleteTexture(p), i.deleteTexture(b), i.deleteBuffer(A), i.deleteBuffer(m);
      } else
        console.error("Cannot dispose without scene and camera");
    }, this._setOutlineThickness = (N) => {
      this._outlineThickness = N, this._initialized && i.uniform1f(h, N);
    }, this._setOutlineColor = (N) => {
      this._outlineColor = N, this._initialized && i.uniform4fv(Q, new Float32Array(N.flatNorm()));
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
    if (pos2d.z < -pos2d.w || pos2d.z > pos2d.w || pos2d.x < -clip || pos2d.x > clip || pos2d.y < -clip || pos2d.y > clip) {
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
class ko {
  constructor(e = 1) {
    let n, l, i, s, a = 0, o = !1;
    this.initialize = (d) => {
      if (!(d instanceof da))
        throw new Error("FadeInPass requires a RenderProgram");
      a = d.started ? 1 : 0, o = !0, n = d, l = d.renderer.gl, i = l.getUniformLocation(n.program, "useDepthFade"), l.uniform1i(i, 1), s = l.getUniformLocation(n.program, "depthFade"), l.uniform1f(s, a);
    }, this.render = () => {
      var d;
      o && !(!((d = n.renderData) === null || d === void 0) && d.updating) && (l.useProgram(n.program), a = Math.min(a + 0.01 * e, 1), a >= 1 && (o = !1, l.uniform1i(i, 0)), l.uniform1f(s, a));
    };
  }
  dispose() {
  }
}
class ca {
  constructor(e = null, n = null) {
    this._backgroundColor = new oa();
    const l = e || document.createElement("canvas");
    e || (l.style.display = "block", l.style.boxSizing = "border-box", l.style.width = "100%", l.style.height = "100%", l.style.margin = "0", l.style.padding = "0", document.body.appendChild(l)), l.style.background = this._backgroundColor.toHexString(), this._canvas = l, this._gl = l.getContext("webgl2", { antialias: !1 });
    const i = n || [];
    n || i.push(new ko()), this._renderProgram = new da(this, i);
    const s = [this._renderProgram];
    this.resize = () => {
      const a = l.clientWidth, o = l.clientHeight;
      l.width === a && l.height === o || this.setSize(a, o);
    }, this.setSize = (a, o) => {
      l.width = a, l.height = o, this._gl.viewport(0, 0, l.width, l.height);
      for (const d of s)
        d.resize();
    }, this.render = (a, o) => {
      for (const d of s)
        d.render(a, o);
    }, this.dispose = () => {
      for (const a of s)
        a.dispose();
    }, this.addProgram = (a) => {
      s.push(a);
    }, this.removeProgram = (a) => {
      const o = s.indexOf(a);
      if (o < 0)
        throw new Error("Program not found");
      s.splice(o, 1);
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
class Ua {
  constructor(e, n, l = 0.5, i = 0.5, s = 5, a = !0, o = new j()) {
    this.minAngle = -90, this.maxAngle = 90, this.minZoom = 0.1, this.maxZoom = 30, this.orbitSpeed = 1, this.panSpeed = 1, this.zoomSpeed = 1, this.dampening = 0.12, this.setCameraTarget = () => {
    };
    let d = o.clone(), r = d.clone(), c = l, U = i, F = s, h = !1, Q = !1, R = 0, V = 0, p = 0;
    const b = {};
    let m = !1;
    e.addEventListener("objectChanged", () => {
      if (m)
        return;
      const B = e.rotation.toEuler();
      c = -B.y, U = -B.x;
      const g = e.position.x - F * Math.sin(c) * Math.cos(U), Y = e.position.y + F * Math.sin(U), y = e.position.z + F * Math.cos(c) * Math.cos(U);
      r = new j(g, Y, y);
    }), this.setCameraTarget = (B) => {
      const g = B.x - e.position.x, Y = B.y - e.position.y, y = B.z - e.position.z;
      F = Math.sqrt(g * g + Y * Y + y * y), U = Math.atan2(Y, Math.sqrt(g * g + y * y)), c = -Math.atan2(g, y), r = new j(B.x, B.y, B.z);
    };
    const A = () => 0.1 + 0.9 * (F - this.minZoom) / (this.maxZoom - this.minZoom), I = (B) => {
      b[B.code] = !0, B.code === "ArrowUp" && (b.KeyW = !0), B.code === "ArrowDown" && (b.KeyS = !0), B.code === "ArrowLeft" && (b.KeyA = !0), B.code === "ArrowRight" && (b.KeyD = !0);
    }, x = (B) => {
      b[B.code] = !1, B.code === "ArrowUp" && (b.KeyW = !1), B.code === "ArrowDown" && (b.KeyS = !1), B.code === "ArrowLeft" && (b.KeyA = !1), B.code === "ArrowRight" && (b.KeyD = !1);
    }, v = (B) => {
      H(B), h = !0, Q = B.button === 2, V = B.clientX, p = B.clientY, window.addEventListener("mouseup", X);
    }, X = (B) => {
      H(B), h = !1, Q = !1, window.removeEventListener("mouseup", X);
    }, N = (B) => {
      if (H(B), !h || !e)
        return;
      const g = B.clientX - V, Y = B.clientY - p;
      if (Q) {
        const y = A(), K = -g * this.panSpeed * 0.01 * y, oe = -Y * this.panSpeed * 0.01 * y, T = Se.RotationFromQuaternion(e.rotation).buffer, C = new j(T[0], T[3], T[6]), ee = new j(T[1], T[4], T[7]);
        r = r.add(C.multiply(K)), r = r.add(ee.multiply(oe));
      } else
        c -= g * this.orbitSpeed * 3e-3, U += Y * this.orbitSpeed * 3e-3, U = Math.min(Math.max(U, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180);
      V = B.clientX, p = B.clientY;
    }, J = (B) => {
      H(B);
      const g = A();
      F += B.deltaY * this.zoomSpeed * 0.025 * g, F = Math.min(Math.max(F, this.minZoom), this.maxZoom);
    }, G = (B) => {
      if (H(B), B.touches.length === 1)
        h = !0, Q = !1, V = B.touches[0].clientX, p = B.touches[0].clientY, R = 0;
      else if (B.touches.length === 2) {
        h = !0, Q = !0, V = (B.touches[0].clientX + B.touches[1].clientX) / 2, p = (B.touches[0].clientY + B.touches[1].clientY) / 2;
        const g = B.touches[0].clientX - B.touches[1].clientX, Y = B.touches[0].clientY - B.touches[1].clientY;
        R = Math.sqrt(g * g + Y * Y);
      }
    }, Be = (B) => {
      H(B), h = !1, Q = !1;
    }, le = (B) => {
      if (H(B), h && e)
        if (Q) {
          const g = A(), Y = B.touches[0].clientX - B.touches[1].clientX, y = B.touches[0].clientY - B.touches[1].clientY, K = Math.sqrt(Y * Y + y * y);
          F += (R - K) * this.zoomSpeed * 0.1 * g, F = Math.min(Math.max(F, this.minZoom), this.maxZoom), R = K;
          const oe = (B.touches[0].clientX + B.touches[1].clientX) / 2, T = (B.touches[0].clientY + B.touches[1].clientY) / 2, C = oe - V, ee = T - p, $ = Se.RotationFromQuaternion(e.rotation).buffer, Ce = new j($[0], $[3], $[6]), Ye = new j($[1], $[4], $[7]);
          r = r.add(Ce.multiply(-C * this.panSpeed * 0.025 * g)), r = r.add(Ye.multiply(-ee * this.panSpeed * 0.025 * g)), V = oe, p = T;
        } else {
          const g = B.touches[0].clientX - V, Y = B.touches[0].clientY - p;
          c -= g * this.orbitSpeed * 3e-3, U += Y * this.orbitSpeed * 3e-3, U = Math.min(Math.max(U, this.minAngle * Math.PI / 180), this.maxAngle * Math.PI / 180), V = B.touches[0].clientX, p = B.touches[0].clientY;
        }
    }, k = (B, g, Y) => (1 - Y) * B + Y * g;
    this.update = () => {
      m = !0, l = k(l, c, this.dampening), i = k(i, U, this.dampening), s = k(s, F, this.dampening), d = d.lerp(r, this.dampening);
      const B = d.x + s * Math.sin(l) * Math.cos(i), g = d.y - s * Math.sin(i), Y = d.z - s * Math.cos(l) * Math.cos(i);
      e.position = new j(B, g, Y);
      const y = d.subtract(e.position).normalize(), K = Math.asin(-y.y), oe = Math.atan2(y.x, y.z);
      e.rotation = Qe.FromEuler(new j(K, oe, 0));
      const T = 0.025, C = 0.01, ee = Se.RotationFromQuaternion(e.rotation).buffer, $ = new j(-ee[2], -ee[5], -ee[8]), Ce = new j(ee[0], ee[3], ee[6]);
      b.KeyS && (r = r.add($.multiply(T))), b.KeyW && (r = r.subtract($.multiply(T))), b.KeyA && (r = r.subtract(Ce.multiply(T))), b.KeyD && (r = r.add(Ce.multiply(T))), b.KeyE && (c += C), b.KeyQ && (c -= C), b.KeyR && (U += C), b.KeyF && (U -= C), m = !1;
    };
    const H = (B) => {
      B.preventDefault(), B.stopPropagation();
    };
    this.dispose = () => {
      n.removeEventListener("dragenter", H), n.removeEventListener("dragover", H), n.removeEventListener("dragleave", H), n.removeEventListener("contextmenu", H), n.removeEventListener("mousedown", v), n.removeEventListener("mousemove", N), n.removeEventListener("wheel", J), n.removeEventListener("touchstart", G), n.removeEventListener("touchend", Be), n.removeEventListener("touchmove", le), a && (window.removeEventListener("keydown", I), window.removeEventListener("keyup", x));
    }, a && (window.addEventListener("keydown", I), window.addEventListener("keyup", x)), n.addEventListener("dragenter", H), n.addEventListener("dragover", H), n.addEventListener("dragleave", H), n.addEventListener("contextmenu", H), n.addEventListener("mousedown", v), n.addEventListener("mousemove", N), n.addEventListener("wheel", J), n.addEventListener("touchstart", G), n.addEventListener("touchend", Be), n.addEventListener("touchmove", le), this.update();
  }
}
const {
  SvelteComponent: Yo,
  append: vn,
  attr: Hn,
  binding_callbacks: To,
  check_outros: _o,
  create_component: Fa,
  destroy_component: ha,
  detach: sl,
  element: xn,
  empty: wo,
  group_outros: vo,
  init: Ho,
  insert: rl,
  mount_component: Qa,
  safe_not_equal: xo,
  space: Ba,
  transition_in: jt,
  transition_out: Un
} = window.__gradio__svelte__internal, { onMount: Do } = window.__gradio__svelte__internal;
function Pl(t) {
  let e, n, l, i, s, a;
  return l = new Vn({
    props: {
      Icon: Tr,
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
      e = xn("div"), n = xn("div"), Fa(l.$$.fragment), i = Ba(), s = xn("canvas"), Hn(n, "class", "buttons svelte-1jnxgzx"), Hn(s, "class", "svelte-1jnxgzx"), Hn(e, "class", "model3DGS svelte-1jnxgzx");
    },
    m(o, d) {
      rl(o, e, d), vn(e, n), Qa(l, n, null), vn(e, i), vn(e, s), t[10](s), a = !0;
    },
    p(o, d) {
      const r = {};
      d & /*i18n*/
      8 && (r.label = /*i18n*/
      o[3]("common.download")), l.$set(r);
    },
    i(o) {
      a || (jt(l.$$.fragment, o), a = !0);
    },
    o(o) {
      Un(l.$$.fragment, o), a = !1;
    },
    d(o) {
      o && sl(e), ha(l), t[10](null);
    }
  };
}
function Mo(t) {
  let e, n, l, i;
  e = new An({
    props: {
      show_label: (
        /*show_label*/
        t[2]
      ),
      Icon: Lt,
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
      Fa(e.$$.fragment), n = Ba(), s && s.c(), l = wo();
    },
    m(a, o) {
      Qa(e, a, o), rl(a, n, o), s && s.m(a, o), rl(a, l, o), i = !0;
    },
    p(a, [o]) {
      const d = {};
      o & /*show_label*/
      4 && (d.show_label = /*show_label*/
      a[2]), o & /*label, i18n*/
      10 && (d.label = /*label*/
      a[1] || /*i18n*/
      a[3]("3DGS_model.splat")), e.$set(d), /*value*/
      a[0] ? s ? (s.p(a, o), o & /*value*/
      1 && jt(s, 1)) : (s = Pl(a), s.c(), jt(s, 1), s.m(l.parentNode, l)) : s && (vo(), Un(s, 1, 1, () => {
        s = null;
      }), _o());
    },
    i(a) {
      i || (jt(e.$$.fragment, a), jt(s), i = !0);
    },
    o(a) {
      Un(e.$$.fragment, a), Un(s), i = !1;
    },
    d(a) {
      a && (sl(n), sl(l)), ha(e, a), s && s.d(a);
    }
  };
}
function zo(t, e, n) {
  let l, { value: i } = e, { label: s = "" } = e, { show_label: a } = e, { i18n: o } = e, { zoom_speed: d = 1 } = e, { pan_speed: r = 1 } = e, c, U, F, h = null, Q, R = !1, V = null;
  function p() {
    if (V !== null && (cancelAnimationFrame(V), V = null), h !== null && (h.dispose(), h = null), U = new ia(), F = new la(), h = new ca(c), Q = new Ua(F, c), Q.zoomSpeed = d, Q.panSpeed = r, !i)
      return;
    let A = !1;
    const I = async () => {
      if (A) {
        console.error("Already loading");
        return;
      }
      if (A = !0, i.url.endsWith(".ply"))
        await sa.LoadAsync(i.url, U, (v) => {
        });
      else if (i.url.endsWith(".splat"))
        await aa.LoadAsync(i.url, U, (v) => {
        });
      else
        throw new Error("Unsupported file type");
      A = !1;
    }, x = () => {
      if (h) {
        if (A) {
          V = requestAnimationFrame(x);
          return;
        }
        Q.update(), h.render(U, F), V = requestAnimationFrame(x);
      }
    };
    I(), V = requestAnimationFrame(x);
  }
  Do(() => {
    i != null && p(), n(8, R = !0);
  });
  function b() {
    if (!i)
      return;
    let A = i.orig_name || i.path.split("/").pop() || "model.splat";
    A = A.replace(/\.ply$/, ".splat"), U.saveToFile(A);
  }
  function m(A) {
    To[A ? "unshift" : "push"](() => {
      c = A, n(4, c);
    });
  }
  return t.$$set = (A) => {
    "value" in A && n(0, i = A.value), "label" in A && n(1, s = A.label), "show_label" in A && n(2, a = A.show_label), "i18n" in A && n(3, o = A.i18n), "zoom_speed" in A && n(6, d = A.zoom_speed), "pan_speed" in A && n(7, r = A.pan_speed);
  }, t.$$.update = () => {
    t.$$.dirty & /*value*/
    1 && n(9, { path: l } = i || { path: void 0 }, l), t.$$.dirty & /*canvas, mounted, path*/
    784 && c && R && l && p();
  }, [
    i,
    s,
    a,
    o,
    c,
    b,
    d,
    r,
    R,
    l,
    m
  ];
}
class jo extends Yo {
  constructor(e) {
    super(), Ho(this, e, zo, Mo, xo, {
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
function Ko(t) {
  return t();
}
function Oo(t) {
  t.forEach(Ko);
}
function Lo(t) {
  return typeof t == "function";
}
function Po(t, e) {
  return t != t ? e == e : t !== e || t && typeof t == "object" || typeof t == "function";
}
function qo(t, ...e) {
  if (t == null) {
    for (const l of e)
      l(void 0);
    return Zt;
  }
  const n = t.subscribe(...e);
  return n.unsubscribe ? () => n.unsubscribe() : n;
}
const ua = typeof window < "u";
let ql = ua ? () => window.performance.now() : () => Date.now(), Aa = ua ? (t) => requestAnimationFrame(t) : Zt;
const Jt = /* @__PURE__ */ new Set();
function Va(t) {
  Jt.forEach((e) => {
    e.c(t) || (Jt.delete(e), e.f());
  }), Jt.size !== 0 && Aa(Va);
}
function $o(t) {
  let e;
  return Jt.size === 0 && Aa(Va), {
    promise: new Promise((n) => {
      Jt.add(e = { c: t, f: n });
    }),
    abort() {
      Jt.delete(e);
    }
  };
}
const Wt = [];
function ed(t, e) {
  return {
    subscribe: Pt(t, e).subscribe
  };
}
function Pt(t, e = Zt) {
  let n;
  const l = /* @__PURE__ */ new Set();
  function i(o) {
    if (Po(t, o) && (t = o, n)) {
      const d = !Wt.length;
      for (const r of l)
        r[1](), Wt.push(r, t);
      if (d) {
        for (let r = 0; r < Wt.length; r += 2)
          Wt[r][0](Wt[r + 1]);
        Wt.length = 0;
      }
    }
  }
  function s(o) {
    i(o(t));
  }
  function a(o, d = Zt) {
    const r = [o, d];
    return l.add(r), l.size === 1 && (n = e(i, s) || Zt), o(t), () => {
      l.delete(r), l.size === 0 && n && (n(), n = null);
    };
  }
  return { set: i, update: s, subscribe: a };
}
function _t(t, e, n) {
  const l = !Array.isArray(t), i = l ? [t] : t;
  if (!i.every(Boolean))
    throw new Error("derived() expects stores as input, got a falsy value");
  const s = e.length < 2;
  return ed(n, (a, o) => {
    let d = !1;
    const r = [];
    let c = 0, U = Zt;
    const F = () => {
      if (c)
        return;
      U();
      const Q = e(l ? r[0] : r, a, o);
      s ? a(Q) : U = Lo(Q) ? Q : Zt;
    }, h = i.map(
      (Q, R) => qo(
        Q,
        (V) => {
          r[R] = V, c &= ~(1 << R), d && F();
        },
        () => {
          c |= 1 << R;
        }
      )
    );
    return d = !0, F(), function() {
      Oo(h), U(), d = !1;
    };
  });
}
function $l(t) {
  return Object.prototype.toString.call(t) === "[object Date]";
}
function ol(t, e, n, l) {
  if (typeof n == "number" || $l(n)) {
    const i = l - n, s = (n - e) / (t.dt || 1 / 60), a = t.opts.stiffness * i, o = t.opts.damping * s, d = (a - o) * t.inv_mass, r = (s + d) * t.dt;
    return Math.abs(r) < t.opts.precision && Math.abs(i) < t.opts.precision ? l : (t.settled = !1, $l(n) ? new Date(n.getTime() + r) : n + r);
  } else {
    if (Array.isArray(n))
      return n.map(
        (i, s) => ol(t, e[s], n[s], l[s])
      );
    if (typeof n == "object") {
      const i = {};
      for (const s in n)
        i[s] = ol(t, e[s], n[s], l[s]);
      return i;
    } else
      throw new Error(`Cannot spring ${typeof n} values`);
  }
}
function ei(t, e = {}) {
  const n = Pt(t), { stiffness: l = 0.15, damping: i = 0.8, precision: s = 0.01 } = e;
  let a, o, d, r = t, c = t, U = 1, F = 0, h = !1;
  function Q(V, p = {}) {
    c = V;
    const b = d = {};
    return t == null || p.hard || R.stiffness >= 1 && R.damping >= 1 ? (h = !0, a = ql(), r = V, n.set(t = c), Promise.resolve()) : (p.soft && (F = 1 / ((p.soft === !0 ? 0.5 : +p.soft) * 60), U = 0), o || (a = ql(), h = !1, o = $o((m) => {
      if (h)
        return h = !1, o = null, !1;
      U = Math.min(U + F, 1);
      const A = {
        inv_mass: U,
        opts: R,
        settled: !0,
        dt: (m - a) * 60 / 1e3
      }, I = ol(A, r, t, c);
      return a = m, r = t, n.set(t = I), A.settled && (o = null), !A.settled;
    })), new Promise((m) => {
      o.promise.then(() => {
        b === d && m();
      });
    }));
  }
  const R = {
    set: Q,
    update: (V, p) => Q(V(c, t), p),
    subscribe: n.subscribe,
    stiffness: l,
    damping: i,
    precision: s
  };
  return R;
}
function td(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var nd = function(e) {
  return ld(e) && !id(e);
};
function ld(t) {
  return !!t && typeof t == "object";
}
function id(t) {
  var e = Object.prototype.toString.call(t);
  return e === "[object RegExp]" || e === "[object Date]" || rd(t);
}
var ad = typeof Symbol == "function" && Symbol.for, sd = ad ? Symbol.for("react.element") : 60103;
function rd(t) {
  return t.$$typeof === sd;
}
function od(t) {
  return Array.isArray(t) ? [] : {};
}
function Kt(t, e) {
  return e.clone !== !1 && e.isMergeableObject(t) ? Et(od(t), t, e) : t;
}
function dd(t, e, n) {
  return t.concat(e).map(function(l) {
    return Kt(l, n);
  });
}
function cd(t, e) {
  if (!e.customMerge)
    return Et;
  var n = e.customMerge(t);
  return typeof n == "function" ? n : Et;
}
function Ud(t) {
  return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(e) {
    return Object.propertyIsEnumerable.call(t, e);
  }) : [];
}
function ti(t) {
  return Object.keys(t).concat(Ud(t));
}
function Za(t, e) {
  try {
    return e in t;
  } catch {
    return !1;
  }
}
function Fd(t, e) {
  return Za(t, e) && !(Object.hasOwnProperty.call(t, e) && Object.propertyIsEnumerable.call(t, e));
}
function hd(t, e, n) {
  var l = {};
  return n.isMergeableObject(t) && ti(t).forEach(function(i) {
    l[i] = Kt(t[i], n);
  }), ti(e).forEach(function(i) {
    Fd(t, i) || (Za(t, i) && n.isMergeableObject(e[i]) ? l[i] = cd(i, n)(t[i], e[i], n) : l[i] = Kt(e[i], n));
  }), l;
}
function Et(t, e, n) {
  n = n || {}, n.arrayMerge = n.arrayMerge || dd, n.isMergeableObject = n.isMergeableObject || nd, n.cloneUnlessOtherwiseSpecified = Kt;
  var l = Array.isArray(e), i = Array.isArray(t), s = l === i;
  return s ? l ? n.arrayMerge(t, e, n) : hd(t, e, n) : Kt(e, n);
}
Et.all = function(e, n) {
  if (!Array.isArray(e))
    throw new Error("first argument should be an array");
  return e.reduce(function(l, i) {
    return Et(l, i, n);
  }, {});
};
var Qd = Et, Bd = Qd;
const ud = /* @__PURE__ */ td(Bd);
var dl = function(t, e) {
  return dl = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, l) {
    n.__proto__ = l;
  } || function(n, l) {
    for (var i in l)
      Object.prototype.hasOwnProperty.call(l, i) && (n[i] = l[i]);
  }, dl(t, e);
};
function Zn(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  dl(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
var te = function() {
  return te = Object.assign || function(e) {
    for (var n, l = 1, i = arguments.length; l < i; l++) {
      n = arguments[l];
      for (var s in n)
        Object.prototype.hasOwnProperty.call(n, s) && (e[s] = n[s]);
    }
    return e;
  }, te.apply(this, arguments);
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
var ie;
(function(t) {
  t[t.literal = 0] = "literal", t[t.argument = 1] = "argument", t[t.number = 2] = "number", t[t.date = 3] = "date", t[t.time = 4] = "time", t[t.select = 5] = "select", t[t.plural = 6] = "plural", t[t.pound = 7] = "pound", t[t.tag = 8] = "tag";
})(ie || (ie = {}));
var yt;
(function(t) {
  t[t.number = 0] = "number", t[t.dateTime = 1] = "dateTime";
})(yt || (yt = {}));
function ni(t) {
  return t.type === ie.literal;
}
function Ad(t) {
  return t.type === ie.argument;
}
function ma(t) {
  return t.type === ie.number;
}
function Ra(t) {
  return t.type === ie.date;
}
function ba(t) {
  return t.type === ie.time;
}
function ga(t) {
  return t.type === ie.select;
}
function Wa(t) {
  return t.type === ie.plural;
}
function Vd(t) {
  return t.type === ie.pound;
}
function fa(t) {
  return t.type === ie.tag;
}
function pa(t) {
  return !!(t && typeof t == "object" && t.type === yt.number);
}
function cl(t) {
  return !!(t && typeof t == "object" && t.type === yt.dateTime);
}
var Ia = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/, Zd = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
function md(t) {
  var e = {};
  return t.replace(Zd, function(n) {
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
var Rd = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
function bd(t) {
  if (t.length === 0)
    throw new Error("Number skeleton cannot be empty");
  for (var e = t.split(Rd).filter(function(F) {
    return F.length > 0;
  }), n = [], l = 0, i = e; l < i.length; l++) {
    var s = i[l], a = s.split("/");
    if (a.length === 0)
      throw new Error("Invalid number skeleton");
    for (var o = a[0], d = a.slice(1), r = 0, c = d; r < c.length; r++) {
      var U = c[r];
      if (U.length === 0)
        throw new Error("Invalid number skeleton");
    }
    n.push({ stem: o, options: d });
  }
  return n;
}
function gd(t) {
  return t.replace(/^(.*?)-/, "");
}
var li = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g, Ja = /^(@+)?(\+|#+)?[rs]?$/g, Wd = /(\*)(0+)|(#+)(0+)|(0+)/g, Ca = /^(0+)$/;
function ii(t) {
  var e = {};
  return t[t.length - 1] === "r" ? e.roundingPriority = "morePrecision" : t[t.length - 1] === "s" && (e.roundingPriority = "lessPrecision"), t.replace(Ja, function(n, l, i) {
    return typeof i != "string" ? (e.minimumSignificantDigits = l.length, e.maximumSignificantDigits = l.length) : i === "+" ? e.minimumSignificantDigits = l.length : l[0] === "#" ? e.maximumSignificantDigits = l.length : (e.minimumSignificantDigits = l.length, e.maximumSignificantDigits = l.length + (typeof i == "string" ? i.length : 0)), "";
  }), e;
}
function Na(t) {
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
function fd(t) {
  var e;
  if (t[0] === "E" && t[1] === "E" ? (e = {
    notation: "engineering"
  }, t = t.slice(2)) : t[0] === "E" && (e = {
    notation: "scientific"
  }, t = t.slice(1)), e) {
    var n = t.slice(0, 2);
    if (n === "+!" ? (e.signDisplay = "always", t = t.slice(2)) : n === "+?" && (e.signDisplay = "exceptZero", t = t.slice(2)), !Ca.test(t))
      throw new Error("Malformed concise eng/scientific notation");
    e.minimumIntegerDigits = t.length;
  }
  return e;
}
function ai(t) {
  var e = {}, n = Na(t);
  return n || e;
}
function pd(t) {
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
        e.style = "unit", e.unit = gd(i.options[0]);
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
        e = te(te(te({}, e), { notation: "scientific" }), i.options.reduce(function(d, r) {
          return te(te({}, d), ai(r));
        }, {}));
        continue;
      case "engineering":
        e = te(te(te({}, e), { notation: "engineering" }), i.options.reduce(function(d, r) {
          return te(te({}, d), ai(r));
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
        i.options[0].replace(Wd, function(d, r, c, U, F, h) {
          if (r)
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
    if (Ca.test(i.stem)) {
      e.minimumIntegerDigits = i.stem.length;
      continue;
    }
    if (li.test(i.stem)) {
      if (i.options.length > 1)
        throw new RangeError("Fraction-precision stems only accept a single optional option");
      i.stem.replace(li, function(d, r, c, U, F, h) {
        return c === "*" ? e.minimumFractionDigits = r.length : U && U[0] === "#" ? e.maximumFractionDigits = U.length : F && h ? (e.minimumFractionDigits = F.length, e.maximumFractionDigits = F.length + h.length) : (e.minimumFractionDigits = r.length, e.maximumFractionDigits = r.length), "";
      });
      var s = i.options[0];
      s === "w" ? e = te(te({}, e), { trailingZeroDisplay: "stripIfInteger" }) : s && (e = te(te({}, e), ii(s)));
      continue;
    }
    if (Ja.test(i.stem)) {
      e = te(te({}, e), ii(i.stem));
      continue;
    }
    var a = Na(i.stem);
    a && (e = te(te({}, e), a));
    var o = fd(i.stem);
    o && (e = te(te({}, e), o));
  }
  return e;
}
var sn = {
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
      var a = 1 + (s & 1), o = s < 2 ? 1 : 3 + (s >> 1), d = "a", r = Jd(e);
      for ((r == "H" || r == "k") && (o = 0); o-- > 0; )
        n += d;
      for (; a-- > 0; )
        n = r + n;
    } else
      i === "J" ? n += "H" : n += i;
  }
  return n;
}
function Jd(t) {
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
  var i = sn[l || ""] || sn[n || ""] || sn["".concat(n, "-001")] || sn["001"];
  return i[0];
}
var Mn, Cd = new RegExp("^".concat(Ia.source, "*")), Nd = new RegExp("".concat(Ia.source, "*$"));
function L(t, e) {
  return { start: t, end: e };
}
var Ed = !!String.prototype.startsWith, yd = !!String.fromCodePoint, Gd = !!Object.fromEntries, Sd = !!String.prototype.codePointAt, Xd = !!String.prototype.trimStart, kd = !!String.prototype.trimEnd, Yd = !!Number.isSafeInteger, Td = Yd ? Number.isSafeInteger : function(t) {
  return typeof t == "number" && isFinite(t) && Math.floor(t) === t && Math.abs(t) <= 9007199254740991;
}, Ul = !0;
try {
  var _d = ya("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  Ul = ((Mn = _d.exec("a")) === null || Mn === void 0 ? void 0 : Mn[0]) === "a";
} catch {
  Ul = !1;
}
var si = Ed ? (
  // Native
  function(e, n, l) {
    return e.startsWith(n, l);
  }
) : (
  // For IE11
  function(e, n, l) {
    return e.slice(l, l + n.length) === n;
  }
), Fl = yd ? String.fromCodePoint : (
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
  Gd ? Object.fromEntries : (
    // Ponyfill
    function(e) {
      for (var n = {}, l = 0, i = e; l < i.length; l++) {
        var s = i[l], a = s[0], o = s[1];
        n[a] = o;
      }
      return n;
    }
  )
), Ea = Sd ? (
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
), wd = Xd ? (
  // Native
  function(e) {
    return e.trimStart();
  }
) : (
  // Ponyfill
  function(e) {
    return e.replace(Cd, "");
  }
), vd = kd ? (
  // Native
  function(e) {
    return e.trimEnd();
  }
) : (
  // Ponyfill
  function(e) {
    return e.replace(Nd, "");
  }
);
function ya(t, e) {
  return new RegExp(t, e);
}
var hl;
if (Ul) {
  var oi = ya("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
  hl = function(e, n) {
    var l;
    oi.lastIndex = n;
    var i = oi.exec(e);
    return (l = i[1]) !== null && l !== void 0 ? l : "";
  };
} else
  hl = function(e, n) {
    for (var l = []; ; ) {
      var i = Ea(e, n);
      if (i === void 0 || Ga(i) || Md(i))
        break;
      l.push(i), n += i >= 65536 ? 2 : 1;
    }
    return Fl.apply(void 0, l);
  };
var Hd = (
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
              type: ie.pound,
              location: L(o, this.clonePosition())
            });
          } else if (s === 60 && !this.ignoreTag && this.peek() === 47) {
            if (l)
              break;
            return this.error(O.UNMATCHED_CLOSING_TAG, L(this.clonePosition(), this.clonePosition()));
          } else if (s === 60 && !this.ignoreTag && Ql(this.peek() || 0)) {
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
            type: ie.literal,
            value: "<".concat(i, "/>"),
            location: L(l, this.clonePosition())
          },
          err: null
        };
      if (this.bumpIf(">")) {
        var s = this.parseMessage(e + 1, n, !0);
        if (s.err)
          return s;
        var a = s.val, o = this.clonePosition();
        if (this.bumpIf("</")) {
          if (this.isEOF() || !Ql(this.char()))
            return this.error(O.INVALID_TAG, L(o, this.clonePosition()));
          var d = this.clonePosition(), r = this.parseTagName();
          return i !== r ? this.error(O.UNMATCHED_CLOSING_TAG, L(d, this.clonePosition())) : (this.bumpSpace(), this.bumpIf(">") ? {
            val: {
              type: ie.tag,
              value: i,
              children: a,
              location: L(l, this.clonePosition())
            },
            err: null
          } : this.error(O.INVALID_TAG, L(o, this.clonePosition())));
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
        var o = this.tryParseLeftAngleBracket();
        if (o) {
          i += o;
          continue;
        }
        break;
      }
      var d = L(l, this.clonePosition());
      return {
        val: { type: ie.literal, value: i, location: d },
        err: null
      };
    }, t.prototype.tryParseLeftAngleBracket = function() {
      return !this.isEOF() && this.char() === 60 && (this.ignoreTag || // If at the opening tag or closing tag position, bail.
      !xd(this.peek() || 0)) ? (this.bump(), "<") : null;
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
              type: ie.argument,
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
      var e = this.clonePosition(), n = this.offset(), l = hl(this.message, n), i = n + l.length;
      this.bumpTo(i);
      var s = this.clonePosition(), a = L(e, s);
      return { value: l, location: a };
    }, t.prototype.parseArgumentOptions = function(e, n, l, i) {
      var s, a = this.clonePosition(), o = this.parseIdentifierIfPossible().value, d = this.clonePosition();
      switch (o) {
        case "":
          return this.error(O.EXPECT_ARGUMENT_TYPE, L(a, d));
        case "number":
        case "date":
        case "time": {
          this.bumpSpace();
          var r = null;
          if (this.bumpIf(",")) {
            this.bumpSpace();
            var c = this.clonePosition(), U = this.parseSimpleArgStyleIfPossible();
            if (U.err)
              return U;
            var F = vd(U.val);
            if (F.length === 0)
              return this.error(O.EXPECT_ARGUMENT_STYLE, L(this.clonePosition(), this.clonePosition()));
            var h = L(c, this.clonePosition());
            r = { style: F, styleLocation: h };
          }
          var Q = this.tryParseArgumentClose(i);
          if (Q.err)
            return Q;
          var R = L(i, this.clonePosition());
          if (r && si(r == null ? void 0 : r.style, "::", 0)) {
            var V = wd(r.style.slice(2));
            if (o === "number") {
              var U = this.parseNumberSkeletonFromString(V, r.styleLocation);
              return U.err ? U : {
                val: { type: ie.number, value: l, location: R, style: U.val },
                err: null
              };
            } else {
              if (V.length === 0)
                return this.error(O.EXPECT_DATE_TIME_SKELETON, R);
              var p = V;
              this.locale && (p = Id(V, this.locale));
              var F = {
                type: yt.dateTime,
                pattern: p,
                location: r.styleLocation,
                parsedOptions: this.shouldParseSkeletons ? md(p) : {}
              }, b = o === "date" ? ie.date : ie.time;
              return {
                val: { type: b, value: l, location: R, style: F },
                err: null
              };
            }
          }
          return {
            val: {
              type: o === "number" ? ie.number : o === "date" ? ie.date : ie.time,
              value: l,
              location: R,
              style: (s = r == null ? void 0 : r.style) !== null && s !== void 0 ? s : null
            },
            err: null
          };
        }
        case "plural":
        case "selectordinal":
        case "select": {
          var m = this.clonePosition();
          if (this.bumpSpace(), !this.bumpIf(","))
            return this.error(O.EXPECT_SELECT_ARGUMENT_OPTIONS, L(m, te({}, m)));
          this.bumpSpace();
          var A = this.parseIdentifierIfPossible(), I = 0;
          if (o !== "select" && A.value === "offset") {
            if (!this.bumpIf(":"))
              return this.error(O.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, L(this.clonePosition(), this.clonePosition()));
            this.bumpSpace();
            var U = this.tryParseDecimalInteger(O.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, O.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
            if (U.err)
              return U;
            this.bumpSpace(), A = this.parseIdentifierIfPossible(), I = U.val;
          }
          var x = this.tryParsePluralOrSelectOptions(e, o, n, A);
          if (x.err)
            return x;
          var Q = this.tryParseArgumentClose(i);
          if (Q.err)
            return Q;
          var v = L(i, this.clonePosition());
          return o === "select" ? {
            val: {
              type: ie.select,
              value: l,
              options: ri(x.val),
              location: v
            },
            err: null
          } : {
            val: {
              type: ie.plural,
              value: l,
              options: ri(x.val),
              offset: I,
              pluralType: o === "plural" ? "cardinal" : "ordinal",
              location: v
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
        l = bd(e);
      } catch {
        return this.error(O.INVALID_NUMBER_SKELETON, n);
      }
      return {
        val: {
          type: yt.number,
          tokens: l,
          location: n,
          parsedOptions: this.shouldParseSkeletons ? pd(l) : {}
        },
        err: null
      };
    }, t.prototype.tryParsePluralOrSelectOptions = function(e, n, l, i) {
      for (var s, a = !1, o = [], d = /* @__PURE__ */ new Set(), r = i.value, c = i.location; ; ) {
        if (r.length === 0) {
          var U = this.clonePosition();
          if (n !== "select" && this.bumpIf("=")) {
            var F = this.tryParseDecimalInteger(O.EXPECT_PLURAL_ARGUMENT_SELECTOR, O.INVALID_PLURAL_ARGUMENT_SELECTOR);
            if (F.err)
              return F;
            c = L(U, this.clonePosition()), r = this.message.slice(U.offset, this.offset());
          } else
            break;
        }
        if (d.has(r))
          return this.error(n === "select" ? O.DUPLICATE_SELECT_ARGUMENT_SELECTOR : O.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, c);
        r === "other" && (a = !0), this.bumpSpace();
        var h = this.clonePosition();
        if (!this.bumpIf("{"))
          return this.error(n === "select" ? O.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : O.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, L(this.clonePosition(), this.clonePosition()));
        var Q = this.parseMessage(e + 1, n, l);
        if (Q.err)
          return Q;
        var R = this.tryParseArgumentClose(h);
        if (R.err)
          return R;
        o.push([
          r,
          {
            value: Q.val,
            location: L(h, this.clonePosition())
          }
        ]), d.add(r), this.bumpSpace(), s = this.parseIdentifierIfPossible(), r = s.value, c = s.location;
      }
      return o.length === 0 ? this.error(n === "select" ? O.EXPECT_SELECT_ARGUMENT_SELECTOR : O.EXPECT_PLURAL_ARGUMENT_SELECTOR, L(this.clonePosition(), this.clonePosition())) : this.requiresOtherClause && !a ? this.error(O.MISSING_OTHER_CLAUSE, L(this.clonePosition(), this.clonePosition())) : { val: o, err: null };
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
      var d = L(i, this.clonePosition());
      return s ? (a *= l, Td(a) ? { val: a, err: null } : this.error(n, d)) : this.error(e, d);
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
      var n = Ea(this.message, e);
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
      for (; !this.isEOF() && Ga(this.char()); )
        this.bump();
    }, t.prototype.peek = function() {
      if (this.isEOF())
        return null;
      var e = this.char(), n = this.offset(), l = this.message.charCodeAt(n + (e >= 65536 ? 2 : 1));
      return l ?? null;
    }, t;
  }()
);
function Ql(t) {
  return t >= 97 && t <= 122 || t >= 65 && t <= 90;
}
function xd(t) {
  return Ql(t) || t === 47;
}
function Dd(t) {
  return t === 45 || t === 46 || t >= 48 && t <= 57 || t === 95 || t >= 97 && t <= 122 || t >= 65 && t <= 90 || t == 183 || t >= 192 && t <= 214 || t >= 216 && t <= 246 || t >= 248 && t <= 893 || t >= 895 && t <= 8191 || t >= 8204 && t <= 8205 || t >= 8255 && t <= 8256 || t >= 8304 && t <= 8591 || t >= 11264 && t <= 12271 || t >= 12289 && t <= 55295 || t >= 63744 && t <= 64975 || t >= 65008 && t <= 65533 || t >= 65536 && t <= 983039;
}
function Ga(t) {
  return t >= 9 && t <= 13 || t === 32 || t === 133 || t >= 8206 && t <= 8207 || t === 8232 || t === 8233;
}
function Md(t) {
  return t >= 33 && t <= 35 || t === 36 || t >= 37 && t <= 39 || t === 40 || t === 41 || t === 42 || t === 43 || t === 44 || t === 45 || t >= 46 && t <= 47 || t >= 58 && t <= 59 || t >= 60 && t <= 62 || t >= 63 && t <= 64 || t === 91 || t === 92 || t === 93 || t === 94 || t === 96 || t === 123 || t === 124 || t === 125 || t === 126 || t === 161 || t >= 162 && t <= 165 || t === 166 || t === 167 || t === 169 || t === 171 || t === 172 || t === 174 || t === 176 || t === 177 || t === 182 || t === 187 || t === 191 || t === 215 || t === 247 || t >= 8208 && t <= 8213 || t >= 8214 && t <= 8215 || t === 8216 || t === 8217 || t === 8218 || t >= 8219 && t <= 8220 || t === 8221 || t === 8222 || t === 8223 || t >= 8224 && t <= 8231 || t >= 8240 && t <= 8248 || t === 8249 || t === 8250 || t >= 8251 && t <= 8254 || t >= 8257 && t <= 8259 || t === 8260 || t === 8261 || t === 8262 || t >= 8263 && t <= 8273 || t === 8274 || t === 8275 || t >= 8277 && t <= 8286 || t >= 8592 && t <= 8596 || t >= 8597 && t <= 8601 || t >= 8602 && t <= 8603 || t >= 8604 && t <= 8607 || t === 8608 || t >= 8609 && t <= 8610 || t === 8611 || t >= 8612 && t <= 8613 || t === 8614 || t >= 8615 && t <= 8621 || t === 8622 || t >= 8623 && t <= 8653 || t >= 8654 && t <= 8655 || t >= 8656 && t <= 8657 || t === 8658 || t === 8659 || t === 8660 || t >= 8661 && t <= 8691 || t >= 8692 && t <= 8959 || t >= 8960 && t <= 8967 || t === 8968 || t === 8969 || t === 8970 || t === 8971 || t >= 8972 && t <= 8991 || t >= 8992 && t <= 8993 || t >= 8994 && t <= 9e3 || t === 9001 || t === 9002 || t >= 9003 && t <= 9083 || t === 9084 || t >= 9085 && t <= 9114 || t >= 9115 && t <= 9139 || t >= 9140 && t <= 9179 || t >= 9180 && t <= 9185 || t >= 9186 && t <= 9254 || t >= 9255 && t <= 9279 || t >= 9280 && t <= 9290 || t >= 9291 && t <= 9311 || t >= 9472 && t <= 9654 || t === 9655 || t >= 9656 && t <= 9664 || t === 9665 || t >= 9666 && t <= 9719 || t >= 9720 && t <= 9727 || t >= 9728 && t <= 9838 || t === 9839 || t >= 9840 && t <= 10087 || t === 10088 || t === 10089 || t === 10090 || t === 10091 || t === 10092 || t === 10093 || t === 10094 || t === 10095 || t === 10096 || t === 10097 || t === 10098 || t === 10099 || t === 10100 || t === 10101 || t >= 10132 && t <= 10175 || t >= 10176 && t <= 10180 || t === 10181 || t === 10182 || t >= 10183 && t <= 10213 || t === 10214 || t === 10215 || t === 10216 || t === 10217 || t === 10218 || t === 10219 || t === 10220 || t === 10221 || t === 10222 || t === 10223 || t >= 10224 && t <= 10239 || t >= 10240 && t <= 10495 || t >= 10496 && t <= 10626 || t === 10627 || t === 10628 || t === 10629 || t === 10630 || t === 10631 || t === 10632 || t === 10633 || t === 10634 || t === 10635 || t === 10636 || t === 10637 || t === 10638 || t === 10639 || t === 10640 || t === 10641 || t === 10642 || t === 10643 || t === 10644 || t === 10645 || t === 10646 || t === 10647 || t === 10648 || t >= 10649 && t <= 10711 || t === 10712 || t === 10713 || t === 10714 || t === 10715 || t >= 10716 && t <= 10747 || t === 10748 || t === 10749 || t >= 10750 && t <= 11007 || t >= 11008 && t <= 11055 || t >= 11056 && t <= 11076 || t >= 11077 && t <= 11078 || t >= 11079 && t <= 11084 || t >= 11085 && t <= 11123 || t >= 11124 && t <= 11125 || t >= 11126 && t <= 11157 || t === 11158 || t >= 11159 && t <= 11263 || t >= 11776 && t <= 11777 || t === 11778 || t === 11779 || t === 11780 || t === 11781 || t >= 11782 && t <= 11784 || t === 11785 || t === 11786 || t === 11787 || t === 11788 || t === 11789 || t >= 11790 && t <= 11798 || t === 11799 || t >= 11800 && t <= 11801 || t === 11802 || t === 11803 || t === 11804 || t === 11805 || t >= 11806 && t <= 11807 || t === 11808 || t === 11809 || t === 11810 || t === 11811 || t === 11812 || t === 11813 || t === 11814 || t === 11815 || t === 11816 || t === 11817 || t >= 11818 && t <= 11822 || t === 11823 || t >= 11824 && t <= 11833 || t >= 11834 && t <= 11835 || t >= 11836 && t <= 11839 || t === 11840 || t === 11841 || t === 11842 || t >= 11843 && t <= 11855 || t >= 11856 && t <= 11857 || t === 11858 || t >= 11859 && t <= 11903 || t >= 12289 && t <= 12291 || t === 12296 || t === 12297 || t === 12298 || t === 12299 || t === 12300 || t === 12301 || t === 12302 || t === 12303 || t === 12304 || t === 12305 || t >= 12306 && t <= 12307 || t === 12308 || t === 12309 || t === 12310 || t === 12311 || t === 12312 || t === 12313 || t === 12314 || t === 12315 || t === 12316 || t === 12317 || t >= 12318 && t <= 12319 || t === 12320 || t === 12336 || t === 64830 || t === 64831 || t >= 65093 && t <= 65094;
}
function Bl(t) {
  t.forEach(function(e) {
    if (delete e.location, ga(e) || Wa(e))
      for (var n in e.options)
        delete e.options[n].location, Bl(e.options[n].value);
    else
      ma(e) && pa(e.style) || (Ra(e) || ba(e)) && cl(e.style) ? delete e.style.location : fa(e) && Bl(e.children);
  });
}
function zd(t, e) {
  e === void 0 && (e = {}), e = te({ shouldParseSkeletons: !0, requiresOtherClause: !0 }, e);
  var n = new Hd(t, e).parse();
  if (n.err) {
    var l = SyntaxError(O[n.err.kind]);
    throw l.location = n.err.location, l.originalMessage = n.err.message, l;
  }
  return e != null && e.captureLocation || Bl(n.val), n.val;
}
function zn(t, e) {
  var n = e && e.cache ? e.cache : qd, l = e && e.serializer ? e.serializer : Pd, i = e && e.strategy ? e.strategy : Kd;
  return i(t, {
    cache: n,
    serializer: l
  });
}
function jd(t) {
  return t == null || typeof t == "number" || typeof t == "boolean";
}
function Sa(t, e, n, l) {
  var i = jd(l) ? l : n(l), s = e.get(i);
  return typeof s > "u" && (s = t.call(this, l), e.set(i, s)), s;
}
function Xa(t, e, n) {
  var l = Array.prototype.slice.call(arguments, 3), i = n(l), s = e.get(i);
  return typeof s > "u" && (s = t.apply(this, l), e.set(i, s)), s;
}
function Rl(t, e, n, l, i) {
  return n.bind(e, t, l, i);
}
function Kd(t, e) {
  var n = t.length === 1 ? Sa : Xa;
  return Rl(t, this, n, e.cache.create(), e.serializer);
}
function Od(t, e) {
  return Rl(t, this, Xa, e.cache.create(), e.serializer);
}
function Ld(t, e) {
  return Rl(t, this, Sa, e.cache.create(), e.serializer);
}
var Pd = function() {
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
var qd = {
  create: function() {
    return new bl();
  }
}, jn = {
  variadic: Od,
  monadic: Ld
}, Gt;
(function(t) {
  t.MISSING_VALUE = "MISSING_VALUE", t.INVALID_VALUE = "INVALID_VALUE", t.MISSING_INTL_API = "MISSING_INTL_API";
})(Gt || (Gt = {}));
var mn = (
  /** @class */
  function(t) {
    Zn(e, t);
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
    Zn(e, t);
    function e(n, l, i, s) {
      return t.call(this, 'Invalid values for "'.concat(n, '": "').concat(l, '". Options are "').concat(Object.keys(i).join('", "'), '"'), Gt.INVALID_VALUE, s) || this;
    }
    return e;
  }(mn)
), $d = (
  /** @class */
  function(t) {
    Zn(e, t);
    function e(n, l, i) {
      return t.call(this, 'Value for "'.concat(n, '" must be of type ').concat(l), Gt.INVALID_VALUE, i) || this;
    }
    return e;
  }(mn)
), e0 = (
  /** @class */
  function(t) {
    Zn(e, t);
    function e(n, l) {
      return t.call(this, 'The intl string context variable "'.concat(n, '" was not provided to the string "').concat(l, '"'), Gt.MISSING_VALUE, l) || this;
    }
    return e;
  }(mn)
), Re;
(function(t) {
  t[t.literal = 0] = "literal", t[t.object = 1] = "object";
})(Re || (Re = {}));
function t0(t) {
  return t.length < 2 ? t : t.reduce(function(e, n) {
    var l = e[e.length - 1];
    return !l || l.type !== Re.literal || n.type !== Re.literal ? e.push(n) : l.value += n.value, e;
  }, []);
}
function n0(t) {
  return typeof t == "function";
}
function Fn(t, e, n, l, i, s, a) {
  if (t.length === 1 && ni(t[0]))
    return [
      {
        type: Re.literal,
        value: t[0].value
      }
    ];
  for (var o = [], d = 0, r = t; d < r.length; d++) {
    var c = r[d];
    if (ni(c)) {
      o.push({
        type: Re.literal,
        value: c.value
      });
      continue;
    }
    if (Vd(c)) {
      typeof s == "number" && o.push({
        type: Re.literal,
        value: n.getNumberFormat(e).format(s)
      });
      continue;
    }
    var U = c.value;
    if (!(i && U in i))
      throw new e0(U, a);
    var F = i[U];
    if (Ad(c)) {
      (!F || typeof F == "string" || typeof F == "number") && (F = typeof F == "string" || typeof F == "number" ? String(F) : ""), o.push({
        type: typeof F == "string" ? Re.literal : Re.object,
        value: F
      });
      continue;
    }
    if (Ra(c)) {
      var h = typeof c.style == "string" ? l.date[c.style] : cl(c.style) ? c.style.parsedOptions : void 0;
      o.push({
        type: Re.literal,
        value: n.getDateTimeFormat(e, h).format(F)
      });
      continue;
    }
    if (ba(c)) {
      var h = typeof c.style == "string" ? l.time[c.style] : cl(c.style) ? c.style.parsedOptions : l.time.medium;
      o.push({
        type: Re.literal,
        value: n.getDateTimeFormat(e, h).format(F)
      });
      continue;
    }
    if (ma(c)) {
      var h = typeof c.style == "string" ? l.number[c.style] : pa(c.style) ? c.style.parsedOptions : void 0;
      h && h.scale && (F = F * (h.scale || 1)), o.push({
        type: Re.literal,
        value: n.getNumberFormat(e, h).format(F)
      });
      continue;
    }
    if (fa(c)) {
      var Q = c.children, R = c.value, V = i[R];
      if (!n0(V))
        throw new $d(R, "function", a);
      var p = Fn(Q, e, n, l, i, s), b = V(p.map(function(I) {
        return I.value;
      }));
      Array.isArray(b) || (b = [b]), o.push.apply(o, b.map(function(I) {
        return {
          type: typeof I == "string" ? Re.literal : Re.object,
          value: I
        };
      }));
    }
    if (ga(c)) {
      var m = c.options[F] || c.options.other;
      if (!m)
        throw new di(c.value, F, Object.keys(c.options), a);
      o.push.apply(o, Fn(m.value, e, n, l, i));
      continue;
    }
    if (Wa(c)) {
      var m = c.options["=".concat(F)];
      if (!m) {
        if (!Intl.PluralRules)
          throw new mn(`Intl.PluralRules is not available in this environment.
Try polyfilling it using "@formatjs/intl-pluralrules"
`, Gt.MISSING_INTL_API, a);
        var A = n.getPluralRules(e, { type: c.pluralType }).select(F - (c.offset || 0));
        m = c.options[A] || c.options.other;
      }
      if (!m)
        throw new di(c.value, F, Object.keys(c.options), a);
      o.push.apply(o, Fn(m.value, e, n, l, i, F - (c.offset || 0)));
      continue;
    }
  }
  return t0(o);
}
function l0(t, e) {
  return e ? te(te(te({}, t || {}), e || {}), Object.keys(t).reduce(function(n, l) {
    return n[l] = te(te({}, t[l]), e[l] || {}), n;
  }, {})) : t;
}
function i0(t, e) {
  return e ? Object.keys(t).reduce(function(n, l) {
    return n[l] = l0(t[l], e[l]), n;
  }, te({}, t)) : t;
}
function Kn(t) {
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
function a0(t) {
  return t === void 0 && (t = {
    number: {},
    dateTime: {},
    pluralRules: {}
  }), {
    getNumberFormat: zn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.NumberFormat).bind.apply(e, Dn([void 0], n, !1)))();
    }, {
      cache: Kn(t.number),
      strategy: jn.variadic
    }),
    getDateTimeFormat: zn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.DateTimeFormat).bind.apply(e, Dn([void 0], n, !1)))();
    }, {
      cache: Kn(t.dateTime),
      strategy: jn.variadic
    }),
    getPluralRules: zn(function() {
      for (var e, n = [], l = 0; l < arguments.length; l++)
        n[l] = arguments[l];
      return new ((e = Intl.PluralRules).bind.apply(e, Dn([void 0], n, !1)))();
    }, {
      cache: Kn(t.pluralRules),
      strategy: jn.variadic
    })
  };
}
var s0 = (
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
        var d = o.reduce(function(r, c) {
          return !r.length || c.type !== Re.literal || typeof r[r.length - 1] != "string" ? r.push(c.value) : r[r.length - 1] += c.value, r;
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
      this.formats = i0(t.formats, l), this.formatters = i && i.formatters || a0(this.formatterCache);
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
    }, t.__parse = zd, t.formats = {
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
function r0(t, e) {
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
const st = {}, o0 = (t, e, n) => n && (e in st || (st[e] = {}), t in st[e] || (st[e][t] = n), n), ka = (t, e) => {
  if (e == null)
    return;
  if (e in st && t in st[e])
    return st[e][t];
  const n = Rn(e);
  for (let l = 0; l < n.length; l++) {
    const i = n[l], s = c0(i, t);
    if (s)
      return o0(t, e, s);
  }
};
let gl;
const qt = Pt({});
function d0(t) {
  return gl[t] || null;
}
function Ya(t) {
  return t in gl;
}
function c0(t, e) {
  if (!Ya(t))
    return null;
  const n = d0(t);
  return r0(n, e);
}
function U0(t) {
  if (t == null)
    return;
  const e = Rn(t);
  for (let n = 0; n < e.length; n++) {
    const l = e[n];
    if (Ya(l))
      return l;
  }
}
function F0(t, ...e) {
  delete st[t], qt.update((n) => (n[t] = ud.all([n[t] || {}, ...e]), n));
}
_t(
  [qt],
  ([t]) => Object.keys(t)
);
qt.subscribe((t) => gl = t);
const hn = {};
function h0(t, e) {
  hn[t].delete(e), hn[t].size === 0 && delete hn[t];
}
function Ta(t) {
  return hn[t];
}
function Q0(t) {
  return Rn(t).map((e) => {
    const n = Ta(e);
    return [e, n ? [...n] : []];
  }).filter(([, e]) => e.length > 0);
}
function ul(t) {
  return t == null ? !1 : Rn(t).some(
    (e) => {
      var n;
      return (n = Ta(e)) == null ? void 0 : n.size;
    }
  );
}
function B0(t, e) {
  return Promise.all(
    e.map((l) => (h0(t, l), l().then((i) => i.default || i)))
  ).then((l) => F0(t, ...l));
}
const Mt = {};
function _a(t) {
  if (!ul(t))
    return t in Mt ? Mt[t] : Promise.resolve();
  const e = Q0(t);
  return Mt[t] = Promise.all(
    e.map(
      ([n, l]) => B0(n, l)
    )
  ).then(() => {
    if (ul(t))
      return _a(t);
    delete Mt[t];
  }), Mt[t];
}
const u0 = {
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
}, A0 = {
  fallbackLocale: null,
  loadingDelay: 200,
  formats: u0,
  warnOnMissingMessages: !0,
  handleMissingMessage: void 0,
  ignoreTag: !0
}, V0 = A0;
function St() {
  return V0;
}
const On = Pt(!1);
var Z0 = Object.defineProperty, m0 = Object.defineProperties, R0 = Object.getOwnPropertyDescriptors, ci = Object.getOwnPropertySymbols, b0 = Object.prototype.hasOwnProperty, g0 = Object.prototype.propertyIsEnumerable, Ui = (t, e, n) => e in t ? Z0(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, W0 = (t, e) => {
  for (var n in e || (e = {}))
    b0.call(e, n) && Ui(t, n, e[n]);
  if (ci)
    for (var n of ci(e))
      g0.call(e, n) && Ui(t, n, e[n]);
  return t;
}, f0 = (t, e) => m0(t, R0(e));
let Al;
const Qn = Pt(null);
function Fi(t) {
  return t.split("-").map((e, n, l) => l.slice(0, n + 1).join("-")).reverse();
}
function Rn(t, e = St().fallbackLocale) {
  const n = Fi(t);
  return e ? [.../* @__PURE__ */ new Set([...n, ...Fi(e)])] : n;
}
function mt() {
  return Al ?? void 0;
}
Qn.subscribe((t) => {
  Al = t ?? void 0, typeof window < "u" && t != null && document.documentElement.setAttribute("lang", t);
});
const p0 = (t) => {
  if (t && U0(t) && ul(t)) {
    const { loadingDelay: e } = St();
    let n;
    return typeof window < "u" && mt() != null && e ? n = window.setTimeout(
      () => On.set(!0),
      e
    ) : On.set(!0), _a(t).then(() => {
      Qn.set(t);
    }).finally(() => {
      clearTimeout(n), On.set(!1);
    });
  }
  return Qn.set(t);
}, $t = f0(W0({}, Qn), {
  set: p0
}), bn = (t) => {
  const e = /* @__PURE__ */ Object.create(null);
  return (l) => {
    const i = JSON.stringify(l);
    return i in e ? e[i] : e[i] = t(l);
  };
};
var I0 = Object.defineProperty, Bn = Object.getOwnPropertySymbols, wa = Object.prototype.hasOwnProperty, va = Object.prototype.propertyIsEnumerable, hi = (t, e, n) => e in t ? I0(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Wl = (t, e) => {
  for (var n in e || (e = {}))
    wa.call(e, n) && hi(t, n, e[n]);
  if (Bn)
    for (var n of Bn(e))
      va.call(e, n) && hi(t, n, e[n]);
  return t;
}, wt = (t, e) => {
  var n = {};
  for (var l in t)
    wa.call(t, l) && e.indexOf(l) < 0 && (n[l] = t[l]);
  if (t != null && Bn)
    for (var l of Bn(t))
      e.indexOf(l) < 0 && va.call(t, l) && (n[l] = t[l]);
  return n;
};
const Ot = (t, e) => {
  const { formats: n } = St();
  if (t in n && e in n[t])
    return n[t][e];
  throw new Error(`[svelte-i18n] Unknown "${e}" ${t} format.`);
}, J0 = bn(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = wt(e, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
    return l && (i = Ot("number", l)), new Intl.NumberFormat(n, i);
  }
), C0 = bn(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = wt(e, ["locale", "format"]);
    if (n == null)
      throw new Error('[svelte-i18n] A "locale" must be set to format dates');
    return l ? i = Ot("date", l) : Object.keys(i).length === 0 && (i = Ot("date", "short")), new Intl.DateTimeFormat(n, i);
  }
), N0 = bn(
  (t) => {
    var e = t, { locale: n, format: l } = e, i = wt(e, ["locale", "format"]);
    if (n == null)
      throw new Error(
        '[svelte-i18n] A "locale" must be set to format time values'
      );
    return l ? i = Ot("time", l) : Object.keys(i).length === 0 && (i = Ot("time", "short")), new Intl.DateTimeFormat(n, i);
  }
), E0 = (t = {}) => {
  var e = t, {
    locale: n = mt()
  } = e, l = wt(e, [
    "locale"
  ]);
  return J0(Wl({ locale: n }, l));
}, y0 = (t = {}) => {
  var e = t, {
    locale: n = mt()
  } = e, l = wt(e, [
    "locale"
  ]);
  return C0(Wl({ locale: n }, l));
}, G0 = (t = {}) => {
  var e = t, {
    locale: n = mt()
  } = e, l = wt(e, [
    "locale"
  ]);
  return N0(Wl({ locale: n }, l));
}, S0 = bn(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (t, e = mt()) => new s0(t, e, St().formats, {
    ignoreTag: St().ignoreTag
  })
), X0 = (t, e = {}) => {
  var n, l, i, s;
  let a = e;
  typeof t == "object" && (a = t, t = a.id);
  const {
    values: o,
    locale: d = mt(),
    default: r
  } = a;
  if (d == null)
    throw new Error(
      "[svelte-i18n] Cannot format a message without first setting the initial locale."
    );
  let c = ka(t, d);
  if (!c)
    c = (s = (i = (l = (n = St()).handleMissingMessage) == null ? void 0 : l.call(n, { locale: d, id: t, defaultValue: r })) != null ? i : r) != null ? s : t;
  else if (typeof c != "string")
    return console.warn(
      `[svelte-i18n] Message with id "${t}" must be of type "string", found: "${typeof c}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`
    ), c;
  if (!o)
    return c;
  let U = c;
  try {
    U = S0(c, d).format(o);
  } catch (F) {
    F instanceof Error && console.warn(
      `[svelte-i18n] Message "${t}" has syntax error:`,
      F.message
    );
  }
  return U;
}, k0 = (t, e) => G0(e).format(t), Y0 = (t, e) => y0(e).format(t), T0 = (t, e) => E0(e).format(t), _0 = (t, e = mt()) => ka(t, e);
_t([$t, qt], () => X0);
_t([$t], () => k0);
_t([$t], () => Y0);
_t([$t], () => T0);
_t([$t, qt], () => _0);
const {
  SvelteComponent: w0,
  append: Qi,
  attr: Le,
  binding_callbacks: v0,
  bubble: ct,
  create_slot: H0,
  detach: x0,
  element: Bi,
  get_all_dirty_from_scope: D0,
  get_slot_changes: M0,
  init: z0,
  insert: j0,
  listen: ye,
  prevent_default: Ut,
  run_all: K0,
  safe_not_equal: O0,
  set_style: ui,
  space: L0,
  stop_propagation: Ft,
  toggle_class: it,
  transition_in: P0,
  transition_out: q0,
  update_slot_base: $0
} = window.__gradio__svelte__internal, { createEventDispatcher: ec, tick: tc, getContext: nc } = window.__gradio__svelte__internal;
function lc(t) {
  let e, n, l, i, s, a, o, d, r;
  const c = (
    /*#slots*/
    t[17].default
  ), U = H0(
    c,
    t,
    /*$$scope*/
    t[16],
    null
  );
  return {
    c() {
      e = Bi("button"), U && U.c(), n = L0(), l = Bi("input"), Le(l, "type", "file"), Le(
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
      j0(F, e, h), U && U.m(e, null), Qi(e, n), Qi(e, l), t[25](l), o = !0, d || (r = [
        ye(
          l,
          "change",
          /*load_files_from_upload*/
          t[10]
        ),
        ye(e, "drag", Ft(Ut(
          /*drag_handler*/
          t[18]
        ))),
        ye(e, "dragstart", Ft(Ut(
          /*dragstart_handler*/
          t[19]
        ))),
        ye(e, "dragend", Ft(Ut(
          /*dragend_handler*/
          t[20]
        ))),
        ye(e, "dragover", Ft(Ut(
          /*dragover_handler*/
          t[21]
        ))),
        ye(e, "dragenter", Ft(Ut(
          /*dragenter_handler*/
          t[22]
        ))),
        ye(e, "dragleave", Ft(Ut(
          /*dragleave_handler*/
          t[23]
        ))),
        ye(e, "drop", Ft(Ut(
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
      U && U.p && (!o || h & /*$$scope*/
      65536) && $0(
        U,
        c,
        F,
        /*$$scope*/
        F[16],
        o ? M0(
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
      ), (!o || h & /*filetype*/
      1) && Le(
        l,
        "accept",
        /*filetype*/
        F[0]
      ), (!o || h & /*file_count*/
      16 && i !== (i = /*file_count*/
      F[4] === "multiple" || void 0)) && (l.multiple = i), (!o || h & /*file_count*/
      16 && s !== (s = /*file_count*/
      F[4] === "directory" || void 0)) && Le(l, "webkitdirectory", s), (!o || h & /*file_count*/
      16 && a !== (a = /*file_count*/
      F[4] === "directory" || void 0)) && Le(l, "mozdirectory", a), (!o || h & /*hidden*/
      32) && it(
        e,
        "hidden",
        /*hidden*/
        F[5]
      ), (!o || h & /*center*/
      4) && it(
        e,
        "center",
        /*center*/
        F[2]
      ), (!o || h & /*boundedheight*/
      2) && it(
        e,
        "boundedheight",
        /*boundedheight*/
        F[1]
      ), (!o || h & /*flex*/
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
      o || (P0(U, F), o = !0);
    },
    o(F) {
      q0(U, F), o = !1;
    },
    d(F) {
      F && x0(e), U && U.d(F), t[25](null), d = !1, K0(r);
    }
  };
}
function Ln(t) {
  let e, n = t[0], l = 1;
  for (; l < t.length; ) {
    const i = t[l], s = t[l + 1];
    if (l += 2, (i === "optionalAccess" || i === "optionalCall") && n == null)
      return;
    i === "access" || i === "optionalAccess" ? (e = n, n = s(n)) : (i === "call" || i === "optionalCall") && (n = s((...a) => n.call(e, ...a)), e = void 0);
  }
  return n;
}
function ic(t, e) {
  return !t || t === "*" ? !0 : t.endsWith("/*") ? e.startsWith(t.slice(0, -1)) : t === e;
}
function ac(t, e, n) {
  let { $$slots: l = {}, $$scope: i } = e, { filetype: s = null } = e, { dragging: a = !1 } = e, { boundedheight: o = !0 } = e, { center: d = !0 } = e, { flex: r = !0 } = e, { file_count: c = "single" } = e, { disable_click: U = !1 } = e, { root: F } = e, { hidden: h = !1 } = e, { include_sources: Q = !1 } = e;
  const R = nc("upload_files");
  let V;
  const p = ec();
  function b() {
    n(12, a = !a);
  }
  function m() {
    U || (n(8, V.value = "", V), V.click());
  }
  async function A(B) {
    await tc();
    const g = await os(B, F, R);
    return p("load", c === "single" ? Ln([g, "optionalAccess", (Y) => Y[0]]) : g), g || [];
  }
  async function I(B) {
    if (!B.length)
      return;
    let g = B.map((y) => new File([y], y.name)), Y = await ds(g);
    return await A(Y);
  }
  async function x(B) {
    const g = B.target;
    g.files && await I(Array.from(g.files));
  }
  async function v(B) {
    if (n(12, a = !1), !Ln([B, "access", (Y) => Y.dataTransfer, "optionalAccess", (Y) => Y.files]))
      return;
    const g = Array.from(B.dataTransfer.files).filter((Y) => Ln([
      s,
      "optionalAccess",
      (y) => y.split,
      "call",
      (y) => y(","),
      "access",
      (y) => y.some,
      "call",
      (y) => y((K) => ic(K, Y.type))
    ]) ? !0 : (p("error", `Invalid file type only ${s} allowed.`), !1));
    await I(g);
  }
  function X(B) {
    ct.call(this, t, B);
  }
  function N(B) {
    ct.call(this, t, B);
  }
  function J(B) {
    ct.call(this, t, B);
  }
  function G(B) {
    ct.call(this, t, B);
  }
  function Be(B) {
    ct.call(this, t, B);
  }
  function le(B) {
    ct.call(this, t, B);
  }
  function k(B) {
    ct.call(this, t, B);
  }
  function H(B) {
    v0[B ? "unshift" : "push"](() => {
      V = B, n(8, V);
    });
  }
  return t.$$set = (B) => {
    "filetype" in B && n(0, s = B.filetype), "dragging" in B && n(12, a = B.dragging), "boundedheight" in B && n(1, o = B.boundedheight), "center" in B && n(2, d = B.center), "flex" in B && n(3, r = B.flex), "file_count" in B && n(4, c = B.file_count), "disable_click" in B && n(13, U = B.disable_click), "root" in B && n(14, F = B.root), "hidden" in B && n(5, h = B.hidden), "include_sources" in B && n(6, Q = B.include_sources), "$$scope" in B && n(16, i = B.$$scope);
  }, [
    s,
    o,
    d,
    r,
    c,
    h,
    Q,
    m,
    V,
    b,
    x,
    v,
    a,
    U,
    F,
    I,
    i,
    l,
    X,
    N,
    J,
    G,
    Be,
    le,
    k,
    H
  ];
}
class sc extends w0 {
  constructor(e) {
    super(), z0(this, e, ac, lc, O0, {
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
  SvelteComponent: rc,
  append: Ai,
  attr: oc,
  check_outros: Vi,
  create_component: fl,
  destroy_component: pl,
  detach: dc,
  element: cc,
  group_outros: Zi,
  init: Uc,
  insert: Fc,
  mount_component: Il,
  safe_not_equal: hc,
  set_style: mi,
  space: Ri,
  toggle_class: bi,
  transition_in: Pe,
  transition_out: Qt
} = window.__gradio__svelte__internal, { createEventDispatcher: Qc } = window.__gradio__svelte__internal;
function gi(t) {
  let e, n;
  return e = new Vn({
    props: {
      Icon: zr,
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
      Il(e, l, i), n = !0;
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
      Qt(e.$$.fragment, l), n = !1;
    },
    d(l) {
      pl(e, l);
    }
  };
}
function Wi(t) {
  let e, n;
  return e = new Vn({
    props: {
      Icon: ao,
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
      Il(e, l, i), n = !0;
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
      Qt(e.$$.fragment, l), n = !1;
    },
    d(l) {
      pl(e, l);
    }
  };
}
function Bc(t) {
  let e, n, l, i, s, a = (
    /*editable*/
    t[0] && gi(t)
  ), o = (
    /*undoable*/
    t[1] && Wi(t)
  );
  return i = new Vn({
    props: {
      Icon: Nr,
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
      e = cc("div"), a && a.c(), n = Ri(), o && o.c(), l = Ri(), fl(i.$$.fragment), oc(e, "class", "svelte-1wj0ocy"), bi(e, "not-absolute", !/*absolute*/
      t[2]), mi(
        e,
        "position",
        /*absolute*/
        t[2] ? "absolute" : "static"
      );
    },
    m(d, r) {
      Fc(d, e, r), a && a.m(e, null), Ai(e, n), o && o.m(e, null), Ai(e, l), Il(i, e, null), s = !0;
    },
    p(d, [r]) {
      /*editable*/
      d[0] ? a ? (a.p(d, r), r & /*editable*/
      1 && Pe(a, 1)) : (a = gi(d), a.c(), Pe(a, 1), a.m(e, n)) : a && (Zi(), Qt(a, 1, 1, () => {
        a = null;
      }), Vi()), /*undoable*/
      d[1] ? o ? (o.p(d, r), r & /*undoable*/
      2 && Pe(o, 1)) : (o = Wi(d), o.c(), Pe(o, 1), o.m(e, l)) : o && (Zi(), Qt(o, 1, 1, () => {
        o = null;
      }), Vi());
      const c = {};
      r & /*i18n*/
      8 && (c.label = /*i18n*/
      d[3]("common.clear")), i.$set(c), (!s || r & /*absolute*/
      4) && bi(e, "not-absolute", !/*absolute*/
      d[2]), r & /*absolute*/
      4 && mi(
        e,
        "position",
        /*absolute*/
        d[2] ? "absolute" : "static"
      );
    },
    i(d) {
      s || (Pe(a), Pe(o), Pe(i.$$.fragment, d), s = !0);
    },
    o(d) {
      Qt(a), Qt(o), Qt(i.$$.fragment, d), s = !1;
    },
    d(d) {
      d && dc(e), a && a.d(), o && o.d(), pl(i);
    }
  };
}
function uc(t, e, n) {
  let { editable: l = !1 } = e, { undoable: i = !1 } = e, { absolute: s = !0 } = e, { i18n: a } = e;
  const o = Qc(), d = () => o("edit"), r = () => o("undo"), c = (U) => {
    o("clear"), U.stopPropagation();
  };
  return t.$$set = (U) => {
    "editable" in U && n(0, l = U.editable), "undoable" in U && n(1, i = U.undoable), "absolute" in U && n(2, s = U.absolute), "i18n" in U && n(3, a = U.i18n);
  }, [
    l,
    i,
    s,
    a,
    o,
    d,
    r,
    c
  ];
}
class Ac extends rc {
  constructor(e) {
    super(), Uc(this, e, uc, Bc, hc, {
      editable: 0,
      undoable: 1,
      absolute: 2,
      i18n: 3
    });
  }
}
const {
  SvelteComponent: Vc,
  add_flush_callback: Zc,
  append: fi,
  attr: pi,
  bind: mc,
  binding_callbacks: Ha,
  check_outros: Rc,
  create_component: Jl,
  create_slot: bc,
  destroy_component: Cl,
  detach: Vl,
  element: Ii,
  empty: gc,
  get_all_dirty_from_scope: Wc,
  get_slot_changes: fc,
  group_outros: pc,
  init: Ic,
  insert: Zl,
  mount_component: Nl,
  safe_not_equal: Jc,
  space: xa,
  transition_in: Ct,
  transition_out: Nt,
  update_slot_base: Cc
} = window.__gradio__svelte__internal, { createEventDispatcher: Nc, tick: Ji, onMount: Ec } = window.__gradio__svelte__internal;
function yc(t) {
  let e, n, l, i, s;
  return n = new Ac({
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
      e = Ii("div"), Jl(n.$$.fragment), l = xa(), i = Ii("canvas"), pi(i, "class", "svelte-pxj656"), pi(e, "class", "input-model svelte-pxj656");
    },
    m(a, o) {
      Zl(a, e, o), Nl(n, e, null), fi(e, l), fi(e, i), t[15](i), s = !0;
    },
    p(a, o) {
      const d = {};
      o & /*i18n*/
      16 && (d.i18n = /*i18n*/
      a[4]), n.$set(d);
    },
    i(a) {
      s || (Ct(n.$$.fragment, a), s = !0);
    },
    o(a) {
      Nt(n.$$.fragment, a), s = !1;
    },
    d(a) {
      a && Vl(e), Cl(n), t[15](null);
    }
  };
}
function Gc(t) {
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
    $$slots: { default: [Sc] },
    $$scope: { ctx: t }
  };
  return (
    /*dragging*/
    t[6] !== void 0 && (s.dragging = /*dragging*/
    t[6]), e = new sc({ props: s }), Ha.push(() => mc(e, "dragging", i)), e.$on(
      "load",
      /*handle_upload*/
      t[7]
    ), {
      c() {
        Jl(e.$$.fragment);
      },
      m(a, o) {
        Nl(e, a, o), l = !0;
      },
      p(a, o) {
        const d = {};
        o & /*root*/
        8 && (d.root = /*root*/
        a[3]), o & /*$$scope*/
        65536 && (d.$$scope = { dirty: o, ctx: a }), !n && o & /*dragging*/
        64 && (n = !0, d.dragging = /*dragging*/
        a[6], Zc(() => n = !1)), e.$set(d);
      },
      i(a) {
        l || (Ct(e.$$.fragment, a), l = !0);
      },
      o(a) {
        Nt(e.$$.fragment, a), l = !1;
      },
      d(a) {
        Cl(e, a);
      }
    }
  );
}
function Sc(t) {
  let e;
  const n = (
    /*#slots*/
    t[13].default
  ), l = bc(
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
      65536) && Cc(
        l,
        n,
        i,
        /*$$scope*/
        i[16],
        e ? fc(
          n,
          /*$$scope*/
          i[16],
          s,
          null
        ) : Wc(
          /*$$scope*/
          i[16]
        ),
        null
      );
    },
    i(i) {
      e || (Ct(l, i), e = !0);
    },
    o(i) {
      Nt(l, i), e = !1;
    },
    d(i) {
      l && l.d(i);
    }
  };
}
function Xc(t) {
  let e, n, l, i, s, a;
  e = new An({
    props: {
      show_label: (
        /*show_label*/
        t[2]
      ),
      Icon: Lt,
      label: (
        /*label*/
        t[1] || "Splat"
      )
    }
  });
  const o = [Gc, yc], d = [];
  function r(c, U) {
    return (
      /*value*/
      c[0] === null ? 0 : 1
    );
  }
  return l = r(t), i = d[l] = o[l](t), {
    c() {
      Jl(e.$$.fragment), n = xa(), i.c(), s = gc();
    },
    m(c, U) {
      Nl(e, c, U), Zl(c, n, U), d[l].m(c, U), Zl(c, s, U), a = !0;
    },
    p(c, [U]) {
      const F = {};
      U & /*show_label*/
      4 && (F.show_label = /*show_label*/
      c[2]), U & /*label*/
      2 && (F.label = /*label*/
      c[1] || "Splat"), e.$set(F);
      let h = l;
      l = r(c), l === h ? d[l].p(c, U) : (pc(), Nt(d[h], 1, 1, () => {
        d[h] = null;
      }), Rc(), i = d[l], i ? i.p(c, U) : (i = d[l] = o[l](c), i.c()), Ct(i, 1), i.m(s.parentNode, s));
    },
    i(c) {
      a || (Ct(e.$$.fragment, c), Ct(i), a = !0);
    },
    o(c) {
      Nt(e.$$.fragment, c), Nt(i), a = !1;
    },
    d(c) {
      c && (Vl(n), Vl(s)), Cl(e, c), d[l].d(c);
    }
  };
}
function kc(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { value: a } = e, { label: o = "" } = e, { show_label: d } = e, { root: r } = e, { i18n: c } = e, { zoom_speed: U = 1 } = e, { pan_speed: F = 1 } = e, h = !1, Q, R, V, p = null, b, m = null;
  function A() {
    if (m !== null && (cancelAnimationFrame(m), m = null), p !== null && (p.dispose(), p = null), R = new ia(), V = new la(), p = new ca(Q), b = new Ua(V, Q), b.zoomSpeed = U, b.panSpeed = F, !a)
      return;
    let G = !1;
    const Be = async () => {
      if (G) {
        console.error("Already loading");
        return;
      }
      if (G = !0, a.url.endsWith(".ply"))
        await sa.LoadAsync(a.url, R, (k) => {
        });
      else if (a.url.endsWith(".splat"))
        await aa.LoadAsync(a.url, R, (k) => {
        });
      else
        throw new Error("Unsupported file type");
      G = !1;
    }, le = () => {
      if (p) {
        if (G) {
          m = requestAnimationFrame(le);
          return;
        }
        b.update(), p.render(R, V), m = requestAnimationFrame(le);
      }
    };
    Be(), m = requestAnimationFrame(le);
  }
  Ec(() => {
    a != null && A(), n(11, h = !0);
  });
  async function I({ detail: G }) {
    n(0, a = G), await Ji(), A(), v("change", a), v("load", a);
  }
  async function x() {
    n(0, a = null), p && (p.dispose(), p = null), await Ji(), v("clear"), v("change");
  }
  const v = Nc();
  let X = !1;
  function N(G) {
    X = G, n(6, X);
  }
  function J(G) {
    Ha[G ? "unshift" : "push"](() => {
      Q = G, n(5, Q);
    });
  }
  return t.$$set = (G) => {
    "value" in G && n(0, a = G.value), "label" in G && n(1, o = G.label), "show_label" in G && n(2, d = G.show_label), "root" in G && n(3, r = G.root), "i18n" in G && n(4, c = G.i18n), "zoom_speed" in G && n(9, U = G.zoom_speed), "pan_speed" in G && n(10, F = G.pan_speed), "$$scope" in G && n(16, s = G.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty & /*value*/
    1 && n(12, { path: l } = a || { path: void 0 }, l), t.$$.dirty & /*canvas, mounted, path*/
    6176 && Q && h && l != null && A(), t.$$.dirty & /*dragging*/
    64 && v("drag", X);
  }, [
    a,
    o,
    d,
    r,
    c,
    Q,
    X,
    I,
    x,
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
class Yc extends Vc {
  constructor(e) {
    super(), Ic(this, e, kc, Xc, Jc, {
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
function pt(t) {
  let e = ["", "k", "M", "G", "T", "P", "E", "Z"], n = 0;
  for (; t > 1e3 && n < e.length - 1; )
    t /= 1e3, n++;
  let l = e[n];
  return (Number.isInteger(t) ? t : t.toFixed(1)) + l;
}
const {
  SvelteComponent: Tc,
  append: ve,
  attr: q,
  component_subscribe: Ci,
  detach: _c,
  element: wc,
  init: vc,
  insert: Hc,
  noop: Ni,
  safe_not_equal: xc,
  set_style: rn,
  svg_element: He,
  toggle_class: Ei
} = window.__gradio__svelte__internal, { onMount: Dc } = window.__gradio__svelte__internal;
function Mc(t) {
  let e, n, l, i, s, a, o, d, r, c, U, F;
  return {
    c() {
      e = wc("div"), n = He("svg"), l = He("g"), i = He("path"), s = He("path"), a = He("path"), o = He("path"), d = He("g"), r = He("path"), c = He("path"), U = He("path"), F = He("path"), q(i, "d", "M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z"), q(i, "fill", "#FF7C00"), q(i, "fill-opacity", "0.4"), q(i, "class", "svelte-43sxxs"), q(s, "d", "M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z"), q(s, "fill", "#FF7C00"), q(s, "class", "svelte-43sxxs"), q(a, "d", "M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z"), q(a, "fill", "#FF7C00"), q(a, "fill-opacity", "0.4"), q(a, "class", "svelte-43sxxs"), q(o, "d", "M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z"), q(o, "fill", "#FF7C00"), q(o, "class", "svelte-43sxxs"), rn(l, "transform", "translate(" + /*$top*/
      t[1][0] + "px, " + /*$top*/
      t[1][1] + "px)"), q(r, "d", "M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z"), q(r, "fill", "#FF7C00"), q(r, "fill-opacity", "0.4"), q(r, "class", "svelte-43sxxs"), q(c, "d", "M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z"), q(c, "fill", "#FF7C00"), q(c, "class", "svelte-43sxxs"), q(U, "d", "M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z"), q(U, "fill", "#FF7C00"), q(U, "fill-opacity", "0.4"), q(U, "class", "svelte-43sxxs"), q(F, "d", "M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z"), q(F, "fill", "#FF7C00"), q(F, "class", "svelte-43sxxs"), rn(d, "transform", "translate(" + /*$bottom*/
      t[2][0] + "px, " + /*$bottom*/
      t[2][1] + "px)"), q(n, "viewBox", "-1200 -1200 3000 3000"), q(n, "fill", "none"), q(n, "xmlns", "http://www.w3.org/2000/svg"), q(n, "class", "svelte-43sxxs"), q(e, "class", "svelte-43sxxs"), Ei(
        e,
        "margin",
        /*margin*/
        t[0]
      );
    },
    m(h, Q) {
      Hc(h, e, Q), ve(e, n), ve(n, l), ve(l, i), ve(l, s), ve(l, a), ve(l, o), ve(n, d), ve(d, r), ve(d, c), ve(d, U), ve(d, F);
    },
    p(h, [Q]) {
      Q & /*$top*/
      2 && rn(l, "transform", "translate(" + /*$top*/
      h[1][0] + "px, " + /*$top*/
      h[1][1] + "px)"), Q & /*$bottom*/
      4 && rn(d, "transform", "translate(" + /*$bottom*/
      h[2][0] + "px, " + /*$bottom*/
      h[2][1] + "px)"), Q & /*margin*/
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
      h && _c(e);
    }
  };
}
function zc(t, e, n) {
  let l, i, { margin: s = !0 } = e;
  const a = ei([0, 0]);
  Ci(t, a, (F) => n(1, l = F));
  const o = ei([0, 0]);
  Ci(t, o, (F) => n(2, i = F));
  let d;
  async function r() {
    await Promise.all([a.set([125, 140]), o.set([-125, -140])]), await Promise.all([a.set([-125, 140]), o.set([125, -140])]), await Promise.all([a.set([-125, 0]), o.set([125, -0])]), await Promise.all([a.set([125, 0]), o.set([-125, 0])]);
  }
  async function c() {
    await r(), d || c();
  }
  async function U() {
    await Promise.all([a.set([125, 0]), o.set([-125, 0])]), c();
  }
  return Dc(() => (U(), () => d = !0)), t.$$set = (F) => {
    "margin" in F && n(0, s = F.margin);
  }, [s, l, i, a, o];
}
class jc extends Tc {
  constructor(e) {
    super(), vc(this, e, zc, Mc, xc, { margin: 0 });
  }
}
const {
  SvelteComponent: Kc,
  append: Vt,
  attr: Ke,
  binding_callbacks: yi,
  check_outros: Da,
  create_component: Oc,
  create_slot: Lc,
  destroy_component: Pc,
  destroy_each: Ma,
  detach: M,
  element: qe,
  empty: vt,
  ensure_array_like: un,
  get_all_dirty_from_scope: qc,
  get_slot_changes: $c,
  group_outros: za,
  init: eU,
  insert: z,
  mount_component: tU,
  noop: ml,
  safe_not_equal: nU,
  set_data: ke,
  set_style: rt,
  space: Oe,
  text: se,
  toggle_class: Ge,
  transition_in: Xt,
  transition_out: kt,
  update_slot_base: lU
} = window.__gradio__svelte__internal, { tick: iU } = window.__gradio__svelte__internal, { onDestroy: aU } = window.__gradio__svelte__internal, sU = (t) => ({}), Gi = (t) => ({});
function Si(t, e, n) {
  const l = t.slice();
  return l[38] = e[n], l[40] = n, l;
}
function Xi(t, e, n) {
  const l = t.slice();
  return l[38] = e[n], l;
}
function rU(t) {
  let e, n = (
    /*i18n*/
    t[1]("common.error") + ""
  ), l, i, s;
  const a = (
    /*#slots*/
    t[29].error
  ), o = Lc(
    a,
    t,
    /*$$scope*/
    t[28],
    Gi
  );
  return {
    c() {
      e = qe("span"), l = se(n), i = Oe(), o && o.c(), Ke(e, "class", "error svelte-14miwb5");
    },
    m(d, r) {
      z(d, e, r), Vt(e, l), z(d, i, r), o && o.m(d, r), s = !0;
    },
    p(d, r) {
      (!s || r[0] & /*i18n*/
      2) && n !== (n = /*i18n*/
      d[1]("common.error") + "") && ke(l, n), o && o.p && (!s || r[0] & /*$$scope*/
      268435456) && lU(
        o,
        a,
        d,
        /*$$scope*/
        d[28],
        s ? $c(
          a,
          /*$$scope*/
          d[28],
          r,
          sU
        ) : qc(
          /*$$scope*/
          d[28]
        ),
        Gi
      );
    },
    i(d) {
      s || (Xt(o, d), s = !0);
    },
    o(d) {
      kt(o, d), s = !1;
    },
    d(d) {
      d && (M(e), M(i)), o && o.d(d);
    }
  };
}
function oU(t) {
  let e, n, l, i, s, a, o, d, r, c = (
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
      return UU;
    if (
      /*queue_position*/
      m[2] !== null && /*queue_size*/
      m[3] !== void 0 && /*queue_position*/
      m[2] >= 0
    )
      return cU;
    if (
      /*queue_position*/
      m[2] === 0
    )
      return dU;
  }
  let F = U(t), h = F && F(t), Q = (
    /*timer*/
    t[5] && _i(t)
  );
  const R = [BU, QU], V = [];
  function p(m, A) {
    return (
      /*last_progress_level*/
      m[15] != null ? 0 : (
        /*show_progress*/
        m[6] === "full" ? 1 : -1
      )
    );
  }
  ~(s = p(t)) && (a = V[s] = R[s](t));
  let b = !/*timer*/
  t[5] && zi(t);
  return {
    c() {
      c && c.c(), e = Oe(), n = qe("div"), h && h.c(), l = Oe(), Q && Q.c(), i = Oe(), a && a.c(), o = Oe(), b && b.c(), d = vt(), Ke(n, "class", "progress-text svelte-14miwb5"), Ge(
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
      c && c.m(m, A), z(m, e, A), z(m, n, A), h && h.m(n, null), Vt(n, l), Q && Q.m(n, null), z(m, i, A), ~s && V[s].m(m, A), z(m, o, A), b && b.m(m, A), z(m, d, A), r = !0;
    },
    p(m, A) {
      /*variant*/
      m[8] === "default" && /*show_eta_bar*/
      m[18] && /*show_progress*/
      m[6] === "full" ? c ? c.p(m, A) : (c = ki(m), c.c(), c.m(e.parentNode, e)) : c && (c.d(1), c = null), F === (F = U(m)) && h ? h.p(m, A) : (h && h.d(1), h = F && F(m), h && (h.c(), h.m(n, l))), /*timer*/
      m[5] ? Q ? Q.p(m, A) : (Q = _i(m), Q.c(), Q.m(n, null)) : Q && (Q.d(1), Q = null), (!r || A[0] & /*variant*/
      256) && Ge(
        n,
        "meta-text-center",
        /*variant*/
        m[8] === "center"
      ), (!r || A[0] & /*variant*/
      256) && Ge(
        n,
        "meta-text",
        /*variant*/
        m[8] === "default"
      );
      let I = s;
      s = p(m), s === I ? ~s && V[s].p(m, A) : (a && (za(), kt(V[I], 1, 1, () => {
        V[I] = null;
      }), Da()), ~s ? (a = V[s], a ? a.p(m, A) : (a = V[s] = R[s](m), a.c()), Xt(a, 1), a.m(o.parentNode, o)) : a = null), /*timer*/
      m[5] ? b && (b.d(1), b = null) : b ? b.p(m, A) : (b = zi(m), b.c(), b.m(d.parentNode, d));
    },
    i(m) {
      r || (Xt(a), r = !0);
    },
    o(m) {
      kt(a), r = !1;
    },
    d(m) {
      m && (M(e), M(n), M(i), M(o), M(d)), c && c.d(m), h && h.d(), Q && Q.d(), ~s && V[s].d(m), b && b.d(m);
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
      z(l, e, i);
    },
    p(l, i) {
      i[0] & /*eta_level*/
      131072 && n !== (n = `translateX(${/*eta_level*/
      (l[17] || 0) * 100 - 100}%)`) && rt(e, "transform", n);
    },
    d(l) {
      l && M(e);
    }
  };
}
function dU(t) {
  let e;
  return {
    c() {
      e = se("processing |");
    },
    m(n, l) {
      z(n, e, l);
    },
    p: ml,
    d(n) {
      n && M(e);
    }
  };
}
function cU(t) {
  let e, n = (
    /*queue_position*/
    t[2] + 1 + ""
  ), l, i, s, a;
  return {
    c() {
      e = se("queue: "), l = se(n), i = se("/"), s = se(
        /*queue_size*/
        t[3]
      ), a = se(" |");
    },
    m(o, d) {
      z(o, e, d), z(o, l, d), z(o, i, d), z(o, s, d), z(o, a, d);
    },
    p(o, d) {
      d[0] & /*queue_position*/
      4 && n !== (n = /*queue_position*/
      o[2] + 1 + "") && ke(l, n), d[0] & /*queue_size*/
      8 && ke(
        s,
        /*queue_size*/
        o[3]
      );
    },
    d(o) {
      o && (M(e), M(l), M(i), M(s), M(a));
    }
  };
}
function UU(t) {
  let e, n = un(
    /*progress*/
    t[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = Ti(Xi(t, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      e = vt();
    },
    m(i, s) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, s);
      z(i, e, s);
    },
    p(i, s) {
      if (s[0] & /*progress*/
      128) {
        n = un(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const o = Xi(i, n, a);
          l[a] ? l[a].p(o, s) : (l[a] = Ti(o), l[a].c(), l[a].m(e.parentNode, e));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && M(e), Ma(l, i);
    }
  };
}
function Yi(t) {
  let e, n = (
    /*p*/
    t[38].unit + ""
  ), l, i, s = " ", a;
  function o(c, U) {
    return (
      /*p*/
      c[38].length != null ? hU : FU
    );
  }
  let d = o(t), r = d(t);
  return {
    c() {
      r.c(), e = Oe(), l = se(n), i = se(" | "), a = se(s);
    },
    m(c, U) {
      r.m(c, U), z(c, e, U), z(c, l, U), z(c, i, U), z(c, a, U);
    },
    p(c, U) {
      d === (d = o(c)) && r ? r.p(c, U) : (r.d(1), r = d(c), r && (r.c(), r.m(e.parentNode, e))), U[0] & /*progress*/
      128 && n !== (n = /*p*/
      c[38].unit + "") && ke(l, n);
    },
    d(c) {
      c && (M(e), M(l), M(i), M(a)), r.d(c);
    }
  };
}
function FU(t) {
  let e = pt(
    /*p*/
    t[38].index || 0
  ) + "", n;
  return {
    c() {
      n = se(e);
    },
    m(l, i) {
      z(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && e !== (e = pt(
        /*p*/
        l[38].index || 0
      ) + "") && ke(n, e);
    },
    d(l) {
      l && M(n);
    }
  };
}
function hU(t) {
  let e = pt(
    /*p*/
    t[38].index || 0
  ) + "", n, l, i = pt(
    /*p*/
    t[38].length
  ) + "", s;
  return {
    c() {
      n = se(e), l = se("/"), s = se(i);
    },
    m(a, o) {
      z(a, n, o), z(a, l, o), z(a, s, o);
    },
    p(a, o) {
      o[0] & /*progress*/
      128 && e !== (e = pt(
        /*p*/
        a[38].index || 0
      ) + "") && ke(n, e), o[0] & /*progress*/
      128 && i !== (i = pt(
        /*p*/
        a[38].length
      ) + "") && ke(s, i);
    },
    d(a) {
      a && (M(n), M(l), M(s));
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
      n && n.c(), e = vt();
    },
    m(l, i) {
      n && n.m(l, i), z(l, e, i);
    },
    p(l, i) {
      /*p*/
      l[38].index != null ? n ? n.p(l, i) : (n = Yi(l), n.c(), n.m(e.parentNode, e)) : n && (n.d(1), n = null);
    },
    d(l) {
      l && M(e), n && n.d(l);
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
      e = se(
        /*formatted_timer*/
        t[20]
      ), l = se(n), i = se("s");
    },
    m(s, a) {
      z(s, e, a), z(s, l, a), z(s, i, a);
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
      s && (M(e), M(l), M(i));
    }
  };
}
function QU(t) {
  let e, n;
  return e = new jc({
    props: { margin: (
      /*variant*/
      t[8] === "default"
    ) }
  }), {
    c() {
      Oc(e.$$.fragment);
    },
    m(l, i) {
      tU(e, l, i), n = !0;
    },
    p(l, i) {
      const s = {};
      i[0] & /*variant*/
      256 && (s.margin = /*variant*/
      l[8] === "default"), e.$set(s);
    },
    i(l) {
      n || (Xt(e.$$.fragment, l), n = !0);
    },
    o(l) {
      kt(e.$$.fragment, l), n = !1;
    },
    d(l) {
      Pc(e, l);
    }
  };
}
function BU(t) {
  let e, n, l, i, s, a = `${/*last_progress_level*/
  t[15] * 100}%`, o = (
    /*progress*/
    t[7] != null && wi(t)
  );
  return {
    c() {
      e = qe("div"), n = qe("div"), o && o.c(), l = Oe(), i = qe("div"), s = qe("div"), Ke(n, "class", "progress-level-inner svelte-14miwb5"), Ke(s, "class", "progress-bar svelte-14miwb5"), rt(s, "width", a), Ke(i, "class", "progress-bar-wrap svelte-14miwb5"), Ke(e, "class", "progress-level svelte-14miwb5");
    },
    m(d, r) {
      z(d, e, r), Vt(e, n), o && o.m(n, null), Vt(e, l), Vt(e, i), Vt(i, s), t[30](s);
    },
    p(d, r) {
      /*progress*/
      d[7] != null ? o ? o.p(d, r) : (o = wi(d), o.c(), o.m(n, null)) : o && (o.d(1), o = null), r[0] & /*last_progress_level*/
      32768 && a !== (a = `${/*last_progress_level*/
      d[15] * 100}%`) && rt(s, "width", a);
    },
    i: ml,
    o: ml,
    d(d) {
      d && M(e), o && o.d(), t[30](null);
    }
  };
}
function wi(t) {
  let e, n = un(
    /*progress*/
    t[7]
  ), l = [];
  for (let i = 0; i < n.length; i += 1)
    l[i] = Mi(Si(t, n, i));
  return {
    c() {
      for (let i = 0; i < l.length; i += 1)
        l[i].c();
      e = vt();
    },
    m(i, s) {
      for (let a = 0; a < l.length; a += 1)
        l[a] && l[a].m(i, s);
      z(i, e, s);
    },
    p(i, s) {
      if (s[0] & /*progress_level, progress*/
      16512) {
        n = un(
          /*progress*/
          i[7]
        );
        let a;
        for (a = 0; a < n.length; a += 1) {
          const o = Si(i, n, a);
          l[a] ? l[a].p(o, s) : (l[a] = Mi(o), l[a].c(), l[a].m(e.parentNode, e));
        }
        for (; a < l.length; a += 1)
          l[a].d(1);
        l.length = n.length;
      }
    },
    d(i) {
      i && M(e), Ma(l, i);
    }
  };
}
function vi(t) {
  let e, n, l, i, s = (
    /*i*/
    t[40] !== 0 && uU()
  ), a = (
    /*p*/
    t[38].desc != null && Hi(t)
  ), o = (
    /*p*/
    t[38].desc != null && /*progress_level*/
    t[14] && /*progress_level*/
    t[14][
      /*i*/
      t[40]
    ] != null && xi()
  ), d = (
    /*progress_level*/
    t[14] != null && Di(t)
  );
  return {
    c() {
      s && s.c(), e = Oe(), a && a.c(), n = Oe(), o && o.c(), l = Oe(), d && d.c(), i = vt();
    },
    m(r, c) {
      s && s.m(r, c), z(r, e, c), a && a.m(r, c), z(r, n, c), o && o.m(r, c), z(r, l, c), d && d.m(r, c), z(r, i, c);
    },
    p(r, c) {
      /*p*/
      r[38].desc != null ? a ? a.p(r, c) : (a = Hi(r), a.c(), a.m(n.parentNode, n)) : a && (a.d(1), a = null), /*p*/
      r[38].desc != null && /*progress_level*/
      r[14] && /*progress_level*/
      r[14][
        /*i*/
        r[40]
      ] != null ? o || (o = xi(), o.c(), o.m(l.parentNode, l)) : o && (o.d(1), o = null), /*progress_level*/
      r[14] != null ? d ? d.p(r, c) : (d = Di(r), d.c(), d.m(i.parentNode, i)) : d && (d.d(1), d = null);
    },
    d(r) {
      r && (M(e), M(n), M(l), M(i)), s && s.d(r), a && a.d(r), o && o.d(r), d && d.d(r);
    }
  };
}
function uU(t) {
  let e;
  return {
    c() {
      e = se(" /");
    },
    m(n, l) {
      z(n, e, l);
    },
    d(n) {
      n && M(e);
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
      n = se(e);
    },
    m(l, i) {
      z(l, n, i);
    },
    p(l, i) {
      i[0] & /*progress*/
      128 && e !== (e = /*p*/
      l[38].desc + "") && ke(n, e);
    },
    d(l) {
      l && M(n);
    }
  };
}
function xi(t) {
  let e;
  return {
    c() {
      e = se("-");
    },
    m(n, l) {
      z(n, e, l);
    },
    d(n) {
      n && M(e);
    }
  };
}
function Di(t) {
  let e = (100 * /*progress_level*/
  (t[14][
    /*i*/
    t[40]
  ] || 0)).toFixed(1) + "", n, l;
  return {
    c() {
      n = se(e), l = se("%");
    },
    m(i, s) {
      z(i, n, s), z(i, l, s);
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
      i && (M(n), M(l));
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
      n && n.c(), e = vt();
    },
    m(l, i) {
      n && n.m(l, i), z(l, e, i);
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
      l && M(e), n && n.d(l);
    }
  };
}
function zi(t) {
  let e, n;
  return {
    c() {
      e = qe("p"), n = se(
        /*loading_text*/
        t[9]
      ), Ke(e, "class", "loading svelte-14miwb5");
    },
    m(l, i) {
      z(l, e, i), Vt(e, n);
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
      l && M(e);
    }
  };
}
function AU(t) {
  let e, n, l, i, s;
  const a = [oU, rU], o = [];
  function d(r, c) {
    return (
      /*status*/
      r[4] === "pending" ? 0 : (
        /*status*/
        r[4] === "error" ? 1 : -1
      )
    );
  }
  return ~(n = d(t)) && (l = o[n] = a[n](t)), {
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
    m(r, c) {
      z(r, e, c), ~n && o[n].m(e, null), t[31](e), s = !0;
    },
    p(r, c) {
      let U = n;
      n = d(r), n === U ? ~n && o[n].p(r, c) : (l && (za(), kt(o[U], 1, 1, () => {
        o[U] = null;
      }), Da()), ~n ? (l = o[n], l ? l.p(r, c) : (l = o[n] = a[n](r), l.c()), Xt(l, 1), l.m(e, null)) : l = null), (!s || c[0] & /*variant, show_progress*/
      320 && i !== (i = "wrap " + /*variant*/
      r[8] + " " + /*show_progress*/
      r[6] + " svelte-14miwb5")) && Ke(e, "class", i), (!s || c[0] & /*variant, show_progress, status, show_progress*/
      336) && Ge(e, "hide", !/*status*/
      r[4] || /*status*/
      r[4] === "complete" || /*show_progress*/
      r[6] === "hidden"), (!s || c[0] & /*variant, show_progress, variant, status, translucent, show_progress*/
      2384) && Ge(
        e,
        "translucent",
        /*variant*/
        r[8] === "center" && /*status*/
        (r[4] === "pending" || /*status*/
        r[4] === "error") || /*translucent*/
        r[11] || /*show_progress*/
        r[6] === "minimal"
      ), (!s || c[0] & /*variant, show_progress, status*/
      336) && Ge(
        e,
        "generating",
        /*status*/
        r[4] === "generating"
      ), (!s || c[0] & /*variant, show_progress, border*/
      4416) && Ge(
        e,
        "border",
        /*border*/
        r[12]
      ), c[0] & /*absolute*/
      1024 && rt(
        e,
        "position",
        /*absolute*/
        r[10] ? "absolute" : "static"
      ), c[0] & /*absolute*/
      1024 && rt(
        e,
        "padding",
        /*absolute*/
        r[10] ? "0" : "var(--size-8) 0"
      );
    },
    i(r) {
      s || (Xt(l), s = !0);
    },
    o(r) {
      kt(l), s = !1;
    },
    d(r) {
      r && M(e), ~n && o[n].d(), t[31](null);
    }
  };
}
let on = [], Pn = !1;
async function VU(t, e = !0) {
  if (!(window.__gradio_mode__ === "website" || window.__gradio_mode__ !== "app" && e !== !0)) {
    if (on.push(t), !Pn)
      Pn = !0;
    else
      return;
    await iU(), requestAnimationFrame(() => {
      let n = [0, 0];
      for (let l = 0; l < on.length; l++) {
        const s = on[l].getBoundingClientRect();
        (l === 0 || s.top + window.scrollY <= n[0]) && (n[0] = s.top + window.scrollY, n[1] = l);
      }
      window.scrollTo({ top: n[0] - 20, behavior: "smooth" }), Pn = !1, on = [];
    });
  }
}
function ZU(t, e, n) {
  let l, { $$slots: i = {}, $$scope: s } = e, { i18n: a } = e, { eta: o = null } = e, { queue: d = !1 } = e, { queue_position: r } = e, { queue_size: c } = e, { status: U } = e, { scroll_to_output: F = !1 } = e, { timer: h = !0 } = e, { show_progress: Q = "full" } = e, { message: R = null } = e, { progress: V = null } = e, { variant: p = "default" } = e, { loading_text: b = "Loading..." } = e, { absolute: m = !0 } = e, { translucent: A = !1 } = e, { border: I = !1 } = e, { autoscroll: x } = e, v, X = !1, N = 0, J = 0, G = null, Be = 0, le = null, k, H = null, B = !0;
  const g = () => {
    n(25, N = performance.now()), n(26, J = 0), X = !0, Y();
  };
  function Y() {
    requestAnimationFrame(() => {
      n(26, J = (performance.now() - N) / 1e3), X && Y();
    });
  }
  function y() {
    n(26, J = 0), X && (X = !1);
  }
  aU(() => {
    X && y();
  });
  let K = null;
  function oe(C) {
    yi[C ? "unshift" : "push"](() => {
      H = C, n(16, H), n(7, V), n(14, le), n(15, k);
    });
  }
  function T(C) {
    yi[C ? "unshift" : "push"](() => {
      v = C, n(13, v);
    });
  }
  return t.$$set = (C) => {
    "i18n" in C && n(1, a = C.i18n), "eta" in C && n(0, o = C.eta), "queue" in C && n(21, d = C.queue), "queue_position" in C && n(2, r = C.queue_position), "queue_size" in C && n(3, c = C.queue_size), "status" in C && n(4, U = C.status), "scroll_to_output" in C && n(22, F = C.scroll_to_output), "timer" in C && n(5, h = C.timer), "show_progress" in C && n(6, Q = C.show_progress), "message" in C && n(23, R = C.message), "progress" in C && n(7, V = C.progress), "variant" in C && n(8, p = C.variant), "loading_text" in C && n(9, b = C.loading_text), "absolute" in C && n(10, m = C.absolute), "translucent" in C && n(11, A = C.translucent), "border" in C && n(12, I = C.border), "autoscroll" in C && n(24, x = C.autoscroll), "$$scope" in C && n(28, s = C.$$scope);
  }, t.$$.update = () => {
    t.$$.dirty[0] & /*eta, old_eta, queue, timer_start*/
    169869313 && (o === null ? n(0, o = G) : d && n(0, o = (performance.now() - N) / 1e3 + o), o != null && (n(19, K = o.toFixed(1)), n(27, G = o))), t.$$.dirty[0] & /*eta, timer_diff*/
    67108865 && n(17, Be = o === null || o <= 0 || !J ? null : Math.min(J / o, 1)), t.$$.dirty[0] & /*progress*/
    128 && V != null && n(18, B = !1), t.$$.dirty[0] & /*progress, progress_level, progress_bar, last_progress_level*/
    114816 && (V != null ? n(14, le = V.map((C) => {
      if (C.index != null && C.length != null)
        return C.index / C.length;
      if (C.progress != null)
        return C.progress;
    })) : n(14, le = null), le ? (n(15, k = le[le.length - 1]), H && (k === 0 ? n(16, H.style.transition = "0", H) : n(16, H.style.transition = "150ms", H))) : n(15, k = void 0)), t.$$.dirty[0] & /*status*/
    16 && (U === "pending" ? g() : y()), t.$$.dirty[0] & /*el, scroll_to_output, status, autoscroll*/
    20979728 && v && F && (U === "pending" || U === "complete") && VU(v, x), t.$$.dirty[0] & /*status, message*/
    8388624, t.$$.dirty[0] & /*timer_diff*/
    67108864 && n(20, l = J.toFixed(1));
  }, [
    o,
    a,
    r,
    c,
    U,
    h,
    Q,
    V,
    p,
    b,
    m,
    A,
    I,
    v,
    le,
    k,
    H,
    Be,
    B,
    K,
    l,
    d,
    F,
    R,
    x,
    N,
    J,
    G,
    s,
    i,
    oe,
    T
  ];
}
class ja extends Kc {
  constructor(e) {
    super(), eU(
      this,
      e,
      ZU,
      AU,
      nU,
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
  SvelteComponent: mU,
  append: RU,
  attr: bU,
  detach: gU,
  element: WU,
  init: fU,
  insert: pU,
  noop: ji,
  safe_not_equal: IU,
  set_data: JU,
  text: CU,
  toggle_class: ft
} = window.__gradio__svelte__internal;
function NU(t) {
  let e, n;
  return {
    c() {
      e = WU("div"), n = CU(
        /*value*/
        t[0]
      ), bU(e, "class", "svelte-1gecy8w"), ft(
        e,
        "table",
        /*type*/
        t[1] === "table"
      ), ft(
        e,
        "gallery",
        /*type*/
        t[1] === "gallery"
      ), ft(
        e,
        "selected",
        /*selected*/
        t[2]
      );
    },
    m(l, i) {
      pU(l, e, i), RU(e, n);
    },
    p(l, [i]) {
      i & /*value*/
      1 && JU(
        n,
        /*value*/
        l[0]
      ), i & /*type*/
      2 && ft(
        e,
        "table",
        /*type*/
        l[1] === "table"
      ), i & /*type*/
      2 && ft(
        e,
        "gallery",
        /*type*/
        l[1] === "gallery"
      ), i & /*selected*/
      4 && ft(
        e,
        "selected",
        /*selected*/
        l[2]
      );
    },
    i: ji,
    o: ji,
    d(l) {
      l && gU(e);
    }
  };
}
function EU(t, e, n) {
  let { value: l } = e, { type: i } = e, { selected: s = !1 } = e;
  return t.$$set = (a) => {
    "value" in a && n(0, l = a.value), "type" in a && n(1, i = a.type), "selected" in a && n(2, s = a.selected);
  }, [l, i, s];
}
class LU extends mU {
  constructor(e) {
    super(), fU(this, e, EU, NU, IU, { value: 0, type: 1, selected: 2 });
  }
}
const {
  SvelteComponent: yU,
  assign: Ka,
  check_outros: Oa,
  create_component: xe,
  destroy_component: De,
  detach: Yt,
  empty: La,
  get_spread_object: Pa,
  get_spread_update: qa,
  group_outros: $a,
  init: GU,
  insert: Tt,
  mount_component: Me,
  safe_not_equal: SU,
  space: gn,
  transition_in: be,
  transition_out: ge
} = window.__gradio__svelte__internal;
function XU(t) {
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
      $$slots: { default: [TU] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      xe(e.$$.fragment);
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
      n || (be(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ge(e.$$.fragment, l), n = !1;
    },
    d(l) {
      De(e, l);
    }
  };
}
function kU(t) {
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
      $$slots: { default: [HU] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      xe(e.$$.fragment);
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
      n || (be(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ge(e.$$.fragment, l), n = !1;
    },
    d(l) {
      De(e, l);
    }
  };
}
function YU(t) {
  let e, n;
  return e = new fo({
    props: {
      i18n: (
        /*gradio*/
        t[11].i18n
      ),
      type: "file"
    }
  }), {
    c() {
      xe(e.$$.fragment);
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
      n || (be(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ge(e.$$.fragment, l), n = !1;
    },
    d(l) {
      De(e, l);
    }
  };
}
function TU(t) {
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
    a = Ka(a, s[o]);
  return e = new ja({ props: a }), l = new Yc({
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
      $$slots: { default: [YU] },
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
      xe(e.$$.fragment), n = gn(), xe(l.$$.fragment);
    },
    m(o, d) {
      Me(e, o, d), Tt(o, n, d), Me(l, o, d), i = !0;
    },
    p(o, d) {
      const r = d & /*gradio, loading_status*/
      2080 ? qa(s, [
        d & /*gradio*/
        2048 && {
          autoscroll: (
            /*gradio*/
            o[11].autoscroll
          )
        },
        d & /*gradio*/
        2048 && { i18n: (
          /*gradio*/
          o[11].i18n
        ) },
        d & /*loading_status*/
        32 && Pa(
          /*loading_status*/
          o[5]
        )
      ]) : {};
      e.$set(r);
      const c = {};
      d & /*label*/
      64 && (c.label = /*label*/
      o[6]), d & /*show_label*/
      128 && (c.show_label = /*show_label*/
      o[7]), d & /*root*/
      16 && (c.root = /*root*/
      o[4]), d & /*_value*/
      65536 && (c.value = /*_value*/
      o[16]), d & /*zoom_speed*/
      8192 && (c.zoom_speed = /*zoom_speed*/
      o[13]), d & /*pan_speed*/
      16384 && (c.pan_speed = /*pan_speed*/
      o[14]), d & /*gradio*/
      2048 && (c.i18n = /*gradio*/
      o[11].i18n), d & /*$$scope, gradio*/
      8390656 && (c.$$scope = { dirty: d, ctx: o }), l.$set(c);
    },
    i(o) {
      i || (be(e.$$.fragment, o), be(l.$$.fragment, o), i = !0);
    },
    o(o) {
      ge(e.$$.fragment, o), ge(l.$$.fragment, o), i = !1;
    },
    d(o) {
      o && Yt(n), De(e, o), De(l, o);
    }
  };
}
function _U(t) {
  let e, n, l, i;
  return e = new An({
    props: {
      show_label: (
        /*show_label*/
        t[7]
      ),
      Icon: Lt,
      label: (
        /*label*/
        t[6] || "Splat"
      )
    }
  }), l = new gr({
    props: {
      unpadded_box: !0,
      size: "large",
      $$slots: { default: [vU] },
      $$scope: { ctx: t }
    }
  }), {
    c() {
      xe(e.$$.fragment), n = gn(), xe(l.$$.fragment);
    },
    m(s, a) {
      Me(e, s, a), Tt(s, n, a), Me(l, s, a), i = !0;
    },
    p(s, a) {
      const o = {};
      a & /*show_label*/
      128 && (o.show_label = /*show_label*/
      s[7]), a & /*label*/
      64 && (o.label = /*label*/
      s[6] || "Splat"), e.$set(o);
      const d = {};
      a & /*$$scope*/
      8388608 && (d.$$scope = { dirty: a, ctx: s }), l.$set(d);
    },
    i(s) {
      i || (be(e.$$.fragment, s), be(l.$$.fragment, s), i = !0);
    },
    o(s) {
      ge(e.$$.fragment, s), ge(l.$$.fragment, s), i = !1;
    },
    d(s) {
      s && Yt(n), De(e, s), De(l, s);
    }
  };
}
function wU(t) {
  let e, n, l, i;
  return e = new An({
    props: {
      show_label: (
        /*show_label*/
        t[7]
      ),
      Icon: Lt,
      label: (
        /*label*/
        t[6] || "Splat"
      )
    }
  }), l = new jo({
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
      xe(e.$$.fragment), n = gn(), xe(l.$$.fragment);
    },
    m(s, a) {
      Me(e, s, a), Tt(s, n, a), Me(l, s, a), i = !0;
    },
    p(s, a) {
      const o = {};
      a & /*show_label*/
      128 && (o.show_label = /*show_label*/
      s[7]), a & /*label*/
      64 && (o.label = /*label*/
      s[6] || "Splat"), e.$set(o);
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
      i || (be(e.$$.fragment, s), be(l.$$.fragment, s), i = !0);
    },
    o(s) {
      ge(e.$$.fragment, s), ge(l.$$.fragment, s), i = !1;
    },
    d(s) {
      s && Yt(n), De(e, s), De(l, s);
    }
  };
}
function vU(t) {
  let e, n;
  return e = new Lt({}), {
    c() {
      xe(e.$$.fragment);
    },
    m(l, i) {
      Me(e, l, i), n = !0;
    },
    i(l) {
      n || (be(e.$$.fragment, l), n = !0);
    },
    o(l) {
      ge(e.$$.fragment, l), n = !1;
    },
    d(l) {
      De(e, l);
    }
  };
}
function HU(t) {
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
  let d = {};
  for (let F = 0; F < o.length; F += 1)
    d = Ka(d, o[F]);
  e = new ja({ props: d });
  const r = [wU, _U], c = [];
  function U(F, h) {
    return (
      /*value*/
      F[0] ? 0 : 1
    );
  }
  return l = U(t), i = c[l] = r[l](t), {
    c() {
      xe(e.$$.fragment), n = gn(), i.c(), s = La();
    },
    m(F, h) {
      Me(e, F, h), Tt(F, n, h), c[l].m(F, h), Tt(F, s, h), a = !0;
    },
    p(F, h) {
      const Q = h & /*gradio, loading_status*/
      2080 ? qa(o, [
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
        32 && Pa(
          /*loading_status*/
          F[5]
        )
      ]) : {};
      e.$set(Q);
      let R = l;
      l = U(F), l === R ? c[l].p(F, h) : ($a(), ge(c[R], 1, 1, () => {
        c[R] = null;
      }), Oa(), i = c[l], i ? i.p(F, h) : (i = c[l] = r[l](F), i.c()), be(i, 1), i.m(s.parentNode, s));
    },
    i(F) {
      a || (be(e.$$.fragment, F), be(i), a = !0);
    },
    o(F) {
      ge(e.$$.fragment, F), ge(i), a = !1;
    },
    d(F) {
      F && (Yt(n), Yt(s)), De(e, F), c[l].d(F);
    }
  };
}
function xU(t) {
  let e, n, l, i;
  const s = [kU, XU], a = [];
  function o(d, r) {
    return (
      /*interactive*/
      d[15] ? 1 : 0
    );
  }
  return e = o(t), n = a[e] = s[e](t), {
    c() {
      n.c(), l = La();
    },
    m(d, r) {
      a[e].m(d, r), Tt(d, l, r), i = !0;
    },
    p(d, [r]) {
      let c = e;
      e = o(d), e === c ? a[e].p(d, r) : ($a(), ge(a[c], 1, 1, () => {
        a[c] = null;
      }), Oa(), n = a[e], n ? n.p(d, r) : (n = a[e] = s[e](d), n.c()), be(n, 1), n.m(l.parentNode, l));
    },
    i(d) {
      i || (be(n), i = !0);
    },
    o(d) {
      ge(n), i = !1;
    },
    d(d) {
      d && Yt(l), a[e].d(d);
    }
  };
}
function DU(t, e, n) {
  let { elem_id: l = "" } = e, { elem_classes: i = [] } = e, { visible: s = !0 } = e, { value: a = null } = e, { root: o } = e, { proxy_url: d } = e, { loading_status: r } = e, { label: c } = e, { show_label: U } = e, { container: F = !0 } = e, { scale: h = null } = e, { min_width: Q = void 0 } = e, { gradio: R } = e, { height: V = void 0 } = e, { zoom_speed: p = 1 } = e, { pan_speed: b = 1 } = e, { interactive: m } = e, A, I = !1;
  const x = ({ detail: J }) => n(0, a = J), v = ({ detail: J }) => n(17, I = J), X = ({ detail: J }) => R.dispatch("change", J), N = () => R.dispatch("clear");
  return t.$$set = (J) => {
    "elem_id" in J && n(1, l = J.elem_id), "elem_classes" in J && n(2, i = J.elem_classes), "visible" in J && n(3, s = J.visible), "value" in J && n(0, a = J.value), "root" in J && n(4, o = J.root), "proxy_url" in J && n(18, d = J.proxy_url), "loading_status" in J && n(5, r = J.loading_status), "label" in J && n(6, c = J.label), "show_label" in J && n(7, U = J.show_label), "container" in J && n(8, F = J.container), "scale" in J && n(9, h = J.scale), "min_width" in J && n(10, Q = J.min_width), "gradio" in J && n(11, R = J.gradio), "height" in J && n(12, V = J.height), "zoom_speed" in J && n(13, p = J.zoom_speed), "pan_speed" in J && n(14, b = J.pan_speed), "interactive" in J && n(15, m = J.interactive);
  }, t.$$.update = () => {
    t.$$.dirty & /*value, root, proxy_url*/
    262161 && n(16, A = Bt(a, o, d));
  }, [
    a,
    l,
    i,
    s,
    o,
    r,
    c,
    U,
    F,
    h,
    Q,
    R,
    V,
    p,
    b,
    m,
    A,
    I,
    d,
    x,
    v,
    X,
    N
  ];
}
class PU extends yU {
  constructor(e) {
    super(), GU(this, e, DU, xU, SU, {
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
  LU as BaseExample,
  jo as BaseModel3DGS,
  Yc as BaseModel3DGSUpload,
  PU as default
};
