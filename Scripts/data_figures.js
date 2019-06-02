﻿var figures = new Object();
figures["fig01"] = [
  //front
  [[[-1, -1, 1, 1], [1, 1, 1, 1], [-1, 1, 1, 1]], [[0, 0, 1], [0, 0, 1], [0, 0, 1]], [[0, 0], [1, 1], [0, 1]]],
  [[[-1, -1, 1, 1], [1, -1, 1, 1], [1, 1, 1, 1]], [[0, 0, 1], [0, 0, 1], [0, 0, 1]], [[0, 0], [1, 0], [1, 1]]],
  ////back
  [[[-1, -1, -1, 1], [-1, 1, -1, 1], [1, 1, -4, 1]], [[0, 0, -1], [0, 0, -1], [0, 0, -1]], [[1, 0], [1, 1], [0, 1]]],
  [[[-1, -1, -1, 1], [1, 1, -4, 1], [1, -1, -4, 1]], [[0, 0, -1], [0, 0, -1], [0, 0, -1]], [[1, 0], [0, 1], [0, 0]]],
  ////left
  [[[-1, -1, 1, 1], [-1, 1, -1, 1], [-1, -1, -1, 1]], [[-1, 0, 0], [-1, 0, 0], [-1, 0, 0]], [[1, 0], [0, 1], [0, 0]]],
  [[[-1, -1, 1, 1], [-1, 1, 1, 1], [-1, 1, -1, 1]], [[-1, 0, 0], [-1, 0, 0], [-1, 0, 0]], [[1, 0], [1, 1], [0, 1]]],
  ////right
  [[[1, -1, 1, 1], [1, -1, -4, 1], [1, 1, -4, 1]], [[1, 0, 0], [1, 0, 0], [1, 0, 0]], [[0, 0], [1, 0], [1, 1]]],
  [[[1, -1, 1, 1], [1, 1, -4, 1], [1, 1, 1, 1]], [[1, 0, 0], [1, 0, 0], [1, 0, 0]], [[0, 0], [1, 1], [0, 1]]],
  //top
  [[[1, 1, 1, 1], [-1, 1, -1, 1], [-1, 1, 1, 1]], [[0, 1, 0], [0, 1, 0], [0, 1, 0]], [[1, 0], [0, 1], [0, 0]]],
  [[[1, 1, 1, 1], [1, 1, -4, 1], [-1, 1, -1, 1]], [[0, 1, 0], [0, 1, 0], [0, 1, 0]], [[1, 0], [1, 1], [0, 1]]],
  //botom
  [[[1, -1, 1, 1], [-1, -1, 1, 1], [-1, -1, -1, 1]], [[0, -1, 0], [0, -1, 0], [0, -1, 0]], [[1, 1], [0, 1], [0, 0]]],
  [[[1, -1, 1, 1], [-1, -1, -1, 1], [1, -1, -4, 1]], [[0, -1, 0], [0, -1, 0], [0, -1, 0]], [[1, 1], [0, 0], [1, 0]]]
];

