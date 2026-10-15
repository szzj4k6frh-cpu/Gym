"""Generate the checked-in Xcode project without Xcode or third-party tooling."""
from pathlib import Path
from uuid import uuid5, NAMESPACE_URL
import json

ROOT = Path(__file__).resolve().parents[1]
objects = {}
def ident(name): return uuid5(NAMESPACE_URL, 'gym-project:' + name).hex[:24].upper()
def obj(name, kind, **values):
    key = ident(name)
    objects[key] = dict(isa=kind, **values)
    return key

def reference(name, path, kind):
    return obj('file:' + name, 'PBXFileReference', lastKnownFileType=kind, path=path, sourceTree='<group>')

def build_file(name, ref, **extra):
    return obj('build:' + name, 'PBXBuildFile', fileRef=ref, **extra)

app_swift = ['GymApp.swift', 'TrainingWebView.swift', 'RestCoordinator.swift', 'NotificationDelegate.swift']
core_swift = ['RestCommand.swift', 'RestSnapshot.swift']
app_refs = [reference(f, f, 'sourcecode.swift') for f in app_swift]
core_refs = [reference(f, f, 'sourcecode.swift') for f in core_swift]
shared = reference('RestActivityAttributes.swift', 'RestActivityAttributes.swift', 'sourcecode.swift')
widget = reference('GymActivity.swift', 'GymActivity.swift', 'sourcecode.swift')
web = reference('Web', 'Web', 'folder')
assets = reference('Assets.xcassets', 'Assets.xcassets', 'folder.assetcatalog')
app_plist = reference('App Info.plist', 'Info.plist', 'text.plist.xml')
ext_plist = reference('Extension Info.plist', 'Info.plist', 'text.plist.xml')
app_product = obj('product:app', 'PBXFileReference', explicitFileType='wrapper.application', includeInIndex=0, path='Gym.app', sourceTree='BUILT_PRODUCTS_DIR')
ext_product = obj('product:ext', 'PBXFileReference', explicitFileType='wrapper.app-extension', includeInIndex=0, path='GymActivity.appex', sourceTree='BUILT_PRODUCTS_DIR')
products = obj('group:products', 'PBXGroup', name='Products', children=[app_product, ext_product], sourceTree='<group>')
app_group = obj('group:app', 'PBXGroup', path='Gym', children=app_refs+[app_plist, assets, web], sourceTree='<group>')
core_group = obj('group:core', 'PBXGroup', path='Core', children=core_refs, sourceTree='<group>')
shared_group = obj('group:shared', 'PBXGroup', path='Shared', children=[shared], sourceTree='<group>')
ext_group = obj('group:ext', 'PBXGroup', path='GymActivity', children=[widget, ext_plist], sourceTree='<group>')
main_group = obj('group:main', 'PBXGroup', children=[app_group,core_group,shared_group,ext_group,products], sourceTree='<group>')

def phase(name, kind, files, **extra):
    return obj(name, kind, buildActionMask=2147483647, files=files, runOnlyForDeploymentPostprocessing=0, **extra)

app_sources = phase('app:sources', 'PBXSourcesBuildPhase', [build_file('app:'+name, ref) for name,ref in zip(app_swift+core_swift+['RestActivityAttributes.swift'],app_refs+core_refs+[shared])])
ext_sources = phase('ext:sources', 'PBXSourcesBuildPhase', [build_file('ext:widget',widget),build_file('ext:shared',shared)])
app_resources = phase('app:resources','PBXResourcesBuildPhase',[build_file('web',web),build_file('assets',assets)])
ext_resources = phase('ext:resources','PBXResourcesBuildPhase',[])
app_frameworks = phase('app:frameworks','PBXFrameworksBuildPhase',[])
ext_frameworks = phase('ext:frameworks','PBXFrameworksBuildPhase',[])
embed = phase('app:embed','PBXCopyFilesBuildPhase',[build_file('extension',ext_product,settings={'ATTRIBUTES':['RemoveHeadersOnCopy']})],dstPath='',dstSubfolderSpec=13,name='Embed App Extensions')

common = {'ALWAYS_SEARCH_USER_PATHS':'NO','CLANG_ENABLE_MODULES':'YES','CLANG_ENABLE_OBJC_ARC':'YES','SDKROOT':'iphoneos','IPHONEOS_DEPLOYMENT_TARGET':'18.0','SWIFT_VERSION':'5.0','SUPPORTED_PLATFORMS':'iphoneos iphonesimulator','CODE_SIGN_STYLE':'Automatic','DEVELOPMENT_TEAM':'','MARKETING_VERSION':'1.0','CURRENT_PROJECT_VERSION':'1','ENABLE_USER_SCRIPT_SANDBOXING':'YES'}
def configurations(scope, extra):
    refs=[]
    for mode in ['Debug','Release']:
        settings=dict(common, **extra, SWIFT_OPTIMIZATION_LEVEL='-Onone' if mode=='Debug' else '-O', DEBUG_INFORMATION_FORMAT='dwarf' if mode=='Debug' else 'dwarf-with-dsym')
        if mode=='Debug': settings['SWIFT_ACTIVE_COMPILATION_CONDITIONS']='DEBUG $(inherited)'
        refs.append(obj(f'{scope}:config:{mode}','XCBuildConfiguration',name=mode,buildSettings=settings))
    return obj(f'{scope}:configs','XCConfigurationList',buildConfigurations=refs,defaultConfigurationIsVisible=0,defaultConfigurationName='Release')

