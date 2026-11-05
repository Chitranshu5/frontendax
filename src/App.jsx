// import { useCallback, useEffect, useRef, useState } from "react";

// const api = async (url, options = {}) => {
//   const response = await fetch(url, {
//     credentials: "same-origin",
//     headers: { "Content-Type": "application/json", ...(options.headers || {}) },
//     ...options
//   });
//   const data = await response.json().catch(() => ({}));
//   if (!response.ok) throw new Error(data.error || "Request failed");
//   return data;
// };

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [peer, setPeer] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [online, setOnline] = useState([]);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [draft, setDraft] = useState("");
//   const [error, setError] = useState("");
//   const [connected, setConnected] = useState(false);
//   const socketRef = useRef(null);
//   const bottomRef = useRef(null);

//   const loadHistory = useCallback(async (currentUser, otherUser) => {
//     const data = await api(`/api/messages?with=${otherUser.id}&limit=50`);
//     setMessages(data.messages);
//   }, []);

//   const initialize = useCallback(async () => {
//     try {
//       const data = await api("/api/me");
//       setUser(data.user);
//       const result = await api("/api/users");
//       setUsers(result.users);
//       const other = result.users.find((u) => u.id !== data.user.id);
//       if (other) {
//         setPeer(other);
//         await loadHistory(data.user, other);
//       }
//     } catch {
//       setUser(null);
//     }
//   }, [loadHistory]);

//   useEffect(() => { initialize(); }, [initialize]);

//   useEffect(() => {
//     if (!user) return;
//     let stopped = false;
//     let socket;
//     let retry;
//     const connect = () => {
//       if (stopped) return;
//       const scheme = location.protocol === "https:" ? "wss:" : "ws:";
//       socket = new WebSocket(`${scheme}//${location.host}/ws`);
//       socketRef.current = socket;
//       socket.onopen = () => { setConnected(true); };
//       socket.onmessage = (event) => {
//         const packet = JSON.parse(event.data);
//         if (packet.type === "presence") setOnline(packet.onlineUserIds);
//         if (packet.type === "message" || packet.type === "sent") {
//           setMessages((old) => old.some((m) => m.id === packet.message.id)
//             ? old : [...old, packet.message]);
//         }
//       };
//       socket.onclose = () => {
//         setConnected(false);
//         if (!stopped) retry = setTimeout(connect, 1500);
//       };
//       socket.onerror = () => socket.close();
//     };
//     connect();
//     return () => {
//       stopped = true;
//       clearTimeout(retry);
//       socket?.close();
//     };
//   }, [user]);

//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

//   async function login(event) {
//     event.preventDefault();
//     setError("");
//     try {
//       await api("/api/login", {
//         method: "POST",
//         body: JSON.stringify({ username, password })
//       });
//       setPassword("");
//       await initialize();
//     } catch (err) { setError(err.message); }
//   }

//   async function logout() {
//     await api("/api/logout", { method: "POST" });
//     socketRef.current?.close();
//     setUser(null); setPeer(null); setMessages([]);
//   }

//   function sendMessage(event) {
//     event.preventDefault();
//     const body = draft.trim();
//     const socket = socketRef.current;
//     if (!body || !peer || socket?.readyState !== WebSocket.OPEN) return;
//     socket.send(JSON.stringify({ type: "message", recipientId: peer.id, body }));
//     setDraft("");
//   }

//   if (!user) {
//     return <main className="login-wrap">
//       <form className="login-card" onSubmit={login}>
//         <div className="brand-mark">P</div>
//         <h1>Private Chat</h1>
//         <p className="muted">Sign in to your private conversation</p>
//         <label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required /></label>
//         <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></label>
//         {error && <p className="error">{error}</p>}
//         <button className="primary">Sign in</button>
//       </form>
//     </main>;
//   }

//   return <main className="app-shell">
//     <aside className="sidebar">
//       <div className="side-heading"><div className="brand-mark small">P</div><strong>Private Chat</strong></div>
//       <div className="section-label">PEOPLE · {users.length}</div>
//       {users.map(person => <button key={person.id} className={`person ${peer?.id === person.id ? "selected" : ""}`} onClick={() => person.id !== user.id && setPeer(person)}>
//         <span className="avatar">{person.username.slice(0,1).toUpperCase()}</span>
//         <span className="person-info"><strong>{person.id === user.id ? `${person.username} (You)` : person.username}</strong><small>{online.includes(person.id) ? "Online" : "Offline"}</small></span>
//         <i className={online.includes(person.id) ? "dot online" : "dot"} />
//       </button>)}
//       <div className="sidebar-bottom"><span>{user.username}</span><button className="text-button" onClick={logout}>Log out</button></div>
//     </aside>
//     <section className="chat">
//       <header className="chat-header">
//         <div className="avatar">{peer?.username?.slice(0,1).toUpperCase() || "?"}</div>
//         <div><strong>{peer?.username || "Conversation"}</strong><small>{connected ? "Connected" : "Reconnecting…"}</small></div>
//       </header>
//       <div className="messages">
//         {messages.map(message => <div key={message.id} className={`message-row ${message.senderId === user.id ? "mine" : ""}`}>
//           <div className="bubble"><p>{message.body}</p><time>{new Date(message.createdAt).toLocaleString()}</time></div>
//         </div>)}
//         <div ref={bottomRef} />
//       </div>
//       <form className="composer" onSubmit={sendMessage}>
//         <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a message…" maxLength={4000} disabled={!connected || !peer} />
//         <button className="primary send" disabled={!connected || !draft.trim()}>Send</button>
//       </form>
//       <div className="notice">Text-only chat · Messages are stored on your server · E2EE is not enabled in this version</div>
//     </section>
//   </main>;
// }

