import { useContext, useEffect, useState } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import { SocketContext } from "../SocketContext";

interface Props {}

const SketchPad: React.FC<Props> = ({}) => {
  const socket = useContext(SocketContext);
  const [color, setColor] = useState("#1362b0");
  const [strokeWidth, setStrokeWidth] = useState(1);

  const sendMouse = (x, y, pX, pY) => {
    const data = {
      x: x,
      y: y,
      px: pX,
      py: pY,
      color,
      strokeWidth
    };

    if (socket) {
      socket.emit("mouse", data);
    }
  };
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(1000, 500).parent(canvasParentRef);
    p5.mouseDragged = (event: any) => {
      console.log("🚀 ~ file: sketchPad.tsx ~ line 32 ~ setup ~ event", event);
      const {
        offsetX,
        offsetY,
        x,
        y,
        px,
        py,
        layerX,
        layerY,
        movementX,
        movementY
      } = event;
      sendMouse(x, y, x - movementX, y + movementY);
    };
  };

  useEffect(() => {
    if (socket) {
      socket.emit("join", {
        username: "alex"
      });
    }
  });

  const draw = (p5: p5Types) => {
    // p5.background(202, 231, 237);
    // p5.ellipse(x, y, 70, 70);
    // p5.line(40, 60, 80, 200);
    if (socket) {
      socket.on("mouse", (data) => {
        p5.stroke(data.color);
        p5.strokeWeight(data.strokeWidth);
        // p5.point(data.px, data.py);
        p5.line(data.px, data.py, data.x, data.y);
      });
    }
  };

  return <Sketch setup={setup} draw={draw} />;
};

export default SketchPad;
