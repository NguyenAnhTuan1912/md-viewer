export type TCopyTextToClipboardOptions = {
  onSuccess?(): void;
  onError?(err: any): void;
};

export function copyTextToClipboard(
  text: string,
  options?: TCopyTextToClipboardOptions,
) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      if (options && options.onSuccess) {
        options.onSuccess();
      }
    })
    .catch((err) => {
      if (options && options.onError) {
        options.onError(err);
      }
    });
}
