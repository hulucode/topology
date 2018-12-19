<template>
    <div class="absolute-full">
        <div class="relative-full">
            <svg class="whiteboard">
                <defs>
                    <filter id="darken">
                        <feColorMatrix
                                type="matrix"
                                values="1   0   0   0   0
                                         0  1   0   0   0
                                         0   0  1   0   0
                                         0   0   0   .1   0 "/>
                    </filter>
                </defs>
            </svg>
        </div>
    </div>
</template>
<style>
    .whiteboard {
        width: 100%;
        height: 100%;
        position: relative;
        background-color: #ffffff;
    }
</style>
<script>

    var Topo = require('../js/topo');

    module.exports = {
        data: function () {
            return {}
        },
        created: function () {
            var self = this;
            self.$nextTick(function () {
                Topo.getD3Json("http://localhost:9999/json/depence1208-9.json", function (data) {
                    Topo.drawSvg(".whiteboard", data);
                });
            });
        },
        methods: {
            /*getD3Json: function (url, callback) {
             d3.request(url)
             .mimeType("application/json")
             .response(function (xhr) {
             return JSON.parse(xhr.responseText);
             })
             .get(callback);
             },
             degreeData: function (data) {
             var degreeList = [];
             for (var i = 0; i < data.length; i++) {
             var node = {
             upstream: data[i]['upstream'] ? data[i]['upstream'] : [],
             current: {
             element_id: data[i]['current']['element_id'],
             inDegree: 0,
             outDegree: 0,
             sortIndegree: 0,
             sortOutDegree: 0
             },
             downstream: data[i]['downstream'] ? data[i]['downstream'] : []
             };
             var upstream = node['upstream'];
             node['current'].inDegree = upstream.length;
             node['current'].sortIndegree = upstream.length;
             var downstream = node['downstream'];
             node['current'].outDegree = downstream.length;
             node['current'].sortOutDegree = downstream.length;

             /!*for (var j = 0; j < data.length; j++) {
             var upstream = data[j]['upstream'] ? data[j]['upstream'] : [];
             for (var m = 0; m < upstream.length; m++) {
             if (upstream[m]['element_id'] == node['current']['element_id']) {
             node['current'].outDegree += 1;
             }
             }
             var downstream = data[j]['downstream'] ? data[j]['downstream'] : [];
             for (var n = 0; n < downstream.length; n++) {
             if (downstream[n]['element_id'] == node['current']['element_id']) {
             node['current'].inDegree += 1;
             }
             }
             }*!/
             degreeList.push(node);
             }

             return degreeList;
             },
             groupData: function (data) {
             var self = this;
             var currentNode = null;
             //寻找入度为0的节点
             for (var i = 0; i < data.length; i++) {
             if (data[i]['current'].inDegree == 0) {
             currentNode = data[i];
             traverseDownStream(currentNode, i);
             }
             }
             //遍历downstream设置group
             function traverseDownStream(node, group) {
             node['current'].group = group;
             //console.log(node['current'].element_id, node['current'].group);
             if (node['downstream'].length > 0) {
             for (var index in node['downstream']) {
             var element_id = node['downstream'][index]['element_id'];
             var downNode = self.getNodeByID(data, element_id);
             //设置group
             if (downNode['current'].group == null) {
             traverseDownStream(downNode, group);
             } else if (currentNode['current'].group != downNode['current'].group) {
             //console.log(node['current'].element_id, downNode['current'].element_id)
             node['current'].group = downNode['current'].group;
             traverseDownStream(currentNode, node['current'].group);
             }
             }
             }
             }

             //通过group归类节点
             var depenceData = [];
             for (var m = 0; m < data.length; m++) {
             var group = data[m]['current'].group;
             if (depenceData[group] == null)depenceData[group] = [];
             depenceData[group].push(data[m]);
             }
             for (var i = 0; i < depenceData.length; i++) {
             if (depenceData[i] == undefined) {
             depenceData.splice(i, 1);
             i--;
             }
             }

             return depenceData;
             },
             topoSort: function (data) {
             var self = this;
             var count = 0;
             var queue = [];
             for (var i = 0; i < data.length; i++) {
             if (data[i]['current'].sortIndegree == 0) {
             queue.push(data[i]);
             }
             }
             var topoList = [];
             while (queue.length > 0) {
             var node = queue.splice(0, 1)[0];
             topoList.push(node);
             count += 1;
             var downStreamList = node['downstream'] ? node['downstream'] : [];
             for (var i = 0; i < downStreamList.length; i++) {
             var downstreamNode = self.getNodeByID(data, downStreamList[i]['element_id']);
             if (downstreamNode == null) {
             console.log('depence error!');
             return null;
             }
             var sortIndegree = --downstreamNode['current'].sortIndegree;
             if (sortIndegree == 0) {
             queue.push(downstreamNode);
             }
             }
             }
             if (count != data.length) {
             console.log('circel error!');
             return null;
             }
             return topoList;
             },
             levelSort: function (data) {
             var self = this;
             var inDegree_0_nodeArray = [];
             //寻找入度为0的节点
             for (var i = 0; i < data.length; i++) {
             if (data[i]['current'].inDegree == 0) {
             inDegree_0_nodeArray.push(data[i]);
             }
             }
             //设置节点的level
             for (var j = 0; j < inDegree_0_nodeArray.length; j++) {
             var node = inDegree_0_nodeArray[j];
             node['current'].level = 0;
             traverseDownStream(node);
             }

             //遍历downstream设置level
             function traverseDownStream(node) {
             if (node['downstream'].length > 0) {
             for (var m = 0; m < node['downstream'].length; m++) {
             var element_id = node['downstream'][m]['element_id'];
             var downNode = self.getNodeByID(data, element_id);
             if (downNode['current'].level == null) {
             downNode['current'].level = node['current'].level + 1;
             } else if (downNode['current'].level < node['current'].level + 1) {
             downNode['current'].level = node['current'].level + 1;
             }
             traverseDownStream(downNode);
             }
             }
             }

             return data;
             },
             levelOrder: function (data) {
             var self = this;
             var inDegree_0_nodeArray = [];
             //寻找入度为0的节点
             for (var i = 0; i < data.length; i++) {
             if (data[i]['current'].inDegree == 0) {
             inDegree_0_nodeArray.push(data[i]);
             }
             }
             //存储层级节点的order
             var orderInLevel = {};

             function getOrderByLevel(level) {
             for (var key in orderInLevel) {
             if (key == level) {
             return ++orderInLevel[key].order;
             }
             }
             orderInLevel[level] = {order: 0};
             return orderInLevel[level].order;
             }

             //设置节点的levelOrder
             for (var j = 0; j < inDegree_0_nodeArray.length; j++) {
             var node = inDegree_0_nodeArray[j];
             node['current'].order = j;
             node['current'].parentOrder = 0;
             node['current'].levelOrder = getOrderByLevel(node['current'].level);
             node['current'].parentLevelOrder = 0;
             traverseDownStream(node);
             }

             //遍历downstream设置level
             function traverseDownStream(node) {
             if (node['downstream'].length > 0) {
             for (var m = 0; m < node['downstream'].length; m++) {
             var element_id = node['downstream'][m]['element_id'];
             var downNode = self.getNodeByID(data, element_id);
             if (downNode['current'].order == null && downNode['current'].parentOrder == null &&
             downNode['current'].levelOrder == null && downNode['current'].parentLevelOrder == null) {
             downNode['current'].order = m;
             downNode['current'].parentOrder = node['current'].order;
             downNode['current'].levelOrder = getOrderByLevel(downNode['current'].level);
             downNode['current'].parentLevelOrder = node['current'].levelOrder;
             }
             traverseDownStream(downNode);
             }
             }
             }

             return data;
             },
             nodesAndLinks: function (data) {
             var self = this;
             var nodes = [];
             var links = [];
             //寻找入度为0的节点
             var inDegree_0_nodeArray = [];
             for (var i = 0; i < data.length; i++) {
             if (data[i]['current'].inDegree == 0) {
             inDegree_0_nodeArray.push(data[i]);
             }
             nodes.push(data[i]);
             }
             for (var j = 0; j < inDegree_0_nodeArray.length; j++) {
             traverseDownStream(inDegree_0_nodeArray[j]);
             }
             function traverseDownStream(node) {
             if (node['downstream'].length > 0) {
             for (var index in node['downstream']) {
             var element_id = node['downstream'][index]['element_id'];
             var downNode = self.getNodeByID(data, element_id);
             var link = {start: node['current'], end: downNode['current']};
             if (!linksHas(link)) {
             links.push(link);
             }
             traverseDownStream(downNode);
             }
             }
             }

             //判断links中是否已经存在该连接
             function linksHas(link) {
             for (var index in links) {
             if (links[index].start == link.start && links[index].end == link.end) {
             return true;
             }
             }
             return false;
             }

             return {
             nodes: nodes,
             links: links
             };
             },
             nodesLayout: function (nodes) {
             var nodeWidth = 100;
             var nodeHeight = 40;
             var nodeHorizontalGap = 60;
             var nodeVerticalGap = 30;
             for (var i = 0; i < nodes.length; i++) {
             var node = nodes[i]['current'];
             node.width = nodeWidth;
             node.height = nodeHeight;
             node.x = (nodeWidth + nodeHorizontalGap) * node.level + nodeHorizontalGap;
             node.y = (nodeHeight + nodeVerticalGap) * node.levelOrder + (nodeHeight + nodeVerticalGap) * node.parentOrder + nodeVerticalGap;
             }
             return nodes;
             },
             linksLayout: function (links) {
             return links;
             },
             getNodeByID: function (data, element_id) {
             for (var i = 0; i < data.length; i++) {
             if (data[i]['current']['element_id'] == element_id) {
             return data[i];
             }
             }
             },
             drawSvg: function (groupData) {
             var self = this;
             var topoList = self.topoSort(groupData[0]);
             //console.log(topoList);
             if (topoList == null) {
             alert('数据错误！');
             return;
             }
             var levelList = self.levelSort(topoList);
             //console.log(levelList);
             var levelOrder = self.levelOrder(levelList);
             //console.log(levelOrder);
             var nodesAndLinks = self.nodesAndLinks(levelOrder);
             //console.log(nodesAndLinks);
             var nodesLayout = self.nodesLayout(nodesAndLinks.nodes);
             var linksLayout = self.linksLayout(nodesAndLinks.links);
             //console.log(linksLayout);
             //console.log(nodesLayout);
             self.drawRootSvg(nodesLayout, linksLayout);
             },
             drawRootSvg: function (nodes, links) {
             var canvas = d3.select('.whiteboard');
             //拖拽
             var drag = d3.drag().on("drag", function (d) {
             d.x = d3.event.x;
             d.y = d3.event.y;
             d3.select(this).attr('transform', 'translate(' + d.x + ',' + d.y + ')');
             });
             var svg_coordinate = {x: 0, y: 0};
             var svg = canvas.append('g').datum(svg_coordinate).attr('transform', function (d) {
             return "translate(" + d.x + "," + d.y + ")";
             }).call(drag);

             //生成节点
             this.drawNodeSvg(svg, nodes);
             //生成连线
             this.drawLinkSvg(svg, links);
             //生成箭头
             this.drawArrowSvg(svg, links);
             },
             drawNodeSvg: function (svg, nodes) {
             var self = this;
             //console.log(nodes)
             var g = svg.selectAll('g')
             .data(nodes)
             .enter()
             .append('g')
             .attr('transform', function (d) {
             return "translate(" + d['current'].x + "," + d['current'].y + ")";
             })
             .attr('id', function (d) {
             return d['current']['element_id'];
             })
             .on('mouseenter', function (d) {
             toggleAll(nodes, "enter");
             var element_id = d['current']['element_id'];
             var rect = d3.select('rect[id="' + element_id + '"]');
             var pathLine = d3.selectAll('path[line][start="' + element_id + '"],path[line][end="' + element_id + '"]');
             var pathArrow = d3.selectAll('path[arrow][end="' + element_id + '"]');
             rect.attr('fill', 'red');
             pathLine.attr('fill', 'none').attr('stroke', 'green');
             pathArrow.attr('fill', 'green').attr('stroke', 'green');
             d3.select(this).attr('filter', "");
             pathLine.style('opacity', "1");
             pathArrow.style('opacity', "1");
             changeUpStreamNodeStyle(d, "enter");
             changeDownStreamNodeStyle(d, "enter");
             })
             .on('mouseleave', function (d) {
             toggleAll(nodes, "leave");
             var element_id = d['current']['element_id'];
             var rect = d3.select('rect[id="' + element_id + '"]');
             var pathLine = d3.selectAll('path[line][start="' + element_id + '"],path[line][end="' + element_id + '"]');
             var pathArrow = d3.selectAll('path[arrow][end="' + element_id + '"]');
             rect.attr('fill', 'blue');
             pathLine.attr('fill', 'none').attr('stroke', 'blue');
             pathArrow.attr('fill', 'blue').attr('stroke', 'blue');
             d3.select(this).attr('filter', "");
             pathLine.style('opacity', "1");
             pathArrow.style('opacity', "1");
             changeUpStreamNodeStyle(d, "leave");
             changeDownStreamNodeStyle(d, "leave");
             });
             var rect = g.append('rect')
             .attr('rx', 5)
             .attr('ry', 5)
             .attr('width', function (d) {
             return d['current'].width;
             })
             .attr('height', function (d) {
             return d['current'].height;
             })
             .attr('fill', 'blue')
             .attr('id', function (d) {
             return d['current']['element_id'];
             });
             var text = g.append('text')
             .text(function (d) {
             return d['current'].element_id;
             })
             .attr('x', 45)
             .attr('y', 25)
             .style('fill', '#ffffff');

             function toggleAll(data, type) {
             for (var index in data) {
             var element_id = data[index]['current']['element_id'];
             var rect = d3.select('rect[id="' + element_id + '"]');
             var pathLine = d3.selectAll('path[line]');
             var pathArrow = d3.selectAll('path[arrow]');
             if (type == "enter") {
             d3.select('g[id="' + element_id + '"]').attr('filter', "url('#darken')");
             pathLine.style('opacity', "0.1");
             pathArrow.style('opacity', "0.1");
             } else {
             d3.select('g[id="' + element_id + '"]').attr('filter', "");
             pathLine.style('opacity', "1");
             pathArrow.style('opacity', "1");
             }
             }
             }

             //高亮上游
             function changeUpStreamNodeStyle(d, type) {
             if (d['upstream'].length > 0) {
             var upstream = d['upstream'];
             for (var i = 0; i < upstream.length; i++) {
             var element_id = upstream[i]['element_id'];
             var rect = d3.select('rect[id="' + element_id + '"]');
             var pathLine = d3.selectAll('path[line][end="' + element_id + '"]');
             var pathArrow = d3.selectAll('path[arrow][end="' + element_id + '"]');
             if (type == "enter") {
             rect.attr('fill', 'green');
             pathLine.attr('fill', 'none').attr('stroke', 'green');
             pathArrow.attr('fill', 'green').attr('stroke', 'green');
             } else {
             rect.attr('fill', 'blue');
             pathLine.attr('fill', 'none').attr('stroke', 'blue');
             pathArrow.attr('fill', 'blue').attr('stroke', 'blue');
             }
             d3.select('g[id="' + element_id + '"]').attr('filter', "");
             pathLine.style('opacity', "1");
             pathArrow.style('opacity', "1");
             var node = self.getNodeByID(nodes, element_id);
             changeUpStreamNodeStyle(node, type);
             }
             }
             }

             //高亮下游
             function changeDownStreamNodeStyle(d, type) {
             if (d['downstream'].length > 0) {
             var downstream = d['downstream'];
             for (var i = 0; i < downstream.length; i++) {
             var element_id = downstream[i]['element_id'];
             var rect = d3.select('rect[id="' + element_id + '"]');
             var pathLine = d3.selectAll('path[line][start="' + element_id + '"]');
             var pathArrow = d3.selectAll('path[arrow][end="' + element_id + '"]');
             if (type == "enter") {
             rect.attr('fill', 'green');
             pathLine.attr('fill', 'none').attr('stroke', 'green');
             pathArrow.attr('fill', 'green').attr('stroke', 'green');
             } else {
             rect.attr('fill', 'blue');
             pathLine.attr('fill', 'none').attr('stroke', 'blue');
             pathArrow.attr('fill', 'blue').attr('stroke', 'blue');
             }
             d3.select('g[id="' + element_id + '"]').attr('filter', "");
             pathLine.style('opacity', "1");
             pathArrow.style('opacity', "1");
             var node = self.getNodeByID(nodes, element_id);
             changeDownStreamNodeStyle(node, type);
             }
             }
             }
             },
             drawLinkSvg: function (svg, links) {
             //console.log(links);
             var path = svg.selectAll('path[line]')
             .data(links)
             .enter()
             .append('path')
             .attr('d', function (d) {
             var arrowWidth = 5;
             var startNodeWidth = d.start.width;
             var startNodeHeight = d.start.height;
             var endNodeWidth = d.end.width;
             var endNodeHeight = d.end.height;
             var move_x = d.start.x + startNodeWidth;
             var move_y = d.start.y + startNodeHeight / 2;
             var to_x = d.end.x - arrowWidth;
             var to_y = d.end.y + endNodeHeight / 2;
             var lineData = {
             move_x: move_x,
             move_y: move_y,
             to_x: to_x,
             to_y: to_y
             };

             var disLevel = d.end.level - d.start.level;
             if (disLevel == 1) {
             var disX = lineData.to_x - lineData.move_x;
             if (disX == 0) disX = 0;
             if (disX > 0) disX = 30;
             if (disX < 0) disX = -30;
             var disY = lineData.to_y - lineData.move_y;
             if (disY == 0) disY = 0;
             if (disY > 0) disY = 5;
             if (disY < 0) disY = -5;

             var baiserPoint_1 = {
             x: lineData.move_x + disX,
             y: lineData.move_y + disY
             };

             var baiserPoint_2 = {
             x: lineData.to_x - disX,
             y: lineData.to_y - disY
             };
             var line = "M" + lineData.move_x + " " + lineData.move_y + " ";
             line += "C" + baiserPoint_1.x + " " + baiserPoint_1.y + " ";
             line += baiserPoint_2.x + " " + baiserPoint_2.y + " ";
             line += lineData.to_x + " " + lineData.to_y + " ";
             return line;
             } else {
             var nodeHorizontalGap = 60;
             var nodeVerticalGap = 30;
             var gap = d.end.y - d.start.y;
             var point_1 = {
             to_x: 0,
             to_y: 0
             };
             var point_2 = {
             to_x: 0,
             to_y: 0
             };
             if (gap == 0) {
             point_1.to_x = lineData.move_x + nodeHorizontalGap;
             point_1.to_y = lineData.move_y - startNodeHeight / 2 - nodeVerticalGap / 2;
             point_2.to_x = lineData.to_x - nodeHorizontalGap;
             point_2.to_y = lineData.to_y - startNodeHeight / 2 - nodeVerticalGap / 2;
             } else if (gap > 0) {
             point_1.to_x = lineData.move_x + nodeHorizontalGap;
             point_1.to_y = lineData.move_y + startNodeHeight / 2 + nodeVerticalGap / 2;
             point_2.to_x = lineData.to_x - nodeHorizontalGap;
             point_2.to_y = point_1.to_y;
             } else {
             point_1.to_x = lineData.move_x + nodeHorizontalGap;
             point_1.to_y = lineData.move_y - startNodeHeight / 2 - nodeVerticalGap / 2;
             point_2.to_x = lineData.to_x - nodeHorizontalGap;
             point_2.to_y = point_1.to_y;
             }
             //转折点1
             var disX1 = point_1.to_x - lineData.move_x;
             if (disX1 == 0) disX1 = 0;
             if (disX1 > 0) disX1 = 30;
             if (disX1 < 0) disX1 = -30;
             var disY1 = point_1.to_y - lineData.move_y;
             if (disY1 == 0) disY1 = 0;
             if (disY1 > 0) disY1 = 5;
             if (disY1 < 0) disY1 = -5;
             var baiserPoint_1 = {
             x: lineData.move_x + disX1,
             y: lineData.move_y + disY1
             };
             var baiserPoint_2 = {
             x: point_1.to_x - disX1,
             y: point_1.to_y - disY1
             };
             //转折点2
             var disX2 = lineData.to_x - point_2.to_x;
             if (disX2 == 0) disX2 = 0;
             if (disX2 > 0) disX2 = 30;
             if (disX2 < 0) disX2 = -30;
             var disY2 = lineData.to_y - point_2.to_y;
             if (disY2 == 0) disY2 = 0;
             if (disY2 > 0) disY2 = 5;
             if (disY1 < 0) disY2 = -5;
             var baiserPoint_3 = {
             x: point_2.to_x + disX2,
             y: point_2.to_y + disY2
             };
             var baiserPoint_4 = {
             x: lineData.to_x - disX2,
             y: lineData.to_y - disY2
             };
             var line = "M" + lineData.move_x + " " + lineData.move_y + " ";
             line += "C" + baiserPoint_1.x + " " + baiserPoint_1.y + " ";
             line += baiserPoint_2.x + " " + baiserPoint_2.y + " ";
             line += point_1.to_x + " " + point_1.to_y + " ";
             line += "M" + point_1.to_x + " " + point_1.to_y + " ";
             line += "L" + point_2.to_x + " " + point_2.to_y + " ";
             line += "M" + point_2.to_x + " " + point_2.to_y + " ";
             line += "C" + baiserPoint_3.x + " " + baiserPoint_3.y + " ";
             line += baiserPoint_4.x + " " + baiserPoint_4.y + " ";
             line += lineData.to_x + " " + lineData.to_y + " ";
             return line;
             }
             })
             .attr('stroke', 'blue').attr('fill', 'none')
             .attr('line', function (d) {
             return "line";
             })
             .attr('start', function (d) {
             return d.start['element_id'];
             })
             .attr('end', function (d) {
             return d.end['element_id'];
             });
             },
             drawArrowSvg: function (svg, links) {
             var path = svg.selectAll('path[arrow]')
             .data(links)
             .enter()
             .append('path')
             .attr('d', function (d) {
             var arrowWidth = 5;
             var endNodeWidth = d.end.width;
             var endNodeHeight = d.end.height;
             var move_x = d.end.x - arrowWidth;
             var move_y = d.end.y + endNodeHeight / 2;
             var lineData = {
             move_x: move_x,
             move_y: move_y,
             to_x: move_x,
             to_y: move_y
             };
             var line = "M" + lineData.move_x + " " + lineData.move_y + " ";
             line += "L" + lineData.to_x + " " + (lineData.to_y + arrowWidth) + " ";
             line += "L" + (lineData.to_x + arrowWidth) + " " + lineData.to_y + " ";
             line += "L" + lineData.to_x + " " + (lineData.to_y - arrowWidth) + " ";
             line += "L" + lineData.to_x + " " + lineData.to_y + " Z";
             return line;
             })
             .attr('stroke', 'blue').attr('fill', 'blue')
             .attr('arrow', function (d) {
             return "arrow";
             })
             .attr('start', function (d) {
             return d.start['element_id'];
             })
             .attr('end', function (d) {
             return d.end['element_id'];
             });
             }*/
        }
    }
</script>