app_config = configurations('app',{'PRODUCT_NAME':'$(TARGET_NAME)','PRODUCT_BUNDLE_IDENTIFIER':'local.gym.personal','INFOPLIST_FILE':'Gym/Info.plist','GENERATE_INFOPLIST_FILE':'NO','TARGETED_DEVICE_FAMILY':'1','ASSETCATALOG_COMPILER_APPICON_NAME':'AppIcon','LD_RUNPATH_SEARCH_PATHS':['$(inherited)','@executable_path/Frameworks'],'SWIFT_EMIT_LOC_STRINGS':'NO'})
ext_config = configurations('ext',{'PRODUCT_NAME':'$(TARGET_NAME)','PRODUCT_BUNDLE_IDENTIFIER':'local.gym.personal.activity','INFOPLIST_FILE':'GymActivity/Info.plist','GENERATE_INFOPLIST_FILE':'NO','TARGETED_DEVICE_FAMILY':'1','APPLICATION_EXTENSION_API_ONLY':'YES','SKIP_INSTALL':'YES','LD_RUNPATH_SEARCH_PATHS':['$(inherited)','@executable_path/Frameworks','@executable_path/../../Frameworks']})
project_config = configurations('project',{})
ext_target = obj('target:ext','PBXNativeTarget',name='GymActivity',productName='GymActivity',productType='com.apple.product-type.app-extension',productReference=ext_product,buildConfigurationList=ext_config,buildPhases=[ext_sources,ext_frameworks,ext_resources],buildRules=[],dependencies=[])
proxy = obj('proxy:ext','PBXContainerItemProxy',containerPortal=ident('project'),proxyType=1,remoteGlobalIDString=ext_target,remoteInfo='GymActivity')
dependency = obj('dependency:ext','PBXTargetDependency',target=ext_target,targetProxy=proxy)
app_target = obj('target:app','PBXNativeTarget',name='Gym',productName='Gym',productType='com.apple.product-type.application',productReference=app_product,buildConfigurationList=app_config,buildPhases=[app_sources,app_frameworks,app_resources,embed],buildRules=[],dependencies=[dependency])
project = obj('project','PBXProject',attributes={'BuildIndependentTargetsInParallel':'YES','LastUpgradeCheck':'1600','TargetAttributes':{app_target:{'CreatedOnToolsVersion':'16.0','ProvisioningStyle':'Automatic'},ext_target:{'CreatedOnToolsVersion':'16.0','ProvisioningStyle':'Automatic'}}},buildConfigurationList=project_config,compatibilityVersion='Xcode 14.0',developmentRegion='de',hasScannedForEncodings=0,knownRegions=['de','en','Base'],mainGroup=main_group,productRefGroup=products,projectDirPath='',projectRoot='',targets=[app_target,ext_target])

def serialize(value, depth=0):
    indent='\t'*depth
    if isinstance(value,dict):
        return '{\n'+''.join('\t'*(depth+1)+json.dumps(str(k))+' = '+serialize(v,depth+1)+';\n' for k,v in value.items())+indent+'}'
    if isinstance(value,list):
        return '(\n'+''.join('\t'*(depth+1)+serialize(v,depth+1)+',\n' for v in value)+indent+')'
    return str(value) if isinstance(value,int) else json.dumps(value)

folder=ROOT/'ios/Gym.xcodeproj'
folder.mkdir(exist_ok=True)
(folder/'project.pbxproj').write_text('// !$*UTF8*$!\n'+serialize({'archiveVersion':1,'classes':{},'objectVersion':56,'objects':objects,'rootObject':project})+'\n')
schemes=folder/'xcshareddata/xcschemes';schemes.mkdir(parents=True,exist_ok=True)
buildable=f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{app_target}" BuildableName="Gym.app" BlueprintName="Gym" ReferencedContainer="container:Gym.xcodeproj"/>'
(schemes/'Gym.xcscheme').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="1600" version="1.3">
 <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">{buildable}</BuildActionEntry></BuildActionEntries></BuildAction>
 <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables/></TestAction>
 <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">{buildable}</BuildableProductRunnable></LaunchAction>
 <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">{buildable}</BuildableProductRunnable></ProfileAction>
 <AnalyzeAction buildConfiguration="Debug"/>
 <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
''')
print('Generated ios/Gym.xcodeproj')
