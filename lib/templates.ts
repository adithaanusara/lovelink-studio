export type EditorItemType = "text" | "image";

export type EditorItem = {
  id: string;
  type: EditorItemType;
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

export const editorTemplates: EditorTemplate[] = [
  {
    id: "romantic-hero",
    name: "Romantic Hero",
    background: "linear-gradient(135deg, #12071f 0%, #08122c 100%)",
    items: [
      {
        id: "title",
        type: "text",
        x: 60,
        y: 60,
        w: 500,
        h: 100,
        z: 2,
        content: "Happy Birthday, My Favorite Person",
        fontSize: 42,
        color: "#ffffff",
        fontWeight: 800
      },
      {
        id: "message",
        type: "text",
        x: 60,
        y: 180,
        w: 420,
        h: 140,
        z: 2,
        content: "Every memory with you feels magical.",
        fontSize: 20,
        color: "#fbcfe8",
        fontWeight: 500
      },
      {
        id: "main-image",
        type: "image",
        x: 560,
        y: 70,
        w: 300,
        h: 420,
        z: 1,
        src: ""
      }
    ]
  },
  {
    id: "photo-story",
    name: "Photo Story",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    items: [
      {
        id: "title",
        type: "text",
        x: 50,
        y: 40,
        w: 600,
        h: 90,
        z: 3,
        content: "For Someone Truly Special",
        fontSize: 40,
        color: "#ffffff",
        fontWeight: 800
      },
      {
        id: "img1",
        type: "image",
        x: 60,
        y: 150,
        w: 240,
        h: 300,
        z: 1,
        src: ""
      },
      {
        id: "img2",
        type: "image",
        x: 330,
        y: 180,
        w: 240,
        h: 260,
        z: 1,
        src: ""
      },
      {
        id: "message",
        type: "text",
        x: 600,
        y: 180,
        w: 250,
        h: 220,
        z: 2,
        content: "I made this page just for you.",
        fontSize: 24,
        color: "#e9d5ff",
        fontWeight: 600
      }
    ]
  },
  {
    id: "center-glow",
    name: "Center Glow",
    background: "radial-gradient(circle at center, #3b0764 0%, #020617 70%)",
    items: [
      {
        id: "main-image",
        type: "image",
        x: 290,
        y: 90,
        w: 320,
        h: 320,
        z: 1,
        src: ""
      },
      {
        id: "title",
        type: "text",
        x: 170,
        y: 440,
        w: 560,
        h: 80,
        z: 2,
        content: "A Surprise Made With Love",
        fontSize: 38,
        color: "#ffffff",
        fontWeight: 800
      }
    ]
  },
  {
    id: "memory-wall",
    name: "Memory Wall",
    background: "linear-gradient(135deg, #111827 0%, #3b0764 100%)",
    items: [
      {
        id: "img1",
        type: "image",
        x: 70,
        y: 80,
        w: 220,
        h: 220,
        z: 1,
        src: ""
      },
      {
        id: "img2",
        type: "image",
        x: 330,
        y: 120,
        w: 220,
        h: 220,
        z: 1,
        src: ""
      },
      {
        id: "img3",
        type: "image",
        x: 590,
        y: 80,
        w: 220,
        h: 220,
        z: 1,
        src: ""
      },
      {
        id: "message",
        type: "text",
        x: 160,
        y: 360,
        w: 580,
        h: 120,
        z: 2,
        content: "A wall of memories that belongs only to us.",
        fontSize: 28,
        color: "#ffffff",
        fontWeight: 700
      }
    ]
  }
];