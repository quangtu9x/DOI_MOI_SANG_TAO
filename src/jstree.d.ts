// jstree.d.ts
interface JSTreeConfig {
    core?: {
      data: any[];
      check_callback?: boolean;
      themes?: {
        name?: string;
        responsive?: boolean;
      };
    };
    plugins?: string[];
    [key: string]: any;
  }

  interface JSTreeInstance {
    search: (keyword: string) => void;
    open_all: () => void;
    close_all: () => void;
    get_json: (selector: string, options?: any) => any[];
  }
  
  interface JQuery<TElement = HTMLElement> {
    jstree(config?: JSTreeConfig): this;
    jstree(method?: string | boolean, ...args: any[]): any;
  }
  