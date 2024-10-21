const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class MenuProvider {
    constructor(extensionPath) {
        console.log('vpEx: path= ' + extensionPath)
        this.extensionPath = extensionPath;
        
        if (!this.extensionPath) {
            vscode.window.showInformationMessage('No menu file detected in extension');
            return;
        }

        const librariesJsonPath = path.join(this.extensionPath, 'visualpython', 'data', 'libraries.json');
        const librariesJson = JSON.parse(fs.readFileSync(librariesJsonPath, 'utf-8'));
        this.librariesJson = librariesJson;
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (element) {
            return Promise.resolve(
                this.getDepsInPackageJson(element)
            );
        } else {
            if (this.librariesJson) {
                return Promise.resolve(
                    this.getDepsInPackageJson(this.librariesJson.library)
                );
            } else {
                vscode.window.showInformationMessage('Extension has no libraries.json');
                return Promise.resolve([]);
            }
        }
    }

    getDepsInPackageJson(element) {
        if (element.item) {
            const toDep = (module) => {
                const expandedMenuIds = [
                    'pkg_apps',
                    'pkg_visualize',
                    'pkg_statistics',
                    'pkg_ml',
                ];
                const { name, id, type, level, desc, item } = module;
                if (item) {
                    if (expandedMenuIds.includes(id)) {
                        return new Dependency(
                            name,
                            id,
                            type, level, desc, item,
                            vscode.TreeItemCollapsibleState.Expanded
                        );
                    } else {
                        return new Dependency(
                            name,
                            id,
                            type, level, desc, item,
                            vscode.TreeItemCollapsibleState.Collapsed
                        );
                    }
                } else {
                    return new Dependency(
                        name,
                        id,
                        type, level, desc, null,
                        vscode.TreeItemCollapsibleState.None);
                }
            };

            // Excluded menu id list
            const excludeMenuIds = ['com_setting', 'com_pip'];
            const deps = element.item
                ? element.item.filter(obj => !excludeMenuIds.includes(obj.id)).map(menu =>
                    toDep(menu)
                )
                : [];
            return deps;
        } else {
            return [];
        }
    }

    pathExists(p) {
        try {
            fs.accessSync(p);
        } catch (err) {
            console.log('vpEx: no path');
            return false;
        }
        return true;
    }

    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire();
    }
    
}

class Dependency extends vscode.TreeItem {
    constructor(
      label,
      menuId,
      type,         // package / function
      level,        // 메뉴 레벨 0~n
      description,  // 설명
      item,         // 하위 메뉴
      collapsibleState
    ) {
        super(label, collapsibleState);
        this.menuId = menuId;
        this.level = level;
        this.type = type;
        this.item = item;
        this.tooltip = `${this.label}: ${description}`;
        this.description = description;
        this.command = {
            command: 'visualpython.start',
            arguments: [this.label],
            title: 'Open Visual Python Popup'
        }
    }
  
    // iconPath = {
    //   light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
}

module.exports = {
	MenuProvider
}