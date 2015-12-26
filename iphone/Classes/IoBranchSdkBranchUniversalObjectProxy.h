//
//  IoBranchSdkBranchUniversalObjectProxy.h
//  Titanium-Deferred-Deep-Linking-SDK
//
//

#import "TiProxy.h"
#import "BranchUniversalObject.h"
#import "BranchLinkProperties.h"

@interface IoBranchSdkBranchUniversalObjectProxy : TiProxy

@property (copy) NSString *canonicalIdentifier;
@property (copy) NSString *title;
@property (copy) NSString *contentDescription;
@property (copy) NSString *imageUrl;
// Note: properties found in metadata will overwrite properties on the BranchUniversal itself
@property (copy) NSDictionary *metadata;
@property (copy) NSString *type;
@property (copy) NSArray *keywords;
@property (copy) NSDate *expirationDate;

@property (strong, nonatomic) BranchUniversalObject *branchUniversalObj;


- (id)initWithCanonicalIdentifier:(id)args;
- (id)initWithTitle:(id)args;
- (void)addMetadata:(id)args;
- (void)registerView:(id)args;

@end
