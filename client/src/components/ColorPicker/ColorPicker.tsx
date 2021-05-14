import { Dispatch, SetStateAction } from "react";
import { HexColorPicker } from "react-colorful";

interface Props {
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
}

const ColorPicker: React.FC<Props> = ({ color, setColor }) => {
  return <HexColorPicker color={color} onChange={setColor} />;
};

export default ColorPicker;
