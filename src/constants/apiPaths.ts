const API_PATHS = {
  product: "https://2hy6bydj7k.execute-api.ap-south-1.amazonaws.com/prod",
  order: "https://.execute-api.eu-west-1.amazonaws.com/dev",
  import:
    import.meta.env.VITE_IMPORT_API ||
    "https://1kbw54tmo9.execute-api.ap-south-1.amazonaws.com/prod",
  bff: "https://.execute-api.eu-west-1.amazonaws.com/dev",
  cart: "https://.execute-api.eu-west-1.amazonaws.com/dev",
};

export default API_PATHS;
