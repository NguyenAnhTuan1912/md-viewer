// Import components
import { MarkdownViewer } from "./markdown-viewer";
import { HtmlViewer } from "./html-viewer";

// Import types
import type { TFileContent } from "@/lib/api/types";

export type TBaseViewerProps = {
  content: string;
  filePath: string;
  sourceRoot?: string;
};

export type TViewerProps = {
  activeTabPath: string;
  fileContent?: TFileContent;
  activeSourceRoot?: string;
};

export function Viewer(props: TViewerProps) {
  return (
    <>
      {props.fileContent?.type === "markdown" && (
        <MarkdownViewer
          content={props.fileContent.content}
          filePath={props.activeTabPath}
          sourceRoot={props.activeSourceRoot}
        />
      )}

      {props.fileContent?.type === "html" && (
        <HtmlViewer
          content={props.fileContent.content}
          filePath={props.activeTabPath}
          sourceRoot={props.activeSourceRoot}
        />
      )}
    </>
  );
}
