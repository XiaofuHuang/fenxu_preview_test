namespace Microsoft.DocAsCode.EntityModel.Plugins.OpenPublishing
{
    using System;
    using System.Collections.Generic;
    using System.Composition;
    using System.Linq;

    using Microsoft.DocAsCode.DataContracts.ManagedReference;
    using Microsoft.DocAsCode.EntityModel.Plugins.OpenPublishing.Common;
    using Microsoft.DocAsCode.Plugins;

    [Export(Constants.CustomizeHrefForAzure, typeof(ICustomHrefGenerator))]
    public class CustomizeHrefForAzure : ICustomHrefGenerator
    {
     
    }
}
