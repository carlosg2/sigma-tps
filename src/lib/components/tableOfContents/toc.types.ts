export type ToCItem = {
  id: number;
  level: number;
  text: string;
  slug: string;
};

export interface TableOfContentsProps {
  toc: ToCItem[];
  className?: string;
}