figures["fig02"] = [
  //front
  [[[-1, -1, 1, 1], [1, 1, 1, 1], [-1, 1, 1, 1]], [[0, 0, 1], [0, 0, 1], [0, 0, 1]], [[0, 0], [1, 1], [0, 1]]],
  [[[-1, -1, 1, 1], [1, -1, 1, 1], [1, 1, 1, 1]], [[0, 0, 1], [0, 0, 1], [0, 0, 1]], [[0, 0], [1, 0], [1, 1]]],
  ////back
  [[[-1, -1, -1, 1], [-1, 1, -1, 1], [1, 1, -4, 1]], [[0, 0, -1], [0, 0, -1], [0, 0, -1]], [[1, 0], [1, 1], [0, 1]]],
  [[[-1, -1, -1, 1], [1, 1, -4, 1], [1, -1, -4, 1]], [[0, 0, -1], [0, 0, -1], [0, 0, -1]], [[1, 0], [0, 1], [0, 0]]],
  ////left
  [[[-1, -1, 1, 1], [-1, 1, -1, 1], [-1, -1, -1, 1]], [[-1, 0, 0], [-1, 0, 0], [-1, 0, 0]], [[1, 0], [0, 1], [0, 0]]],
  [[[-1, -1, 1, 1], [-1, 1, 1, 1], [-1, 1, -1, 1]], [[-1, 0, 0], [-1, 0, 0], [-1, 0, 0]], [[1, 0], [1, 1], [0, 1]]],
  ////right
  [[[1, -1, 1, 1], [1, -1, -4, 1], [1, 1, -4, 1]], [[1, 0, 0], [1, 0, 0], [1, 0, 0]], [[0, 0], [1, 0], [1, 1]]],
  [[[1, -1, 1, 1], [1, 1, -4, 1], [1, 1, 1, 1]], [[1, 0, 0], [1, 0, 0], [1, 0, 0]], [[0, 0], [1, 1], [0, 1]]],
  //top
  [[[1, 1, 1, 1], [-1, 1, -1, 1], [-1, 1, 1, 1]], [[0, 1, 0], [0, 1, 0], [0, 1, 0]], [[1, 0], [0, 1], [0, 0]]],
  [[[1, 1, 1, 1], [1, 1, -4, 1], [-1, 1, -1, 1]], [[0, 1, 0], [0, 1, 0], [0, 1, 0]], [[1, 0], [1, 1], [0, 1]]],
  //botom
  [[[1, -1, 1, 1], [-1, -1, 1, 1], [-1, -1, -1, 1]], [[0, -1, 0], [0, -1, 0], [0, -1, 0]], [[1, 1], [0, 1], [0, 0]]],
  [[[1, -1, 1, 1], [-1, -1, -1, 1], [1, -1, -4, 1]], [[0, -1, 0], [0, -1, 0], [0, -1, 0]], [[1, 1], [0, 0], [1, 0]]]
];

figures["fig03"] = [
  //front
  [[[-1, -1, 1, 1], [1, 1, 1, 1], [-1, 1, 1, 1]], [[0, 0, 1], [0, 0, 1], [0, 0, 1]], [[0, 0], [1, 1], [0, 1]]],
  [[[-1, -1, 1, 1], [1, -1, 1, 1], [1, 1, 1, 1]], [[0, 0, 1], [0, 0, 1], [0, 0, 1]], [[0, 0], [1, 0], [1, 1]]],
  ////back
  [[[-1, -1, -1, 1], [-1, 1, -1, 1], [1, 1, -4, 1]], [[0, 0, -1], [0, 0, -1], [0, 0, -1]], [[1, 0], [1, 1], [0, 1]]],
  [[[-1, -1, -1, 1], [1, 1, -4, 1], [1, -1, -4, 1]], [[0, 0, -1], [0, 0, -1], [0, 0, -1]], [[1, 0], [0, 1], [0, 0]]],
  ////left
  [[[-1, -1, 1, 1], [-1, 1, -1, 1], [-1, -1, -1, 1]], [[-1, 0, 0], [-1, 0, 0], [-1, 0, 0]], [[1, 0], [0, 1], [0, 0]]],
  [[[-1, -1, 1, 1], [-1, 1, 1, 1], [-1, 1, -1, 1]], [[-1, 0, 0], [-1, 0, 0], [-1, 0, 0]], [[1, 0], [1, 1], [0, 1]]],
  ////right
  [[[1, -1, 1, 1], [1, -1, -4, 1], [1, 1, -4, 1]], [[1, 0, 0], [1, 0, 0], [1, 0, 0]], [[0, 0], [1, 0], [1, 1]]],
  [[[1, -1, 1, 1], [1, 1, -4, 1], [1, 1, 1, 1]], [[1, 0, 0], [1, 0, 0], [1, 0, 0]], [[0, 0], [1, 1], [0, 1]]],
  //top
  [[[1, 1, 1, 1], [-1, 1, -1, 1], [-1, 1, 1, 1]], [[0, 1, 0], [0, 1, 0], [0, 1, 0]], [[1, 0], [0, 1], [0, 0]]],
  [[[1, 1, 1, 1], [1, 1, -4, 1], [-1, 1, -1, 1]], [[0, 1, 0], [0, 1, 0], [0, 1, 0]], [[1, 0], [1, 1], [0, 1]]],
  //botom
  [[[1, -1, 1, 1], [-1, -1, 1, 1], [-1, -1, -1, 1]], [[0, -1, 0], [0, -1, 0], [0, -1, 0]], [[1, 1], [0, 1], [0, 0]]],
  [[[1, -1, 1, 1], [-1, -1, -1, 1], [1, -1, -4, 1]], [[0, -1, 0], [0, -1, 0], [0, -1, 0]], [[1, 1], [0, 0], [1, 0]]]
];