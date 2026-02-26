export const validatePhoneFormat = (input: string) => {
  let out = input.replace(/\D/g, "").substring(0, 10);
  const size = out.length;
  if (size > 0) {
    out = `(${out}`;
  }
  if (size > 3) {
    out = `${out.slice(0, 4)}) ${out.slice(4)}`;
  }
  if (size > 6) {
    out = `${out.slice(0, 9)}-${out.slice(9)}`;
  }
  return out;
};

export const validateEmailFormat = (input: string) => {
  return input.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
};
