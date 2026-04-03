export type EditorItem = {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  content?: string;
  src?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
};

export type EditorTemplate = {
  id: string;
  name: string;
  background: string;
  items: EditorItem[];
};

const TITLE_BOX_WIDTH = 400;
const TITLE_BOX_HEIGHT = 280;

export const editorTemplates: EditorTemplate[] = [
  {
    id: "romantic-hero",
    name: "Romantic Hero",
    background: "linear-gradient(135deg, #12071f 0%, #08122c 100%)",
    items: [
      {
        id: "title",
        type: "text",
        x: 70,
        y: 70,
        w: TITLE_BOX_WIDTH,
        h: TITLE_BOX_HEIGHT,
        z: 2,
        content: "Happy Birthday, My\nFavorite Person",
        fontSize: 42,
        color: "#ffffff",
        fontWeight: 800
      },
      {
        id: "message",
        type: "text",
        x: 70,
        y: 260,
        w: 400,
        h: 220,
        z: 2,
        content: "Every memory with you feels magical.",
        fontSize: 28,
        color: "#fbcfe8",
        fontWeight: 600
      },
      {
        id: "hero-image",
        type: "image",
        x: 500,
        y: 90,
        w: TITLE_BOX_WIDTH,
        h: TITLE_BOX_HEIGHT,
        z: 2,
        src: ""
      }
    ]
  },
  {
    id: "photo-story",
    name: "Photo Story",
    background: "linear-gradient(135deg, #1a103d 0%, #0b1736 100%)",
    items: [
      {
        id: "title",
        type: "text",
        x: 70,
        y: 70,
        w: 400,
        h: 240,
        z: 2,
        content: "For My Favorite Person",
        fontSize: 38,
        color: "#ffffff",
        fontWeight: 800
      },
      {
        id: "message",
        type: "text",
        x: 70,
        y: 250,
        w: 400,
        h: 180,
        z: 2,
        content: "A page full of memories, love, and little moments.",
        fontSize: 26,
        color: "#f5d0fe",
        fontWeight: 600
      },
      {
        id: "photo-main",
        type: "image",
        x: 500,
        y: 90,
        w: 340,
        h: 300,
        z: 2,
        src: ""
      }
    ]
  },
  {
    id: "center-glow",
    name: "Center Glow",
    background: "radial-gradient(circle at center, #581c87 0%, #09090b 70%)",
    items: [
      {
        id: "title",
        type: "text",
        x: 120,
        y: 70,
        w: 320,
        h: 140,
        z: 2,
        content: "A Special Day",
        fontSize: 40,
        color: "#ffffff",
        fontWeight: 800
      },
      {
        id: "message",
        type: "text",
        x: 120,
        y: 230,
        w: 320,
        h: 160,
        z: 2,
        content: "You make every ordinary day feel extraordinary.",
        fontSize: 24,
        color: "#fce7f3",
        fontWeight: 600
      },
      {
        id: "center-image",
        type: "image",
        x: 500,
        y: 110,
        w: 260,
        h: 260,
        z: 2,
        src: ""
      }
    ]
  },
  {
    id: "memory-wall",
    name: "Memory Wall",
    background: "linear-gradient(135deg, #1f1147 0%, #3b0764 100%)",
    items: [
      {
        id: "title",
        type: "text",
        x: 90,
        y: 90,
        w: 360,
        h: 150,
        z: 2,
        content: "A wall of memories that belongs only to us.",
        fontSize: 34,
        color: "#ffffff",
        fontWeight: 800
      },
      {
        id: "message",
        type: "text",
        x: 90,
        y: 270,
        w: 360,
        h: 160,
        z: 2,
        content: "Every picture here carries a little piece of our story.",
        fontSize: 24,
        color: "#fbcfe8",
        fontWeight: 600
      },
      {
        id: "memory-image",
        type: "image",
        x: 500,
        y: 110,
        w: 280,
        h: 280,
        z: 2,
        src: ""
      }
    ]
  }
];