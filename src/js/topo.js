/**
 * Created by wangshouyun on 2016/12/20.
 */

define(function (require, exports, module) {

    var Topo = {
        getD3Json: function (url, callback) {
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
                    current: data[i]['current'] ? data[i]['current'] : {id: -1},
                    downstream: data[i]['downstream'] ? data[i]['downstream'] : []
                };
                node.current.inDegree = 0;
                node.current.outDegree = 0;
                node.current.sortIndegree = 0;
                node.current.sortOutDegree = 0;
                var upstream = node['upstream'];
                node['current'].inDegree = upstream.length;
                node['current'].sortIndegree = upstream.length;
                var downstream = node['downstream'];
                node['current'].outDegree = downstream.length;
                node['current'].sortOutDegree = downstream.length;

                /*for (var j = 0; j < data.length; j++) {
                 var upstream = data[j]['upstream'] ? data[j]['upstream'] : [];
                 for (var m = 0; m < upstream.length; m++) {
                 if (upstream[m]['id'] == node['current']['id']) {
                 node['current'].outDegree += 1;
                 }
                 }
                 var downstream = data[j]['downstream'] ? data[j]['downstream'] : [];
                 for (var n = 0; n < downstream.length; n++) {
                 if (downstream[n]['id'] == node['current']['id']) {
                 node['current'].inDegree += 1;
                 }
                 }
                 }*/
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
                //console.log(node['current'].id, node['current'].group);
                if (node['downstream'].length > 0) {
                    for (var index in node['downstream']) {
                        var id = node['downstream'][index]['id'];
                        var downNode = self.getNodeByID(data, id);
                        //设置group
                        if (downNode['current'].group == null) {
                            traverseDownStream(downNode, group);
                        } else if (currentNode['current'].group != downNode['current'].group) {
                            //console.log(node['current'].id, downNode['current'].id)
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
                    var downstreamNode = self.getNodeByID(data, downStreamList[i]['id']);
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
                        var id = node['downstream'][m]['id'];
                        var downNode = self.getNodeByID(data, id);
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
                        var id = node['downstream'][m]['id'];
                        var downNode = self.getNodeByID(data, id);
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
                        var id = node['downstream'][index]['id'];
                        var downNode = self.getNodeByID(data, id);
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
        nodesLayout: function (startPoint, nodes) {
            var nodeWidth = 150;
            var nodeHeight = 50;
            var nodeHorizontalGap = 60;
            var nodeVerticalGap = 30;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i]['current'];
                node.width = nodeWidth;
                node.height = nodeHeight;
                node.horizontalGap = nodeHorizontalGap;
                node.verticalGap = nodeVerticalGap;
                node.x = (nodeWidth + nodeHorizontalGap) * node.level
                    + nodeHorizontalGap
                    + startPoint.x;
                node.y = (nodeHeight + nodeVerticalGap) * node.levelOrder
                    + (nodeHeight + nodeVerticalGap) * node.parentOrder
                    + nodeVerticalGap + startPoint.y;
            }
            return nodes;
        },
        linksLayout: function (links) {
            return links;
        },
        getNodeByID: function (data, id) {
            for (var i = 0; i < data.length; i++) {
                if (data[i]['current']['id'] == id) {
                    return data[i];
                }
            }
        },
        drawSvg: function (element, data) {
            var self = this;
            var degreeData = self.degreeData(data);
            //console.log(degreeData);
            var groupData = self.groupData(degreeData);
            //console.log(groupData);
            var maxPositionNode = null;
            for (var i = 0; i < groupData.length; i++) {
                var topoList = self.topoSort(groupData[i]);
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
                var maxY = maxPositionNode == null ? 0 : maxPositionNode.y + maxPositionNode.height + maxPositionNode.verticalGap;
                var nodesLayout = self.nodesLayout({x: 0, y: maxY}, nodesAndLinks.nodes);
                maxPositionNode = nodesLayout.sort(function (a, b) {
                    return b.current.y - a.current.y;
                })[0]['current'];
                //console.log(maxPositionNode);
                var linksLayout = self.linksLayout(nodesAndLinks.links);
                //console.log(linksLayout);
                //console.log(nodesLayout);
                self.drawRootSvg(element, nodesLayout, linksLayout);
            }
        },
        drawRootSvg: function (element, nodes, links) {
            var canvas = d3.select(element);
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
                    return d['current']['id'];
                })
                .classed('pointer', true)
                .on('mouseenter', function (d) {
                    toggleAll(nodes, "enter");
                    var id = d['current']['id'];
                    var rect = d3.select('rect[id="' + id + '"]');
                    var pathLine = d3.selectAll('path[line][start="' + id + '"],path[line][end="' + id + '"]');
                    var pathArrow = d3.selectAll('path[arrow][end="' + id + '"]');
                    rect.classed('current-node-highlight', true);
                    pathLine.classed('line-highlight', true);
                    pathArrow.classed('arrow-highlight', true);
                    d3.select(this).attr('filter', "");
                    changeUpStreamNodeStyle(d, "enter");
                    changeDownStreamNodeStyle(d, "enter");
                    //$(this).trigger("mouseEnterNode", [d.current]);
                })
                .on('mouseleave', function (d) {
                    toggleAll(nodes, "leave");
                    var id = d['current']['id'];
                    var rect = d3.select('rect[id="' + id + '"]');
                    var pathLine = d3.selectAll('path[line][start="' + id + '"],path[line][end="' + id + '"]');
                    var pathArrow = d3.selectAll('path[arrow][end="' + id + '"]');
                    rect.classed('current-node-highlight', false);
                    pathLine.classed('line-highlight', false);
                    pathArrow.classed('arrow-highlight', false);
                    d3.select(this).attr('filter', "");
                    changeUpStreamNodeStyle(d, "leave");
                    changeDownStreamNodeStyle(d, "leave");
                    //$(this).trigger("mouseLeaveNode");
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
                .classed('node-normal', true)
                .attr('id', function (d) {
                    return d['current']['id'];
                });
            var doc = g.append('circle')
                .attr('r', 5)
                .attr('cx', 10)
                .attr('cy', function (d) {
                    return d.current.height / 2;
                })
                .classed('status-1', function (d) {
                    if (d.current.status == 1) {
                        return true;
                    }
                    return false;
                })
                .classed('status-2', function (d) {
                    if (d.current.status == 2) {
                        return true;
                    }
                    return false;
                })
                .classed('status-3', function (d) {
                    if (d.current.status == 3) {
                        return true;
                    }
                    return false;
                })
                .classed('status-4', function (d) {
                    if (d.current.status == 4) {
                        return true;
                    }
                    return false;
                })
                .classed('status-5', function (d) {
                    if (d.current.status == 5) {
                        return true;
                    }
                    return false;
                });
            var text = g.append('text')
                .style('font-size', 14)
                .text(function (d) {
                    var name = d['current'].name;
                    var nameLength = name.replace(/[\u0391-\uFFE5]/g, "aa").length;
                    if (nameLength > 15) {
                        name = name.substr(0, 13) + "...";
                    }
                    return name;
                })
                .attr('x', 20)
                .attr('y', function (d) {
                    return (d.current.height + 7) / 2;
                })
                .attr('width', function (d) {
                    return d.current.width - 30;
                })
                .classed('text-normal', true);

            function toggleAll(data, type) {
                for (var index in data) {
                    var id = data[index]['current']['id'];
                    var pathLine = d3.selectAll('path[line]');
                    var pathArrow = d3.selectAll('path[arrow]');
                    if (type == "enter") {
                        d3.select('g[id="' + id + '"]').attr('filter', "url('#darken')");
                        pathLine.classed('line-dark', true);
                        pathArrow.classed('arrow-dark', true);
                    } else {
                        d3.select('g[id="' + id + '"]').attr('filter', "");
                        pathLine.classed('line-dark', false);
                        pathArrow.classed('arrow-dark', false);
                    }
                }
            }

            //高亮上游
            function changeUpStreamNodeStyle(d, type) {
                if (d['upstream'].length > 0) {
                    var upstream = d['upstream'];
                    for (var i = 0; i < upstream.length; i++) {
                        var id = upstream[i]['id'];
                        var rect = d3.select('rect[id="' + id + '"]');
                        var pathLine = d3.selectAll('path[line][end="' + id + '"]');
                        var pathArrow = d3.selectAll('path[arrow][end="' + id + '"]');
                        if (type == "enter") {
                            rect.classed('link-node-highlight', true);
                            pathLine.classed('line-highlight', true);
                            pathArrow.classed('arrow-highlight', true);
                        } else {
                            rect.classed('link-node-highlight', false);
                            pathLine.classed('line-highlight', false);
                            pathArrow.classed('arrow-highlight', false);
                        }
                        d3.select('g[id="' + id + '"]').attr('filter', "");
                        var node = self.getNodeByID(nodes, id);
                        changeUpStreamNodeStyle(node, type);
                    }
                }
            }

            //高亮下游
            function changeDownStreamNodeStyle(d, type) {
                if (d['downstream'].length > 0) {
                    var downstream = d['downstream'];
                    for (var i = 0; i < downstream.length; i++) {
                        var id = downstream[i]['id'];
                        var rect = d3.select('rect[id="' + id + '"]');
                        var pathLine = d3.selectAll('path[line][start="' + id + '"]');
                        var pathArrow = d3.selectAll('path[arrow][end="' + id + '"]');
                        if (type == "enter") {
                            rect.classed('link-node-highlight', true);
                            pathLine.classed('line-highlight', true);
                            pathArrow.classed('arrow-highlight', true);
                        } else {
                            rect.classed('link-node-highlight', false);
                            pathLine.classed('line-highlight', false);
                            pathArrow.classed('arrow-highlight', false);
                        }
                        d3.select('g[id="' + id + '"]').attr('filter', "");
                        var node = self.getNodeByID(nodes, id);
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
                .classed('line-normal', true)
                .attr('line', function (d) {
                    return "line";
                })
                .attr('start', function (d) {
                    return d.start['id'];
                })
                .attr('end', function (d) {
                    return d.end['id'];
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
                .classed('arrow-normal', true)
                .attr('arrow', function (d) {
                    return "arrow";
                })
                .attr('start', function (d) {
                    return d.start['id'];
                })
                .attr('end', function (d) {
                    return d.end['id'];
                });
        }
    };

    module.exports = Topo;

});