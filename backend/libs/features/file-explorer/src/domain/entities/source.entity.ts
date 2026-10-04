export interface SourceProps {
  id: string;
  path: string;
  name: string;
  addedAt: string;
}

export class Source {
  readonly id: string;
  readonly path: string;
  readonly name: string;
  readonly addedAt: string;

  constructor(props: SourceProps) {
    this.id = props.id;
    this.path = props.path;
    this.name = props.name;
    this.addedAt = props.addedAt;
  }

  static create(path: string, name: string): Source {
    return new Source({
      id: crypto.randomUUID(),
      path,
      name,
      addedAt: new Date().toISOString(),
    });
  }

  toJSON(): SourceProps {
    return {
      id: this.id,
      path: this.path,
      name: this.name,
      addedAt: this.addedAt,
    };
  }
}
