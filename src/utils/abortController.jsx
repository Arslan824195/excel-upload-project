let abortController = new AbortController();

export const resetAbortController = () => 
{
  abortController.abort();
  abortController = new AbortController();
};

export { abortController };