import React, { useEffect, useRef, useState } from "react";
import Editor from "../components/Editor";
import "../App.css";
import { initSocket } from "../socket";
import { useLocation } from "react-router-dom";
import Client from "../components/Client";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import logo from '../assest/logo.png';
import { Navigate, useNavigate, useParams } from "react-router-dom";

function EditorPage() {
  const location = useLocation();
  const socketRef = useRef(null);
  const reactNavigator = useNavigate();
  const codeRef= useRef(null);
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const handleErrors = (e) => {
    console.log("socket error", e);
    toast.error("Socket connection failed, try again later");
    reactNavigator("/");
  };
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });
      // listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(` ${username} has joined the room`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE,{
            code:codeRef.current,
            socketId,

          });
        }
      );
      //listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter(
            (client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return ()=>{
       socketRef.current.disconnect();
       socketRef.current.off(ACTIONS.JOINED);
       socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, []);

  async function copyRoomId(){
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    }catch(err){
      toast.error('could not copy Room Id');
      console.error();
    }
  };

  function leaveRoom(){
    reactNavigator('/');
  }
  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
        <div className='logo-wrapper'>
        <img className="collab-logo" src={logo} alt="collab-logo" />
        <h2>Collab</h2>
        </div>
          <h3>connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorWrap">
        <Editor  socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{
          codeRef.current=code;
        }}/>
      </div>
    </div>
  );
}

export default EditorPage;
