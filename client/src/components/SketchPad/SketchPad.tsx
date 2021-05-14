import React, { useContext, useEffect, useState } from "react";
import p5 from "p5";
import { SocketContext } from "../SocketContext";

interface Props {
  color: string;
}

const SketchPad: React.FC<Props> = ({ color }) => {
  const socket = useContext(SocketContext);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const divRef = React.useRef<any>();
  const colorRef = React.useRef<any>();

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  const sendMouse = (x, y, pX, pY) => {
    const data = {
      x: x,
      y: y,
      px: pX,
      py: pY,
      color: colorRef.current,
      strokeWidth
    };

    if (socket) {
      socket.emit("mouse", data);
    }
  };

  useEffect(() => {
    let p5Obj;
    if (socket && divRef.current) {
      p5Obj = new p5((sketch) => {
        sketch.setup = () => {
          sketch.createCanvas(1000, 500);
        };

        sketch.mouseDragged = (event: any) => {
          const { offsetX, offsetY, movementX, movementY } = event;
          sendMouse(offsetX, offsetY, offsetX - movementX, offsetY - movementY);
        };

        sketch.mouseClicked = () => console.log("clicked");

        socket.on("mouse", (data) => {
          sketch.stroke(data.color);
          sketch.color(data.color);
          sketch.strokeWeight(data.strokeWidth);
          sketch.line(data.px, data.py, data.x, data.y);
        });
      }, divRef.current);
    }
    return p5Obj;
  }, [socket, divRef]);

  useEffect(() => {
    console.log(color);
  }, [color]);
  return <div ref={divRef}></div>;
};

export default SketchPad;
