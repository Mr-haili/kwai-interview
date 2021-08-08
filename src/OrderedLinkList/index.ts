type Nil = null | undefined;

const isNil = (x: any): x is Nil => {
  return x === null || x === undefined;
};

interface IOrderedLinkNode {
  id: number;
  before?: number;
  after?: number;
  first?: boolean;
  last?: boolean;
}

class GraphNode {
  parents: number[];
  children: number[];

  constructor(readonly id: number) {
    this.parents = [];
    this.children = [];
  }

  get indegree() {
    return this.parents.length;
  }

  get outdegree() {
    return this.children.length;
  }
}

type Graph = Map<number, GraphNode>;

/**
 * 端点检测结果，如果有 first 或 last 节点冲突，
 * isConflict 为 true
 */
interface ICheckEndPointResult {
  isConflict: boolean;
  firstIds: ReadonlyArray<number>;
  lastIds: ReadonlyArray<number>;
}

/**
 * 只能有 0 或 1 个 first 节点，
 * 也只能有 0 或者 1 个 last 节点
 */
const checkEndPoint = (
  nodes: ReadonlyArray<IOrderedLinkNode>
): ICheckEndPointResult => {
  const firstIds: number[] = [],
    lastIds: number[] = [];
  for (const { first, last, id } of nodes) {
    if (first) {
      firstIds.push(id);
    }
    if (last) {
      lastIds.push(id);
    }
  }
  const isConflict = 1 < firstIds.length && 1 < lastIds.length;
  return {
    isConflict,
    firstIds,
    lastIds,
  };
};

const buildGraph = (
  orderedLinkNodes: ReadonlyArray<IOrderedLinkNode>
): Graph => {
  const graph: Graph = new Map();
  const getGraphNode = (id: number): GraphNode => {
    if (!graph.has(id)) {
      const node: GraphNode = new GraphNode(id);
      graph.set(id, node);
    }
    return graph.get(id) as GraphNode;
  };

  for (const linkNode of orderedLinkNodes) {
    const { before, after, id } = linkNode;
    getGraphNode(id);

    if (!isNil(before)) {
      getGraphNode(id).parents.push(before);
      getGraphNode(before).children.push(id);
    }
    if (!isNil(after)) {
      getGraphNode(id).children.push(after);
      getGraphNode(after).parents.push(id);
    }
  }
  return graph;
};

const dfs = (graph: Graph, id: number): number[] => {
  const ids: number[] = [];
  while (true) {
    const v = graph.get(id);
    if (!v) {
      return ids;
    }

    // TODO: 检测到环，或者非线性的情况需要记录错误
    if (1 < v.indegree || 1 < v.outdegree) {
      return [];
    }
    ids.push(v.id);
    id = v.children[0];
  }
};

const orderedLinklist = (
  linkNodes: ReadonlyArray<IOrderedLinkNode>
): number[] => {
  const checkEndPointResult = checkEndPoint(linkNodes);
  const graph = buildGraph(linkNodes);

  console.log(graph);

  if (checkEndPointResult.isConflict) {
    throw `端点冲突 ${JSON.stringify(checkEndPointResult)}`;
  }

  const lists: number[][] = [];

  const firstId: number | undefined = checkEndPointResult.firstIds[0];
  const lastId: number | undefined = checkEndPointResult.lastIds[0];

  // 遍历 firstId 所属的子图
  if (!isNil(firstId)) {
    lists.push(dfs(graph, firstId));
  }

  // 逐一遍历入度为 0 的非头尾节点
  graph.forEach((v, id) => {
    if (v.indegree !== 0 || id === firstId || id === lastId) {
      return;
    }
    const list = dfs(graph, id);
    if (0 < list.length) {
      lists.push(list);
    }
  });

  // 遍历 lastId 所属的子图
  if (!isNil(lastId)) {
    lists.push(dfs(graph, lastId));
  }

  const mergedList = lists.reduce((acc, cur) => {
    acc.push(...cur);
    return acc;
  }, []);
  return mergedList;
};

const data: IOrderedLinkNode[] = [
  { id: 1 },
  { id: 2, before: 1 },
  { id: 3, after: 1 },
  { id: 5, first: true },
  { id: 6, last: true },
  { id: 7, after: 8 },
  { id: 8 },
  { id: 9 },
];
console.log(orderedLinklist(data));