import { useCallback, useEffect, useRef, useState } from "react";

const api = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const loadHistory = useCallback(async (currentUser, otherUser) => {
    const data = await api(`/api/messages?with=${otherUser.id}&limit=50`);
    setMessages(data.messages);
  }, []);

  const initialize = useCallback(async () => {
    try {
      const data = await api("/api/me");
      setUser(data.user);
      const result = await api("/api/users");
      setUsers(result.users);
      const other = result.users.find((u) => u.id !== data.user.id);
      if (other) {
        setPeer(other);
        await loadHistory(data.user, other);
      }
    } catch {
      setUser(null);
    }
  }, [loadHistory]);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!user) return;
    let stopped = false;
    let socket;
    let retry;
    const connect = () => {
      if (stopped) return;
      const scheme = location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${scheme}//${location.host}/ws`);
      socketRef.current = socket;
      socket.onopen = () => { setConnected(true); };
      socket.onmessage = (event) => {
        const packet = JSON.parse(event.data);
        if (packet.type === "presence") setOnline(packet.onlineUserIds);
        if (packet.type === "message" || packet.type === "sent") {
          setMessages((old) => old.some((m) => m.id === packet.message.id)
            ? old : [...old, packet.message]);
        }
      };
      socket.onclose = () => {
        setConnected(false);
        if (!stopped) retry = setTimeout(connect, 1500);
      };
      socket.onerror = () => socket.close();
    };
    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function login(event) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      setPassword("");
      await initialize();
    } catch (err) { setError(err.message); }
  }

  async function logout() {
    await api("/api/logout", { method: "POST" });
    socketRef.current?.close();
    setUser(null); setPeer(null); setMessages([]);
  }

  function sendMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    const socket = socketRef.current;
    if (!body || !peer || socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "message", recipientId: peer.id, body }));
    setDraft("");
  }

  if (!user) {
    return <main className="login-wrap">
      <form className="login-card" onSubmit={login}>
        <div className="brand-mark">P</div>
        <h1>Private Chat</h1>
        <p className="muted">Sign in to your private conversation</p>
        <label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary">Sign in</button>
      </form>
    </main>;
  }

  return <>
    {/* Hidden checkbox that controls the mobile drawer */}
    <input type="checkbox" id="sidebar-toggle" className="sidebar-toggle" />

    {/* Dimmed backdrop — tap to close */}
    <label htmlFor="sidebar-toggle" className="sidebar-backdrop" aria-hidden="true" />

    <main className="app-shell">
      <aside className="sidebar">
        <div className="side-heading"><div className="brand-mark small">P</div><strong>Private Chat</strong></div>
        <div className="section-label">PEOPLE · {users.length}</div>
        {users.map(person => <button key={person.id} className={`person ${peer?.id === person.id ? "selected" : ""}`} onClick={() => person.id !== user.id && setPeer(person)}>
          <span className="avatar">{person.username.slice(0,1).toUpperCase()}</span>
          <span className="person-info"><strong>{person.id === user.id ? `${person.username} (You)` : person.username}</strong><small>{online.includes(person.id) ? "Online" : "Offline"}</small></span>
          <i className={online.includes(person.id) ? "dot online" : "dot"} />
        </button>)}
        <div className="sidebar-bottom"><span>{user.username}</span><button className="text-button" onClick={logout}>Log out</button></div>
      </aside>

      <section className="chat">
        <header className="chat-header">
          {/* Hamburger button — top bar, mobile only */}
          <label htmlFor="sidebar-toggle" className="sidebar-fab" aria-label="Toggle contacts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </label>

          <div className="avatar">{peer?.username?.slice(0,1).toUpperCase() || "?"}</div>
          <div><strong>{peer?.username || "Conversation"}</strong><small>{connected ? "Connected" : "Reconnecting…"}</small></div>
        </header>

        <div className="messages">
          {messages.map(message => <div key={message.id} className={`message-row ${message.senderId === user.id ? "mine" : ""}`}>
            <div className="bubble"><p>{message.body}</p></div>
          </div>)}
          <div ref={bottomRef} />
        </div>

        <form className="composer" onSubmit={sendMessage}>
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a message…" maxLength={4000} disabled={!connected || !peer} />
          <button className="primary send" disabled={!connected || !draft.trim()}>Send</button>
        </form>

        <div className="notice">Text-only chat · Messages are stored on your server · E2EE is not enabled in this version</div>
      </section>
    </main>
  </>;
}