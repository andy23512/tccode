window.MonacoEnvironment = {
  getWorker: function () {
    return new Worker(new URL('./tccl/tccl.worker', import.meta.url));
  },
};
